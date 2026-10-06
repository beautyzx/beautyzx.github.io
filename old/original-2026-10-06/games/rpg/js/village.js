"use strict";
import {G,clearStory,addStory,setChoices,showNotif,updateUI,addItem,gainExp,addQuest,completeQuest} from './engine.js';
import {VILLAGERS} from '../data/villagers.js';
import {COMMISSIONS} from '../data/commissions.js';
import {startBattle} from './battle.js';
import {diceCheck} from './dice.js';

function ensureFlags(){
  if(!G.flags.heardLines)G.flags.heardLines={};
  if(!G.flags.acceptedCommissions)G.flags.acceptedCommissions=[];
  if(!G.flags.completedCommissions)G.flags.completedCommissions=[];
}

export function showVillagers(villageKey,onClose){
  ensureFlags();
  const villagers=VILLAGERS[villageKey]||[];
  clearStory();
  addStory('【街上的人們】','narr');
  addStory('你在街上走著，有幾個熟面孔可以攀談。','narr');
  const choices=villagers.map(v=>({
    label:`與 ${v.name}（${v.role}）說話`,
    action:()=>talkTo(v,villageKey,onClose)
  }));
  choices.push({label:'← 離開街道',action:onClose});
  setChoices(choices);
}

function talkTo(villager,villageKey,onClose){
  ensureFlags();
  const heard=G.flags.heardLines[villager.id]||[];
  const unheard=villager.lines.map((_,i)=>i).filter(i=>!heard.includes(i));
  let lineIdx;
  if(unheard.length>0){
    lineIdx=unheard[Math.floor(Math.random()*unheard.length)];
    heard.push(lineIdx);
    G.flags.heardLines[villager.id]=heard;
  }else{
    lineIdx=Math.floor(Math.random()*villager.lines.length);
  }
  clearStory();
  addStory(`【${villager.name}】`,'narr');
  addStory(villager.lines[lineIdx],'dialogue');
  setChoices([
    {label:'← 回到街上',action:()=>showVillagers(villageKey,onClose)}
  ]);
}

export function showCommissionBoard(villageKey,onClose){
  ensureFlags();
  const list=COMMISSIONS[villageKey]||[];
  clearStory();
  addStory('【委託板】','narr');
  addStory('木板上釘著幾張泛黃的紙條，墨跡未乾。','narr');
  const choices=list.map(c=>{
    const accepted=G.flags.acceptedCommissions.includes(c.id);
    const completed=G.flags.completedCommissions.includes(c.id);
    let label=`「${c.title}」— ${c.desc}`;
    if(completed)label=`✓ ${c.title}（已完成）`;
    else if(accepted)label=`▶ ${c.title}（進行中，點擊回報）`;
    return{
      label,
      action:()=>{
        if(completed)return showCommissionBoard(villageKey,onClose);
        if(accepted)return resolveCommission(c,villageKey,onClose);
        return acceptCommission(c,villageKey,onClose);
      }
    };
  });
  choices.push({label:'← 離開',action:onClose});
  setChoices(choices);
}

function acceptCommission(c,villageKey,onClose){
  G.flags.acceptedCommissions.push(c.id);
  addQuest(`side_commission_${c.id}`,c.title,c.desc+`\n委託人：${c.giver}`);
  clearStory();
  addStory(`你撕下了「${c.title}」的委託。`,'action');
  addStory(c.desc,'narr');
  setChoices([
    {label:'← 回到委託板',action:()=>showCommissionBoard(villageKey,onClose)}
  ]);
}

function resolveCommission(c,villageKey,onClose){
  clearStory();
  if(c.enemy){
    addStory(`你前往委託地點，與 ${c.enemy.name} 遭遇——`,'action');
    const enemies=[];
    const count=c.enemyCount||1;
    for(let i=0;i<count;i++){
      enemies.push({...c.enemy,name:c.enemy.name+(count>1?` #${i+1}`:'')});
    }
    startBattle(
      enemies,
      ()=>grantCommissionReward(c,villageKey,onClose),
      ()=>{
        showNotif('委託失敗，但你保住了性命');
        showCommissionBoard(villageKey,onClose);
      }
    );
  }else if(c.checkType){
    const statMap={wisdom:'wis',strength:'str',dex:'dex',charisma:'cha',intelligence:'int'};
    const stat=statMap[c.checkType]||'wis';
    diceCheck(c.dc||11,stat,G.stats).then(res=>{
      if(res.success){
        addStory('你成功完成了委託。','action');
        grantCommissionReward(c,villageKey,onClose);
      }else{
        addStory('你未能完成委託，或許下次再試。','dim');
        setChoices([
          {label:'← 回到委託板',action:()=>showCommissionBoard(villageKey,onClose)}
        ]);
      }
    });
  }else{
    grantCommissionReward(c,villageKey,onClose);
  }
}

function grantCommissionReward(c,villageKey,onClose){
  const r=c.reward||{};
  if(r.gold)G.gold+=r.gold;
  if(r.exp)gainExp(r.exp);
  if(r.item)addItem({...r.item});
  G.flags.completedCommissions.push(c.id);
  const accIdx=G.flags.acceptedCommissions.indexOf(c.id);
  if(accIdx>=0)G.flags.acceptedCommissions.splice(accIdx,1);
  completeQuest(`side_commission_${c.id}`);
  updateUI();
  clearStory();
  addStory(`【委託完成：${c.title}】`,'action');
  if(r.gold)addStory(`獲得 ${r.gold} 兩金幣`,'dim');
  if(r.exp)addStory(`獲得 ${r.exp} 點經驗`,'dim');
  if(r.item)addStory(`獲得道具：${r.item.name}`,'dim');
  if(c.plotHook){
    addStory('你在現場找到的線索，似乎與封印的衰退有關——這件事還沒完。','action');
  }
  setChoices([
    {label:'← 回到委託板',action:()=>showCommissionBoard(villageKey,onClose)}
  ]);
}
