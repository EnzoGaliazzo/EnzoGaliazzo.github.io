// Busca com sugestões em tempo real, sobre um índice estático das páginas e seções do site.
let indice = null;

const normalizar = (texto) => texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const idioma = () => (document.documentElement.lang.startsWith('en') ? 'en' : 'pt');

export async function ligarBusca(painel) {
  const campo = painel.querySelector('input');
  const lista = painel.querySelector('.busca-sugestoes');
  campo.focus();
  if (painel.dataset.ligada) return;
  painel.dataset.ligada = 'sim';

  if (!indice) {
    try { indice = await (await fetch('/busca/indice.json')).json(); } catch { indice = []; }
  }

  const mostrar = () => {
    const consulta = normalizar(campo.value.trim());
    const l = idioma();
    const achados = (consulta
      ? indice.filter((item) => normalizar(`${item[l].titulo} ${item[l].texto} ${item.termos || ''}`).includes(consulta))
      : indice.slice(0, 5)).slice(0, 6);

    if (!achados.length) {
      const vazio = document.createElement('li');
      vazio.textContent = l === 'en' ? 'Nothing found. Try "Distri Rio" or "resume".' : 'Nada encontrado. Tente "Distri Rio" ou "currículo".';
      lista.replaceChildren(vazio);
      return;
    }
    lista.replaceChildren(...achados.map((item) => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = item.url;
      const titulo = document.createElement('span');
      titulo.textContent = item[l].titulo;
      const texto = document.createElement('small');
      texto.textContent = item[l].texto;
      link.append(titulo, texto);
      li.append(link);
      return li;
    }));
  };

  campo.addEventListener('input', mostrar);
  document.addEventListener('idioma', mostrar);
  mostrar();
}
