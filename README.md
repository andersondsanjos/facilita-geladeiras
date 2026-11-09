# Tosa BABY — clone técnico de validação

Clone independente da página de vendas Tosa BABY para validar o funil existente em uma nova hospedagem.

## Objetivo desta primeira versão

- Preservar conteúdo, imagens, os dois planos e os links de checkout atuais.
- Preservar o Pixel Meta e os scripts de rastreamento identificados na página original.
- Registrar eventos próprios de página, leitura e clique nos CTAs, sem alterar os produtos nem a campanha original.
- Publicar em um projeto Vercel separado para o teste manual.

## Dois caminhos de compra

| Plano | Preço | Checkout |
| --- | ---: | --- |
| Básico | R$ 17,90 | Wiapy `ib4ygmGeY1IZ` |
| Completo + bônus | R$ 27,90 | Wiapy `n_zHK0Dgs_YY` |

## Eventos da página

- `PageView`: carregamento da página, pelo Pixel Meta existente.
- `ViewContent`: conteúdo da oferta carregado.
- `tosa_scroll_depth`: marcos de 25%, 50%, 75% e 100% de leitura.
- `tosa_cta_click`: clique no CTA, com o plano selecionado.
- `InitiateCheckout`: saída intencional para o checkout correspondente.

Eventos de geração/cópia de Pix e aprovação de pagamento acontecem dentro da Wiapy. Eles serão conferidos na Wiapy, Meta e Cashflow no teste de ponta a ponta.
