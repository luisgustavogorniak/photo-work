# Design System — Photo Work SaaS

Este documento define a identidade visual e os padrões de UI/UX do sistema. Toda nova tela ou componente deve seguir estas diretrizes antes de ser codificado.

## Identidade Visual

O sistema foi pensado para transmitir a atmosfera de um estúdio fotográfico profissional: escuro, quente e premium. A referência visual é a "câmara escura" da fotografia analógica — pretos foscos, detalhes em cobre e luz âmbar.

---

## Paleta de Cores

| Papel                  | Nome          | Hex       |
|------------------------|---------------|-----------|
| Fundo principal        | Preto Fosco   | `#0F0E0C` |
| Superfícies e Cards    | Carvão        | `#1A1916` |
| Bordas e Divisores     | Carvão Claro  | `#2C2A26` |
| Destaque / Accent      | Cobre Âmbar   | `#C8813A` |
| Hover do Accent        | Cobre Escuro  | `#A8692E` |
| Texto principal        | Marfim        | `#F0EDE8` |
| Texto secundário       | Cinza Fosco   | `#7A756E` |
| Sucesso                | Verde Musgo   | `#4A7C59` |
| Erro / Perigo          | Vermelho Fosco| `#8B3A3A` |
| Alerta                 | Âmbar Suave   | `#C8A23A` |

---

## Tipografia

- **Fonte:** Inter (Google Fonts)
- **Títulos de Página (h1):** `font-size: 24px`, `font-weight: 700`, cor Marfim
- **Subtítulos (h2):** `font-size: 18px`, `font-weight: 600`, cor Marfim
- **Corpo do texto:** `font-size: 14px`, `font-weight: 400`, cor Cinza Fosco
- **Labels de formulário:** `font-size: 13px`, `font-weight: 500`, cor Marfim
- **Valores e dados:** `font-size: 14px`, `font-weight: 500`, cor Marfim

---

## Layout Principal

- **Padrão:** Sidebar fixa à esquerda + Área de conteúdo principal.
- **Largura da Sidebar:** `240px` (expandida) / `64px` (recolhida).
- **Estilo da Sidebar:** Ícone Lucide React + Texto para cada item de navegação.

### Itens da Sidebar (ordem)
1. Dashboard
2. Clientes
3. Pedidos
4. Produção
5. Estoque
6. Financeiro
7. Configurações (rodapé da sidebar)

---

## Componentes Base

### Botão Primário
- Fundo: `#C8813A` (Cobre Âmbar)
- Texto: `#0F0E0C` (Preto Fosco)
- Hover: `#A8692E`
- Border Radius: `6px`
- Padding: `10px 20px`

### Botão Secundário (Fantasma)
- Fundo: transparente
- Borda: `1px solid #2C2A26`
- Texto: `#F0EDE8`
- Hover: fundo `#1A1916`

### Cards / Superfícies
- Fundo: `#1A1916`
- Borda: `1px solid #2C2A26`
- Border Radius: `8px`
- Padding: `24px`

### Campos de Formulário (Input)
- Fundo: `#0F0E0C`
- Borda: `1px solid #2C2A26`
- Foco (borda): `1px solid #C8813A`
- Texto: `#F0EDE8`
- Placeholder: `#7A756E`
- Border Radius: `6px`

---

## Tom de Voz (UX Writing)

O sistema fala com o dono do estúdio de forma direta, sem ser frio. Exemplos:

| Situação              | Errado                          | Certo                              |
|-----------------------|---------------------------------|------------------------------------|
| Botão de criar        | "Submit"                       | "Criar Estúdio"                    |
| Tela vazia            | "No records found"              | "Nenhum cliente cadastrado ainda." |
| Erro de validação     | "Field is required"             | "Informe o nome do cliente."       |
| Confirmação de ação   | "Are you sure?"                 | "Tem certeza? Essa ação não pode ser desfeita." |
| Sucesso               | "Success"                       | "Pedido criado com sucesso!"       |

---

> [!NOTE]
> Este documento deve ser atualizado sempre que um novo componente ou padrão visual for definido durante o desenvolvimento.
