"use strict";

export function rollD20(){return Math.floor(Math.random()*20)+1;}
export function getModifier(stat){return Math.floor((stat-10)/2);}

export function diceCheck(dc,statKey,stats){
  return new Promise(resolve=>{
    const overlay=document.getElementById('dice-overlay');
    const numEl=document.getElementById('dice-num');
    const resultEl=document.getElementById('dice-result');
    overlay.classList.add('show');
    resultEl.textContent='';
    let ticks=0,speed=40,roll=0;
    const anim=setInterval(()=>{
      numEl.textContent=Math.floor(Math.random()*20)+1;
      ticks++;
      if(ticks>20&&speed<200){speed+=12;}
      if(ticks>35){
        clearInterval(anim);
        roll=rollD20();
        numEl.textContent=roll;
        const mod=getModifier(stats[statKey]||10);
        const total=roll+mod;
        const success=total>=dc;
        const modStr=mod>=0?'+'+mod:String(mod);
        resultEl.textContent=`${roll} ${modStr} = ${total} (需要 DC${dc}) — ${success?'成功':'失敗'}`;
        resultEl.className='dice-result '+(success?'dice-success':'dice-fail');
        setTimeout(()=>{
          overlay.classList.remove('show');
          resolve({roll,mod,total,success});
        },1400);
      }
    },speed);
  });
}
