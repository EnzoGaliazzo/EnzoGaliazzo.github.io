import { instalarAnalytics } from './analytics.js';

const html=document.documentElement;
const qs=(s,r=document)=>r.querySelector(s);
const idiomaBotao=[...document.querySelectorAll('[data-idioma]')];
const secciones=[...document.querySelectorAll('main section[data-hora]')];

function observarRota(){
  const reloj=qs('[data-relogio]');
  if(!('IntersectionObserver'in window))return;
  const io=new IntersectionObserver(entries=>{
    for(const e of entries){if(!e.isIntersecting)continue;
      const s=e.target;reloj.textContent=s.dataset.hora;
      const tema=s.dataset.tema;html.classList.toggle('escuro',['madrugada','noite'].includes(tema));
      html.dataset.tema=tema;
    }
  },{rootMargin:'-42% 0px -42% 0px',threshold:0});
  secciones.forEach(s=>io.observe(s));
  const sync=()=>{const e=document.elementFromPoint(innerWidth/2,Math.min(innerHeight-1,innerHeight*.5));const s=e?.closest('main section[data-hora]');if(s){reloj.textContent=s.dataset.hora;html.classList.toggle('escuro',['madrugada','noite'].includes(s.dataset.tema));html.dataset.tema=s.dataset.tema;}};let queued=false;window.addEventListener('scroll',()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;sync();});},{passive:true});window.addEventListener('hashchange',()=>setTimeout(()=>{const target=location.hash&&qs(location.hash);if(target)window.scrollTo({top:target.getBoundingClientRect().top+scrollY,behavior:'instant'});sync();},50));if(location.hash)setTimeout(()=>{const target=qs(location.hash);if(target)window.scrollTo({top:target.getBoundingClientRect().top+scrollY,behavior:'instant'});sync();},1500);
}
function eMail(){document.querySelectorAll('[data-usuario][data-dominio]').forEach(a=>{const address=`${a.dataset.usuario}@${a.dataset.dominio}`;a.href=`mailto:${address}`;a.textContent=address;});}
function aparelhoLeve(){const mem=navigator.deviceMemory||99,cores=navigator.hardwareConcurrency||99,save=navigator.connection?.saveData; if((cores<=4&&mem<=4)||save)html.classList.add('leve');}
async function trocarIdioma(lang){
  if(!['pt','en'].includes(lang))return;
  const aplica=async()=>{
    if(lang==='en'){
      const res=await fetch('i18n/en.json',{credentials:'same-origin'});if(!res.ok)throw Error('Falha ao obter tradução');const t=await res.json();
      document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t[el.dataset.i18n];if(v!==undefined)el.textContent=v;});
      document.querySelectorAll('[data-i18n-attr]').forEach(el=>{const [attr,key]=el.dataset.i18nAttr.split(':');if(t[key]!==undefined)el.setAttribute(attr,t[key]);});
      document.title=t['meta.title'];qs('meta[name="description"]').content=t['meta.description'];html.lang='en';
      const resume=qs('[data-curriculo-en]');if(resume)resume.href=resume.dataset.curriculoEn;
    }else{
      const response=await fetch('i18n/en.json',{credentials:'same-origin'});const t=await response.json();
      document.querySelectorAll('[data-i18n]').forEach(el=>{const v=t.__pt?.[el.dataset.i18n];if(v!==undefined)el.textContent=v;});
      // O HTML inicial é a fonte canônica em português; preserve cópia dos textos antes da primeira tradução.
      document.querySelectorAll('[data-i18n]').forEach(el=>{if(el.dataset.ptOriginal)el.textContent=el.dataset.ptOriginal;});
      document.querySelectorAll('[data-i18n-attr]').forEach(el=>{const [attr]=el.dataset.i18nAttr.split(':');if(el.dataset.ptOriginalAttr){const original=JSON.parse(el.dataset.ptOriginalAttr);if(Object.hasOwn(original,attr))el.setAttribute(attr,original[attr]);}});
      document.title='Enzo Rezende — Desenvolvedor web no Rio de Janeiro';qs('meta[name="description"]').content='Sou Enzo Rezende, desenvolvedor web do Rio de Janeiro. Conheça meu trabalho, meus estudos e fale comigo sobre estágio ou projetos de site.';html.lang='pt-BR';
      const resume=qs('[data-curriculo-pt]');if(resume)resume.href=resume.dataset.curriculoPt;
    }
    idiomaBotao.forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.idioma===lang)));
    try{localStorage.setItem('linha21-lang',lang);}catch(_){}
    window.dispatchEvent(new CustomEvent('linha21:idioma',{detail:{lang}}));
  };
  // Cache o texto português literal antes de substituir.
  document.querySelectorAll('[data-i18n]').forEach(el=>{if(!el.dataset.ptOriginal)el.dataset.ptOriginal=el.textContent;});
  document.querySelectorAll('[data-i18n-attr]').forEach(el=>{const [attr]=el.dataset.i18nAttr.split(':');if(!el.dataset.ptOriginalAttr)el.dataset.ptOriginalAttr=JSON.stringify({[attr]:el.getAttribute(attr)||''});});
  try{if(document.startViewTransition)document.startViewTransition(aplica);else await aplica();}catch(err){console.warn('Idioma não foi alterado.',err);}
}
idiomaBotao.forEach(b=>b.addEventListener('click',()=>trocarIdioma(b.dataset.idioma)));
async function carregarMovimento(){
  if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const files=['vendor/gsap.min.js','vendor/ScrollTrigger.min.js','vendor/SplitText.min.js','vendor/lenis.min.js'];
  try{for(const src of files){await new Promise((ok,no)=>{const s=document.createElement('script');s.src=src;s.onload=ok;s.onerror=no;document.head.append(s);});}await import('./cenas.js');}catch(e){console.warn('Movimento opcional indisponível.',e);}
}
let movementQueued=false;const queueMovement=()=>{if(movementQueued)return;movementQueued=true;carregarMovimento();};
['pointerdown','keydown','wheel','touchstart'].forEach(ev=>window.addEventListener(ev,queueMovement,{once:true,passive:true}));

function carregarSobDemanda(){
  if(!('IntersectionObserver'in window))return;
  const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(!e.isIntersecting)return;const el=e.target;io.unobserve(el);
    if(el.matches('.mar'))import('./mar.js').then(m=>{const api=m.iniciarMar(qs('.mar-canvas',el));if(api){window.linha21Mar=api;window.dispatchEvent(new CustomEvent('linha21:mar'));const obs=new IntersectionObserver(v=>v[0].isIntersecting?api.retomar():api.pausar());obs.observe(el);}}).catch(()=>html.classList.add('sem-webgl'));
    if(el.matches('.fotos'))import('./fotos-gl.js').then(m=>m.distorcaoNoHover(el.querySelectorAll('img'))).catch(()=>html.classList.add('sem-webgl'));
  }),{rootMargin:'250px'});
  document.querySelectorAll('.mar,.fotos').forEach(s=>io.observe(s));
}
// Lazy texts are progressive; mount contact email and route state immediately.
eMail();observarRota();aparelhoLeve();carregarSobDemanda();instalarAnalytics();
let idioma='pt';try{idioma=localStorage.getItem('linha21-lang')||idioma;}catch(_){}const q=new URLSearchParams(location.search).get('lang');if(q==='en')idioma='en';if(idioma==='en')trocarIdioma('en');
window.linha21={carregar:carregarMovimento,event:n=>window.dispatchEvent(new CustomEvent('linha21:evento',{detail:n}))};
