export function instalarAnalytics(){
  document.addEventListener('click',event=>{
    const link=event.target.closest('[data-evento]');if(!link)return;
    const endpoint=document.documentElement.dataset.goatcounter;if(!endpoint)return;
    const url=endpoint;
    const payload=JSON.stringify({path:`/${link.dataset.evento}`,title:link.dataset.evento, event:true});
    try{navigator.sendBeacon(url,new Blob([payload],{type:'application/json'}));}catch(_){}
  });
}
