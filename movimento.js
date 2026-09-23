// Movimento da página: rolagem suave, títulos que sobem de trás de uma máscara, fundo que
// escurece nas zonas escuras, telas que andam para o lado e o percurso da linha 21.
// Com "reduzir movimento" ligado, ou se as bibliotecas não carregarem, a página fica estática.
(() => {
  const raiz = document.documentElement;
  const liberar = () => raiz.classList.remove('carregando');
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return liberar();
  if (!window.gsap || !window.ScrollTrigger || !window.SplitText || !window.Lenis) return liberar();

  gsap.registerPlugin(ScrollTrigger, SplitText);
  raiz.classList.add('movimento');

  // Rolagem suave, sincronizada com o ScrollTrigger
  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((tempo) => lenis.raf(tempo * 1000));
  gsap.ticker.lagSmoothing(0);

  // Links internos rolam suave e levam o foco junto
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const alvo = document.querySelector(link.getAttribute('href'));
      if (!alvo) return;
      e.preventDefault();
      lenis.scrollTo(alvo, { offset: alvo.id === 'topo' ? 0 : -72, duration: 1.4 });
      alvo.setAttribute('tabindex', '-1');
      alvo.focus({ preventScroll: true });
    });
  });

  // A navegação aparece depois do topo
  ScrollTrigger.create({
    trigger: '.topo',
    start: 'bottom 40%',
    onEnter: () => raiz.classList.add('nav-visivel'),
    onLeaveBack: () => raiz.classList.remove('nav-visivel'),
  });

  // A galeria presa na tela vem primeiro: os gatilhos criados depois dela
  // já medem a página com o espaço extra que ela ocupa
  const telas = gsap.matchMedia();

  // Telas da Distri Rio andam para o lado enquanto a página rola
  telas.add('(min-width: 768px)', () => {
    const galeria = document.querySelector('.galeria');
    const janela = galeria.querySelector('.galeria-janela');
    const trilho = galeria.querySelector('.galeria-trilho');
    const distancia = () => Math.max(0, trilho.scrollWidth - janela.clientWidth);
    gsap.to(trilho, {
      x: () => -distancia(),
      ease: 'none',
      scrollTrigger: {
        trigger: galeria,
        start: 'top top',
        end: () => `+=${distancia()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });
  });

  // Percurso da linha 21: o número e as paradas acompanham a cena que está na tela
  telas.add('(min-width: 900px)', () => {
    const cenas = gsap.utils.toArray('.cena');
    const valor = document.querySelector('.rota-valor');
    const legenda = document.querySelector('.rota-legenda');
    const paradas = gsap.utils.toArray('.rota-paradas li');
    const contador = { n: 1 };
    let atual = -1;

    const irPara = (i) => {
      if (i === atual) return;
      atual = i;
      const cena = cenas[i];
      const sufixo = cena.dataset.sufixo || '';
      gsap.to(contador, {
        n: Number(cena.dataset.valor),
        duration: 0.9,
        ease: 'power2.out',
        overwrite: true,
        onUpdate: () => { valor.textContent = Math.round(contador.n) + sufixo; },
      });
      legenda.textContent = cena.dataset.legenda;
      gsap.fromTo(legenda, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.4, overwrite: true });
      paradas.forEach((parada, k) => {
        parada.classList.toggle('passou', k < i);
        parada.classList.toggle('atual', k === i);
      });
    };

    // Cada cena vale enquanto o meio dela está perto do meio da tela
    cenas.forEach((cena, i) => ScrollTrigger.create({
      trigger: cena,
      start: 'top 20%',
      end: 'bottom 20%',
      onToggle: (st) => { if (st.isActive) irPara(i); },
    }));
    irPara(0);

    gsap.fromTo('.rota-progresso', { scaleY: 0 }, {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: '.cenas', start: 'top 20%', end: 'bottom 20%', scrub: true },
    });

    return () => paradas.forEach((parada) => parada.classList.remove('passou', 'atual'));
  });

  // Fundo escuro enquanto uma zona escura ocupa a tela. Criado depois da galeria para
  // contar o espaço que ela ocupa presa na tela, e decidido olhando todas as zonas juntas.
  const zonas = [];
  const atualizarTema = () => raiz.classList.toggle('escuro', zonas.some((z) => z.isActive));
  gsap.utils.toArray('[data-tema="escuro"]').forEach((zona) => {
    zonas.push(ScrollTrigger.create({ trigger: zona, start: 'top 55%', end: 'bottom 45%', onToggle: atualizarTema }));
  });
  atualizarTema();

  // O letreiro sobe um pouco mais devagar que a página
  gsap.to('.letreiro', {
    yPercent: 18,
    ease: 'none',
    scrollTrigger: { trigger: '.topo', start: 'top top', end: 'bottom top', scrub: true },
  });

  // Blocos que surgem de baixo quando entram na tela
  gsap.set('.surgir', { y: 36, opacity: 0 });
  ScrollTrigger.batch('.surgir', {
    start: 'top 90%',
    once: true,
    onEnter: (lote) => gsap.to(lote, {
      y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1, overwrite: true,
    }),
  });

  // Cartões das cenas: o cartão sobe e os itens entram um a um
  gsap.utils.toArray('.cartao').forEach((cartao) => {
    const itens = cartao.querySelectorAll('.cartao-lista li, .cartao-fluxo li, pre, .cartao-nota, .cartao-botao');
    const marcas = cartao.querySelectorAll('.ok');
    const entrada = gsap.timeline({ scrollTrigger: { trigger: cartao, start: 'top 82%', once: true } })
      .from(cartao, { y: 48, opacity: 0, duration: 0.8, ease: 'power3.out' });
    if (itens.length) entrada.from(itens, { x: -14, opacity: 0, duration: 0.45, stagger: 0.14, ease: 'power2.out' }, '-=0.35');
    if (marcas.length) entrada.from(marcas, { scale: 0, duration: 0.35, stagger: 0.14, ease: 'back.out(3)' }, '<');
  });

  // Faixa de ferramentas: anda sozinha e acelera (ou inverte) conforme a rolagem
  const faixa = gsap.to('.faixa-trilho', { xPercent: -50, duration: 28, ease: 'none', repeat: -1 });
  faixa.totalTime(faixa.duration() * 500); // folga para poder andar para trás
  let acalmar;
  ScrollTrigger.create({
    trigger: '.faixa',
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: (st) => {
      const sentido = st.direction || 1;
      const impulso = gsap.utils.clamp(1, 6, 1 + Math.abs(st.getVelocity()) / 400);
      gsap.to(faixa, { timeScale: sentido * impulso, duration: 0.2, overwrite: true });
      clearTimeout(acalmar);
      acalmar = setTimeout(() => gsap.to(faixa, { timeScale: sentido, duration: 1, overwrite: true }), 150);
    },
  });

  // Números contam até o valor quando entram na tela
  gsap.utils.toArray('[data-contar]').forEach((numero) => {
    const alvo = Number(numero.dataset.contar);
    const contador = { n: 0 };
    numero.textContent = '0';
    gsap.to(contador, {
      n: alvo,
      duration: alvo > 50 ? 1.8 : 1.1,
      ease: 'power2.out',
      onUpdate: () => { numero.textContent = Math.round(contador.n); },
      scrollTrigger: { trigger: numero, start: 'top 90%', once: true },
    });
  });

  // Cartões de serviço entram em sequência
  gsap.set('.servico', { y: 40, opacity: 0 });
  ScrollTrigger.batch('.servico', {
    start: 'top 90%',
    once: true,
    onEnter: (lote) => gsap.to(lote, {
      y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.1, overwrite: true,
      onComplete: () => gsap.set(lote, { clearProps: 'transform' }),
    }),
  });

  // Mural: cada foto abre de baixo para cima quando entra na tela
  gsap.utils.toArray('.mural-moldura').forEach((moldura) => {
    gsap.timeline({ scrollTrigger: { trigger: moldura, start: 'top 92%', once: true } })
      .from(moldura, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.1, ease: 'power4.inOut' })
      .from(moldura.querySelector('img'), { scale: 1.3, duration: 1.4, ease: 'power3.out' }, 0);
  });

  // Botões grudam de leve no mouse
  if (matchMedia('(hover: hover) and (pointer: fine)').matches) {
    gsap.utils.toArray('.botao').forEach((botao) => {
      const x = gsap.quickTo(botao, 'x', { duration: 0.5, ease: 'power3' });
      const y = gsap.quickTo(botao, 'y', { duration: 0.5, ease: 'power3' });
      botao.addEventListener('pointermove', (e) => {
        const r = botao.getBoundingClientRect();
        x((e.clientX - r.left - r.width / 2) * 0.25);
        y((e.clientY - r.top - r.height / 2) * 0.35);
      });
      botao.addEventListener('pointerleave', () => { x(0); y(0); });
    });
  }

  // Screenshot do Catálogo de Séries com leve paralaxe dentro da moldura
  gsap.fromTo('.series .tela-link img',
    { scale: 1.12, yPercent: -4 },
    {
      scale: 1.12, yPercent: 4, ease: 'none',
      scrollTrigger: { trigger: '.series .tela-link', start: 'top bottom', end: 'bottom top', scrub: true },
    });

  // Colunas do mural andam em velocidades diferentes
  telas.add('(min-width: 860px)', () => {
    gsap.utils.toArray('.mural-coluna').forEach((coluna) => {
      gsap.to(coluna, {
        yPercent: Number(coluna.dataset.velocidade) || 0,
        ease: 'none',
        scrollTrigger: { trigger: '.mural', start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  });

  // Textos dependem da fonte carregada para quebrar as linhas no lugar certo
  document.fonts.ready.then(() => {
    // Abertura: as linhas sobem logo que a página abre
    SplitText.create('.abertura', {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
      onSplit: (self) => gsap.from(self.lines, {
        yPercent: 110, duration: 1.1, ease: 'power4.out', stagger: 0.09, delay: 0.15,
      }),
    });
    gsap.from('.resumo, .convite', { y: 20, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.1, delay: 0.55 });

    // Foto: abre de baixo para cima, com a imagem assentando dentro da moldura
    gsap.from('.foto-moldura', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.3, ease: 'power4.inOut', delay: 0.25 });
    gsap.fromTo('.foto-moldura img', { scale: 1.35 }, { scale: 1.1, duration: 1.8, ease: 'power3.out', delay: 0.25 });
    gsap.from('.foto figcaption', { opacity: 0, y: 8, duration: 0.6, delay: 1.1 });
    gsap.to('.foto-moldura img', {
      yPercent: 5,
      ease: 'none',
      scrollTrigger: { trigger: '.topo', start: 'top top', end: 'bottom top', scrub: true },
    });
    liberar();

    // Títulos: linhas sobem de trás de uma máscara quando entram na tela
    gsap.utils.toArray('.revelar, .cena-titulo').forEach((titulo) => {
      SplitText.create(titulo, {
        type: 'lines',
        mask: 'lines',
        autoSplit: true,
        onSplit: (self) => gsap.from(self.lines, {
          yPercent: 110,
          duration: 1.1,
          ease: 'power4.out',
          stagger: 0.09,
          scrollTrigger: { trigger: titulo, start: 'top 88%', once: true },
        }),
      });
    });

    // Frase grande: as palavras acendem conforme a página rola
    SplitText.create('.frase-rolagem', {
      type: 'words',
      autoSplit: true,
      onSplit: (self) => gsap.fromTo(self.words, { opacity: 0.14 }, {
        opacity: 1,
        ease: 'none',
        stagger: 0.12,
        scrollTrigger: { trigger: '.frase-rolagem', start: 'top 78%', end: 'bottom 42%', scrub: true },
      }),
    });

    ScrollTrigger.refresh();
  });
})();
