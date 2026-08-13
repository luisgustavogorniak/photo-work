import { PrismaClient } from '../generated/prisma/client'
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"
import * as dotenv from 'dotenv'

dotenv.config()

const url = new URL(process.env.DATABASE_URL!)
const pool = new Pool({
  user: url.username,
  password: url.password,
  host: url.hostname,
  port: parseInt(url.port || '5432'),
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
})
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados...')

  const organization = await prisma.organization.findFirst()
  const user = await prisma.user.findFirst()

  if (!organization || !user) {
    console.log('⚠️ Organização ou Usuário não encontrados. Faça login e crie o estúdio primeiro na interface.')
    return
  }

  let member = await prisma.member.findFirst({ where: { organizationId: organization.id } })
  if (!member) {
    member = await prisma.member.create({
      data: { id: crypto.randomUUID(), organizationId: organization.id, userId: user.id, role: 'ADMIN' }
    })
  }

  const orgId = organization.id
  const memberId = member.id
  console.log(`🏢 Usando Organização: ${organization.name}`)

  console.log('🧹 Limpando dados antigos...')
  await prisma.financialTransaction.deleteMany({ where: { organizationId: orgId } })
  await prisma.order.deleteMany({ where: { organizationId: orgId } })
  await prisma.inventoryMovement.deleteMany({ where: { organizationId: orgId } })
  await prisma.product.deleteMany({ where: { organizationId: orgId } })
  await prisma.customer.deleteMany({ where: { organizationId: orgId } })
  await prisma.productionWorkflow.deleteMany({ where: { organizationId: orgId } })

  // =====================================================
  // CLIENTES
  // =====================================================
  console.log('👥 Criando Clientes...')
  const [c1, c2, c3, c4, c5, c6, c7, c8] = await Promise.all([
    prisma.customer.create({ data: { organizationId: orgId, type: 'PF', name: 'Ana Paula Ferreira', phone: '(44) 99812-3344', whatsapp: '(44) 99812-3344', email: 'ana.ferreira@gmail.com', notes: 'Gosta de acabamento fosco.' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PF', name: 'Roberto e Júlia Mendes', phone: '(44) 99654-7788', email: 'roberto.mendes@outlook.com', preferences: 'Tons quentes, estilo vintage.' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PJ', name: 'Ótica Visão Nítida', document: '28.431.900/0001-44', phone: '(44) 3223-1100', email: 'contato@visaonitida.com.br' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PF', name: 'Carla Duarte', phone: '(44) 99741-5522', email: 'carla.duarte@hotmail.com' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PF', name: 'Marcos Henrique Souza', phone: '(44) 99333-0099', whatsapp: '(44) 99333-0099' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PJ', name: 'Estúdio Criativo Ltda.', document: '11.222.333/0001-55', phone: '(44) 3344-5566', email: 'studio@criativo.com' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PF', name: 'Fernanda Alves', phone: '(44) 98800-1234', email: 'fe.alves@gmail.com', notes: 'Formatura turma de medicina 2024.' } }),
    prisma.customer.create({ data: { organizationId: orgId, type: 'PF', name: 'Pedro Cavalcanti', phone: '(44) 99100-7788' } }),
  ])

  // =====================================================
  // PRODUTOS E INSUMOS
  // =====================================================
  console.log('📦 Criando Produtos e Estoque...')

  // Insumos (RAW_MATERIAL)
  const papelBrilho = await prisma.product.create({ data: { organizationId: orgId, name: 'Papel Fotográfico Brilho (Rolo 10cm)', type: 'RAW_MATERIAL', costPrice: 85.00, currentStock: 8, minStock: 2, unitMeasure: 'UN' } })
  const papelFosco  = await prisma.product.create({ data: { organizationId: orgId, name: 'Papel Fotográfico Fosco (Rolo 10cm)', type: 'RAW_MATERIAL', costPrice: 95.00, currentStock: 3, minStock: 2, unitMeasure: 'UN' } })
  const papelGrande = await prisma.product.create({ data: { organizationId: orgId, name: 'Papel Fotográfico A3 (Folha)', type: 'RAW_MATERIAL', costPrice: 4.50, currentStock: 150, minStock: 30, unitMeasure: 'UN' } })
  const molduraPreta = await prisma.product.create({ data: { organizationId: orgId, name: 'Moldura Slim Preta 2cm (Metro)', type: 'RAW_MATERIAL', costPrice: 12.00, currentStock: 45, minStock: 10, unitMeasure: 'M' } })
  const vidroAnti   = await prisma.product.create({ data: { organizationId: orgId, name: 'Vidro Antirreflexo 20x30cm', type: 'RAW_MATERIAL', costPrice: 6.50, currentStock: 25, minStock: 8, unitMeasure: 'UN' } })
  const passepartout = await prisma.product.create({ data: { organizationId: orgId, name: 'Passepartout Branco 30x40cm', type: 'RAW_MATERIAL', costPrice: 3.80, currentStock: 60, minStock: 15, unitMeasure: 'UN' } })

  // Serviços
  const revSimples  = await prisma.product.create({ data: { organizationId: orgId, name: 'Revelação 10x15cm (Brilho)', type: 'SERVICE', sellingPrice: 0.90, costPrice: 0.25, currentStock: 0, minStock: 0, unitMeasure: 'UN' } })
  const revFosco    = await prisma.product.create({ data: { organizationId: orgId, name: 'Revelação 10x15cm (Fosco)', type: 'SERVICE', sellingPrice: 1.10, costPrice: 0.35, currentStock: 0, minStock: 0, unitMeasure: 'UN' } })
  const revelA4     = await prisma.product.create({ data: { organizationId: orgId, name: 'Impressão A3 Alta Resolução', type: 'SERVICE', sellingPrice: 18.00, costPrice: 6.00, currentStock: 0, minStock: 0, unitMeasure: 'UN' } })
  const restauracao = await prisma.product.create({ data: { organizationId: orgId, name: 'Restauração Digital de Foto Antiga', type: 'SERVICE', sellingPrice: 120.00, costPrice: 0, currentStock: 0, minStock: 0, unitMeasure: 'UN' } })

  // Produto Final (FINISHED_GOOD)
  const quadro2030  = await prisma.product.create({ data: { organizationId: orgId, name: 'Quadro Completo 20x30cm', type: 'FINISHED_GOOD', costPrice: 28.00, sellingPrice: 85.00, currentStock: 3, minStock: 1, unitMeasure: 'UN' } })
  const quadro3040  = await prisma.product.create({ data: { organizationId: orgId, name: 'Quadro Completo 30x40cm', type: 'FINISHED_GOOD', costPrice: 42.00, sellingPrice: 130.00, currentStock: 2, minStock: 1, unitMeasure: 'UN' } })

  // Fichas Técnicas
  await prisma.productComponent.createMany({ data: [
    { parentProductId: quadro2030.id, childProductId: molduraPreta.id, quantityRequired: 1.0 },
    { parentProductId: quadro2030.id, childProductId: vidroAnti.id, quantityRequired: 1 },
    { parentProductId: quadro2030.id, childProductId: passepartout.id, quantityRequired: 1 },
    { parentProductId: quadro3040.id, childProductId: molduraPreta.id, quantityRequired: 1.4 },
    { parentProductId: quadro3040.id, childProductId: vidroAnti.id, quantityRequired: 1 },
  ]})

  // Movimentações de estoque anteriores para histórico
  await prisma.inventoryMovement.createMany({ data: [
    { organizationId: orgId, productId: papelBrilho.id, type: 'IN', quantity: 10, reason: 'Compra fornecedor Konica', date: new Date(Date.now() - 86400000 * 15) },
    { organizationId: orgId, productId: papelBrilho.id, type: 'OUT', quantity: 2, reason: 'Pedido #1003', date: new Date(Date.now() - 86400000 * 5) },
    { organizationId: orgId, productId: papelFosco.id, type: 'IN', quantity: 5, reason: 'Compra fornecedor Fujifilm', date: new Date(Date.now() - 86400000 * 20) },
    { organizationId: orgId, productId: papelFosco.id, type: 'OUT', quantity: 2, reason: 'Pedido #1004', date: new Date(Date.now() - 86400000 * 3) },
    { organizationId: orgId, productId: molduraPreta.id, type: 'IN', quantity: 60, reason: 'Compra mensal', date: new Date(Date.now() - 86400000 * 10) },
    { organizationId: orgId, productId: molduraPreta.id, type: 'OUT', quantity: 15, reason: 'Produção quadros semana', date: new Date(Date.now() - 86400000 * 2) },
  ]})

  // =====================================================
  // PEDIDOS
  // =====================================================
  console.log('🛍️ Criando Pedidos...')

  // Pedido 1 – A Fazer (APPROVED, urgente)
  await prisma.order.create({ data: {
    organizationId: orgId, customerId: c7.id, createdById: memberId,
    status: 'APPROVED', priority: 'URGENT',
    totalAmount: 360, discount: 0, laboratoryCost: 0, balancePending: 60,
    expectedDate: new Date(Date.now() + 86400000 * 2),
    customerNotes: 'Formatura — prazo firme!',
    items: { create: [ { productId: quadro3040.id, quantity: 3, unitPrice: 130, total: 390 } ] },
    envelope: { create: { envelopeNumber: '1007', receivedMaterials: ['PENDRIVE'], printSize: '30x40', paperSurface: 'Brilho', copiesQuantity: 3 } }
  }})

  // Pedido 2 – A Fazer (APPROVED, normal)
  await prisma.order.create({ data: {
    organizationId: orgId, customerId: c4.id, createdById: memberId,
    status: 'APPROVED', priority: 'NORMAL',
    totalAmount: 108, discount: 0, laboratoryCost: 0, balancePending: 108,
    expectedDate: new Date(Date.now() + 86400000 * 4),
    items: { create: [ { productId: revSimples.id, quantity: 120, unitPrice: 0.90, total: 108 } ] },
    envelope: { create: { envelopeNumber: '1008', receivedMaterials: ['MEMORY_CARD'], printSize: '10x15', paperSurface: 'Brilho', copiesQuantity: 120 } }
  }})

  // Pedido 3 – A Fazer (APPROVED, normal, com restauração)
  await prisma.order.create({ data: {
    organizationId: orgId, customerId: c5.id, createdById: memberId,
    status: 'APPROVED', priority: 'NORMAL',
    totalAmount: 120, discount: 0, laboratoryCost: 0, balancePending: 120,
    expectedDate: new Date(Date.now() + 86400000 * 6),
    internalNotes: 'Foto escaneada pelo cliente via WhatsApp.',
    items: { create: [ { productId: restauracao.id, quantity: 1, unitPrice: 120, total: 120 } ] },
    envelope: { create: { envelopeNumber: '1009', receivedMaterials: ['INTERNET'], digitalServicesNotes: 'Restauração de foto de batizado anos 70.' } }
  }})

  // Pedido 4 – Finalizado (READY) - botão "Entregue" aparece
  await prisma.order.create({ data: {
    organizationId: orgId, customerId: c2.id, createdById: memberId,
    status: 'READY', priority: 'NORMAL',
    totalAmount: 170, discount: 20, laboratoryCost: 0, balancePending: 0,
    expectedDate: new Date(Date.now() - 86400000 * 1),
    items: { create: [
      { productId: quadro2030.id, quantity: 2, unitPrice: 85, total: 170 },
    ]},
    envelope: { create: { envelopeNumber: '1005', receivedMaterials: ['PENDRIVE'], printSize: '20x30', paperSurface: 'Fosco', copiesQuantity: 2 } }
  }})

  // Pedido 5 – Finalizado (READY)
  await prisma.order.create({ data: {
    organizationId: orgId, customerId: c1.id, createdById: memberId,
    status: 'READY', priority: 'NORMAL',
    totalAmount: 54, discount: 0, laboratoryCost: 0, balancePending: 0,
    expectedDate: new Date(),
    items: { create: [ { productId: revFosco.id, quantity: 60, unitPrice: 1.10, total: 66 } ] },
    envelope: { create: { envelopeNumber: '1006', receivedMaterials: ['INTERNET'], printSize: '10x15', paperSurface: 'Fosco', copiesQuantity: 60 } }
  }})

  // =====================================================
  // TRANSAÇÕES FINANCEIRAS (para o Dashboard financeiro)
  // =====================================================
  console.log('💰 Criando Transações Financeiras...')

  const daysAgo = (d: number) => new Date(Date.now() - 86400000 * d)

  await prisma.financialTransaction.createMany({ data: [
    // Entradas passadas (pagas)
    { organizationId: orgId, type: 'INCOME', amount: 220.00, dueDate: daysAgo(30), paidAt: daysAgo(30), status: 'PAID', paymentMethod: 'PIX', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 85.00,  dueDate: daysAgo(25), paidAt: daysAgo(25), status: 'PAID', paymentMethod: 'CASH', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 360.00, dueDate: daysAgo(20), paidAt: daysAgo(20), status: 'PAID', paymentMethod: 'CREDIT', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 120.00, dueDate: daysAgo(18), paidAt: daysAgo(18), status: 'PAID', paymentMethod: 'PIX', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 96.00,  dueDate: daysAgo(15), paidAt: daysAgo(15), status: 'PAID', paymentMethod: 'DEBIT', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 130.00, dueDate: daysAgo(12), paidAt: daysAgo(12), status: 'PAID', paymentMethod: 'PIX', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 54.00,  dueDate: daysAgo(10), paidAt: daysAgo(10), status: 'PAID', paymentMethod: 'CASH', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 170.00, dueDate: daysAgo(8),  paidAt: daysAgo(8),  status: 'PAID', paymentMethod: 'PIX', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 260.00, dueDate: daysAgo(5),  paidAt: daysAgo(5),  status: 'PAID', paymentMethod: 'PIX', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 108.00, dueDate: daysAgo(3),  paidAt: daysAgo(3),  status: 'PAID', paymentMethod: 'CREDIT', category: 'Venda' },

    // Despesas pagas
    { organizationId: orgId, type: 'EXPENSE', amount: 85.00,  dueDate: daysAgo(28), paidAt: daysAgo(28), status: 'PAID', paymentMethod: 'PIX', category: 'Insumo' },
    { organizationId: orgId, type: 'EXPENSE', amount: 95.00,  dueDate: daysAgo(20), paidAt: daysAgo(20), status: 'PAID', paymentMethod: 'BOLETO', category: 'Insumo' },
    { organizationId: orgId, type: 'EXPENSE', amount: 120.00, dueDate: daysAgo(12), paidAt: daysAgo(12), status: 'PAID', paymentMethod: 'PIX', category: 'Insumo' },
    { organizationId: orgId, type: 'EXPENSE', amount: 40.00,  dueDate: daysAgo(7),  paidAt: daysAgo(7),  status: 'PAID', paymentMethod: 'CASH', category: 'Manutenção' },

    // Entradas pendentes (a receber)
    { organizationId: orgId, type: 'INCOME', amount: 360.00, dueDate: new Date(Date.now() + 86400000 * 2), status: 'PENDING', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 120.00, dueDate: new Date(Date.now() + 86400000 * 6), status: 'PENDING', category: 'Venda' },
    { organizationId: orgId, type: 'INCOME', amount: 108.00, dueDate: new Date(Date.now() + 86400000 * 4), status: 'PENDING', category: 'Venda' },

    // Despesa pendente (a pagar)
    { organizationId: orgId, type: 'EXPENSE', amount: 95.00, dueDate: new Date(Date.now() + 86400000 * 10), status: 'PENDING', category: 'Insumo' },
  ]})

  console.log('✅ Seed concluído com sucesso!')
  console.log('📊 Resumo:')
  console.log('   - 8 clientes')
  console.log('   - 12 produtos/insumos/serviços')
  console.log('   - 5 pedidos (3 "A Fazer", 2 "Finalizados")')
  console.log('   - 22 transações financeiras')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
