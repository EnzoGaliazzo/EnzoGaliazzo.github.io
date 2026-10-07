// Troca PT/EN sem recarregar: o português mora no HTML; o inglês vem de /i18n/en.json só quando pedido.
let ingles = null;
const originais = new Map();      // elemento -> innerHTML em português
const atributosOriginais = new Map(); // elemento -> { atributo: valor em português }
const original = { titulo: document.title, descricao: document.querySelector('meta[name="description"]')?.content || '' };

export function ligarIdioma() {
  document.querySelectorAll('[data-idioma]').forEach((botao) => botao.addEventListener('click', () => trocar(botao.dataset.idioma)));
  let salvo = null;
  try { salvo = localStorage.getItem('idioma'); } catch { /* armazenamento bloqueado: segue em português */ }
  const pedido = new URLSearchParams(location.search).get('lang') || salvo;
  if (pedido === 'en') trocar('en', false);
}

export async function trocar(alvo, guardar = true) {
  if (alvo === 'en' && !ingles) {
    try { ingles = await (await fetch('/i18n/en.json')).json(); } catch { return; }
  }
  const emIngles = alvo === 'en';
  const pagina = document.body.dataset.pagina || 'inicio';

  const aplicar = () => {
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      if (!originais.has(el)) originais.set(el, el.innerHTML);
      const traducao = ingles?.[el.dataset.i18n];
      el.innerHTML = emIngles && traducao ? traducao : originais.get(el);
    });
    document.querySelectorAll('[data-i18n-attr]').forEach((el) => {
      if (!atributosOriginais.has(el)) atributosOriginais.set(el, {});
      const guardados = atributosOriginais.get(el);
      el.dataset.i18nAttr.split(';').forEach((par) => {
        const [atributo, chave] = par.split(':').map((s) => s.trim());
        if (!(atributo in guardados)) guardados[atributo] = el.getAttribute(atributo);
        const traducao = ingles?.[chave];
        el.setAttribute(atributo, emIngles && traducao ? traducao : guardados[atributo]);
      });
    });
    document.documentElement.lang = emIngles ? 'en' : 'pt-BR';
    document.title = emIngles && ingles?.[`pagina.${pagina}.titulo`] ? ingles[`pagina.${pagina}.titulo`] : original.titulo;
    const descricao = document.querySelector('meta[name="description"]');
    if (descricao) descricao.content = emIngles && ingles?.[`pagina.${pagina}.descricao`] ? ingles[`pagina.${pagina}.descricao`] : original.descricao;
    document.querySelectorAll('[data-idioma]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.idioma === alvo)));
    document.dispatchEvent(new CustomEvent('idioma', { detail: alvo }));
  };

  const reduzir = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (document.startViewTransition && !reduzir) document.startViewTransition(aplicar);
  else aplicar();
  if (guardar) { try { localStorage.setItem('idioma', alvo); } catch { /* sem armazenamento */ } }
}

export const idiomaAtual = () => (document.documentElement.lang.startsWith('en') ? 'en' : 'pt');
