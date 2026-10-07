// Números grandes que contam até o valor quando entram na tela.
import { suavizar } from '../nucleo/rolagem.js';

export default function ligar(elementos, { reduzir }) {
  if (reduzir) return; // o número final já está escrito no HTML
  const contar = (el) => {
    const alvo = Number(el.dataset.contar);
    const duracao = alvo > 50 ? 1600 : 900;
    const inicio = performance.now();
    const passo = (agora) => {
      const t = Math.min(1, (agora - inicio) / duracao);
      el.textContent = Math.round(alvo * suavizar(t));
      if (t < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  const observador = new IntersectionObserver((entradas) => entradas.forEach((entrada) => {
    if (!entrada.isIntersecting) return;
    observador.unobserve(entrada.target);
    contar(entrada.target);
  }), { threshold: 0.6 });
  elementos.forEach((el) => { el.textContent = '0'; observador.observe(el); });
}
