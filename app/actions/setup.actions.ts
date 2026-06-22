'use server'

import prisma from '@/lib/prisma'
import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

/**
 * Seeds initial data for a newly created organization (Tenant).
 * This should be called immediately after the user creates their organization.
 */
export async function seedStudioEnvironment(organizationId: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers()
    })

    if (!session || !session.user) {
      throw new Error('Unauthorized')
    }

    // Verify if the user is a member of this organization
    const membership = await prisma.member.findFirst({
      where: {
        organizationId,
        userId: session.user.id
      }
    })

    if (!membership) {
      throw new Error('Unauthorized to seed this organization')
    }

    // Create Default Production Workflows
    // 1. Fluxo Simples (Foto 3x4, Revelação)
    await prisma.productionWorkflow.create({
      data: {
        organizationId,
        name: 'Fluxo Simples (Ex: Foto 3x4)',
        steps: {
          create: [
            { name: 'Recebido', orderIndex: 1 },
            { name: 'Impressão', orderIndex: 2 },
            { name: 'Pronto para Retirada', orderIndex: 3 },
            { name: 'Entregue', orderIndex: 4 },
          ]
        }
      }
    })

    // 2. Fluxo Complexo (Quadros)
    await prisma.productionWorkflow.create({
      data: {
        organizationId,
        name: 'Fluxo Complexo (Ex: Quadros)',
        steps: {
          create: [
            { name: 'Recebido', orderIndex: 1 },
            { name: 'Conferência de Arquivo', orderIndex: 2 },
            { name: 'Impressão', orderIndex: 3 },
            { name: 'Laminação', orderIndex: 4 },
            { name: 'Corte', orderIndex: 5 },
            { name: 'Molduraria', orderIndex: 6 },
            { name: 'Controle de Qualidade', orderIndex: 7 },
            { name: 'Pronto para Retirada', orderIndex: 8 },
            { name: 'Entregue', orderIndex: 9 },
          ]
        }
      }
    })

    return { success: true }
  } catch (error: any) {
    console.error('Error seeding studio environment:', error)
    return { success: false, error: error.message }
  }
}
