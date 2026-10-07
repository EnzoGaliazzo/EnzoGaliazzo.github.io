// Vídeos de tela que tocam sozinhos (sem som) só enquanto estão visíveis.
// Com "reduzir movimento", ficam parados no pôster e ganham os controles do navegador.
export default function ligar(videos, { reduzir }) {
  videos.forEach((video) => {
    if (reduzir) { video.controls = true; return; }
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) video.play().catch(() => {});
      else video.pause();
    }, { threshold: 0.4 }).observe(video);
  });
}
