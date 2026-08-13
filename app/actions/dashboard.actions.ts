'use server'

import prisma from '@/lib/prisma'
import { getAuthenticatedContext } from '@/lib/auth-context'

export async function getDashboardSummary() {
  try {
    const { organizationId } = await getAuthenticatedContext()

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const [
      totalCustomers,
      pendingOrders,
      readyOrders,
      monthOrders,
      lowStockProducts,
      recentOrders,
    ] = await Promise.all([
      // Total de clientes cadastrados
      prisma.customer.count({ where: { organizationId } }),

      // Pedidos a fazer (aprovados, ainda não prontos)
      prisma.order.count({ where: { organizationId, status: { in: ['APPROVED', 'IN_PRODUCTION'] } } }),

      // Pedidos prontos aguardando retirada
      prisma.order.count({ where: { organizationId, status: 'READY' } }),

      // Faturamento e pedidos do mês
      prisma.order.findMany({
        where: {
          organizationId,
          status: { notIn: ['CANCELED', 'BUDGET'] },
          createdAt: { gte: firstDayOfMonth },
        },
        select: { totalAmount: true, discount: true },
      }),

      // Produtos abaixo do estoque mínimo
      prisma.product.findMany({
        where: {
          organizationId,
          type: { not: 'SERVICE' },
        },
        select: { name: true, currentStock: true, minStock: true },
      }),

      // Últimos 5 pedidos com cliente
      prisma.order.findMany({
        where: { organizationId, status: { not: 'CANCELED' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          customer: { select: { name: true } },
        },
      }),
    ])

    const faturamentoMes = monthOrders.reduce(
      (acc, o) => acc + Number(o.totalAmount) - Number(o.discount),
      0
    )

    const alertaEstoque = lowStockProducts
      .filter(p => Number(p.currentStock) <= Number(p.minStock))
      .map(p => ({ name: p.name, currentStock: Number(p.currentStock), minStock: Number(p.minStock) }))

    return {
      success: true,
      data: {
        totalCustomers,
        pendingOrders,
        readyOrders,
        faturamentoMes,
        totalOrdersMes: monthOrders.length,
        alertaEstoque,
        recentOrders: recentOrders.map(o => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customer?.name ?? '—',
          status: o.status,
          totalAmount: Number(o.totalAmount),
          createdAt: o.createdAt.toISOString(),
        })),
      },
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}
