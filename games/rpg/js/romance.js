"use strict";
import {G,clearStory,addStory,addStoryHTML,setChoices,showNotif} from './engine.js';

export function addRomanceScene(compKey,context,callback){
  clearStory();
  if(compKey==='yuer'){
    if(context==='chapter2'){
      addStory('山道旁，有一處清澈的山泉。你和月如取水休息，劍眉先行一步。','narr');
      addStoryHTML('月光如練，灑在水面上。月如坐在石頭上，輕輕哼著一首不知名的小曲，神情恬靜。','romance');
      addStory('你問她為什麼叫「月如」。她笑著說：「娘說我出生的那晚，月亮特別圓，所以叫月如——就是說，人如月般，明亮溫柔。」','dialogue');
      if(G.affection.yuer>=60){
        addStoryHTML('她偏頭看你，月光在她眼中流動：「你會一直在嗎？……我是說，封印的事之後。」','romance');
        G.affection.yuer=Math.min(100,G.affection.yuer+10);
        showNotif('月如 緣份+10');
      }
    }else if(context==='chapter3_moon'){
      addStory('進入古跡之前，你和月如站在山崖邊，俯瞰夜霧中的蜀山。','narr');
      addStoryHTML('她把玉佩輕輕放在你掌心：「萬一……萬一我出了什麼事，你要幫我把這個帶出去。」','romance');
      addStory('你握住她的手，連同那枚玉佩。她的手很涼，也很輕。','narr');
      addStoryHTML('「不會的。」你說，「我們一起進去，也一起出來。」\n她輕輕笑了：「嗯。我信你。」','romance');
      G.affection.yuer=Math.min(100,G.affection.yuer+15);
      showNotif('月如 緣份+15 · 「我信你」');
    }
  }else{
    if(context==='chapter2'){
      addStory('紮營休息時，你找到一個人獨坐的劍眉。她在磨劍，動作緩慢而專注。','narr');
      addStory('「你跟大多數人不一樣，」她說，不看你，「大多數人看到危險就躲，你不是。」','dialogue');
      addStoryHTML('這對她來說，算是很長的一段話了。你在她旁邊坐下，兩人靜靜看著夜空。','romance');
      if(G.affection.jianmei>=60){
        addStoryHTML('「那場刺殺……」她停頓，「不是第一次了。我已經習慣了獨自面對。」\n她的聲音裡有什麼東西碎了一點點。','romance');
        G.affection.jianmei=Math.min(100,G.affection.jianmei+10);
        showNotif('劍眉 緣份+10');
      }
    }else if(context==='chapter3_moon'){
      addStory('進入古跡之前，劍眉叫住了你。','narr');
      addStoryHTML('「如果……打不過的話，帶她們先跑。」她說的是月如。','romance');
      addStory('「你呢？」你問。','');
      addStoryHTML('她側臉對你，眉峰冷峻，卻有一絲從未有過的柔和：「有你在，我跑不了的地方應該不多。」','romance');
      G.affection.jianmei=Math.min(100,G.affection.jianmei+15);
      showNotif('劍眉 緣份+15 · 「有你在」');
    }
  }
  setTimeout(()=>{
    setChoices([{label:'繼續',action:callback}]);
  },500);
}
