export function iniciarMar(canvas, opcoes = {}) {
  if (!canvas || typeof canvas.getContext !== 'function') return null;
  const raiz = document.documentElement;
  let gl;
  try { gl = canvas.getContext('webgl', { antialias: false, alpha: false, powerPreference: 'low-power' }); } catch (_) { gl = null; }
  if (!gl) { raiz.classList.add('sem-webgl'); return null; }
  const vert = `attribute vec2 a; void main(){ gl_Position=vec4(a,0.,1.); }`;
  const frag = `precision mediump float;
uniform vec2 res; uniform float t; uniform float prog;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+1.),f.x),f.y);}
void main(){vec2 uv=gl_FragCoord.xy/res; float aspect=res.x/res.y; float horizon=.43-prog*.035;
 float y=uv.y; vec3 col;
 if(y>horizon){float k=clamp((y-horizon)/(.64-horizon),0.,1.);vec3 top=vec3(.055,.095,.16),mid=vec3(.30,.31,.43),warm=vec3(.91,.53,.39);col=mix(warm,mid,smoothstep(0.,.62,k));col=mix(col,top,smoothstep(.45,1.,k));float glow=exp(-pow((y-horizon-.055)/.115,2.));col+=vec3(.23,.095,.045)*glow; vec2 sunPos=vec2(.73,.57+prog*.055); float d=length(vec2((uv.x-sunPos.x)*aspect,(uv.y-sunPos.y)));float disk=1.-smoothstep(.041,.044,d);float halo=exp(-d*20.);col=mix(col,vec3(1.,.635,.12),disk);col+=vec3(.31,.13,.035)*halo*(1.-disk);
 }else{float depth=(horizon-y)/horizon;float wave=sin(uv.x*19.+t*.75+depth*13.)*.006+sin(uv.x*43.-t*.48+depth*21.)*.0025;float surface=y+wave;float band=sin(uv.x*94.+t*1.5+noise(vec2(uv.x*13.,t*.07))*2.5);float shimmer=pow(max(0.,band),18.)*exp(-depth*3.3);float refl=exp(-abs(uv.x-(.73+sin(t*.32)*.014))*17.)*exp(-depth*2.6)*(.25+.75*noise(vec2(uv.x*24.,t*.3)));col=mix(vec3(.11,.39,.41),vec3(.035,.19,.25),smoothstep(0.,1.,depth));col+=vec3(.13,.18,.15)*wave*12.;col+=vec3(.94,.56,.22)*(shimmer*.32+refl*.30);float foam=1.-smoothstep(.001,.009,abs(surface-horizon));col=mix(col,vec3(.88,.86,.79),foam*.58);}
 gl_FragColor=vec4(col,1.);}`;
  function shader(type, src) { const s=gl.createShader(type); gl.shaderSource(s,src); gl.compileShader(s); if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)) throw Error(gl.getShaderInfoLog(s)); return s; }
  let program, buffer;
  try { program=gl.createProgram();gl.attachShader(program,shader(gl.VERTEX_SHADER,vert));gl.attachShader(program,shader(gl.FRAGMENT_SHADER,frag));gl.linkProgram(program);if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw Error(gl.getProgramInfoLog(program));buffer=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW); }
  catch (_) { raiz.classList.add('sem-webgl');try{gl.getExtension('WEBGL_lose_context')?.loseContext();}catch(__){} return null; }
  const loc={a:gl.getAttribLocation(program,'a'),res:gl.getUniformLocation(program,'res'),t:gl.getUniformLocation(program,'t'),prog:gl.getUniformLocation(program,'prog')};
  const reduced=matchMedia('(prefers-reduced-motion: reduce)'), mobile=matchMedia('(max-width: 767px)'); let progress=0, frame=0, last=0, start=performance.now(), visible=true, dead=false, lost=false;
  const resize=()=>{const dpr=mobile.matches?1:Math.min(devicePixelRatio||1,1.5),w=Math.max(1,Math.round(canvas.clientWidth*dpr)),h=Math.max(1,Math.round(canvas.clientHeight*dpr));if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;}draw(performance.now());};
  function draw(now){if(dead||lost)return;gl.viewport(0,0,canvas.width,canvas.height);gl.useProgram(program);gl.bindBuffer(gl.ARRAY_BUFFER,buffer);gl.enableVertexAttribArray(loc.a);gl.vertexAttribPointer(loc.a,2,gl.FLOAT,false,0,0);gl.uniform2f(loc.res,canvas.width,canvas.height);gl.uniform1f(loc.t,reduced.matches?0:(now-start)/1000);gl.uniform1f(loc.prog,progress);gl.drawArrays(gl.TRIANGLE_STRIP,0,4);}
  const loop=now=>{frame=0;if(dead||lost||!visible||reduced.matches)return;const interval=mobile.matches?1000/30:1000/60;if(now-last>=interval){last=now;draw(now);}frame=requestAnimationFrame(loop);};
  const sync=()=>{if(frame)cancelAnimationFrame(frame);frame=0;if(!dead&&visible&&!reduced.matches)frame=requestAnimationFrame(loop);else draw(performance.now());};
  const io='IntersectionObserver'in window?new IntersectionObserver(es=>{visible=es[0]?.isIntersecting??true;sync();}):null;io?.observe(canvas);
  const ro='ResizeObserver'in window?new ResizeObserver(resize):null;ro?.observe(canvas);window.addEventListener('resize',resize);document.addEventListener('visibilitychange',sync);reduced.addEventListener?.('change',sync);mobile.addEventListener?.('change',resize);
  const lostHandler=e=>{e.preventDefault();lost=true;if(frame)cancelAnimationFrame(frame);frame=0;};const restored=()=>{lost=false;resize();sync();};canvas.addEventListener('webglcontextlost',lostHandler);canvas.addEventListener('webglcontextrestored',restored);
  resize();sync();
  return {definirProgresso(p){progress=Math.max(0,Math.min(1,Number(p)||0));draw(performance.now());},pausar(){visible=false;sync();},retomar(){visible=true;sync();},destruir(){if(dead)return;dead=true;if(frame)cancelAnimationFrame(frame);io?.disconnect();ro?.disconnect();window.removeEventListener('resize',resize);document.removeEventListener('visibilitychange',sync);reduced.removeEventListener?.('change',sync);mobile.removeEventListener?.('change',resize);canvas.removeEventListener('webglcontextlost',lostHandler);canvas.removeEventListener('webglcontextrestored',restored);try{gl.getExtension('WEBGL_lose_context')?.loseContext();}catch(_){} }};
}
