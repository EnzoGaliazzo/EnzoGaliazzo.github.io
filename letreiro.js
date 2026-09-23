// Letreiro do topo: desenha o texto ponto a ponto, como os painéis de LED dos ônibus do Rio.
// Mostra o nome, passa uma vez pelos outros quadros e para de novo no nome.
(() => {
  const painel = document.querySelector('.letreiro-painel');
  if (!painel || !painel.getContext) return;
  const ctx = painel.getContext('2d');

  // Fonte de 5×7 pontos, a mesma grade dos painéis de LED
  const FONTE = {
    A: ['01110', '10001', '10001', '10001', '11111', '10001', '10001'],
    B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
    C: ['01110', '10001', '10000', '10000', '10000', '10001', '01110'],
    D: ['11100', '10010', '10001', '10001', '10001', '10010', '11100'],
    E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
    F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
    G: ['01110', '10001', '10000', '10111', '10001', '10001', '01111'],
    H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
    I: ['01110', '00100', '00100', '00100', '00100', '00100', '01110'],
    J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
    K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
    L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
    M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
    N: ['10001', '10001', '11001', '10101', '10011', '10001', '10001'],
    O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
    P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
    Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
    R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
    S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
    T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
    U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
    V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
    W: ['10001', '10001', '10001', '10101', '10101', '10101', '01010'],
    X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
    Y: ['10001', '10001', '10001', '01010', '00100', '00100', '00100'],
    Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
    0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
    1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
    2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
    3: ['11111', '00010', '00100', '00010', '00001', '10001', '01110'],
    4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
    5: ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
    6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
    7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
    8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
    9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
    '-': ['0000', '0000', '0000', '1111', '0000', '0000', '0000'],
    '.': ['00', '00', '00', '00', '00', '11', '11'],
    ' ': ['000', '000', '000', '000', '000', '000', '000'],
  };

  const LINHA = '21'; // o DDD do Rio, no lugar do número da linha

  // Cada quadro é uma lista de linhas de texto: [texto, escala]
  const QUADROS = {
    largo: [
      [['ENZO REZENDE', 2]],
      [['DESENVOLVEDOR WEB', 1], ['RIO DE JANEIRO', 1]],
      [['ESTUDANTE DE ADS', 1], ['VIA UVA BARRA', 1]],
    ],
    estreito: [
      [['ENZO', 2], ['REZENDE', 2]],
      [['DESENVOLVEDOR', 1], ['WEB', 1], ['RIO DE JANEIRO', 1]],
      [['ESTUDANTE', 1], ['DE ADS', 1], ['VIA UVA BARRA', 1]],
    ],
  };

  const MARGEM = 2;      // pontos apagados em volta do texto
  const SEPARACAO = 3;   // vão sem LED entre o número e o destino
  const ENTRE_LINHAS = 2;
  const TEMPO_QUADRO = 2600;
  const TEMPO_APAGADO = 140;

  const ACESO = '#ffa21f';
  const APAGADO = '#2b2419';
  const BRILHO = 'rgba(255, 150, 20, 0.55)';

  // Converte um texto numa matriz de pontos (altura × largura)
  function rasterizar(texto, escala) {
    const colunas = [];
    [...texto].forEach((letra, i) => {
      const glifo = FONTE[letra] || FONTE[' '];
      if (i > 0) colunas.push([0, 0, 0, 0, 0, 0, 0]);
      for (let x = 0; x < glifo[0].length; x++) {
        colunas.push(glifo.map((linha) => (linha[x] === '1' ? 1 : 0)));
      }
    });
    const matriz = [];
    for (let y = 0; y < 7 * escala; y++) {
      const linha = [];
      for (let x = 0; x < colunas.length * escala; x++) {
        linha.push(colunas[Math.floor(x / escala)][Math.floor(y / escala)]);
      }
      matriz.push(linha);
    }
    return matriz;
  }

  function montarQuadro(linhas) {
    const blocos = linhas.map(([texto, escala]) => rasterizar(texto, escala));
    const altura = blocos.reduce((soma, b) => soma + b.length, 0) + ENTRE_LINHAS * (blocos.length - 1);
    const largura = Math.max(...blocos.map((b) => b[0].length));
    return { blocos, altura, largura };
  }

  const numero = rasterizar(LINHA, 2);
  let layout = null; // { nome, linhas, colunas, grades, vazia }

  function carimbar(grade, bloco, x0, y0) {
    bloco.forEach((linha, y) => linha.forEach((v, x) => { if (v) grade[y0 + y][x0 + x] = 1; }));
  }

  // Monta as grades de pontos de todos os quadros para um tamanho de painel
  function prepararLayout(nome) {
    const quadros = QUADROS[nome].map(montarQuadro);
    const linhas = Math.max(numero.length, ...quadros.map((q) => q.altura));
    const larguraDestino = Math.max(...quadros.map((q) => q.largura)) + MARGEM * 2;
    const inicioDestino = MARGEM + numero[0].length + MARGEM + SEPARACAO;
    const colunas = inicioDestino + larguraDestino;

    const gradeBase = () => Array.from({ length: linhas }, (_, y) => {
      const linha = new Uint8Array(colunas);
      // 2 = sem LED: o vão entre o módulo do número e o do destino
      for (let x = inicioDestino - SEPARACAO; x < inicioDestino; x++) linha[x] = 2;
      return linha;
    });

    const grades = quadros.map((q) => {
      const grade = gradeBase();
      carimbar(grade, numero, MARGEM, Math.floor((linhas - numero.length) / 2));
      let y = Math.floor((linhas - q.altura) / 2);
      for (const bloco of q.blocos) {
        carimbar(grade, bloco, inicioDestino + Math.floor((larguraDestino - bloco[0].length) / 2), y);
        y += bloco.length + ENTRE_LINHAS;
      }
      return grade;
    });

    const vazia = gradeBase();
    carimbar(vazia, numero, MARGEM, Math.floor((linhas - numero.length) / 2));
    return { nome, linhas, colunas, grades, vazia };
  }

  let larguraAtual = 0;
  let passo = 0;
  let quadroAtual = 0;
  let mostrandoVazia = false;

  function ajustar() {
    const largura = painel.clientWidth;
    if (!largura || largura === larguraAtual) return false;
    larguraAtual = largura;
    const nome = largura < 560 ? 'estreito' : 'largo';
    if (!layout || layout.nome !== nome) layout = prepararLayout(nome);
    passo = largura / layout.colunas;
    const altura = passo * layout.linhas;
    const dpr = window.devicePixelRatio || 1;
    painel.style.height = `${altura}px`;
    painel.width = Math.round(largura * dpr);
    painel.height = Math.round(altura * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return true;
  }

  function desenhar(grade) {
    const dpr = window.devicePixelRatio || 1;
    // Limpa em pixels do aparelho: com zoom abaixo de 100% a escala fica menor que 1
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, painel.width, painel.height);
    ctx.restore();
    const raio = passo * 0.36;
    const apagados = new Path2D();
    const acesos = new Path2D();
    for (let y = 0; y < layout.linhas; y++) {
      for (let x = 0; x < layout.colunas; x++) {
        const v = grade[y][x];
        if (v === 2) continue;
        const cx = (x + 0.5) * passo;
        const cy = (y + 0.5) * passo;
        const alvo = v ? acesos : apagados;
        alvo.moveTo(cx + raio, cy);
        alvo.arc(cx, cy, raio, 0, Math.PI * 2);
      }
    }
    ctx.fillStyle = APAGADO;
    ctx.fill(apagados);
    ctx.save();
    ctx.shadowColor = BRILHO;
    ctx.shadowBlur = passo * 1.1 * dpr;
    ctx.fillStyle = ACESO;
    ctx.fill(acesos);
    ctx.restore();
  }

  function mostrar(i) {
    quadroAtual = i;
    mostrandoVazia = false;
    desenhar(layout.grades[i]);
  }

  function redesenhar() {
    if (!layout) return;
    if (mostrandoVazia) desenhar(layout.vazia);
    else desenhar(layout.grades[quadroAtual]);
  }

  // Passa uma vez pelos quadros e volta para o nome, onde fica parado
  function tocar() {
    const ordem = [1, 2, 0];
    let k = 0;
    const avancar = () => {
      mostrandoVazia = true;
      desenhar(layout.vazia);
      setTimeout(() => {
        mostrar(ordem[k]);
        k += 1;
        if (k < ordem.length) setTimeout(avancar, TEMPO_QUADRO);
      }, TEMPO_APAGADO);
    };
    setTimeout(avancar, TEMPO_QUADRO);
  }

  ajustar();
  mostrar(0);
  document.documentElement.classList.add('letreiro-ativo');

  new ResizeObserver(() => { if (ajustar()) redesenhar(); }).observe(painel);

  if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) tocar();
})();
