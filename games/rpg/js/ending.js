"use strict";
import {G,clearStory,setChapterBanner,addStory} from './engine.js';
import {startBattle} from './battle.js';

export function startFinalBattle(){
  const darkBuff=G.darkBuffActive?8:0;
  startBattle(
    [{name:'黑淵魔君',hp:90,maxHp:90,atk:15+darkBuff,def:5,ac:16,exp:300,gold:200,
      loot:{name:'魔君殘魂',qty:1,type:'key',effect:{},desc:'魔君被封印後留下的殘魂結晶'}}],
    ()=>{
      // gotoScene is imported via scenes; call window reference to avoid circular dep
      window._gotoScene(3,6);
    },
    ()=>{
      window._gotoScene(1,'death');
    }
  );
}

export function determineEnding(){
  clearStory();
  setChapterBanner(4,'終章·輪迴');
  const isDark=G.origin==='dark';
  const topComp=G.affection.yuer>=G.affection.jianmei?'yuer':'jianmei';
  const topAff=G.affection[topComp];
  const compName=topComp==='yuer'?'沈夜涼':'裴霜華';

  let endingType;
  if(isDark){
    if(G.urgeEmbrace>=2)endingType='dark';
    else if(G.urgeResist>=2)endingType='redemption';
    else endingType='true';
  }else{
    if(topAff>=70)endingType='true';
    else if(topAff>=40)endingType='light';
    else endingType='light';
  }

  let endingName,endingText,endingStory;
  if(endingType==='dark'){
    endingName='黑淵歸墟';
    endingText='你順從了黑暗。魔君的力量與你融為一體，封印碎裂，黑氣吞噬了古跡，也吞噬了你。沈夜涼和裴霜華看著你消失在黑霧之中，淚流滿面。\n\n也許，在某個遙遠的地方，你還記得曾經選擇過光明的那個瞬間。';
    endingStory=[
      {t:'封印石台爆裂，黑氣如洪水決堤。',c:'narr'},
      {t:'你站在中央，沒有掙扎，眼中的光芒一點點熄滅。',c:'dark-urge'},
      {t:'「別——！」沈夜涼衝向你，被裴霜華死死抱住。「放開我！」',c:'dialogue'},
      {t:'黑霧淹沒了一切。',c:'red'},
    ];
  }else if(endingType==='redemption'){
    endingName='黑暗中的光';
    endingText='你以血肉之軀，抵抗了三次邪念的侵蝕，最終以自身的意志力，成為了封印新的核心。代價是你永遠無法離開古跡——但封印得以重鑄。\n\n沈夜涼每年都會來，在石台前放上一束野花。';
    endingStory=[
      {t:'你把玉佩壓在胸口，以最後的意志壓制體內的黑暗。',c:'action'},
      {t:'「我……選擇……」聲音沙啞，卻清晰，「留在這裡。」',c:'dialogue'},
      {t:'金色的符文重新亮起，封印重鑄，古跡重歸寂靜。',c:'narr'},
      {t:'你站在石台中央，如一尊守護的雕像，眉間帶著平靜。',c:'narr'},
    ];
  }else if(endingType==='true'){
    endingName='天地長情';
    endingText=`封印重鑄，黑淵魔君再度沉眠。你與${compName}在古跡外的山坡上看見了日出——金色的光芒灑在蜀山之上，千年的陰霾終於散去。\n\n你握住${compName}的手。她/他沒有說話，只是輕輕靠近了一點。\n\n這個世界，值得守護。`;
    endingStory=[
      {t:'封印重鑄，魔君的怒吼在地底漸漸消散。',c:'narr'},
      {t:'古跡的石門緩緩開啟，晨光透進來，溫暖而金黃。',c:'narr'},
      {t:`${compName}站在你身邊，臉上的傷痕在陽光中有種奇異的美麗。`,c:'narr'},
      {t:`「結束了。」你說。\n「嗯，結束了。」她/他回答，聲音帶著笑意。`,c:'dialogue'},
    ];
  }else{
    endingName='光明之道';
    endingText='封印以沈夜涼的玉佩為核心，重新凝固。黑淵魔君的怨念在蒼白的晨光中消散，如霧散於日出。\n\n渝州的百姓說，那天清晨，蜀山頂上出現了一道金光，照亮了整個天際。';
    endingStory=[
      {t:'沈夜涼把玉佩高舉，引動封印之力，金色光柱沖天而起。',c:'action'},
      {t:'魔君發出最後的咆哮，被光柱束縛，緩緩沉入深淵。',c:'narr'},
      {t:'「封印……完成了。」沈夜涼虛脫地靠在你身上，輕聲說。',c:'dialogue'},
      {t:'天亮了。蜀山上，有鳥鳴聲傳來。',c:'narr'},
    ];
  }

  endingStory.forEach(s=>addStory(s.t,s.c));
  setTimeout(()=>{
    const es=document.getElementById('ending-screen');
    es.style.display='flex';
    document.getElementById('ending-name').textContent=endingName;
    document.getElementById('ending-text').textContent=endingText;
    document.getElementById('ending-stats').innerHTML=`
      <span>等級 ${G.level}</span>
      <span>沈夜涼緣份 ${G.affection.yuer}</span>
      <span>裴霜華緣份 ${G.affection.jianmei}</span>
      ${G.origin==='dark'?`<span>抵抗 ${G.urgeResist} 順從 ${G.urgeEmbrace}</span>`:''}
    `;
  },3000);
}
