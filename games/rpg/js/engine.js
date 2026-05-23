"use strict";
import {EXP_TABLE} from '../data/exp-table.js';
import {ORIGINS} from '../data/origins.js';
import {diceCheck} from './dice.js';

export {ORIGINS,EXP_TABLE};

export let G={
  origin:null,
  name:'',
  level:1,exp:0,
  hp:0,maxHp:0,
  mp:0,maxMp:0,
  stats:{str:0,dex:0,con:0,int:0,wis:0,cha:0},
  weapon:null,armor:null,accessory:null,
  skills:[],
  inventory:[],
  statusEffects:[],
  chapter:0,
  scene:0,
  affection:{yuer:0,jianmei:0},
  companions:{yuer:false,jianmei:false},
  urgeResist:0,
  urgeEmbrace:0,
  darkBuffActive:false,
  gold:0,
  choices:{},
  flags:{}
};

export let selectedOrigin=null;

export function selectOrigin(el){
  document.querySelectorAll('.origin-card').forEach(c=>c.classList.remove('selected'));
  el.classList.add('selected');
  selectedOrigin=el.dataset.origin;
  document.getElementById('start-btn').disabled=false;
  document.getElementById('start-btn').textContent='踏上征途';
}

export function startGame(){
  if(!selectedOrigin)return;
  const orig=ORIGINS[selectedOrigin];
  G.origin=selectedOrigin;
  G.name=orig.name;
  G.level=1;G.exp=0;
  G.maxHp=orig.hp;G.hp=orig.hp;
  G.maxMp=orig.mp;G.mp=orig.mp;
  G.stats={...orig.stats};
  G.weapon={...orig.weapon};
  G.armor={...orig.armor};
  G.accessory={...orig.accessory};
  G.skills=orig.skills.map(s=>({...s}));
  G.inventory=orig.startItems.map(i=>({...i}));
  G.statusEffects=[];
  G.chapter=0;G.scene=0;
  G.affection={yuer:0,jianmei:0};
  G.companions={yuer:false,jianmei:false};
  G.urgeResist=0;G.urgeEmbrace=0;
  G.darkBuffActive=false;
  G.gold=30;
  G.choices={};G.flags={};
  document.getElementById('title-screen').style.display='none';
  if(G.origin==='dark')document.getElementById('dark-urge-tracker').style.display='block';
  updateUI();
  gotoScene(0,0);
}

export function restartGame(){
  document.getElementById('ending-screen').style.display='none';
  document.getElementById('title-screen').style.display='flex';
  selectedOrigin=null;
  document.querySelectorAll('.origin-card').forEach(c=>c.classList.remove('selected'));
  document.getElementById('start-btn').disabled=true;
  document.getElementById('start-btn').textContent='選擇起源以開始';
}

export function updateUI(){
  document.getElementById('char-name').textContent=G.name;
  document.getElementById('char-origin').textContent=ORIGINS[G.origin]?.nameEn||'';
  document.getElementById('stat-level').textContent=G.level;
  document.getElementById('stat-gold').textContent=G.gold;
  document.getElementById('stat-hp').textContent=G.hp+'/'+G.maxHp;
  document.getElementById('stat-mp').textContent=G.mp+'/'+G.maxMp;
  const expNext=EXP_TABLE[Math.min(G.level,9)];
  document.getElementById('stat-exp').textContent=G.exp+'/'+expNext;
  document.getElementById('bar-hp').style.width=(G.hp/G.maxHp*100)+'%';
  document.getElementById('bar-mp').style.width=(G.mp/G.maxMp*100)+'%';
  document.getElementById('bar-exp').style.width=(G.exp/expNext*100)+'%';
  const sg=document.getElementById('stat-grid');
  const snames={str:'力量',dex:'敏捷',con:'體質',int:'智力',wis:'智慧',cha:'魅力'};
  sg.innerHTML=Object.entries(G.stats).map(([k,v])=>
    `<div class="sg-item"><span class="sg-label">${snames[k]}</span><span class="sg-val">${v} (+${Math.floor((v-10)/2)})</span></div>`
  ).join('');
  const es=document.getElementById('equip-slots');
  es.innerHTML=`
    <div class="equip-slot"><span class="slot-icon">⚔</span><span class="slot-name">${G.weapon?.name||'—'}</span><span class="slot-val">${G.weapon?'ATK '+G.weapon.atk:''}</span></div>
    <div class="equip-slot"><span class="slot-icon">🛡</span><span class="slot-name">${G.armor?.name||'—'}</span><span class="slot-val">${G.armor?'DEF '+G.armor.def:''}</span></div>
    <div class="equip-slot"><span class="slot-icon">◈</span><span class="slot-name">${G.accessory?.name||'—'}</span><span class="slot-val">${G.accessory?.effect||''}</span></div>
  `;
  const se=document.getElementById('status-effects');
  if(G.statusEffects.length===0){se.innerHTML='<span class="dim" style="font-size:10px">無</span>';}
  else{se.innerHTML=G.statusEffects.map(s=>{
    const cls=s==='poison'?'st-poison':s==='burn'?'st-burn':'st-buff';
    const names={poison:'中毒',burn:'灼燒',fear:'恐懼',shield:'護盾',buff:'強化'};
    return `<span class="status-tag ${cls}">${names[s]||s}</span>`;
  }).join('');}
  updateAffection();
  updateInventory();
  if(G.origin==='dark'){
    document.getElementById('urge-track-text').textContent=`抵抗: ${G.urgeResist} | 順從: ${G.urgeEmbrace}`;
  }
}

export function updateAffection(){
  const comps=[
    {key:'yuer',heartId:'hearts-yuer',barId:'aff-bar-yuer',textId:'aff-text-yuer',statusId:'comp-status-yuer',
     statuses:['尚未相遇','初識於渝州','逐漸熟悉','心生暖意','深厚情誼','情定終身'],name:'沈夜涼'},
    {key:'jianmei',heartId:'hearts-jianmei',barId:'aff-bar-jianmei',textId:'aff-text-jianmei',statusId:'comp-status-jianmei',
     statuses:['尚未相遇','蜀山邂逅','並肩作戰','相互欣賞','生死之交','心意相通'],name:'裴霜華'}
  ];
  comps.forEach(c=>{
    const aff=G.affection[c.key];
    const hearts=Math.floor(aff/20);
    const filled='❤'.repeat(hearts)+'♡'.repeat(5-hearts);
    document.getElementById(c.heartId).textContent=filled;
    document.getElementById(c.barId).style.width=aff+'%';
    document.getElementById(c.textId).textContent='緣份 '+aff+'/100';
    const met=G.companions[c.key];
    const si=met?Math.min(Math.floor(aff/20)+1,5):0;
    document.getElementById(c.statusId).textContent=c.statuses[si]||c.statuses[5];
  });
}

export function updateInventory(){
  const inv=document.getElementById('inventory-list');
  if(G.inventory.length===0){inv.innerHTML='<div class="inv-empty">囊空如洗</div>';return;}
  inv.innerHTML=G.inventory.map((item,i)=>`
    <div class="inv-item" onclick="useItemFromInv(${i})" title="${item.desc||''}">
      <span class="inv-item-name">${item.name}</span>
      <span class="inv-item-qty">×${item.qty}</span>
    </div>
  `).join('');
}

let _battleActive=false;
export function setBattleActive(v){_battleActive=v;}

export function useItemFromInv(idx){
  if(_battleActive)return;
  const item=G.inventory[idx];
  if(!item||item.qty<1)return;
  if(item.type==='consumable')applyItemEffect(item,idx);
}

export function applyItemEffect(item,idx){
  let msg=`使用了 ${item.name}`;
  if(item.effect.hp){
    const h=item.effect.hp;
    if(h>0){G.hp=Math.min(G.maxHp,G.hp+h);msg+=`，回復 ${h} HP`;}
    else{G.hp=Math.max(0,G.hp+h);msg+=`，失去 ${-h} HP`;}
  }
  if(item.effect.mp){const m=item.effect.mp;G.mp=Math.min(G.maxMp,G.mp+m);msg+=`，回復 ${m} MP`;}
  if(item.effect.cure){
    if(item.effect.cure==='all')G.statusEffects=[];
    else G.statusEffects=G.statusEffects.filter(s=>s!==item.effect.cure);
    msg+=`，消除狀態`;
  }
  G.inventory[idx].qty--;
  if(G.inventory[idx].qty<=0)G.inventory.splice(idx,1);
  showNotif(msg);
  updateUI();
}

let _scenes=null;
export function setScenesRef(s){_scenes=s;}

export function gotoScene(chapter,scene){
  G.chapter=chapter;G.scene=scene;
  clearStory();
  setBattleActive(false);
  _scenes[chapter][scene]();
  updateUI();
}

export function nextScene(){gotoScene(G.chapter,G.scene+1);}

export function setChapterBanner(chap,name){
  const titles=['PROLOGUE','CHAPTER ONE','CHAPTER TWO','CHAPTER THREE','EPILOGUE'];
  document.getElementById('chapter-title').textContent=titles[chap]||'';
  document.getElementById('chapter-name').textContent=name;
}

export function clearStory(){
  document.getElementById('story-box').innerHTML='';
  document.getElementById('choices').innerHTML='';
  document.getElementById('battle-area').classList.remove('show');
}

export function addStory(text,cls=''){
  const box=document.getElementById('story-box');
  const p=document.createElement('div');
  p.className='story-para '+(cls||'');
  p.textContent=text;
  box.appendChild(p);
  box.scrollTop=box.scrollHeight;
  return p;
}

export function addStoryHTML(html,cls=''){
  const box=document.getElementById('story-box');
  const p=document.createElement('div');
  p.className='story-para '+(cls||'');
  p.innerHTML=html;
  box.appendChild(p);
  box.scrollTop=box.scrollHeight;
}

export function setChoices(choices){
  const el=document.getElementById('choices');
  el.innerHTML='';
  choices.forEach(c=>{
    const btn=document.createElement('button');
    btn.className='choice-btn'+(c.dc?' dc-check':'')+(c.dark?' dark-btn':'');
    let label=c.label;
    if(c.dc)label+=`<span class="dc-badge">DC${c.dc} ${c.stat||''}</span>`;
    btn.innerHTML=label;
    if(c.dc){
      btn.onclick=async()=>{
        el.innerHTML='';
        const res=await diceCheck(c.dc,c.stat||'str',G.stats);
        if(c.onSuccess&&res.success)c.onSuccess(res);
        else if(c.onFail&&!res.success)c.onFail(res);
        else if(c.onResult)c.onResult(res);
      };
    }else{
      btn.onclick=()=>{el.innerHTML='';if(c.action)c.action();};
    }
    el.appendChild(btn);
  });
}

export function gainExp(amount){
  G.exp+=amount;
  const needed=EXP_TABLE[Math.min(G.level,9)];
  if(G.exp>=needed&&G.level<10){
    G.level++;
    G.exp=G.exp-needed;
    G.maxHp=Math.floor(G.maxHp*1.12);
    G.hp=G.maxHp;
    G.maxMp=Math.floor(G.maxMp*1.1);
    G.mp=G.maxMp;
    G.stats.str++;G.stats.dex++;G.stats.con++;
    if(G.level%2===0)G.stats.int++;
    showNotif(`升級！等級 ${G.level}`);
  }
}

export function addItem(item){
  const existing=G.inventory.find(i=>i.name===item.name);
  if(existing)existing.qty+=item.qty||1;
  else G.inventory.push({qty:1,...item});
}

export function saveGame(){
  try{
    localStorage.setItem('xjqxt_save',JSON.stringify(G));
    showNotif('遊戲已儲存');
  }catch(e){showNotif('儲存失敗');}
}

export function loadGame(){
  try{
    const data=localStorage.getItem('xjqxt_save');
    if(!data){showNotif('沒有存檔');return;}
    const saved=JSON.parse(data);
    Object.assign(G,saved);
    document.getElementById('title-screen').style.display='none';
    document.getElementById('ending-screen').style.display='none';
    if(G.origin==='dark')document.getElementById('dark-urge-tracker').style.display='block';
    updateUI();
    gotoScene(G.chapter,G.scene);
    showNotif('讀取成功');
  }catch(e){showNotif('讀取失敗');}
}

export function showNotif(text){
  const notif=document.getElementById('notif');
  const div=document.createElement('div');
  div.className='notif-item';
  div.textContent=text;
  notif.appendChild(div);
  setTimeout(()=>div.remove(),2100);
}
