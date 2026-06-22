# ERP para Estúdios de Fotografia - SaaS B2B

Um software ERP completo e multi-tenant (vários lojistas), desenvolvido especificamente para estúdios de fotografia e serviços de imagem.

Esta plataforma conecta CRM, Vendas, Fluxo de Produção, Estoque e Financeiro em um único sistema centralizado, eliminando planilhas espalhadas e processos desconectados.

## Arquitetura e Stack Tecnológica

Este projeto utiliza uma stack moderna e robusta, focada em escalabilidade, performance e isolamento estrito de dados entre diferentes clientes (modelo B2B).

- **Framework:** Next.js 16 (App Router)
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL
- **ORM:** Prisma (`@prisma/adapter-pg`)
- **Autenticação:** Better Auth (com plugin de Organização/Multi-tenant)
- **Estilização:** TailwindCSS v4 + shadcn/ui

## Módulos Principais

1. **CRM e Clientes:** Histórico de clientes, preferências e dados demográficos.
2. **Vendas e Pedidos:** Conversão de orçamentos em pedidos. Gestão de sinais (pagamentos parciais), serviços digitais e controle do "Envelope Físico" do balcão.
3. **Fluxo de Produção:** Etapas de produção personalizáveis (ex: Impressão, Molduraria, Controle de Qualidade) para saber exatamente onde cada pedido está em tempo real.
4. **Estoque e Ficha Técnica:** Baixa automática de estoque baseada em "receitas" de produtos (ex: descontar a quantidade exata de madeira e vidro ao vender um quadro).
5. **Financeiro:** Gestão de fluxo de caixa, contas a pagar/receber e relatórios de lucratividade.

## Estratégia de Multi-Tenancy

Os dados são isolados logicamente em nível de linha (Row-Level Isolation). A entidade central `Organization` representa o estúdio (o lojista). Toda entidade crítica de negócio (Cliente, Pedido, Produto, etc.) possui uma relação obrigatória com o `organizationId`, garantindo que não haja vazamento de dados entre diferentes empresas que utilizam o SaaS.

## Instruções de Instalação

1. Clone o repositório.
2. Instale as dependências:
   ```bash
   npm install
   ```
3. Configure as variáveis de ambiente criando um arquivo `.env` com base nos requisitos.
4. Rode as migrações do banco de dados:
   ```bash
   npx prisma db push
   ```
5. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```
