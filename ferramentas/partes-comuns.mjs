// Copia a barra do topo e o rodapé da página inicial para as outras páginas, que não têm passo de build.
// Edite a barra ou o rodapé só no index.html e rode:  node ferramentas/partes-comuns.mjs
// Cada página marca onde eles entram com <!-- comum:barra --> … <!-- /comum:barra --> (e o mesmo para rodape).
// O link da página atual ganha aria-current="page".
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = join(dirname(fileURLToPath(import.meta.url)), '..');
const paginas = {
  '404.html': null,
  'distri-rio/index.html': '/distri-rio/',
  'quero-um-site/index.html': '/quero-um-site/',
  'quero-um-site/enviado/index.html': '/quero-um-site/',
  'sobre/index.html': '/sobre/',
  'contato/index.html': '/contato/',
  'perguntas/index.html': '/perguntas/',
};

const bloco = (nome) => new RegExp(`<!-- comum:${nome} -->[\\s\\S]*?<!-- /comum:${nome} -->`);
const inicio = readFileSync(join(raiz, 'index.html'), 'utf8');
const partes = Object.fromEntries(['barra', 'rodape'].map((nome) => {
  const achado = inicio.match(bloco(nome));
  if (!achado) throw new Error(`index.html sem o bloco comum:${nome}`);
  return [nome, achado[0]];
}));

for (const [arquivo, caminho] of Object.entries(paginas)) {
  const alvo = join(raiz, arquivo);
  if (!existsSync(alvo)) { console.log('(ainda não existe)', arquivo); continue; }
  let html = readFileSync(alvo, 'utf8');
  for (const [nome, conteudo] of Object.entries(partes)) {
    if (!bloco(nome).test(html)) throw new Error(`${arquivo} sem o bloco comum:${nome}`);
    let parte = conteudo;
    if (nome === 'barra' && caminho) parte = parte.replaceAll(`<a href="${caminho}"`, `<a href="${caminho}" aria-current="page"`);
    html = html.replace(bloco(nome), () => parte);
  }
  writeFileSync(alvo, html);
  console.log('ok', arquivo);
}
