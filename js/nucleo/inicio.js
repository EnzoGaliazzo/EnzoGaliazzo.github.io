// Entrada de todas as páginas: liga o essencial na hora e carrega só os componentes que a página usa.
import { ligarEmail } from './email.js';
import { ligarBarra } from './barra.js';
import { ligarIdioma } from './idioma.js';

const raiz = document.documentElement;
const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
raiz.classList.add(reduzir ? 'sem-mov' : 'mov');

ligarEmail();
ligarBarra();
ligarIdioma();

// [seletor, arquivo em js/componentes/]
const componentes = [
  ['[data-letreiro]', 'letreiro-pagina'],
  ['[data-revelar]', 'revelar'],
  ['[data-contar]', 'contador'],
  ['[data-carrossel]', 'carrossel'],
  ['[data-quadros]', 'quadros'],
  ['[data-mockup]', 'mockup'],
  ['[data-expandir]', 'expandir'],
  ['[data-galeria]', 'galeria'],
  ['[data-acende]', 'acende'],
  ['[data-saiba-mais]', 'saiba-mais'],
  ['[data-configurador]', 'configurador'],
  ['[data-paradas]', 'paradas'],
  ['video[data-video-auto]', 'video-auto'],
  ['.rodape-colunas', 'rodape'],
];

for (const [seletor, arquivo] of componentes) {
  const elementos = document.querySelectorAll(seletor);
  if (!elementos.length) continue;
  import(`../componentes/${arquivo}.js`)
    .then((modulo) => modulo.default(elementos, { reduzir }))
    .catch((erro) => console.error(`Componente ${arquivo} não carregou`, erro));
}
