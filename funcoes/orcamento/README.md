# Função de orçamento (desligada)

O site funciona **sem** esta função: o configurador de `/quero-um-site/` monta o pedido e abre o WhatsApp ou o e-mail já escritos.
Esta função é opcional. Com ela, uma cópia de cada pedido também fica guardada (Cloudflare KV, por 180 dias) e pode chegar por e-mail (Resend).

## Como ligar
1. Crie uma conta gratuita na Cloudflare e rode, nesta pasta:
   ```bash
   npx wrangler login
   npx wrangler kv namespace create PEDIDOS
   ```
2. Copie `wrangler.toml.example` para `wrangler.toml` e preencha o `id` do KV e o `EMAIL_DESTINO`.
3. (Opcional) Para receber por e-mail: `npx wrangler secret put RESEND_API_KEY`.
4. Publique: `npx wrangler deploy`. Anote o endereço `https://orcamento-enzo.<sua-conta>.workers.dev`.
5. No site, em `quero-um-site/index.html`:
   - no `<form data-configurador>`, acrescente `data-orcamento-endpoint="https://orcamento-enzo.<sua-conta>.workers.dev"`;
   - na meta CSP, acrescente esse endereço em `connect-src` (ex.: `connect-src 'self' https://orcamento-enzo.<sua-conta>.workers.dev`).

Feito isso, ao tocar em **Enviar pelo WhatsApp** ou **Enviar por e-mail**, o configurador também manda o resumo para a função (sem atrasar a abertura do WhatsApp).

## O que a função aceita
- Só `POST` vindo de `ORIGEM_PERMITIDA`, com até 8 KB.
- Só os valores que o configurador produz (plano, páginas e extras de uma lista fechada); textos são cortados no tamanho máximo.
- Precisa de WhatsApp ou e-mail para resposta. O campo-isca `site` descarta robôs.

Nada de segredo vai para o git: `wrangler.toml`, `.dev.vars` e `.env` ficam de fora (veja `.gitignore` na raiz).
