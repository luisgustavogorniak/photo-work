'use server'

import prisma from '@/lib/prisma'
import { getAuthenticatedContext } from '@/lib/auth-context'

// ==========================================
// CRIAR FLUXO DE PRODUÇÃO
// ==========================================

export async function createProductionWorkflow(name: string, steps: string[]) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    if (!name || steps.length === 0) {
      return { success: false, error: 'Nome e pelo menos uma etapa são obrigatórios.' }
    }

    const workflow = await prisma.productionWorkflow.create({
      data: {
        organizationId,
        name,
        steps: {
          create: steps.map((stepName, index) => ({
            name: stepName,
            orderIndex: index
          }))
        }
      },
      include: { steps: true }
    })

    return { success: true, workflow }
  } catch (error: any) {
    console.error('Erro ao criar fluxo:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// LISTAR FLUXOS DE PRODUÇÃO
// ==========================================

export async function listProductionWorkflows() {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const workflows = await prisma.productionWorkflow.findMany({
      where: { organizationId },
      include: {
        steps: { orderBy: { orderIndex: 'asc' } }
      },
      orderBy: { name: 'asc' }
    })

    return { success: true, workflows }
  } catch (error: any) {
    console.error('Erro ao listar fluxos:', error)
    return { success: false, error: error.message, workflows: [] }
  }
}

// ==========================================
// INICIAR PRODUÇÃO DE UM PEDIDO
// ==========================================

export async function startOrderProduction(orderId: string, workflowId: string) {
  try {
    const { organizationId, memberId } = await getAuthenticatedContext()
    if (!memberId) throw new Error("Usuário não possui Member ID.")

    // Verifica se o workflow existe e pega a primeira etapa
    const workflow = await prisma.productionWorkflow.findFirst({
      where: { id: workflowId, organizationId },
      include: { steps: { orderBy: { orderIndex: 'asc' } } }
    })

    if (!workflow || workflow.steps.length === 0) {
      return { success: false, error: 'Fluxo inválido ou sem etapas.' }
    }

    const firstStep = workflow.steps[0]

    // Verifica se já não tem status de produção aberto
    const existing = await prisma.orderProductionStatus.findFirst({
      where: { orderId }
    })

    if (existing) {
      return { success: false, error: 'Este pedido já está em um fluxo de produção.' }
    }

    await prisma.$transaction([
      // Atualiza o status do pedido para IN_PRODUCTION
      prisma.order.update({
        where: { id: orderId },
        data: { status: 'IN_PRODUCTION' }
      }),
      // Cria o registro na primeira etapa do Kanban
      prisma.orderProductionStatus.create({
        data: {
          orderId,
          stepId: firstStep.id,
          assignedToId: memberId,
          startedAt: new Date()
        }
      })
    ])

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao iniciar produção:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// MOVER PEDIDO PARA PRÓXIMA ETAPA (KANBAN)
// ==========================================

export async function moveOrderToStep(orderId: string, targetStepId: string) {
  try {
    const { organizationId, memberId } = await getAuthenticatedContext()
    if (!memberId) throw new Error("Usuário não possui Member ID.")

    // Pega o status atual que não foi completado
    const currentStatus = await prisma.orderProductionStatus.findFirst({
      where: { orderId, completedAt: null },
      include: { step: true }
    })

    if (!currentStatus) {
      return { success: false, error: 'O pedido não está em produção ou já foi finalizado.' }
    }

    // Se a target step for a mesma, não faz nada
    if (currentStatus.stepId === targetStepId) {
      return { success: true }
    }

    // Marca a atual como concluída e cria a nova
    await prisma.$transaction([
      prisma.orderProductionStatus.update({
        where: { id: currentStatus.id },
        data: { completedAt: new Date() }
      }),
      prisma.orderProductionStatus.create({
        data: {
          orderId,
          stepId: targetStepId,
          assignedToId: memberId,
          startedAt: new Date()
        }
      })
    ])

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao mover pedido:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// OBTER KANBAN BOARD
// ==========================================

export async function getKanbanBoard(workflowId: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    // Pega todas as etapas do workflow
    const workflow = await prisma.productionWorkflow.findFirst({
      where: { id: workflowId, organizationId },
      include: {
        steps: { orderBy: { orderIndex: 'asc' } }
      }
    })

    if (!workflow) return { success: false, error: 'Fluxo não encontrado' }

    const stepIds = workflow.steps.map(s => s.id)

    // Pega todos os pedidos que estão atualmente (completedAt == null) em alguma destas etapas
    const activeStatuses = await prisma.orderProductionStatus.findMany({
      where: {
        stepId: { in: stepIds },
        completedAt: null
      },
      include: {
        order: {
          include: {
            customer: { select: { name: true } },
            envelope: { select: { envelopeNumber: true } },
          }
        },
        assignedTo: {
          include: { user: { select: { name: true } } }
        }
      }
    })

    // Agrupa por stepId
    const board = workflow.steps.map(step => ({
      ...step,
      orders: activeStatuses
        .filter(s => s.stepId === step.id)
        .map(s => ({
          statusId: s.id,
          orderId: s.order.id,
          orderNumber: s.order.orderNumber,
          expectedDate: s.order.expectedDate,
          envelopeNumber: s.order.envelope?.envelopeNumber,
          customerName: s.order.customer.name,
          startedAt: s.startedAt,
          assignedTo: s.assignedTo?.user?.name || 'Desconhecido'
        }))
    }))

    return { success: true, board }
  } catch (error: any) {
    console.error('Erro ao carregar kanban:', error)
    return { success: false, error: error.message }
  }
}
