// Galeria "Explore": trilho com scroll-snap, setas, pontos e arraste (nativo).
// Os botões de cor trocam a cor do LED de todos os letreiros do site.
export default function ligar(galerias) {
  galerias.forEach((galeria) => {
    const trilho = galeria.querySelector('.galeria-trilho');
    const itens = [...trilho.children];
    const pontos = galeria.querySelector('.galeria-pontos');
    const anterior = galeria.querySelector('[data-anterior]');
    const proxima = galeria.querySelector('[data-proxima]');
    const en = () => document.documentElement.lang.startsWith('en');

    const botoesPontos = itens.map((item, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', `${en() ? 'Photo' : 'Foto'} ${i + 1}`);
      b.addEventListener('click', () => trilho.scrollTo({ left: item.offsetLeft - trilho.offsetLeft, behavior: 'smooth' }));
      pontos?.append(b);
      return b;
    });

    const passo = () => (itens[0]?.getBoundingClientRect().width || 300) + 20;
    anterior?.addEventListener('click', () => trilho.scrollBy({ left: -passo(), behavior: 'smooth' }));
    proxima?.addEventListener('click', () => trilho.scrollBy({ left: passo(), behavior: 'smooth' }));

    const atualizar = () => {
      const i = Math.round(trilho.scrollLeft / passo());
      botoesPontos.forEach((b, k) => b.toggleAttribute('aria-current', k === i));
      botoesPontos[i]?.setAttribute('aria-current', 'true');
      if (anterior) anterior.disabled = trilho.scrollLeft < 4;
      if (proxima) proxima.disabled = trilho.scrollLeft + trilho.clientWidth >= trilho.scrollWidth - 4;
    };
    trilho.addEventListener('scroll', () => requestAnimationFrame(atualizar), { passive: true });
    atualizar();

    // Cor do LED
    const cores = [...galeria.querySelectorAll('[data-cor]')];
    let salva = 'ambar';
    try { salva = localStorage.getItem('cor-led') || 'ambar'; } catch { /* sem armazenamento */ }
    const marcar = (nome) => cores.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.cor === nome)));
    marcar(salva);
    cores.forEach((botao) => botao.addEventListener('click', async () => {
      const { aplicarCor } = await import('./letreiro-pagina.js');
      aplicarCor(botao.dataset.cor);
      marcar(botao.dataset.cor);
      try { localStorage.setItem('cor-led', botao.dataset.cor); } catch { /* sem armazenamento */ }
    }));
  });
}
