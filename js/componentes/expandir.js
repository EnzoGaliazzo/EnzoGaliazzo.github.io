// Card que expande com a rolagem: o recorte (clip-path) abre conforme a seção travada atravessa a tela.
// No celular chega à tela cheia; no computador para em LARGURA_MAX, porque a foto original tem 768 px
// de largura e, esticada além disso, perde nitidez.
import { aoRolar, suavizar } from '../nucleo/rolagem.js';

const LARGURA_MAX = 1000;
const RAIO = 28;

export default function ligar(secoes, { reduzir }) {
  secoes.forEach((secao) => {
    if (reduzir) { secao.classList.add('estatico'); return; }
    const quadro = secao.querySelector('.expandir-quadro');
    let largura = quadro.clientWidth;
    let altura = quadro.clientHeight;
    new ResizeObserver(() => { largura = quadro.clientWidth; altura = quadro.clientHeight; }).observe(quadro);

    aoRolar(secao, ({ fixo }) => {
      const p = suavizar(Math.min(1, fixo / 0.7));
      const xInicio = largura * 0.22;
      const xFim = Math.max(0, (largura - LARGURA_MAX) / 2);
      const x = xInicio + (xFim - xInicio) * p;
      const y = altura * 0.18 * (1 - p);
      const r = xFim > 0 ? RAIO : RAIO * (1 - p);
      quadro.style.setProperty('--recorte-y', `${y.toFixed(1)}px`);
      quadro.style.setProperty('--recorte-x', `${x.toFixed(1)}px`);
      quadro.style.setProperty('--recorte-r', `${r.toFixed(1)}px`);
      quadro.style.setProperty('--zoom', (1.12 - 0.12 * p).toFixed(3));
    });
  });
}
