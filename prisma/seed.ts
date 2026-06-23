import { PrismaClient } from '../generated/prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando Seed do Banco de Dados...')

  // 1. Identificar a Organização e Membro
  let organization = await prisma.organization.findFirst()
  let user = await prisma.user.findFirst()

  if (!organization || !user) {
    console.log('⚠️ Organização ou Usuário não encontrados. Faça login e crie o estúdio primeiro na interface.')
    return
  }

  let member = await prisma.member.findFirst({ where: { organizationId: organization.id } })
  if (!member) {
    member = await prisma.member.create({
      data: {
        organizationId: organization.id,
        userId: user.id,
        role: 'ADMIN'
      }
    })
  }

  const orgId = organization.id
  const memberId = member.id

  console.log(`🏢 Usando Organização: ${organization.name}`)

  // 2. Limpar dados de negócio antigos (Cascata vai limpar o resto)
  console.log('🧹 Limpando dados antigos...')
  await prisma.order.deleteMany({ where: { organizationId: orgId } })
  await prisma.product.deleteMany({ where: { organizationId: orgId } })
  await prisma.customer.deleteMany({ where: { organizationId: orgId } })
  await prisma.productionWorkflow.deleteMany({ where: { organizationId: orgId } })

  // 3. Criar Clientes
  console.log('👥 Criando Clientes...')
  const customer1 = await prisma.customer.create({
    data: {
      organizationId: orgId, type: 'PF', name: 'Marina e Carlos (Casamento)', phone: '(11) 99999-1111', preferences: 'Gostam de tons quentes.'
    }
  })
  const customer2 = await prisma.customer.create({
    data: {
      organizationId: orgId, type: 'PJ', name: 'Agência de Publicidade X', document: '12.345.678/0001-99', phone: '(11) 3333-4444'
    }
  })

  // 4. Criar Produtos e Insumos
  console.log('📦 Criando Produtos e Estoque...')
  
  // Insumos
  const moldura = await prisma.product.create({
    data: { organizationId: orgId, name: 'Moldura Preta 2cm (Barra)', type: 'RAW_MATERIAL', costPrice: 15, currentStock: 100, minStock: 20, unitMeasure: 'M' }
  })
  const vidro = await prisma.product.create({
    data: { organizationId: orgId, name: 'Vidro Antirreflexo 30x40', type: 'RAW_MATERIAL', costPrice: 8, currentStock: 50, minStock: 10, unitMeasure: 'UN' }
  })
  const papel = await prisma.product.create({
    data: { organizationId: orgId, name: 'Papel Fotográfico Fosco (Rolo)', type: 'RAW_MATERIAL', costPrice: 120, currentStock: 5, minStock: 1, unitMeasure: 'UN' }
  })

  // Serviço
  const diag = await prisma.product.create({
    data: { organizationId: orgId, name: 'Serviço de Diagramação (Hora)', type: 'SERVICE', sellingPrice: 150, unitMeasure: 'UN' }
  })

  // Produto Final
  const quadro = await prisma.product.create({
    data: { organizationId: orgId, name: 'Quadro Completo 30x40cm', type: 'FINISHED_GOOD', costPrice: 35, sellingPrice: 120, unitMeasure: 'UN' }
  })

  // Ficha Técnica do Quadro
  await prisma.productComponent.createMany({
    data: [
      { parentProductId: quadro.id, childProductId: moldura.id, quantityRequired: 1.5 }, // 1.5 metros
      { parentProductId: quadro.id, childProductId: vidro.id, quantityRequired: 1 },     // 1 vidro
    ]
  })

  // 5. Criar Fluxos de Produção (Workflows)
  console.log('⚙️ Criando Fluxos de Produção (Kanban)...')
  const wfQuadros = await prisma.productionWorkflow.create({
    data: {
      organizationId: orgId,
      name: 'Produção de Quadros',
      steps: {
        create: [
          { name: 'Impressão', orderIndex: 0 },
          { name: 'Corte de Moldura', orderIndex: 1 },
          { name: 'Montagem', orderIndex: 2 },
          { name: 'Embalagem', orderIndex: 3 },
        ]
      }
    },
    include: { steps: { orderBy: { orderIndex: 'asc' } } }
  })

  // 6. Criar Pedidos (Orders)
  console.log('🛍️ Criando Pedidos...')
  
  // Pedido 1: Aprovado (Ainda não foi pra produção)
  await prisma.order.create({
    data: {
      organizationId: orgId, customerId: customer1.id, createdById: memberId,
      status: 'APPROVED', totalAmount: 240, expectedDate: new Date(Date.now() + 86400000 * 5),
      items: {
        create: [ { productId: quadro.id, quantity: 2, unitPrice: 120, total: 240 } ]
      },
      envelope: {
        create: { envelopeNumber: '1001', receivedMaterials: ['PENDRIVE'], printSize: '30x40', paperSurface: 'Fosco', copiesQuantity: 2 }
      }
    }
  })

  // Pedido 2: Em Produção (Etapa 2 - Corte)
  const order2 = await prisma.order.create({
    data: {
      organizationId: orgId, customerId: customer2.id, createdById: memberId,
      status: 'IN_PRODUCTION', totalAmount: 120, expectedDate: new Date(Date.now() - 86400000 * 1), // Atrasado 1 dia
      items: {
        create: [ { productId: quadro.id, quantity: 1, unitPrice: 120, total: 120 } ]
      },
      envelope: {
        create: { envelopeNumber: '1002', receivedMaterials: ['INTERNET'], printSize: '30x40', digitalServicesNotes: 'Cuidado com o corte nas bordas.' }
      }
    }
  })

  await prisma.orderProductionStatus.create({
    data: {
      orderId: order2.id,
      stepId: wfQuadros.steps[1].id, // Etapa de Corte
      assignedToId: memberId,
      startedAt: new Date()
    }
  })

  // Pedido 3: Pronto
  await prisma.order.create({
    data: {
      organizationId: orgId, customerId: customer1.id, createdById: memberId,
      status: 'READY', totalAmount: 150, expectedDate: new Date(),
      items: {
        create: [ { productId: diag.id, quantity: 1, unitPrice: 150, total: 150 } ]
      },
      envelope: {
        create: { envelopeNumber: '1003', receivedMaterials: ['INTERNET'], digitalServicesNotes: 'Apenas diagrama.' }
      }
    }
  })

  console.log('✅ Seed concluído com sucesso!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
