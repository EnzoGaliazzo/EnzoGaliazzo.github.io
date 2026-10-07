// E-mail protegido de robôs: no HTML ele aparece como "usuario (arroba) dominio"; aqui vira link de verdade.
export const enderecoEmail = () => ['enzogaliaco29', 'gmail.com'].join('@');

export function ligarEmail(raiz = document) {
  raiz.querySelectorAll('[data-email]').forEach((el) => {
    const endereco = enderecoEmail();
    const assunto = el.dataset.assunto ? `?subject=${encodeURIComponent(el.dataset.assunto)}` : '';
    if (el.tagName === 'A') el.href = `mailto:${endereco}${assunto}`;
    const texto = el.querySelector('[data-email-texto]');
    if (texto) texto.textContent = endereco;
  });
}
