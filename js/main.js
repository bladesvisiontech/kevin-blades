/* ==========================================================================
   KEVIN BLADES — interactions & motion
   ========================================================================== */
gsap.registerPlugin(ScrollTrigger);
const reduce = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
const isTouch = window.matchMedia('(hover:none)').matches;

/* ---------- PRELOADER / INTERACTIVE ENTRY GATE ---------- */
(function loader(){
  const el   = document.getElementById('loader');
  const bar  = document.getElementById('loaderFill');
  const mask = document.getElementById('loaderFillMask');
  const num  = document.getElementById('loaderNum');
  const step = document.getElementById('loaderStep');
  const status = document.getElementById('loaderStatus');
  const glow = document.getElementById('loaderGlow');
  const enterBtn = document.getElementById('enterBtn');
  const enterWrap = document.getElementById('enterWrap');
  document.body.classList.add('loading');

  const phases = [
    [0,  'Iniciando la sesión…'],
    [22, 'Afilando las <b>cuchillas</b>…'],
    [46, 'Preparando la <b>silla</b>…'],
    [70, 'Cargando el <b>feed</b>…'],
    [90, 'Casi listo. <b>Winning season</b>.']
  ];
  let phaseIdx = -1;
  function setPhase(p){
    let i=0; for(let k=0;k<phases.length;k++){if(p>=phases[k][0])i=k;}
    if(i!==phaseIdx){phaseIdx=i;status.innerHTML=phases[i][1];}
  }

  let p=0, entered=false, ready=false;
  const tick=setInterval(()=>{
    p += Math.random()*7 + 2;
    if(p>=100){p=100;clearInterval(tick);}
    const v=Math.floor(p);
    bar.style.width=p+'%';
    mask.style.clipPath='inset(0 '+(100-p)+'% 0 0)';
    num.textContent=v<10?'0'+v:v;
    setPhase(p);
    if(p>=100)openGate();
  },95);

  // cursor-follow glow
  if(!isTouch){
    el.addEventListener('mousemove',e=>{
      el.style.setProperty('--gx',e.clientX+'px');
      el.style.setProperty('--gy',e.clientY+'px');
    });
  }

  function openGate(){
    if(ready)return; ready=true;
    step.textContent='LISTO';
    status.innerHTML='Tu silla te espera.';
    setTimeout(()=>{
      el.classList.add('gate');
      enterWrap.classList.add('show');
    },500);
  }

  function enter(){
    if(entered||!ready)return; entered=true;
    enterWrap.classList.remove('show');
    el.classList.add('done');
    document.body.classList.remove('loading');
    document.body.classList.add('loaded');
    if(window.__startBeat) window.__startBeat();       // start music on user gesture
    const hv=document.getElementById('heroVideo'); if(hv) hv.play().catch(()=>{});
    startHero();
    ScrollTrigger.refresh();
    setTimeout(()=>el.remove(),1200);
  }

  enterBtn.addEventListener('click',enter);
  window.addEventListener('keydown',e=>{
    if(ready && !entered && (e.key==='Enter'||e.key===' ')){e.preventDefault();enter();}
  });
})();

/* ---------- HERO INTRO ---------- */
function startHero(){
  if(reduce) return;
  const lines = gsap.utils.toArray('[data-hero-line]');
  gsap.set(lines,{yPercent:110});
  gsap.to(lines,{yPercent:0,duration:1.1,ease:'expo.out',stagger:.12});
  gsap.utils.toArray('.hero [data-reveal]').forEach((el,i)=>{
    gsap.fromTo(el,{opacity:0,y:24},{opacity:1,y:0,duration:1,delay:.5+i*.12,ease:'power3.out'});
    el.classList.add('in');
  });
}

/* ---------- CUSTOM CURSOR ---------- */
if(!isTouch){
  const cur = document.getElementById('cursor');
  const dot = document.getElementById('cursorDot');
  let mx=innerWidth/2,my=innerHeight/2,cx=mx,cy=my;
  window.addEventListener('mousemove',e=>{
    mx=e.clientX;my=e.clientY;
    dot.style.transform=`translate(${mx}px,${my}px) translate(-50%,-50%)`;
  });
  gsap.ticker.add(()=>{
    cx+=(mx-cx)*.16;cy+=(my-cy)*.16;
    cur.style.transform=`translate(${cx}px,${cy}px) translate(-50%,-50%)`;
  });
  document.querySelectorAll('[data-cursor="hover"],a,button').forEach(el=>{
    el.addEventListener('mouseenter',()=>cur.classList.add('is-hover'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('is-hover'));
  });
  document.querySelectorAll('[data-cursor="hidden"]').forEach(el=>{
    el.addEventListener('mouseenter',()=>cur.classList.add('is-hidden'));
    el.addEventListener('mouseleave',()=>cur.classList.remove('is-hidden'));
  });
}

/* ---------- MAGNETIC BUTTONS ---------- */
if(!isTouch){
  document.querySelectorAll('[data-magnetic]').forEach(btn=>{
    btn.addEventListener('mousemove',e=>{
      const r=btn.getBoundingClientRect();
      const x=e.clientX-r.left-r.width/2;
      const y=e.clientY-r.top-r.height/2;
      gsap.to(btn,{x:x*.35,y:y*.5,duration:.5,ease:'power3.out'});
    });
    btn.addEventListener('mouseleave',()=>gsap.to(btn,{x:0,y:0,duration:.7,ease:'elastic.out(1,.4)'}));
  });
}

/* ---------- NAV state + scroll progress ---------- */
const nav=document.getElementById('nav');
const bar=document.getElementById('scrollBar');
function onScroll(){
  const st=window.scrollY;
  nav.classList.toggle('scrolled',st>60);
  const h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(st/h*100)+'%';
}
window.addEventListener('scroll',onScroll,{passive:true});onScroll();

/* smooth anchor scroll */
document.querySelectorAll('a[href^="#"]').forEach(a=>{
  a.addEventListener('click',e=>{
    const t=document.querySelector(a.getAttribute('href'));
    if(t){e.preventDefault();t.scrollIntoView({behavior:'smooth'});}
  });
});

/* ---------- HERO PARALLAX ---------- */
if(!reduce){
  gsap.to('#heroVideo',{yPercent:18,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero__content',{yPercent:-30,opacity:.2,ease:'none',
    scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
}

/* ---------- MARQUEE (scroll-reactive) ---------- */
if(!reduce){
  const row=document.querySelector('.marquee__row');
  gsap.to(row,{xPercent:-50,ease:'none',repeat:-1,duration:22});
  gsap.to(row,{xPercent:-50,ease:'none',
    scrollTrigger:{trigger:'.marquee-wrap',start:'top bottom',end:'bottom top',scrub:1.2}});
}

/* ---------- GENERIC REVEAL ---------- */
gsap.utils.toArray('[data-reveal]').forEach(el=>{
  if(el.closest('.hero')) return;
  ScrollTrigger.create({trigger:el,start:'top 88%',once:true,
    onEnter:()=>el.classList.add('in')});
});

/* ---------- MANIFESTO word-by-word ---------- */
if(!reduce){
  const words=gsap.utils.toArray('.manifesto__text [data-word]');
  gsap.to(words,{opacity:1,stagger:.15,ease:'none',
    scrollTrigger:{trigger:'.manifesto__text',start:'top 75%',end:'bottom 65%',scrub:true}});
}

/* ---------- PARALLAX layers (data-parallax) ---------- */
if(!reduce){
  gsap.utils.toArray('[data-parallax]').forEach(el=>{
    const speed=parseFloat(el.dataset.parallax);
    gsap.fromTo(el,{yPercent:-speed*50},{yPercent:speed*50,ease:'none',
      scrollTrigger:{trigger:el.parentElement,start:'top bottom',end:'bottom top',scrub:true}});
  });
}

/* ---------- FEED horizontal scroll ---------- */
if(!reduce && !isTouch){
  const track=document.getElementById('feedTrack');
  const dist=()=>track.scrollWidth-innerWidth+64;
  gsap.to(track,{x:()=>-dist(),ease:'none',
    scrollTrigger:{trigger:'#feed',start:'top top',end:()=>'+='+dist(),
      pin:true,scrub:1,invalidateOnRefresh:true,anticipatePin:1}});
}

/* ---------- LAZY VIDEO load + play in view ---------- */
const vids=document.querySelectorAll('video[data-src]');
const vObs=new IntersectionObserver((entries)=>{
  entries.forEach(en=>{
    const v=en.target;
    if(en.isIntersecting){
      if(!v.src){v.src=v.dataset.src;}
      v.play().catch(()=>{});
    }else{v.pause();}
  });
},{threshold:.35});
vids.forEach(v=>vObs.observe(v));

/* ---------- STATS counter ---------- */
gsap.utils.toArray('.stat__num').forEach(el=>{
  const end=+el.dataset.count, suf=el.dataset.suffix||'';
  ScrollTrigger.create({trigger:el,start:'top 90%',once:true,onEnter:()=>{
    const o={v:0};
    gsap.to(o,{v:end,duration:2,ease:'power2.out',
      onUpdate:()=>el.textContent=Math.floor(o.v).toLocaleString('en-US')+suf});
  }});
});

/* ---------- SHOWREEL play/pause ---------- */
(function showreel(){
  const v=document.getElementById('showVideo');
  const btn=document.getElementById('showPlay');
  if(!v||!btn)return;
  btn.addEventListener('click',()=>{
    if(!v.src)v.src=v.dataset.src;
    if(v.paused){v.play();btn.classList.add('hidden');}
    else{v.pause();btn.classList.remove('hidden');}
  });
  v.addEventListener('click',()=>{v.pause();btn.classList.remove('hidden');});
})();

/* ---------- AUDIO (background beat) ---------- */
(function audio(){
  const a=document.getElementById('beat');
  const btn=document.getElementById('audioBtn');
  a.volume=0;
  let on=false;
  function fade(to,cb){
    gsap.to(a,{volume:to,duration:.8,ease:'power2.out',onComplete:cb});
  }
  function play(){
    a.play().then(()=>{on=true;btn.classList.add('playing');fade(.55);})
     .catch(()=>{});
  }
  function stop(){fade(0,()=>{a.pause();});on=false;btn.classList.remove('playing');}
  btn.addEventListener('click',()=>on?stop():play());
  // the entry gate (ENTRAR) triggers this on the user's first gesture
  window.__startBeat=()=>{if(!on)play();};
  // pause when tab hidden
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&on)a.pause();else if(!document.hidden&&on)a.play();});
})();

/* refresh on load of everything */
window.addEventListener('load',()=>ScrollTrigger.refresh());
