// Parágrafo em cinza: as frases-chave acendem uma a uma enquanto ele passa pela tela.
import { aoRolar } from '../nucleo/rolagem.js';

export default function ligar(paragrafos, { reduzir }) {
  if (reduzir) return; // sem movimento: o CSS já deixa tudo aceso
  paragrafos.forEach((paragrafo) => {
    const frases = [...paragrafo.querySelectorAll('.acende')];
    aoRolar(paragrafo, ({ passagem }) => {
      const p = Math.min(1, Math.max(0, (passagem - 0.2) / 0.45));
      frases.forEach((frase, i) => frase.classList.toggle('aceso', p >= (i + 1) / (frases.length + 0.5)));
    });
  });
}
