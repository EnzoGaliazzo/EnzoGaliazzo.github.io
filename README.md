# enzogaliazzo.github.io

Portfólio do Enzo Rezende, desenvolvedor web do Rio de Janeiro. É um site estático no GitHub Pages, feito em HTML, CSS e JavaScript puros, sem framework e sem passo de build.

A linguagem visual é a de página de produto premium: preto, grafite, névoa e branco, uma ideia por tela e cenas que reagem à rolagem. O letreiro de LED com o "21" faz o papel do produto, e o âmbar `#ffa21f` é a única cor de destaque. Nada de marca, texto, imagem ou fonte de terceiros: a fonte é a Inter (licença OFL), servida pelo próprio site.

## Páginas
| Endereço | Para quem | O que tem |
|---|---|---|
| `/` | recrutador e cliente | letreiro, destaques, "do arquivo ao ar", números, especificações, galeria, planos e valores |
| `/distri-rio/` | os dois | o case da Distri Rio em cinco paradas e a ficha técnica |
| `/quero-um-site/` | cliente | planos sem preço, configurador do pedido, gaveta "Seu pedido", envio por WhatsApp ou e-mail |
| `/quero-um-site/enviado/` | cliente | confirmação depois do envio |
| `/sobre/`, `/contato/`, `/perguntas/` | os dois | linha do tempo e fotos; contatos; perguntas frequentes |
| `/curriculo.html`, `/curriculo-en.html` e os PDFs | recrutador | currículo |
| `/404.html` | — | página de erro |

## Rodar no computador
Os caminhos começam com `/`, então sirva a pasta inteira como raiz:
```bash
python -m http.server 8000
```
e abra `http://localhost:8000`.

## Estrutura
```
css/tokens.css          cores, tipografia, espaços e easing
css/base.css            reset, seções claras e escuras, botões, revelações
css/componentes.css     um bloco por componente (barra, carrossel, cenas, bento, galeria, planos, configurador…)
js/nucleo/inicio.js     entrada de todas as páginas: liga barra, idioma e e-mail e carrega só os componentes usados
js/nucleo/              barra, busca, idioma, e-mail protegido, progresso de rolagem
js/componentes/         um arquivo por componente (carrossel, quadros, mockup, expandir, galeria, configurador…)
js/letreiro.js          o letreiro de LED em canvas (fonte de pontos 5×7)
i18n/en.json            textos em inglês (o português mora no HTML)
busca/indice.json       índice da busca do topo
funcoes/orcamento/      função da Cloudflare para guardar pedidos — preparada e DESLIGADA (veja o README dela)
ferramentas/            scripts de manutenção (não fazem parte do site): partes comuns e gravação dos vídeos
midia/videos/           vídeos de tela da Distri Rio e seus pôsteres
assets/r/               fotos e telas em AVIF e WebP, em várias larguras
fontes/                 inter.woff2 + licença OFL
```

## Como editar
- **Textos:** direto no HTML. Se o texto tem `data-i18n="chave"`, troque também a mesma chave em `i18n/en.json`.
- **Barra do topo e rodapé:** edite só no `index.html` (entre `<!-- comum:barra -->` e `<!-- comum:rodape -->`) e rode
  ```bash
  node ferramentas/partes-comuns.mjs
  ```
  para copiar para as outras páginas.
- **Busca:** acrescente a página ou seção em `busca/indice.json` (português e inglês).
- **Vídeos de tela:** ficam em `midia/videos/` (MP4 H.264 + pôster WebP) e são gravações reais do site da Distri Rio: a busca digitando "trident", o catálogo rolando e o pedido no celular até o formulário (sem enviar nada). Para gravar de novo, com o ffmpeg instalado:
  ```bash
  node ferramentas/gravar-videos.mjs midia/videos
  ```
  Os vídeos só baixam quando chegam perto da tela (`preload="none"`), tocam sem som só enquanto aparecem e, com "reduzir movimento", ficam parados no pôster.

## O que falta preencher (Enzo)
Procure por `[preencher` no código: respostas das Perguntas frequentes (preço, prazo, domínio, manutenção, atendimento fora do Rio), os três passos de "O que vem depois" em `/quero-um-site/enviado/` e um interesse opcional em `/sobre/`.

## Segurança e privacidade
- CSP por `<meta>` em todas as páginas: só scripts e estilos do próprio site, sem script inline e sem `style=""`.
- Links externos com `rel="noopener"`. O e-mail é montado por JavaScript (no HTML aparece como "(arroba)").
- O site não usa cookies nem medição. O navegador guarda só o idioma, a cor do LED e o pedido em andamento (localStorage).
- O configurador não envia nada sozinho: o pedido vai na mensagem que a pessoa manda pelo WhatsApp ou e-mail.

## Acessibilidade e desempenho
- Funciona no teclado, com leitor de tela e sem JavaScript. Com "reduzir movimento" ligado, as cenas aparecem prontas e paradas.
- Animações só em `transform`, `opacity` e `clip-path`; tudo pausa fora da tela. Imagens com `width`/`height`, `srcset` e `loading="lazy"`.

## Publicar
O GitHub Pages publica a branch `main`. O trabalho novo fica na branch `estilo-apple` até ser aprovado. Para publicar:
```bash
git switch main && git merge --no-ff estilo-apple && git push origin main
```
