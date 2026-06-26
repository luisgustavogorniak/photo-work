'use server'

import prisma from '@/lib/prisma'
import { getAuthenticatedContext } from '@/lib/auth-context'

// ==========================================
// TIPO: CRIAÇÃO DE PEDIDO
// ==========================================

export type OrderItemData = {
  productId: string
  quantity: number
  unitPrice: number
}

export type OrderEnvelopeData = {
  envelopeNumber?: string
  receivedMaterials: string[]
  printSize?: string
  paperSurface?: string
  copiesQuantity?: number
  mediaQuality?: string
  hasIndex: boolean
  isProductPhoto: boolean
  hasMontage: boolean
  sendEmail: boolean
  digitalServicesNotes?: string
}

export type CreateOrderData = {
  customerId: string
  items: OrderItemData[]
  envelope: OrderEnvelopeData
  totalAmount: number
  discount: number
  laboratoryCost?: number
  advancePayment: number // Sinal
  expectedDate?: string
  internalNotes?: string
  customerNotes?: string
}

// ==========================================
// CRIAR PEDIDO E DAR BAIXA NO ESTOQUE
// ==========================================

export async function createOrder(data: CreateOrderData) {
  try {
    const { organizationId, memberId } = await getAuthenticatedContext()

    if (!memberId) throw new Error("Usuário não possui Member ID associado à organização.")

    const balancePending = data.totalAmount - data.discount - data.advancePayment

    // O Prisma.$transaction garante que se a baixa de estoque der erro, o pedido não é criado.
    const result = await prisma.$transaction(async (tx) => {
      
      // 1. Cria o Pedido (Order)
      const order = await tx.order.create({
        data: {
          organizationId,
          customerId: data.customerId,
          createdById: memberId,
          status: 'APPROVED', // Ao criar no balcão, já entra como aprovado para produção
          priority: 'NORMAL',
          totalAmount: data.totalAmount,
          discount: data.discount,
          laboratoryCost: data.laboratoryCost || 0,
          balancePending: balancePending,
          expectedDate: data.expectedDate ? new Date(data.expectedDate) : null,
          internalNotes: data.internalNotes,
          customerNotes: data.customerNotes,
          
          // 2. Cria os Itens (OrderItems)
          items: {
            create: data.items.map(item => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice
            }))
          },
          
          // 3. Cria o Envelope (OrderEnvelope)
          envelope: {
            create: {
              envelopeNumber: data.envelope.envelopeNumber,
              receivedMaterials: data.envelope.receivedMaterials,
              printSize: data.envelope.printSize,
              paperSurface: data.envelope.paperSurface,
              copiesQuantity: data.envelope.copiesQuantity,
              mediaQuality: data.envelope.mediaQuality,
              hasIndex: data.envelope.hasIndex,
              isProductPhoto: data.envelope.isProductPhoto,
              hasMontage: data.envelope.hasMontage,
              sendEmail: data.envelope.sendEmail,
              digitalServicesNotes: data.envelope.digitalServicesNotes
            }
          }
        }
      })

      // 4. Cria a Transação Financeira se houver Sinal (Adiantamento)
      if (data.advancePayment > 0) {
        await tx.financialTransaction.create({
          data: {
            organizationId,
            orderId: order.id,
            type: 'INCOME',
            amount: data.advancePayment,
            status: 'PAID',
            paidAt: new Date(),
            dueDate: new Date(),
            paymentMethod: 'CASH', // Poderia ser selecionável no UI
            category: 'Adiantamento de Pedido'
          }
        })
      }

      // 5. BAIXA DE ESTOQUE AUTOMÁTICA (BOM - Bill of Materials)
      for (const item of data.items) {
        // Busca o produto vendido
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { components: true } // Pega a Ficha Técnica
        })

        if (!product) continue;

        if (product.type === 'RAW_MATERIAL') {
          // Se vendeu matéria-prima direto, dá baixa nela mesma
          await tx.product.update({
            where: { id: product.id },
            data: { currentStock: { decrement: item.quantity } }
          })
          await tx.inventoryMovement.create({
            data: {
              organizationId,
              productId: product.id,
              type: 'OUT',
              quantity: item.quantity,
              reason: `Venda Direta - Pedido #${order.orderNumber}`,
              date: new Date()
            }
          })
        } 
        else if (product.type === 'FINISHED_GOOD') {
          // Se vendeu Produto Final, dá baixa nos componentes da Ficha Técnica
          for (const component of product.components) {
            const qtyToDeduct = Number(component.quantityRequired) * item.quantity

            await tx.product.update({
              where: { id: component.childProductId },
              data: { currentStock: { decrement: qtyToDeduct } }
            })
            await tx.inventoryMovement.create({
              data: {
                organizationId,
                productId: component.childProductId,
                type: 'OUT',
                quantity: qtyToDeduct,
                reason: `Produção (Ficha Técnica) - Pedido #${order.orderNumber}`,
                date: new Date()
              }
            })
          }
          // O Produto Final em si não tem "estoque de prateleira" neste modelo, é fabricado sob demanda.
          // Se houvesse estoque de prateleira, daríamos baixa nele também.
        }
      }

      return order
    })

    return { success: true, orderId: result.id, orderNumber: result.orderNumber }
  } catch (error: any) {
    console.error('Erro ao criar pedido:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// LISTAR PEDIDOS
// ==========================================

export async function listOrders(statusFilter?: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const where: any = { organizationId }
    if (statusFilter && statusFilter !== 'ALL') {
      where.status = statusFilter
    }

    const orders = await prisma.order.findMany({
      where,
      include: {
        customer: { select: { name: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, orders: JSON.parse(JSON.stringify(orders)) }
  } catch (error: any) {
    console.error('Erro ao listar pedidos:', error)
    return { success: false, error: error.message, orders: [] }
  }
}

// ==========================================
// BUSCAR PEDIDO POR ID
// ==========================================

export async function getOrderById(orderId: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        organizationId,
      },
      include: {
        customer: true,
        envelope: true,
        items: {
          include: { product: true }
        },
        transactions: true,
        createdBy: {
          include: { user: { select: { name: true } } }
        }
      },
    })

    if (!order) {
      return { success: false, error: 'Pedido não encontrado.' }
    }

    return { success: true, order: JSON.parse(JSON.stringify(order)) }
  } catch (error: any) {
    console.error('Erro ao buscar pedido:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// ATUALIZAR STATUS DO PEDIDO
// ==========================================

export async function updateOrderStatus(orderId: string, newStatus: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const order = await prisma.order.update({
      where: { id: orderId, organizationId },
      data: { status: newStatus }
    })

    // TODO: Se newStatus for CANCELED, implementar lógica de devolução de estoque (estorno).

    return { success: true, order: JSON.parse(JSON.stringify(order)) }
  } catch (error: any) {
    console.error('Erro ao atualizar status:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// AGENDA DE PRODUÇÃO (SIMPLIFICADA)
// ==========================================

export async function getProductionAgenda() {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)

    const orders = await prisma.order.findMany({
      where: {
        organizationId,
        status: { not: 'CANCELED' },
        OR: [
          { status: { in: ['BUDGET', 'APPROVED', 'IN_PRODUCTION', 'READY'] } },
          { status: 'DELIVERED', updatedAt: { gte: twentyFourHoursAgo } }
        ]
      },
      include: {
        customer: { select: { name: true, phone: true } },
        items: {
          include: { product: { select: { name: true } } }
        },
        envelope: true
      },
      orderBy: { expectedDate: 'asc' }
    })

    const todo = orders.filter(o => ['BUDGET', 'APPROVED', 'IN_PRODUCTION'].includes(o.status))
    const done = orders.filter(o => ['READY', 'DELIVERED'].includes(o.status))

    return { 
      success: true, 
      todo: JSON.parse(JSON.stringify(todo)), 
      done: JSON.parse(JSON.stringify(done)) 
    }
  } catch (error: any) {
    console.error('Erro ao buscar agenda:', error)
    return { success: false, error: error.message, todo: [], done: [] }
  }
}
