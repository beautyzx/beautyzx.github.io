(()=>{
 const root=document.documentElement,body=document.querySelector('.reader-body'),heading=document.querySelector('.reader-heading');
 if(!body||!heading)return;
 const get=k=>{try{return localStorage.getItem(k)}catch{return null}};
 const set=(k,v)=>{try{localStorage.setItem(k,v)}catch{}};
 const KEYS={lu:'陸曜',jiang:'江澈',lin:'林棠',wen:'溫寧'};
 const keyOf=name=>Object.keys(KEYS).find(k=>KEYS[k]===name);

 /* 視角按鈕上色 */
 document.querySelectorAll('.pov-nav a').forEach(a=>{const k=keyOf(a.textContent.trim());if(k)a.classList.add('c-'+k)});

 /* 背景：白天、夜間木色、星空黑 */
 const modeKey='beauty-reader-mode-v1',modes=[['day','白天'],['night','夜間木色'],['star','星空黑']];
 const box=document.createElement('div');box.className='plus-modes';box.setAttribute('role','group');box.setAttribute('aria-label','背景');
 box.innerHTML='<span>背景</span>'+modes.map(([v,t])=>`<button type="button" data-mode="${v}">${t}</button>`).join('');
 const anchor=heading.querySelector('.reader-typefaces')||heading.querySelector('.reader-settings');
 (anchor||heading.lastElementChild).after(box);
 const sky=document.createElement('canvas');sky.className='plus-sky';sky.setAttribute('aria-hidden','true');document.body.prepend(sky);
 const drawSky=()=>{
  const dpr=Math.min(window.devicePixelRatio||1,2),w=innerWidth,h=innerHeight;
  sky.width=w*dpr;sky.height=h*dpr;const c=sky.getContext('2d');c.scale(dpr,dpr);
  const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#0b1024');g.addColorStop(1,'#04060d');c.fillStyle=g;c.fillRect(0,0,w,h);
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  const n=Math.round(w*h/2600);
  for(let k=0;k<n;k++){const x=rnd()*w,y=rnd()*h,r=rnd()<.93?rnd()*.9+.3:rnd()*1.2+1;c.globalAlpha=.25+rnd()*.7;c.fillStyle=rnd()<.15?'#f3e2b8':'#dfe6ff';c.beginPath();c.arc(x,y,r,0,6.283);c.fill()}
  c.globalAlpha=1;
 };
 let mode=get(modeKey);if(!modes.some(([v])=>v===mode))mode='day';
 const applyMode=()=>{
  if(mode==='day')root.removeAttribute('data-mode');else root.setAttribute('data-mode',mode);
  if(mode==='star')drawSky();
  box.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));
  set(modeKey,mode);tint();
 };
 box.addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;mode=b.dataset.mode;applyMode()});
 addEventListener('resize',()=>{if(mode==='star')drawSky()});

 /* 進度條、現在是誰 */
 const secs=[...body.querySelectorAll('.pov')];
 const bar=document.createElement('div');bar.className='plus-progress';bar.setAttribute('aria-hidden','true');bar.innerHTML='<i></i>';document.body.append(bar);
 const now=document.createElement('div');now.className='plus-now';now.innerHTML='現在是 <b></b>';document.body.append(now);
 const nowName=now.querySelector('b');let cur=null;
 function tint(){if(cur)root.style.setProperty('--cur',getComputedStyle(cur).getPropertyValue('--c'))}
 if(!secs.length)now.hidden=true;

 /* 記住讀到哪 */
 const posKey='beauty-reader-pos-v1:'+location.pathname,ps=[...body.querySelectorAll('p')];
 let lastSave=0;
 const savePos=()=>{const t=Date.now();if(t-lastSave<800)return;lastSave=t;for(let k=0;k<ps.length;k++){if(ps[k].getBoundingClientRect().top>60){set(posKey,k);return}}};
 let ticking=false;
 const onScroll=()=>{
  const h=document.documentElement,max=h.scrollHeight-h.clientHeight,y=h.scrollTop||document.body.scrollTop;
  bar.firstChild.style.width=(max>0?Math.min(100,y/max*100):0)+'%';
  let pick=secs[0];secs.forEach(s=>{if(s.getBoundingClientRect().top<innerHeight*.45)pick=s});
  if(pick&&pick!==cur){cur=pick;nowName.textContent=cur.dataset.name;tint()}
  savePos();ticking=false;
 };
 addEventListener('scroll',()=>{if(!ticking){ticking=true;requestAnimationFrame(onScroll)}},{passive:true});
 addEventListener('resize',onScroll);
 const pos=Number(get(posKey));
 if(pos>8&&ps[pos]){
  const sec=ps[pos].closest('.pov'),r=document.createElement('div');r.className='plus-resume';
  const label=document.createElement('span');label.textContent='上次讀到'+(sec?sec.dataset.name+'那一段':'中間')+'：「'+ps[pos].textContent.slice(0,16)+'…」';
  const go=document.createElement('button');go.type='button';go.textContent='從上次的地方繼續';
  const no=document.createElement('button');no.type='button';no.className='x';no.textContent='從頭讀';
  r.append(label,go,no);box.after(r);
  go.onclick=()=>{r.remove();ps[pos].scrollIntoView({block:'center'})};
  no.onclick=()=>{r.remove();set(posKey,0)};
 }

 /* 插圖放大 */
 const lb=document.createElement('div');lb.className='plus-lightbox';lb.hidden=true;lb.setAttribute('role','dialog');lb.setAttribute('aria-modal','true');lb.setAttribute('aria-label','插圖放大');
 lb.innerHTML='<button type="button" aria-label="關閉">×</button><img alt=""><p></p>';document.body.append(lb);
 let opener=null;
 const close=()=>{lb.hidden=true;if(opener)opener.focus()};
 body.querySelectorAll('.pov-art').forEach(a=>a.addEventListener('click',e=>{
  e.preventDefault();opener=a;const img=a.querySelector('img'),cap=a.querySelector('.pov-cap');
  lb.querySelector('img').src=a.getAttribute('href');lb.querySelector('img').alt=img?img.alt:'';
  lb.querySelector('p').textContent=cap?cap.textContent:'';lb.hidden=false;lb.querySelector('button').focus();
 }));
 lb.addEventListener('click',close);addEventListener('keydown',e=>{if(e.key==='Escape'&&!lb.hidden)close()});

 applyMode();onScroll();
})();
