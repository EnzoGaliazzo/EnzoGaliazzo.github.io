// Computador em perspectiva: deitado quando entra na tela, de pé no meio dela.
// Se a tela tiver um vídeo com data-video-rolagem, o tempo do vídeo acompanha a rolagem.
import { aoRolar, suavizar } from '../nucleo/rolagem.js';

export default function ligar(mockups, { reduzir }) {
  mockups.forEach((mockup) => {
    const corpo = mockup.querySelector('.mockup-corpo');
    const video = mockup.querySelector('video[data-video-rolagem]');
    if (reduzir) return;
    let duracao = 0;
    if (video) {
      video.pause();
      const pronto = () => { duracao = video.duration || 0; };
      if (video.readyState >= 1) pronto(); else video.addEventListener('loadedmetadata', pronto, { once: true });
    }
    aoRolar(mockup, ({ passagem }) => {
      const p = suavizar(Math.min(1, passagem / 0.55));
      corpo.style.setProperty('--giro', `${(1 - p) * 32}deg`);
      if (video && duracao) {
        const t = Math.min(duracao - 0.05, Math.max(0, (passagem - 0.15) / 0.7) * duracao);
        if (Math.abs(video.currentTime - t) > 0.04) video.currentTime = t;
      }
    });
  });
}
