// Grava vídeos curtos de tela da Distri Rio (Chrome sem interface + screencast do DevTools + ffmpeg).
// Uso: node ferramentas/gravar-videos.mjs <pasta-de-saída> [busca,catalogo,pedido]
// Saída por clipe: <nome>.mp4 (H.264) e <nome>.webp (pôster). Sem áudio.
// Não envia nada: o clipe do pedido para no formulário, sem digitar CNPJ e sem tocar em enviar.
import { spawn, spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const [saida, lista = 'busca,catalogo,pedido'] = process.argv.slice(2);
const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const SITE = 'https://distririo.com.br';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(saida, { recursive: true });

async function abrir(porta) {
  const perfil = mkdtempSync(join(tmpdir(), 'gravar-'));
  const chrome = spawn(CHROME, ['--headless=new', `--remote-debugging-port=${porta}`, `--user-data-dir=${perfil}`,
    '--hide-scrollbars', '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore' });
  let wsUrl;
  for (let i = 0; i < 80 && !wsUrl; i++) {
    try { wsUrl = (await (await fetch(`http://127.0.0.1:${porta}/json/list`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl; } catch {}
    if (!wsUrl) await sleep(250);
  }
  const ws = new WebSocket(wsUrl);
  await new Promise((r) => { ws.onopen = r; });
  let seq = 0;
  const pend = new Map();
  const quadros = [];
  ws.onmessage = (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); }
    if (m.method === 'Page.screencastFrame') {
      quadros.push({ dados: m.params.data, t: m.params.metadata.timestamp });
      ws.send(JSON.stringify({ id: ++seq, method: 'Page.screencastFrameAck', params: { sessionId: m.params.sessionId } }));
    }
  };
  const send = (method, params = {}) => new Promise((r) => { const id = ++seq; pend.set(id, r); ws.send(JSON.stringify({ id, method, params })); });
  const js = async (expr) => (await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true })).result.result?.value;
  await send('Page.enable'); await send('Runtime.enable');
  // Guarda a recusa de cookies antes de a página abrir, para o aviso não aparecer no vídeo
  await send('Page.addScriptToEvaluateOnNewDocument', { source: `if (location.hostname.endsWith('distririo.com.br')) { try { localStorage.setItem('dr-consentimento-medicao', 'nao'); } catch (e) {} }` });
  return { send, js, quadros, fechar: () => { ws.close(); chrome.kill(); try { rmSync(perfil, { recursive: true, force: true }); } catch {} } };
}

// Recusa o aviso de cookies (o site só mede depois do aceite)
const recusar = `(() => { const b = [...document.querySelectorAll('button')].find((x) => /recusar/i.test(x.textContent)); if (b) b.click(); })()`;

const CLIPES = {
  // Busca do topo digitando "trident", no computador
  busca: { largura: 1280, altura: 800, escala: 1, mobile: false, async roteiro(b) {
    await b.send('Page.navigate', { url: `${SITE}/` }); await sleep(4000); await b.js(recusar); await sleep(600);
    return async () => {
      await sleep(700);
      await b.js(`document.querySelector('#buscaCabecalho input[name="q"]').focus()`);
      await sleep(400);
      for (const letra of 'trident') { await b.send('Input.insertText', { text: letra }); await sleep(190); }
      await sleep(1800);
      await b.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
      await b.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'ArrowDown', code: 'ArrowDown', windowsVirtualKeyCode: 40 });
      await sleep(1000);
    };
  } },
  // Catálogo rolando devagar, no computador (vai dentro do computador da página inicial)
  catalogo: { largura: 1280, altura: 800, escala: 1, mobile: false, async roteiro(b) {
    await b.send('Page.navigate', { url: `${SITE}/loja.html` }); await sleep(4000); await b.js(recusar); await sleep(600);
    return async () => {
      await sleep(600);
      for (let i = 0; i < 150; i++) {
        await b.send('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 900, y: 500, deltaX: 0, deltaY: 22 });
        await sleep(33);
      }
      await sleep(600);
    };
  } },
  // Do produto à lista e ao formulário do pedido, no celular (para antes de enviar)
  pedido: { largura: 390, altura: 844, escala: 2, mobile: true, async roteiro(b) {
    await b.send('Page.navigate', { url: `${SITE}/produto/trident-5s.html` }); await sleep(4000); await b.js(recusar); await sleep(600);
    return async () => {
      await sleep(900);
      await b.js(`document.querySelector('.btn-lista-grande, .btn-lista').scrollIntoView({ behavior: 'smooth', block: 'center' })`);
      await sleep(1300);
      await b.js(`document.querySelector('.btn-lista-grande, .btn-lista').click()`);
      await sleep(1500);
      await b.js(`document.querySelector('.lista-flutuante')?.click()`);
      await sleep(2000);
      await b.js(`document.querySelector('#listaContinuar')?.click()`);
      await sleep(2200);
      await b.js(`(() => { const f = document.querySelector('#pedidoForm'); const alvo = f?.querySelector('button[type="submit"]') || f?.lastElementChild; alvo?.scrollIntoView({ behavior: 'smooth', block: 'end' }); })()`);
      await sleep(2200);
    };
  } },
};

let porta = 9360;
for (const nome of lista.split(',')) {
  const clipe = CLIPES[nome];
  const b = await abrir(porta++);
  await b.send('Emulation.setDeviceMetricsOverride', { width: clipe.largura, height: clipe.altura, deviceScaleFactor: clipe.escala, mobile: clipe.mobile });
  if (clipe.mobile) await b.send('Emulation.setUserAgentOverride', { userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Mobile Safari/537.36' });
  const acao = await clipe.roteiro(b);
  await b.send('Page.startScreencast', { format: 'jpeg', quality: 90, maxWidth: clipe.largura * clipe.escala, maxHeight: clipe.altura * clipe.escala, everyNthFrame: 1 });
  await acao();
  await b.send('Page.stopScreencast');
  b.fechar();

  // Quadros com a duração real de cada um, normalizados para 30 fps pelo ffmpeg
  const pasta = mkdtempSync(join(tmpdir(), `quadros-${nome}-`));
  const linhas = [];
  b.quadros.forEach((q, i) => {
    const arquivo = join(pasta, `q${String(i).padStart(5, '0')}.jpg`).replaceAll('\\', '/');
    writeFileSync(arquivo, Buffer.from(q.dados, 'base64'));
    const dur = i + 1 < b.quadros.length ? Math.max(0.001, b.quadros[i + 1].t - q.t) : 0.8;
    linhas.push(`file '${arquivo}'`, `duration ${dur.toFixed(4)}`);
  });
  linhas.push(linhas.at(-2)); // o concat do ffmpeg ignora a duração do último quadro sem repeti-lo
  const listaQuadros = join(pasta, 'lista.txt');
  writeFileSync(listaQuadros, linhas.join('\n'));
  // Tamanho fixo: quadros do screencast às vezes vêm com 1 px a mais ou a menos, e trocar de
  // resolução no meio do vídeo faz o navegador dar erro de decodificação.
  const largura = clipe.mobile ? 720 : 1280;
  const altura = Math.round((largura * clipe.altura) / clipe.largura / 2) * 2;
  const filtro = `fps=30,scale=${largura}:${altura}:flags=lanczos,setsar=1,format=yuv420p`;
  const ff = (args) => { const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', ...args], { stdio: 'inherit' }); if (r.status) throw new Error(`ffmpeg falhou em ${nome}`); };
  ff(['-f', 'concat', '-safe', '0', '-i', listaQuadros, '-vf', filtro, '-c:v', 'libx264', '-preset', 'slow', '-crf', clipe.mobile ? '27' : '30', '-g', '15', '-movflags', '+faststart', '-an', join(saida, `${nome}.mp4`)]);
  // Sem WebM: o VP9 gerado aqui dava erro de decodificação no Chrome a partir do 2º quadro-chave,
  // e o H.264 toca em todos os navegadores.
  ff(['-i', join(saida, `${nome}.mp4`), '-frames:v', '1', '-vf', `scale=${largura}:${altura}`, '-c:v', 'libwebp', '-quality', '62', join(saida, `${nome}.webp`)]);
  rmSync(pasta, { recursive: true, force: true });
  console.log('ok', nome, `${b.quadros.length} quadros`);
}
