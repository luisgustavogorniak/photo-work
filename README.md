# Aplicativo de Afazeres

Um aplicativo de tarefas minimalista criado para demonstrar como uma arquitetura moderna pode resolver problemas comuns com menos código e uma estrutura clara.
---

## Objetivos do Projeto

- Construir um aplicativo CRUD do mundo real com autenticação
- Manter o código-fonte pequeno e legível
- Evitar abstrações desnecessárias
- Usar uma stack de tecnologias moderna para reduzir o código repetitivo, não para adicionar complexidade

## Stack de Ferramentas

- Next.js (App Router)
- Prisma
- Better Auth
- PostgreSQL
- Tailwind CSS

## Funcionalidades

- Autenticação de usuários
- Criar, editar e excluir tarefas (todos)
- Persistência do estado de conclusão
- Interface de usuário limpa e minimalista

## Executando localmente

### 1. Clone o repositório
```
git clone https://github.com/luisgustavogorniak/next-auth-todo.git
cd next-auth-todo
```

### 2. Instale as dependências
```
npm install
```

### 3. Variáveis ​​de ambiente
Este projeto usa o Prisma para acesso ao banco de dados e o Better-Auth para autenticação.

Crie um arquivo `.env` e forneça as seguintes variáveis:
```
DATABASE_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=
```

Você pode usar qualquer banco de dados compatível com PostgreSQL.

Se você ainda não possui um banco de dados, pode criar um banco de dados PostgreSQL gratuito usando serviços como Prisma Postgres, Supabase ou Neon.

Após definir a variável `DATABASE_URL`, execute:

npx prisma migrate dev

### 4. Execute o servidor de desenvolvimento
```
npm run dev
```
---
Para obter mais detalhes sobre a configuração de autenticação e os provedores suportados, consulte a documentação oficial:
https://better-auth.com/
