import {criarLetreiro} from '../js/letreiro.js';
const quadros={largo:[[['ENZO REZENDE',2]],[['DESENVOLVEDOR WEB',1],['RIO DE JANEIRO',1]],[['ESTUDANTE DE ADS',1],['VIA UVA BARRA',1]],[['6 MESES EM',1],['VANCOUVER',1]]],estreito:[[['ENZO',2],['REZENDE',2]],[['DESENVOLVEDOR',1],['WEB',1],['RIO DE JANEIRO',1]],[['ESTUDANTE',1],['DE ADS',1],['VIA UVA BARRA',1]],[['6 MESES',1],['EM',1],['VANCOUVER',1]]]};
const main=criarLetreiro(document.querySelector('#principal'),{quadros,particulas:document.querySelector('#particulas')});
const contact=criarLetreiro(document.querySelector('#contato'),{quadros:{largo:[[['ME CHAMA',2]]],estreito:[[['ME',2],['CHAMA',2]]]},ciclo:false});
document.querySelector('#queda').addEventListener('input',e=>main.soltar(Number(e.target.value)));
for(const button of document.querySelectorAll('button[data-t]')){const show=()=>contact.mostrarTexto(button.dataset.t),back=()=>contact.voltarAoCiclo();button.addEventListener('mouseenter',show);button.addEventListener('focus',show);button.addEventListener('mouseleave',back);button.addEventListener('blur',back);}
const p=new URLSearchParams(location.search).get('p');if(p!==null){document.querySelector('#queda').value=p;main.soltar(Number(p));}
