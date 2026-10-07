// Configurador da Quero um site: plano, páginas, extras e dados viram um resumo em tempo real,
// guardado no navegador (gaveta "Seu pedido") e enviado pronto por WhatsApp ou e-mail.
import { enderecoEmail } from '../nucleo/email.js';

const CHAVE = 'pedido-orcamento';
const WHATS = '5521920000983';

const rotulo = (input) => input.closest('label')?.querySelector('[data-rotulo]')?.textContent.trim() || input.value;
const en = () => document.documentElement.lang.startsWith('en');

export default function ligar(formularios) {
  formularios.forEach((form) => {
    const campos = (nome) => [...form.querySelectorAll(`[name="${nome}"]`)];
    const saidas = (nome) => document.querySelectorAll(`[data-resumo="${nome}"]`);
    const contadores = document.querySelectorAll('[data-contador-pedido]');
    const links = { whatsapp: document.querySelectorAll('[data-enviar="whatsapp"]'), email: document.querySelectorAll('[data-enviar="email"]') };

    // Restaura o pedido guardado
    try {
      const salvo = JSON.parse(localStorage.getItem(CHAVE) || 'null');
      if (salvo) {
        form.querySelectorAll('input, textarea').forEach((el) => {
          if (el.type === 'radio') el.checked = salvo[el.name] === el.value;
          else if (el.type === 'checkbox') el.checked = (salvo[el.name] || []).includes(el.value);
          else if (salvo[el.name] != null) el.value = salvo[el.name];
        });
      }
    } catch { /* sem armazenamento ou JSON inválido: começa do zero */ }

    const ler = () => {
      const plano = campos('plano').find((i) => i.checked);
      const paginas = campos('paginas').find((i) => i.checked);
      const extras = campos('extras').filter((i) => i.checked);
      const dado = (nome) => form.querySelector(`[name="${nome}"]`)?.value.trim() || '';
      return {
        plano: plano ? rotulo(plano) : '',
        paginas: paginas ? rotulo(paginas) : '',
        extras: extras.map(rotulo),
        nome: dado('nome'), empresa: dado('empresa'), whatsapp: dado('whatsapp'), email: dado('email'), vende: dado('vende'), mensagem: dado('mensagem'),
        bruto: Object.fromEntries([...form.querySelectorAll('input, textarea')].reduce((mapa, el) => {
          if (el.type === 'radio') { if (el.checked) mapa.set(el.name, el.value); }
          else if (el.type === 'checkbox') { if (!mapa.has(el.name)) mapa.set(el.name, []); if (el.checked) mapa.get(el.name).push(el.value); }
          else mapa.set(el.name, el.value);
          return mapa;
        }, new Map())),
      };
    };

    const mensagem = (p) => {
      const ingles = en();
      const linhas = [
        ingles ? 'Hi, Enzo! I want a website for my business.' : 'Oi, Enzo! Quero um site para o meu negócio.',
        '',
        `${ingles ? 'Plan' : 'Plano'}: ${p.plano || '—'}`,
        `${ingles ? 'Pages' : 'Páginas'}: ${p.paginas || '—'}`,
        `${ingles ? 'Extras' : 'Extras'}: ${p.extras.length ? p.extras.join(', ') : (ingles ? 'none' : 'nenhum')}`,
      ];
      if (p.nome) linhas.push(`${ingles ? 'Name' : 'Nome'}: ${p.nome}`);
      if (p.empresa) linhas.push(`${ingles ? 'Company' : 'Empresa'}: ${p.empresa}`);
      if (p.whatsapp) linhas.push(`WhatsApp: ${p.whatsapp}`);
      if (p.email) linhas.push(`E-mail: ${p.email}`);
      if (p.vende) linhas.push(`${ingles ? 'What I sell' : 'O que vendo'}: ${p.vende}`);
      if (p.mensagem) linhas.push('', p.mensagem);
      return linhas.join('\n');
    };

    const atualizar = () => {
      const p = ler();
      saidas('plano').forEach((s) => { s.textContent = p.plano; });
      saidas('paginas').forEach((s) => { s.textContent = p.paginas; });
      saidas('extras').forEach((s) => { s.textContent = p.extras.length ? p.extras.join(' · ') : (en() ? 'No extras' : 'Sem extras'); });
      contadores.forEach((c) => { c.textContent = String(1 + p.extras.length); });
      const texto = mensagem(p);
      links.whatsapp.forEach((a) => { a.href = `https://wa.me/${WHATS}?text=${encodeURIComponent(texto)}`; });
      links.email.forEach((a) => { a.href = `mailto:${enderecoEmail()}?subject=${encodeURIComponent(en() ? 'Website quote' : 'Pedido de orçamento de site')}&body=${encodeURIComponent(texto)}`; });
      try { localStorage.setItem(CHAVE, JSON.stringify(p.bruto)); } catch { /* sem armazenamento */ }
    };

    form.addEventListener('input', atualizar);
    form.addEventListener('change', atualizar);
    document.addEventListener('idioma', atualizar);
    form.addEventListener('submit', (e) => e.preventDefault());

    // Depois de enviar, leva para a página de confirmação
    [...links.whatsapp, ...links.email].forEach((a) => a.addEventListener('click', () => {
      setTimeout(() => { location.href = '/quero-um-site/enviado/'; }, 900);
    }));

    // Gaveta "Seu pedido"
    const gaveta = document.getElementById('gaveta-pedido');
    document.querySelectorAll('[data-abre-gaveta]').forEach((b) => b.addEventListener('click', () => gaveta?.showModal()));
    gaveta?.querySelectorAll('[data-fechar]').forEach((b) => b.addEventListener('click', () => gaveta.close()));
    gaveta?.addEventListener('click', (e) => { if (e.target === gaveta) gaveta.close(); });

    atualizar();
  });
}
