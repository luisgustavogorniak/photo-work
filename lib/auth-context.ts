'use server'

import { auth } from '@/lib/auth'
import { headers } from 'next/headers'

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

  return {
    userId: session.user.id,
    organizationId,
    session,
  }
}
