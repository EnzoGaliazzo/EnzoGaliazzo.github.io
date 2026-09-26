import { criarLetreiro } from './letreiro.js';

function initCenas(){
const {gsap}=window;if(!gsap)return;
const {ScrollTrigger}=window;gsap.registerPlugin(ScrollTrigger);
const root=document.documentElement;
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduced)return;

let lenis=null;
if(window.Lenis){lenis=new window.Lenis({duration:1.05,smoothWheel:true,gestureOrientation:'vertical',smoothTouch:false});lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);}

const wide=gsap.matchMedia();
// Letreiro fica decorativo; o conteúdo equivalente continua disponível no HTML.
const quadrosPT={largo:[[["ENZO REZENDE",2]],[["DESENVOLVEDOR WEB",1],["RIO DE JANEIRO",1]],[["ESTUDANTE DE ADS",1],["VIA UVA BARRA",1]],[["6 MESES EM",1],["VANCOUVER",1]]],estreito:[[["ENZO",2],["REZENDE",2]],[["DESENVOLVEDOR",1],["WEB",1],["RIO DE JANEIRO",1]],[["ESTUDANTE",1],["DE ADS",1],["VIA UVA BARRA",1]],[["6 MESES",1],["EM",1],["VANCOUVER",1]]]};
const quadrosEN={largo:[[["ENZO REZENDE",2]],[["WEB DEVELOPER",1],["RIO DE JANEIRO",1]],[["ADS STUDENT",1],["UVA BARRA",1]],[["6 MONTHS IN",1],["VANCOUVER",1]]],estreito:[[["ENZO",2],["REZENDE",2]],[["WEB",1],["DEVELOPER",1],["RIO DE JANEIRO",1]],[["ADS",1],["STUDENT",1],["UVA BARRA",1]],[["6 MONTHS",1],["IN",1],["VANCOUVER",1]]]};
const contatoPT={largo:[[["ME CHAMA",2]]],estreito:[[["ME",2],["CHAMA",2]]]};
const contatoEN={largo:[[["SAY HELLO",2]]],estreito:[[["SAY",2],["HELLO",2]]]};
const idiomaEN=document.documentElement.lang==='en';
const sign=qs('.letreiro-canvas');
function qs(s,r=document){return r.querySelector(s)}
let topSign=sign?criarLetreiro(sign,{quadros:idiomaEN?quadrosEN:quadrosPT,linha:'',ciclo:true,interativo:true,particulas:false}):null;
const contactCanvas=qs('.contato-letreiro');let contactSign=contactCanvas?criarLetreiro(contactCanvas,{quadros:idiomaEN?contatoEN:contatoPT,linha:'',ciclo:false,interativo:false,particulas:false}):null;
window.addEventListener('linha21:idioma',e=>{const en=e.detail.lang==='en';topSign?.trocarQuadros(en?quadrosEN:quadrosPT);contactSign?.trocarQuadros(en?contatoEN:contatoPT);});

// Letreiro se desfaz ao rolar a abertura; estado reversível pelo scrub.
gsap.to({p:0},{p:1,ease:'none',scrollTrigger:{trigger:'#topo',start:'top top',end:'bottom top',scrub:true,onUpdate:self=>topSign?.soltar(self.progress)}});

// Mar e canvas pausam quando a cena sai do viewport (o mar inicia pelo carregador base).
let marApi=null;let marTrigger=null;const conectarMar=()=>{marApi=window.linha21Mar;if(!marApi||marTrigger)return;marTrigger=ScrollTrigger.create({trigger:'#mar',start:'top bottom',end:'bottom top',onUpdate:s=>marApi?.definirProgresso(s.progress),onLeave:()=>marApi?.pausar(),onEnterBack:()=>marApi?.retomar(),refreshPriority:8});};
window.addEventListener('linha21:mar',conectarMar);conectarMar();

// Case em cinco etapas: pinos apenas em telas largas; no celular cada etapa fica no fluxo.
wide.add('(min-width: 761px)',()=>{
 const steps=gsap.utils.toArray('.case-passo');const list=qs('.case-passos');
 const desk=qs('.case-screen img'),phone=qs('.case-phone img');
 const deskShots=['distririo-inicio','distririo-catalogo','distririo-produto','distririo-celular','distririo-inicio'];
 const phoneShots=['distririo-celular','distririo-celular','distririo-produto','distririo-celular','distririo-celular'];
 const setShot=(img,name)=>{if(!img)return;const max=(name==='distririo-celular'||name==='distririo-produto')?'780':'960',picture=img.closest('picture'),sources=picture?.querySelectorAll('source');if(sources?.[0])sources[0].srcset=`assets/r/${name}-480.avif 480w, assets/r/${name}-${max}.avif ${max}w`;if(sources?.[1])sources[1].srcset=`assets/r/${name}-480.webp 480w, assets/r/${name}-${max}.webp ${max}w`;img.src=`assets/${name}.webp`;};
 const change=i=>{setShot(desk,deskShots[i]);setShot(phone,phoneShots[i]);steps.forEach((s,n)=>s.classList.toggle('atual',n===i));};
 const tl=gsap.timeline({scrollTrigger:{trigger:'.case',start:'top top+=80',end:()=>`+=${steps.length*window.innerHeight*.8}`,pin:qs('.case-visuais'),scrub:.6,invalidateOnRefresh:true,onUpdate:s=>change(Math.min(4,Math.floor(s.progress*5))),refreshPriority:6}});
 steps.forEach((step,i)=>{tl.fromTo(step,{x:18},{x:0,duration:1},i);});
 const grid=qs('.grade-produtos');if(grid){const c=grid.getContext('2d');c.clearRect(0,0,grid.width,grid.height);c.fillStyle='#b96d00';for(let i=0;i<333;i++){const col=i%21,row=Math.floor(i/21);c.fillRect(col*15+3,row*15+3,9,9);}}
 const formSearch=qs('.busca-texto');if(formSearch){const original='trident';formSearch.textContent='';ScrollTrigger.create({trigger:steps[2],start:'top 65%',onEnter:()=>{let i=0;const id=setInterval(()=>{formSearch.textContent=original.slice(0,++i);if(i>=original.length)clearInterval(id);},90);},onLeaveBack:()=>formSearch.textContent=''});}
 gsap.to('.case-phone',{y:-8,duration:1.7,repeat:-1,yoyo:true,ease:'sine.inOut'});
});
wide.add('(max-width: 760px)',()=>{const phone=qs('.case-phone img');const shots=['distririo-celular','distririo-celular','distririo-produto','distririo-celular','distririo-celular'];gsap.utils.toArray('.case-passo').forEach((step,i)=>ScrollTrigger.create({trigger:step,start:'top 62%',onEnter:()=>{const max=780,pic=phone?.closest('picture'),src=pic?.querySelectorAll('source');if(src?.[0])src[0].srcset=`assets/r/${shots[i]}-480.avif 480w, assets/r/${shots[i]}-${max}.avif ${max}w`;if(src?.[1])src[1].srcset=`assets/r/${shots[i]}-480.webp 480w, assets/r/${shots[i]}-${max}.webp ${max}w`;if(phone)phone.src=`assets/${shots[i]}.webp`;}}));});

// Grade de serviços monta sem esconder os itens quando a animação não roda.
gsap.from('.servicos-grade li',{y:24,stagger:.08,duration:.55,ease:'power2.out',scrollTrigger:{trigger:'.servicos-grade',start:'top 82%',once:true}});
// Stack por teclado e ponteiro.
const use=qs('[data-stack-uso]');document.querySelectorAll('[data-stack]').forEach(key=>{
 const select=()=>{document.querySelectorAll('[data-stack]').forEach(k=>k.setAttribute('aria-pressed','false'));key.setAttribute('aria-pressed','true');if(use)use.textContent=`${key.textContent}: ${key.dataset.stack}.`;};
 key.addEventListener('click',select);key.addEventListener('keydown',e=>{if(['Enter',' '].includes(e.key)){e.preventDefault();select();}});
});
// Trilho touch é rolável nativamente; mouse arrasta com pointer capture.
function arrastavel(el){let x=0,left=0,drag=false;el.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;drag=true;x=e.clientX;left=el.scrollLeft;el.setPointerCapture(e.pointerId);});el.addEventListener('pointermove',e=>{if(drag)el.scrollLeft=left-(e.clientX-x);});for(const ev of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(ev,()=>drag=false);}
arrastavel(qs('.linha-tempo'));
wide.add('(min-width: 900px)',()=>{const track=qs('.linha-tempo');if(!track)return;const distance=()=>Math.max(0,track.scrollWidth-track.parentElement.clientWidth);gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:'.vida',start:'top top',end:()=>`+=${distance()}`,pin:true,scrub:.65,invalidateOnRefresh:true,refreshPriority:4}});});

// Galeria rola horizontalmente no mobile; em desktop o scroll vertical guia o trilho.
wide.add('(min-width: 900px)',()=>{const track=qs('.galeria-fotos');if(!track)return;const distance=()=>Math.max(0,track.scrollWidth-innerWidth*.74);gsap.to(track,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:'.fotos',start:'top top',end:()=>`+=${distance()}`,pin:true,scrub:.7,invalidateOnRefresh:true,refreshPriority:2}});});

// SplitText usa aria:none para não alterar a árvore acessível. Reverte no unload.
const splits=[];document.fonts.ready.then(()=>{
 if(window.SplitText){document.querySelectorAll('.revelar').forEach(el=>{const instance=window.SplitText.create(el,{type:'lines',aria:'none'});splits.push(instance);gsap.from(instance.lines,{yPercent:45,clipPath:'inset(0 0 100% 0)',duration:.7,stagger:.045,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});});}
 ScrollTrigger.refresh();
});
document.querySelectorAll('.contato-link').forEach(link=>{const show=()=>{contactSign?.retomar();contactSign?.mostrarTexto(link.dataset.letreiro||'');};const reset=()=>{contactSign?.mostrarTexto('');contactSign?.pausar();};link.addEventListener('pointerenter',show);link.addEventListener('focus',show);link.addEventListener('pointerleave',reset);link.addEventListener('blur',reset);});
if(matchMedia('(hover: hover) and (pointer: fine)').matches){document.querySelectorAll('.botao').forEach(b=>{b.addEventListener('pointermove',e=>{const r=b.getBoundingClientRect();b.style.transform=`translate(${(e.clientX-r.left-r.width/2)*.08}px,${(e.clientY-r.top-r.height/2)*.12}px)`;});b.addEventListener('pointerleave',()=>b.style.transform='');});}
// Freeze animation work outside the viewport and when the tab is hidden.
const visibleIO=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.target===qs('#topo'))e.isIntersecting?topSign?.retomar():topSign?.pausar();if(e.target===qs('#contato'))e.isIntersecting?contactSign?.retomar():contactSign?.pausar();}),{threshold:.01});[qs('#topo'),qs('#contato')].forEach(x=>x&&visibleIO.observe(x));
document.addEventListener('visibilitychange',()=>{if(document.hidden){lenis?.stop();topSign?.pausar();contactSign?.pausar();marApi?.pausar();}else{lenis?.start();topSign?.retomar();contactSign?.retomar();marApi?.retomar();}});
window.addEventListener('pagehide',()=>{splits.forEach(s=>s.revert());topSign?.destruir();contactSign?.destruir();marApi?.destruir();lenis?.destroy();},{once:true});
}
initCenas();
