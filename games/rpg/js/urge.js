"use strict";
import {G,updateUI,showNotif,addStory} from './engine.js';

let urgeCallback=null;

export function showUrge(text,callback){
  urgeCallback=callback;
  document.getElementById('urge-text').textContent=text;
  document.getElementById('urge-overlay').classList.add('show');
}

export function handleUrge(choice){
  document.getElementById('urge-overlay').classList.remove('show');
  if(choice==='resist'){
    G.urgeResist++;
    G.hp=Math.max(1,G.hp-5);
    addStory('你咬緊牙關，硬生生壓下體內的黑暗。代價是一陣撕心裂肺的痛楚——但你還是你。','action');
    addStory('（抵抗邪念：失去5HP，獲得自制+1）','dim');
    G.affection.yuer=Math.min(100,G.affection.yuer+5);
    G.affection.jianmei=Math.min(100,G.affection.jianmei+5);
    showNotif('抵抗邪念 · 同伴信任+5');
  }else{
    G.urgeEmbrace++;
    G.darkBuffActive=true;
    G.stats.str=Math.min(20,G.stats.str+2);
    addStory('你鬆開了那扇門，讓黑暗流入。一股冰涼而強大的力量充滿了你的每一寸血肉——你感到自己無所不能。','dark-urge');
    addStory('（順從邪念：力量+2，同伴信任-8）','dim');
    G.affection.yuer=Math.max(0,G.affection.yuer-8);
    G.affection.jianmei=Math.max(0,G.affection.jianmei-8);
    showNotif('順從邪念 · 力量+2 · 同伴信任-8');
  }
  updateUI();
  if(urgeCallback)urgeCallback();
  urgeCallback=null;
}
