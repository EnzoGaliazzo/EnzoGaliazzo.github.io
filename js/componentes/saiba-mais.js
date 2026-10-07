// Pílulas "Saiba mais +": abrem um <dialog> em tela cheia (foco preso e ESC fechando são do próprio navegador).
export default function ligar(botoes) {
  botoes.forEach((botao) => {
    const modal = document.getElementById(botao.dataset.saibaMais);
    if (!modal) return;
    botao.addEventListener('click', () => modal.showModal());
    modal.querySelectorAll('[data-fechar]').forEach((f) => f.addEventListener('click', () => modal.close()));
    // Clique no fundo escurecido também fecha
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    modal.addEventListener('close', () => botao.focus());
  });
}
