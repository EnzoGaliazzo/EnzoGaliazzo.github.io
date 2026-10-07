// Função de orçamento (Cloudflare Worker). PREPARADA E DESLIGADA: o site funciona sem ela.
// Quando ligada, recebe o mesmo resumo que o configurador da página "Quero um site" manda
// pelo WhatsApp, guarda no KV (PEDIDOS) e, se houver chave do Resend, avisa por e-mail.
// Como ligar: veja README.md nesta pasta.

const LIMITE_BYTES = 8 * 1024;
const CAMPOS_TEXTO = { nome: 120, empresa: 160, whatsapp: 40, email: 160, vende: 300, mensagem: 2000 };
const PLANOS = ['institucional', 'catalogo', 'completo'];
const PAGINAS = ['ate-5', '6-a-10', 'mais-de-10'];
const EXTRAS = ['ingles', 'formulario', 'catalogo', 'whatsapp'];

const resposta = (status, corpo, origem) => new Response(JSON.stringify(corpo), {
  status,
  headers: {
    'content-type': 'application/json; charset=utf-8',
    'access-control-allow-origin': origem,
    'access-control-allow-methods': 'POST, OPTIONS',
    'access-control-allow-headers': 'content-type',
    'vary': 'origin',
  },
});

// Aceita só o formato que o configurador produz; o resto é descartado.
function validar(dados) {
  if (typeof dados !== 'object' || dados === null) return null;
  if (dados.site) return null; // campo-isca: gente não preenche, robô preenche
  const limpo = {
    plano: PLANOS.includes(dados.plano) ? dados.plano : null,
    paginas: PAGINAS.includes(dados.paginas) ? dados.paginas : null,
    extras: Array.isArray(dados.extras) ? dados.extras.filter((e) => EXTRAS.includes(e)) : [],
  };
  if (!limpo.plano || !limpo.paginas) return null;
  for (const [campo, maximo] of Object.entries(CAMPOS_TEXTO)) {
    const valor = typeof dados[campo] === 'string' ? dados[campo].trim() : '';
    limpo[campo] = valor.slice(0, maximo);
  }
  if (!limpo.whatsapp && !limpo.email) return null; // sem contato não há como responder
  return limpo;
}

async function avisarPorEmail(env, pedido) {
  if (!env.RESEND_API_KEY || !env.EMAIL_DESTINO) return;
  const linhas = [
    `Plano: ${pedido.plano}`, `Páginas: ${pedido.paginas}`, `Extras: ${pedido.extras.join(', ') || 'nenhum'}`,
    `Nome: ${pedido.nome}`, `Empresa: ${pedido.empresa}`, `WhatsApp: ${pedido.whatsapp}`, `E-mail: ${pedido.email}`,
    `O que vende: ${pedido.vende}`, '', pedido.mensagem,
  ];
  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.RESEND_API_KEY}`, 'content-type': 'application/json' },
    body: JSON.stringify({
      from: env.EMAIL_REMETENTE || 'Pedidos <onboarding@resend.dev>',
      to: [env.EMAIL_DESTINO],
      reply_to: pedido.email || undefined,
      subject: `Pedido de orçamento: ${pedido.empresa || pedido.nome || 'sem nome'}`,
      text: linhas.join('\n'),
    }),
  });
}

export default {
  async fetch(request, env, ctx) {
    const origem = env.ORIGEM_PERMITIDA || 'https://enzogaliazzo.github.io';
    if (request.headers.get('origin') !== origem) return resposta(403, { ok: false }, origem);
    if (request.method === 'OPTIONS') return resposta(204, {}, origem);
    if (request.method !== 'POST') return resposta(405, { ok: false }, origem);
    if (+(request.headers.get('content-length') || 0) > LIMITE_BYTES) return resposta(413, { ok: false }, origem);

    let dados;
    try { dados = JSON.parse(await request.text()); } catch { return resposta(400, { ok: false }, origem); }
    const pedido = validar(dados);
    if (!pedido) return resposta(422, { ok: false }, origem);

    const chave = `${new Date().toISOString()}-${crypto.randomUUID().slice(0, 8)}`;
    await env.PEDIDOS.put(chave, JSON.stringify({ ...pedido, recebidoEm: new Date().toISOString() }), {
      expirationTtl: 60 * 60 * 24 * 180, // apaga sozinho depois de 180 dias (LGPD: guardar só o necessário)
    });
    ctx.waitUntil(avisarPorEmail(env, pedido).catch(() => {}));
    return resposta(201, { ok: true }, origem);
  },
};
