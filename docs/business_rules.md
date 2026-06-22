# Regras de Negócio e Requisitos

Este documento centraliza as regras de negócio vitais do SaaS de Fotografia. Ele serve como fonte da verdade para o comportamento esperado do sistema.

## 1. Visão Geral
O sistema funciona como um ERP especializado para fotografia. Existem dois tipos principais de fluxos:
- **Pedidos Simples:** Orçamento → Pagamento → Produção → Entrega (mesmo dia).
- **Pedidos Complexos:** Orçamento → Aprovação → Entrada Financeira → Produção em Etapas → Controle de Materiais → Entrega Final.

O **Pedido** é o coração do sistema, amarrando Cliente, Produtos, Arquivos, Pagamentos e Histórico de movimentações.

## 2. Regras de Negócio (RN)
*   **RN001:** Não permitir iniciar produção sem aprovação do orçamento.
*   **RN002:** Não permitir entrega do pedido com saldo pendente (configurável).
*   **RN003:** Não permitir avançar para "Produção" sem arquivos anexados.
*   **RN004:** Não permitir produzir item se os materiais necessários estiverem indisponíveis.
*   **RN005:** Reservar estoque automaticamente ao confirmar pedido.
*   **RN006:** Alertar quando a data prometida estiver próxima.
*   **RN007:** Pedidos urgentes devem aparecer destacados.
*   **RN008:** Toda alteração de status deve gerar histórico.
*   **RN009:** Baixa de estoque automática conforme Ficha Técnica.
*   **RN010:** Se houver material insuficiente, gerar sugestão de compra.
*   **RN011:** Ao concluir um ensaio fotográfico, criar automaticamente tarefa de edição.
*   **RN012:** Não permitir exclusão definitiva de pedidos faturados.
*   **RN013:** Controlar aprovação do cliente antes de produzir álbuns e quadros.
*   **RN014:** Registrar automaticamente lucro bruto do pedido.
*   **RN015:** Pedidos entregues devem ser arquivados, mas permanecer pesquisáveis.

## 3. A Importância do "Envelope"
Para espelhar a realidade física do balcão, pedidos geram um **Envelope Físico**, que acompanha o fluxo. O sistema deve registrar o número do envelope, os materiais físicos recebidos (Cartão de memória, Pendrive) e as marcações de execução (Superfície, Tamanho, Cópias).
