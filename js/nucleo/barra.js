// Barra global: abre e fecha o mega-menu de Trabalho, o menu do celular e a busca. ESC e clique fora fecham.
export function ligarBarra() {
  const gatilhos = [...document.querySelectorAll('[data-abre]')];
  if (!gatilhos.length) return;
  const painelDe = (botao) => document.getElementById(botao.getAttribute('aria-controls'));

  const fechar = (exceto) => gatilhos.forEach((botao) => {
    if (botao === exceto) return;
    botao.setAttribute('aria-expanded', 'false');
    const painel = painelDe(botao);
    if (painel) painel.hidden = true;
  });

  gatilhos.forEach((botao) => botao.addEventListener('click', async () => {
    const painel = painelDe(botao);
    if (!painel) return;
    const abrir = botao.getAttribute('aria-expanded') !== 'true';
    fechar(botao);
    botao.setAttribute('aria-expanded', String(abrir));
    painel.hidden = !abrir;
    if (abrir && botao.dataset.abre === 'busca') {
      const { ligarBusca } = await import('./busca.js');
      ligarBusca(painel);
    }
  }));

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    const aberto = gatilhos.find((b) => b.getAttribute('aria-expanded') === 'true');
    if (aberto) { fechar(); aberto.focus(); }
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.barra')) fechar(); });
}
