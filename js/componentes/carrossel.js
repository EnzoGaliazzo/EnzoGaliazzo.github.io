// Carrossel de destaques: troca sozinho, a pílula do slide atual enche com o tempo, e há play/pausa.
const DURACAO = 6500;

export default function ligar(carrosseis, { reduzir }) {
  carrosseis.forEach((carrossel) => {
    const slides = [...carrossel.querySelectorAll('.slide')];
    const pilulas = [...carrossel.querySelectorAll('.pilulas button')];
    const botaoPausa = carrossel.querySelector('[data-pausa]');
    let atual = 0;
    let tocando = !reduzir;
    let visivel = true;
    let inicio = performance.now();
    let decorrido = 0;
    let quadro = 0;

    const rotuloPausa = () => {
      const en = document.documentElement.lang.startsWith('en');
      botaoPausa.setAttribute('aria-label', tocando ? (en ? 'Pause the highlights' : 'Pausar os destaques') : (en ? 'Play the highlights' : 'Tocar os destaques'));
      botaoPausa.querySelector('[data-icone-pausa]').toggleAttribute('hidden', !tocando);
      botaoPausa.querySelector('[data-icone-play]').toggleAttribute('hidden', tocando);
    };

    const mostrar = (i) => {
      slides[atual].querySelector('video')?.pause();
      pilulas[atual]?.removeAttribute('aria-current');
      pilulas[atual]?.style.removeProperty('--progresso');
      atual = (i + slides.length) % slides.length;
      slides.forEach((s, k) => { s.classList.toggle('ativo', k === atual); s.setAttribute('aria-hidden', String(k !== atual)); });
      pilulas[atual]?.setAttribute('aria-current', 'true');
      const video = slides[atual].querySelector('video');
      if (video && tocando && visivel) video.play().catch(() => {});
      decorrido = 0;
      inicio = performance.now();
    };

    const tique = (agora) => {
      quadro = 0;
      if (!tocando || !visivel) return;
      const p = Math.min(1, (decorrido + agora - inicio) / DURACAO);
      pilulas[atual]?.style.setProperty('--progresso', p.toFixed(3));
      if (p >= 1) mostrar(atual + 1);
      quadro = requestAnimationFrame(tique);
    };
    const rodar = () => { if (!quadro && tocando && visivel) { inicio = performance.now(); quadro = requestAnimationFrame(tique); } };
    const parar = () => { if (quadro) cancelAnimationFrame(quadro); quadro = 0; decorrido += performance.now() - inicio; };

    pilulas.forEach((pilula, i) => pilula.addEventListener('click', () => { mostrar(i); }));
    botaoPausa.addEventListener('click', () => {
      tocando = !tocando;
      const video = slides[atual].querySelector('video');
      if (tocando) { video?.play().catch(() => {}); rodar(); } else { video?.pause(); parar(); }
      rotuloPausa();
    });

    new IntersectionObserver(([e]) => {
      visivel = e.isIntersecting;
      const video = slides[atual].querySelector('video');
      if (visivel) { if (tocando) video?.play().catch(() => {}); rodar(); } else { video?.pause(); parar(); }
    }, { threshold: 0.25 }).observe(carrossel);
    document.addEventListener('visibilitychange', () => { if (document.hidden) parar(); else rodar(); });
    document.addEventListener('idioma', rotuloPausa);

    carrossel.classList.remove('sem-js-carrossel');
    mostrar(0);
    rotuloPausa();
    rodar();
  });
}
