"use strict";
import {G,updateUI,applyItemEffect,gainExp,addItem,showNotif,setBattleActive} from './engine.js';
import {rollD20,getModifier} from './dice.js';

let currentBattle=null;
export function getCurrentBattle(){return currentBattle;}

export function startBattle(enemies,onWin,onLose){
  currentBattle={
    enemies:enemies.map(e=>({...e})),
    turn:'player',
    onWin,onLose,
    log:[],
    turnCount:0
  };
  setBattleActive(true);
  document.getElementById('battle-area').classList.add('show');
  document.getElementById('story-box').style.display='none';
  renderBattle();
  battleLog('<span class="blog-enemy">⚔ 戰鬥開始！</span>');
}

export function endBattle(won){
  document.getElementById('battle-area').classList.remove('show');
  document.getElementById('story-box').style.display='block';
  const cb=won?currentBattle.onWin:currentBattle.onLose;
  currentBattle=null;
  setBattleActive(false);
  if(cb)cb();
}

export function renderBattle(){
  if(!currentBattle)return;
  const enemyDiv=document.getElementById('battle-enemies');
  enemyDiv.innerHTML=currentBattle.enemies.map((e)=>`
    <div class="enemy-card">
      <div class="enemy-name">${e.name}</div>
      <div class="enemy-hp-bar"><div class="enemy-hp-fill" style="width:${e.hp/e.maxHp*100}%"></div></div>
      <div class="enemy-hp-text">HP ${e.hp}/${e.maxHp} | AC ${e.ac}</div>
    </div>
  `).join('');

  const actDiv=document.getElementById('battle-actions');
  actDiv.innerHTML='';

  if(currentBattle.turn!=='player')return;

  addBattleBtn(actDiv,'⚔ 普通攻擊','',()=>playerAttack());
  G.skills.forEach((sk,i)=>{
    const canUse=G.mp>=sk.mpCost&&(!sk.hpCost||G.hp>sk.hpCost);
    const btn=addBattleBtn(actDiv,`✦ ${sk.name} (${sk.mpCost>0?sk.mpCost+'MP':sk.hpCost+'HP'})`,'skill-btn',()=>playerSkill(i));
    if(!canUse)btn.disabled=true;
  });
  G.inventory.filter(it=>it.type==='consumable').forEach(item=>{
    addBattleBtn(actDiv,`◈ ${item.name}×${item.qty}`,'item-btn',()=>playerItem(item));
  });
  addBattleBtn(actDiv,'↩ 逃跑','',()=>playerFlee());
}

function addBattleBtn(parent,text,extra,onclick){
  const btn=document.createElement('button');
  btn.className='battle-btn '+(extra||'');
  btn.textContent=text;
  btn.onclick=onclick;
  parent.appendChild(btn);
  return btn;
}

function battleLog(msg){
  const log=document.getElementById('battle-log');
  const d=document.createElement('div');
  d.innerHTML=msg;
  log.appendChild(d);
  log.scrollTop=log.scrollHeight;
}

function getAtkMod(){
  const strMod=getModifier(G.stats.str);
  const dexMod=getModifier(G.stats.dex);
  return Math.max(strMod,dexMod);
}

function getDmg(){
  const base=G.weapon?G.weapon.atk:4;
  const mod=getModifier(G.stats.str);
  return Math.max(1,base+mod+Math.floor(Math.random()*4));
}

function playerAttack(){
  if(!currentBattle||currentBattle.turn!=='player')return;
  const target=currentBattle.enemies.find(e=>e.hp>0);
  if(!target)return;
  const roll=rollD20();
  const atkMod=getAtkMod();
  const total=roll+atkMod;
  if(total>=target.ac){
    const dmg=getDmg()+(G.darkBuffActive?3:0);
    target.hp=Math.max(0,target.hp-dmg);
    battleLog(`<span class="blog-hit">攻擊！擲出 ${roll}+${atkMod}=${total} ≥ AC${target.ac}，造成 ${dmg} 傷害</span>`);
    if(target.hp<=0){battleLog(`<span class="blog-hit">${target.name} 已倒下！</span>`);checkBattleEnd();return;}
  }else{
    battleLog(`<span class="blog-miss">攻擊落空。擲出 ${roll}+${atkMod}=${total} < AC${target.ac}</span>`);
  }
  enemyTurn();
}

function playerSkill(idx){
  if(!currentBattle||currentBattle.turn!=='player')return;
  const sk=G.skills[idx];
  if(sk.mpCost>G.mp){showNotif('靈力不足！');return;}
  if(sk.hpCost&&G.hp<=sk.hpCost){showNotif('HP不足！');return;}

  if(sk.mpCost>0)G.mp=Math.max(0,G.mp-sk.mpCost);
  if(sk.hpCost)G.hp=Math.max(1,G.hp-sk.hpCost);

  const target=currentBattle.enemies.find(e=>e.hp>0);

  if(sk.heal){
    const h=sk.heal;
    G.hp=Math.min(G.maxHp,G.hp+h);
    battleLog(`<span class="blog-skill">${sk.name}：回復 ${h} HP</span>`);
  }
  if(sk.dmg&&target){
    const roll=rollD20();
    const mod=getModifier(G.stats.int||G.stats.str);
    const total=roll+mod;
    let dmg=sk.dmg+Math.floor(Math.random()*6);
    if(G.darkBuffActive)dmg+=4;
    if(total>=target.ac){
      target.hp=Math.max(0,target.hp-dmg);
      battleLog(`<span class="blog-skill">${sk.name}：擲出${total}，造成 ${dmg} 傷害</span>`);
      if(sk.status&&!target.statusEffects){target.statusEffects=[sk.status];battleLog(`<span class="blog-status">${target.name} 陷入${sk.status==='poison'?'中毒':'灼燒'}狀態！</span>`);}
      if(target.hp<=0){battleLog(`<span class="blog-hit">${target.name} 已倒下！</span>`);updateUI();checkBattleEnd();return;}
    }else{
      battleLog(`<span class="blog-miss">${sk.name}：擲出${total}，未能命中 AC${target.ac}</span>`);
    }
  }
  if(sk.buff){
    if(!G.statusEffects.includes('shield'))G.statusEffects.push('shield');
    battleLog(`<span class="blog-skill">${sk.name}：護身符啟動，防禦提升！</span>`);
  }
  updateUI();
  enemyTurn();
}

function playerItem(item){
  if(!currentBattle||currentBattle.turn!=='player')return;
  const idx=G.inventory.indexOf(item);
  if(idx<0)return;
  applyItemEffect(item,idx);
  battleLog(`<span class="blog-heal">使用 ${item.name}</span>`);
  enemyTurn();
}

function playerFlee(){
  if(!currentBattle)return;
  const roll=rollD20();
  const mod=getModifier(G.stats.dex);
  if(roll+mod>=12){
    battleLog('<span class="blog-miss">成功逃跑！</span>');
    endBattle(false);
  }else{
    battleLog('<span class="blog-enemy">逃跑失敗！</span>');
    enemyTurn();
  }
}

function enemyTurn(){
  if(!currentBattle)return;
  currentBattle.turn='enemy';
  renderBattle();
  const aliveEnemies=currentBattle.enemies.filter(e=>e.hp>0);
  let i=0;
  function nextEnemy(){
    if(i>=aliveEnemies.length){
      if(G.statusEffects.includes('poison')){
        const dmg=3;G.hp=Math.max(0,G.hp-dmg);
        battleLog(`<span class="blog-status">中毒！失去 ${dmg} HP</span>`);
      }
      if(G.statusEffects.includes('burn')){
        const dmg=4;G.hp=Math.max(0,G.hp-dmg);
        battleLog(`<span class="blog-status">灼燒！失去 ${dmg} HP</span>`);
      }
      currentBattle.turnCount++;
      updateUI();
      if(G.hp<=0){battleLog('<span class="blog-enemy">你已倒下……</span>');setTimeout(()=>endBattle(false),800);return;}
      currentBattle.turn='player';
      renderBattle();
      return;
    }
    const e=aliveEnemies[i];i++;
    if(e.statusEffects&&e.statusEffects.includes('poison')){
      e.hp=Math.max(0,e.hp-3);
      battleLog(`<span class="blog-status">${e.name} 中毒，失去3HP</span>`);
      if(e.hp<=0){battleLog(`<span class="blog-hit">${e.name} 死於中毒！</span>`);checkBattleEnd();return;}
    }
    const roll=rollD20();
    const def=G.armor?G.armor.def:0;
    const shield=G.statusEffects.includes('shield')?3:0;
    const playerAC=10+getModifier(G.stats.dex)+def+shield;
    if(roll>=playerAC){
      let dmg=Math.max(1,e.atk+Math.floor(Math.random()*4)-def);
      G.hp=Math.max(0,G.hp-dmg);
      battleLog(`<span class="blog-enemy">${e.name} 攻擊！擲出${roll}，造成 ${dmg} 傷害</span>`);
      if(Math.random()<0.15&&e.status){
        G.statusEffects.push(e.status);
        battleLog(`<span class="blog-status">你陷入${e.status}狀態！</span>`);
      }
    }else{
      battleLog(`<span class="blog-miss">${e.name} 的攻擊被你閃開（AC${playerAC}）</span>`);
    }
    setTimeout(nextEnemy,300);
  }
  setTimeout(nextEnemy,400);
}

function checkBattleEnd(){
  if(!currentBattle)return;
  const allDead=currentBattle.enemies.every(e=>e.hp<=0);
  if(allDead){
    let totalExp=0,totalGold=0;
    currentBattle.enemies.forEach(e=>{
      totalExp+=e.exp||0;
      totalGold+=e.gold||0;
      if(e.loot){addItem({...e.loot});}
    });
    gainExp(totalExp);
    battleLog(`<span class="blog-hit">獲得 ${totalExp} 經驗值！</span>`);
    if(totalGold>0){G.gold+=totalGold;battleLog(`<span class="blog-hit">獲得 ${totalGold} 金幣！</span>`);}
    updateUI();
    setTimeout(()=>endBattle(true),800);
  }
}
