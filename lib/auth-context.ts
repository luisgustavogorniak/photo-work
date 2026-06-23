'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'
import prisma from '@/lib/prisma'

/**
 * Retorna a sessão autenticada e o organizationId ativo.
 * Lança erro se o usuário não estiver logado ou sem organização ativa.
 * 
 * REGRA DE OURO: Toda Server Action de negócio DEVE chamar esta função
 * antes de qualquer operação no banco de dados.
 */
export async function getAuthenticatedContext() {
  const session = await auth.api.getSession({
    headers: await headers()
  })

  if (!session || !session.user) {
    throw new Error('Usuário não autenticado.')
  }

  const organizationId = session.session.activeOrganizationId

  if (!organizationId) {
    throw new Error('Nenhuma organização ativa. Faça o onboarding primeiro.')
  }

  // Buscar o Member ID correspondente
  const member = await prisma.member.findFirst({
    where: { userId: session.user.id, organizationId }
  })

  return {
    userId: session.user.id,
    organizationId,
    memberId: member?.id,
    session,
  }
}
