// Progresso de rolagem sem biblioteca: só escuta enquanto o elemento está perto da tela.
// fn recebe { fixo, passagem }:
//   fixo     0..1 enquanto uma seção alta (com miolo sticky) atravessa a tela
//   passagem 0..1 do momento em que o elemento entra por baixo até sair por cima
const limitar = (v) => Math.min(1, Math.max(0, v));

export function aoRolar(elemento, fn) {
  let ativo = false;
  let pedido = 0;

  const medir = () => {
    pedido = 0;
    const r = elemento.getBoundingClientRect();
    const alturaTela = innerHeight;
    const curso = r.height - alturaTela;
    fn({
      fixo: curso > 0 ? limitar(-r.top / curso) : limitar((alturaTela - r.top) / (alturaTela + r.height)),
      passagem: limitar((alturaTela - r.top) / (alturaTela + r.height)),
    });
  };
  const agendar = () => { if (ativo && !pedido) pedido = requestAnimationFrame(medir); };

  new IntersectionObserver(([entrada]) => {
    ativo = entrada.isIntersecting;
    if (ativo) agendar();
  }, { rootMargin: '20% 0px 20% 0px' }).observe(elemento);

  addEventListener('scroll', agendar, { passive: true });
  addEventListener('resize', agendar);
  medir();
}

export const suavizar = (t) => 1 - Math.pow(1 - t, 3);
