// Página da Distri Rio: as telas do computador e do celular trocam conforme a parada que está na tela.
export default function ligar(blocos) {
  blocos.forEach((bloco) => {
    const telas = [...bloco.querySelectorAll('[data-tela]')];
    const paradas = [...bloco.querySelectorAll('.parada')];
    const mostrar = (n) => telas.forEach((img) => img.classList.toggle('ativa', img.dataset.tela.split(' ').includes(n)));
    const observador = new IntersectionObserver((entradas) => entradas.forEach((e) => {
      if (e.isIntersecting) mostrar(e.target.dataset.parada);
    }), { rootMargin: '-45% 0px -45% 0px' });
    paradas.forEach((p) => observador.observe(p));
  });
}
