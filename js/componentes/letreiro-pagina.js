// Liga os letreiros de LED da página (o do topo e os pequenos) e troca os quadros quando o idioma muda.
import { criarLetreiro, definirCorLed } from '../letreiro.js';

const QUADROS = {
  pt: {
    largo: [[['ENZO REZENDE', 2]], [['DESENVOLVEDOR WEB', 1], ['RIO DE JANEIRO', 1]], [['ESTUDANTE DE ADS', 1], ['VIA UVA BARRA', 1]], [['6 MESES EM', 1], ['VANCOUVER', 1]]],
    estreito: [[['ENZO', 2], ['REZENDE', 2]], [['DESENVOLVEDOR', 1], ['WEB', 1], ['RIO DE JANEIRO', 1]], [['ESTUDANTE', 1], ['DE ADS', 1], ['VIA UVA BARRA', 1]], [['6 MESES', 1], ['EM', 1], ['VANCOUVER', 1]]],
  },
  en: {
    largo: [[['ENZO REZENDE', 2]], [['WEB DEVELOPER', 1], ['RIO DE JANEIRO', 1]], [['ADS STUDENT', 1], ['UVA BARRA', 1]], [['6 MONTHS IN', 1], ['VANCOUVER', 1]]],
    estreito: [[['ENZO', 2], ['REZENDE', 2]], [['WEB', 1], ['DEVELOPER', 1], ['RIO DE JANEIRO', 1]], [['ADS', 1], ['STUDENT', 1], ['UVA BARRA', 1]], [['6 MONTHS', 1], ['IN', 1], ['VANCOUVER', 1]]],
  },
};

// Quadros fixos dos letreiros pequenos, pelo valor de data-letreiro
const FIXOS = {
  rio: { largo: [[['RIO', 2]]], estreito: [[['RIO', 2]]] },
  chama: { largo: [[['ME CHAMA', 2]]], estreito: [[['ME', 2], ['CHAMA', 2]]] },
};

const CORES = {
  ambar: { aceso: '#ffa21f', apagado: '#2b2419', brilho: 'rgba(255,150,20,.55)', css: 'rgba(255, 162, 31, 0.5)' },
  verde: { aceso: '#35e07a', apagado: '#14271b', brilho: 'rgba(53,224,122,.5)', css: 'rgba(53, 224, 122, 0.45)' },
  vermelho: { aceso: '#ff4a3d', apagado: '#2c1513', brilho: 'rgba(255,74,61,.5)', css: 'rgba(255, 74, 61, 0.45)' },
  branco: { aceso: '#f5f5f7', apagado: '#262628', brilho: 'rgba(245,245,247,.4)', css: 'rgba(245, 245, 247, 0.35)' },
};

export function aplicarCor(nome) {
  const cor = CORES[nome] || CORES.ambar;
  definirCorLed(cor);
  document.documentElement.style.setProperty('--led', cor.aceso);
  document.documentElement.style.setProperty('--led-brilho', cor.css);
}

export default function ligar(canvases, { reduzir }) {
  const idioma = () => (document.documentElement.lang.startsWith('en') ? 'en' : 'pt');
  let salva = 'ambar';
  try { salva = localStorage.getItem('cor-led') || 'ambar'; } catch { /* sem armazenamento */ }
  aplicarCor(salva);

  canvases.forEach((canvas) => {
    const tipo = canvas.dataset.letreiro;
    const principal = tipo === 'topo';
    const letreiro = criarLetreiro(canvas, {
      quadros: principal ? QUADROS[idioma()] : (FIXOS[tipo] || FIXOS.rio),
      linha: '21',
      ciclo: principal && !reduzir,
      interativo: !reduzir,
      particulas: false,
    });
    if (!letreiro) return;
    canvas.closest('[data-letreiro-caixa]')?.classList.add('letreiro-ativo');
    if (principal) document.addEventListener('idioma', (e) => letreiro.trocarQuadros(QUADROS[e.detail === 'en' ? 'en' : 'pt']));

    // Botões que escrevem o destino no letreiro ao passar o mouse ou focar
    const grupo = canvas.closest('section');
    grupo?.querySelectorAll('[data-letreiro-texto]').forEach((botao) => {
      const mostrar = () => letreiro.mostrarTexto(botao.dataset.letreiroTexto);
      const voltar = () => letreiro.voltarAoCiclo();
      botao.addEventListener('pointerenter', mostrar);
      botao.addEventListener('focus', mostrar);
      botao.addEventListener('pointerleave', voltar);
      botao.addEventListener('blur', voltar);
    });
  });
}
