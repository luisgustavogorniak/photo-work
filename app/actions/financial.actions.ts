'use server'

import prisma from '@/lib/prisma'
import { getAuthenticatedContext } from '@/lib/auth-context'

export async function getFinancialDashboard() {
  try {
    const { organizationId } = await getAuthenticatedContext()

    // Consideramos faturamento qualquer pedido não cancelado e não orçamento
    const validStatuses = ['APPROVED', 'IN_PRODUCTION', 'READY', 'DELIVERED']

    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // 1. Pedidos do Mês Atual
    const currentMonthOrders = await prisma.order.findMany({
      where: {
        organizationId,
        status: { in: validStatuses },
        createdAt: {
          gte: firstDayOfMonth,
          lte: lastDayOfMonth
        }
      },
      include: {
        items: { include: { product: true } }
      }
    })

    // Calcular Métricas Principais
    let faturamentoTotal = 0
    let valoresReceber = 0
    let totalPedidos = currentMonthOrders.length

    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {}

    currentMonthOrders.forEach(order => {
      const total = Number(order.totalAmount)
      const advance = Number(order.advancePayment || 0)
      
      faturamentoTotal += total
      // O que falta receber (assumindo que entregues e prontos podem ter pago na hora, mas para MVP vamos descontar apenas o advance)
      valoresReceber += Math.max(0, total - advance)

      // Agrupar produtos
      order.items.forEach(item => {
        const prodId = item.productId
        if (!productSales[prodId]) {
          productSales[prodId] = { name: item.product.name, quantity: 0, revenue: 0 }
        }
        productSales[prodId].quantity += Number(item.quantity)
        productSales[prodId].revenue += Number(item.total)
      })
    })

    const ticketMedio = totalPedidos > 0 ? faturamentoTotal / totalPedidos : 0

    // Top Produtos
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5)

    // 2. Gráfico: Faturamento dos últimos 6 meses
    const last6Months = []
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const start = new Date(d.getFullYear(), d.getMonth(), 1)
      const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59)
      
      const ordersInMonth = await prisma.order.aggregate({
        where: {
          organizationId,
          status: { in: validStatuses },
          createdAt: { gte: start, lte: end }
        },
        _sum: { totalAmount: true }
      })

      last6Months.push({
        month: d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        total: Number(ordersInMonth._sum.totalAmount || 0)
      })
    }

    // 3. Distribuição por Status Atual (Independente do mês)
    const statusDistributionRaw = await prisma.order.groupBy({
      by: ['status'],
      where: { organizationId, status: { not: 'CANCELED' } },
      _count: true
    })

    const statusDistribution = statusDistributionRaw.map(s => ({
      status: s.status,
      count: s._count
    }))

    return {
      success: true,
      data: {
        currentMonth: {
          faturamentoTotal,
          valoresReceber,
          ticketMedio,
          totalPedidos
        },
        topProducts,
        last6Months,
        statusDistribution
      }
    }

  } catch (error: any) {
    console.error('Erro no dashboard financeiro:', error)
    return { success: false, error: error.message }
  }
}
