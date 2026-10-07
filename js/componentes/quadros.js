// Cena "do arquivo ao ar": uma sequência de quadros desenhada por código no canvas.
// Conforme a seção travada atravessa a tela, os 333 pontos (um por página de produto) acendem em ordem.
import { aoRolar } from '../nucleo/rolagem.js';

const TOTAL = 333;
const COLUNAS = 21;

export default function ligar(cenas, { reduzir }) {
  cenas.forEach((cena) => {
    const canvas = cena.querySelector('canvas');
    const contagem = cena.querySelector('[data-quadros-contagem]');
    const ctx = canvas.getContext('2d');
    const linhas = Math.ceil(TOTAL / COLUNAS);
    let ultimo = -1;

    const desenhar = (acesos) => {
      const dpr = Math.min(2, devicePixelRatio || 1);
      const largura = canvas.clientWidth;
      const altura = canvas.clientHeight;
      if (canvas.width !== Math.round(largura * dpr)) { canvas.width = Math.round(largura * dpr); canvas.height = Math.round(altura * dpr); }
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, largura, altura);
      const passo = Math.min(largura / COLUNAS, altura / linhas);
      const raio = passo * 0.3;
      const x0 = (largura - passo * COLUNAS) / 2;
      const y0 = (altura - passo * linhas) / 2;
      const led = getComputedStyle(document.documentElement).getPropertyValue('--led').trim() || '#ffa21f';
      for (let i = 0; i < TOTAL; i++) {
        const cx = x0 + (i % COLUNAS) * passo + passo / 2;
        const cy = y0 + Math.floor(i / COLUNAS) * passo + passo / 2;
        const aceso = i < acesos;
        ctx.beginPath();
        ctx.arc(cx, cy, aceso && i === acesos - 1 ? raio * 1.35 : raio, 0, Math.PI * 2);
        ctx.fillStyle = aceso ? led : '#2b2419';
        ctx.shadowColor = aceso ? led : 'transparent';
        ctx.shadowBlur = aceso ? passo * 0.6 : 0;
        ctx.fill();
      }
      if (contagem) contagem.textContent = acesos;
    };

    if (reduzir) { requestAnimationFrame(() => desenhar(TOTAL)); return; }
    aoRolar(cena, ({ fixo }) => {
      const acesos = Math.round(Math.min(1, fixo / 0.85) * TOTAL);
      if (acesos !== ultimo) { ultimo = acesos; desenhar(acesos); }
    });
    new ResizeObserver(() => { const n = ultimo; ultimo = -1; desenhar(Math.max(0, n)); }).observe(canvas);
  });
}
