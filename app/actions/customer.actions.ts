'use server'

import prisma from '@/lib/prisma'
import { getAuthenticatedContext } from '@/lib/auth-context'

// ==========================================
// TIPOS
// ==========================================

export type CustomerFormData = {
  type: 'PF' | 'PJ'
  name: string
  document?: string
  phone?: string
  whatsapp?: string
  email?: string
  address?: string
  birthDate?: string
  notes?: string
  preferences?: string
}

// ==========================================
// CRIAR CLIENTE
// ==========================================

/**
 * Cria um novo cliente associado à Organização (Tenant) ativa.
 * O organizationId é injetado automaticamente via sessão.
 */
export async function createCustomer(data: CustomerFormData) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const customer = await prisma.customer.create({
      data: {
        organizationId,
        type: data.type,
        name: data.name,
        document: data.document || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
        preferences: data.preferences || null,
      },
    })

    return { success: true, customer }
  } catch (error: any) {
    console.error('Erro ao criar cliente:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// LISTAR CLIENTES
// ==========================================

/**
 * Retorna todos os clientes da Organização ativa.
 * Aceita um termo de busca opcional que filtra por nome, documento ou e-mail.
 */
export async function listCustomers(search?: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const where: any = { organizationId }

    if (search && search.trim()) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { document: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ]
    }

    const customers = await prisma.customer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { orders: true },
        },
      },
    })

    return { success: true, customers }
  } catch (error: any) {
    console.error('Erro ao listar clientes:', error)
    return { success: false, error: error.message, customers: [] }
  }
}

// ==========================================
// BUSCAR CLIENTE POR ID
// ==========================================

/**
 * Retorna os dados completos de um cliente, incluindo pedidos e transações.
 * Filtra pelo organizationId para garantir isolamento B2B.
 */
export async function getCustomerById(customerId: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId, // ISOLAMENTO B2B
      },
      include: {
        orders: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    })

    if (!customer) {
      return { success: false, error: 'Cliente não encontrado.' }
    }

    return { success: true, customer }
  } catch (error: any) {
    console.error('Erro ao buscar cliente:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// ATUALIZAR CLIENTE
// ==========================================

/**
 * Atualiza os dados de um cliente existente.
 * Verifica se o cliente pertence à Organização ativa antes de atualizar.
 */
export async function updateCustomer(customerId: string, data: CustomerFormData) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    // Verificar se o cliente pertence a esta organização
    const existing = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
    })

    if (!existing) {
      return { success: false, error: 'Cliente não encontrado.' }
    }

    const customer = await prisma.customer.update({
      where: { id: customerId },
      data: {
        type: data.type,
        name: data.name,
        document: data.document || null,
        phone: data.phone || null,
        whatsapp: data.whatsapp || null,
        email: data.email || null,
        address: data.address || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        notes: data.notes || null,
        preferences: data.preferences || null,
      },
    })

    return { success: true, customer }
  } catch (error: any) {
    console.error('Erro ao atualizar cliente:', error)
    return { success: false, error: error.message }
  }
}

// ==========================================
// DELETAR CLIENTE
// ==========================================

/**
 * Remove um cliente. Verifica se pertence à organização ativa.
 * ATENÇÃO: Clientes com pedidos vinculados não podem ser removidos
 * para preservar a integridade do histórico financeiro.
 */
export async function deleteCustomer(customerId: string) {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const existing = await prisma.customer.findFirst({
      where: { id: customerId, organizationId },
      include: { _count: { select: { orders: true } } },
    })

    if (!existing) {
      return { success: false, error: 'Cliente não encontrado.' }
    }

    if (existing._count.orders > 0) {
      return {
        success: false,
        error: `Este cliente possui ${existing._count.orders} pedido(s) vinculado(s) e não pode ser removido.`,
      }
    }

    await prisma.customer.delete({
      where: { id: customerId },
    })

    return { success: true }
  } catch (error: any) {
    console.error('Erro ao deletar cliente:', error)
    return { success: false, error: error.message }
  }
}
