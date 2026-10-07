// Revelação por etapas (fade + subida) e títulos que saem do desfoque, quando entram na tela.
export default function ligar(elementos, { reduzir }) {
  if (reduzir || !('IntersectionObserver' in window)) {
    elementos.forEach((el) => el.classList.add('visivel'));
    return;
  }
  const observador = new IntersectionObserver((entradas) => entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    entrada.target.classList.add('visivel');
    observador.unobserve(entrada.target);
  }), { rootMargin: '0px 0px -12% 0px' });
  elementos.forEach((el) => observador.observe(el));
}
