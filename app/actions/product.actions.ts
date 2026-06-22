'use server'

import prisma from '@/lib/prisma'
import { getAuthenticatedContext } from '@/lib/auth-context'
import { Prisma } from '@/generated/prisma/client'

// ==========================================
// TIPOS
// ==========================================

export type ProductFormData = {
  name: string
  type: 'RAW_MATERIAL' | 'FINISHED_GOOD' | 'SERVICE'
  costPrice?: number
  sellingPrice?: number
  minStock?: number
  currentStock?: number
  unitMeasure?: string
}

export type ProductComponentData = {
  childProductId: string
  quantityRequired: number
}

// ==========================================
// CRIAR PRODUTO
// ==========================================

export async function createProduct(data: ProductFormData) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const product = await prisma.product.create({
      data: {
        organizationId,
        name: data.name,
        type: data.type,
        costPrice: data.costPrice || 0,
        sellingPrice: data.sellingPrice || 0,
        minStock: data.minStock || 0,
        currentStock: data.currentStock || 0,
        unitMeasure: data.unitMeasure || 'UN',
      },
    })

    // Registra movimento de estoque inicial se houver estoque
    if (product.currentStock > 0) {
      await prisma.inventoryMovement.create({
        data: {
          organizationId,
          productId: product.id,
          type: 'IN',
          quantity: product.currentStock,
          reason: 'Saldo Inicial (Cadastro)',
          date: new Date()
        }
      })
    }

    return { success: true, product }
  } catch (error: any) {
    console.error('Erro ao criar produto:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// LISTAR PRODUTOS
// ==========================================

export async function listProducts(search?: string, typeFilter?: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const where: any = { organizationId }

    if (search && search.trim()) {
      where.name = { contains: search, mode: 'insensitive' }
    }

    if (typeFilter && typeFilter !== 'ALL') {
      where.type = typeFilter
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: { name: 'asc' },
    })

    return { success: true, products }
  } catch (error: any) {
    console.error('Erro ao listar produtos:', error)
    return { success: false, error: error.message, products: [] }
  }
}

// ==========================================
// BUSCAR PRODUTO POR ID
// ==========================================

export async function getProductById(productId: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        organizationId,
      },
      include: {
        components: { // Ficha Técnica
          include: {
            childProduct: true
          }
        },
        usedIn: { // Onde este produto é usado
          include: {
            parentProduct: true
          }
        },
        movements: {
          orderBy: { date: 'desc' },
          take: 10
        }
      },
    })

    if (!product) {
      return { success: false, error: 'Produto não encontrado.' }
    }

    return { success: true, product }
  } catch (error: any) {
    console.error('Erro ao buscar produto:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// ATUALIZAR PRODUTO
// ==========================================

export async function updateProduct(productId: string, data: ProductFormData) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const existing = await prisma.product.findFirst({
      where: { id: productId, organizationId },
    })

    if (!existing) {
      return { success: false, error: 'Produto não encontrado.' }
    }

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        name: data.name,
        type: data.type,
        costPrice: data.costPrice || 0,
        sellingPrice: data.sellingPrice || 0,
        minStock: data.minStock || 0,
        unitMeasure: data.unitMeasure || 'UN',
      },
    })

    return { success: true, product }
  } catch (error: any) {
    console.error('Erro ao atualizar produto:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// AJUSTE MANUAL DE ESTOQUE
// ==========================================

export async function adjustInventory(productId: string, quantity: number, type: 'IN' | 'OUT', reason: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const existing = await prisma.product.findFirst({
      where: { id: productId, organizationId },
    })

    if (!existing) {
      return { success: false, error: 'Produto não encontrado.' }
    }

    const newStock = type === 'IN' 
      ? existing.currentStock + quantity 
      : existing.currentStock - quantity

    if (newStock < 0) {
      return { success: false, error: 'Estoque insuficiente para esta saída.' }
    }

    // Transação para garantir consistência
    await prisma.$transaction([
      prisma.product.update({
        where: { id: productId },
        data: { currentStock: newStock }
      }),
      prisma.inventoryMovement.create({
        data: {
          organizationId,
          productId,
          type,
          quantity,
          reason,
          date: new Date()
        }
      })
    ])

    return { success: true, newStock }
  } catch (error: any) {
    console.error('Erro ao ajustar estoque:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// FICHA TÉCNICA (BILL OF MATERIALS)
// ==========================================

export async function addProductComponent(parentId: string, data: ProductComponentData) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    // Verifica parent
    const parent = await prisma.product.findFirst({
      where: { id: parentId, organizationId }
    })
    if (!parent) return { success: false, error: 'Produto base não encontrado.' }

    // Verifica child
    const child = await prisma.product.findFirst({
      where: { id: data.childProductId, organizationId }
    })
    if (!child) return { success: false, error: 'Insumo/Matéria-prima não encontrada.' }

    // Cria relação
    const component = await prisma.productComponent.create({
      data: {
        parentProductId: parentId,
        childProductId: data.childProductId,
        quantityRequired: data.quantityRequired
      }
    })

    return { success: true, component }
  } catch (error: any) {
    console.error('Erro ao adicionar componente:', error)
    return { success: false, error: error.message }
  }
}

export async function removeProductComponent(componentId: string) {
  try {
    await getAuthenticatedContext() // Apenas para validar a sessão

    await prisma.productComponent.delete({
      where: { id: componentId }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao remover componente:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// DELETAR PRODUTO
// ==========================================

export async function deleteProduct(productId: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const existing = await prisma.product.findFirst({
      where: { id: productId, organizationId },
      include: {
        _count: { select: { orderItems: true, usedIn: true, components: true } }
      }
    })

    if (!existing) return { success: false, error: 'Produto não encontrado.' }

    if (existing._count.orderItems > 0) {
      return { success: false, error: 'Não é possível remover produtos que já foram vendidos.' }
    }
    
    if (existing._count.usedIn > 0) {
      return { success: false, error: 'Não é possível remover um insumo que faz parte da ficha técnica de outro produto.' }
    }

    // Se tem componentes (Ficha Técnica), removemos eles primeiro
    if (existing._count.components > 0) {
      await prisma.productComponent.deleteMany({
        where: { parentProductId: productId }
      })
    }

    // Deleta os movimentos de estoque também
    await prisma.inventoryMovement.deleteMany({
      where: { productId }
    })

    await prisma.product.delete({
      where: { id: productId }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar produto:', error)
    return { success: false, error: error.message }
  }
}
