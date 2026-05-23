import {G,setChapterBanner,addStory,setChoices,gotoScene,showNotif,showUrge} from '../js/api.js';
import {startBattle} from '../js/battle.js';
import {addRomanceScene} from '../js/romance.js';
import {startFinalBattle,determineEnding} from '../js/ending.js';

export const CH3={
  0:function(){
    setChapterBanner(3,'第三章·封魔古跡');
    addStory('封魔古跡，深藏於蜀山腹地。','narr');
    addStory('古石門上刻滿了晦澀難懂的符文，空氣中彌漫著一股壓抑的氣息，彷彿有什麼東西正在從縫隙中透出。','narr');
    addStory('沈夜涼的玉佩發出強烈的光，幾乎燙手。','narr');
    setTimeout(()=>{
      const topComp=G.affection.yuer>=G.affection.jianmei?'yuer':'jianmei';
      const topAff=G.affection[topComp];
      if(topAff>=40&&G.companions[topComp]){
        addRomanceScene(topComp,'chapter3_moon',()=>gotoScene(3,1));
      }else{
        gotoScene(3,1);
      }
    },700);
  },
  1:function(){
    addStory('你們推開沉重的石門，走入古跡內部。','narr');
    addStory('深處傳來的黑氣越來越濃，走廊兩側的古畫在黑氣中扭動，像是活了一般。','narr');
    if(G.origin==='dark'){
      addStory('你感到體內的黑暗之力猛地翻湧——這裡的黑氣，與你體內的東西是同源的。','dark-urge');
    }
    setTimeout(()=>{
      addStory('走廊盡頭，獨孤殤出現了。他一身黑袍，臉上有一道猙獰的疤，眼中混合著恨意與悲痛。','narr');
      addStory('「你們來得正好。再過一刻，封印將完全破碎，魔君重生，那時天下皆要陪葬！」','dialogue');
      addStory('沈夜涼顫聲道：「為什麼？你這樣做……值得嗎？」','dialogue');
      addStory('獨孤殤苦笑：「我的女兒死在這個世道，這個世道就不配存在。」他的聲音裂開了，像是在哭。','dialogue');
      setChoices([
        {label:'「殺戮換不回你失去的。」',action:()=>{
          G.affection.yuer=Math.min(100,G.affection.yuer+6);
          G.affection.jianmei=Math.min(100,G.affection.jianmei+6);
          G.flags.compassion=true;
          gotoScene(3,2);
        }},
        {label:'[說服DC15魅力] 試著動搖他的心',dc:15,stat:'cha',
          onSuccess:(res)=>{
            addStory('你的話語打動了獨孤殤，他的眼神出現了一絲動搖，手上的力道鬆了些——','action');
            G.flags.persuade=true;
            G.affection.yuer=Math.min(100,G.affection.yuer+10);
            G.affection.jianmei=Math.min(100,G.affection.jianmei+8);
            setTimeout(()=>gotoScene(3,2),600);
          },
          onFail:(res)=>{
            addStory('獨孤殤搖頭苦笑：「說得再好聽，也救不了她……上吧！」','dialogue');
            setTimeout(()=>gotoScene(3,2),600);
          }
        },
        ...(G.origin==='dark'?[{label:'[邪念] 你感到魔君的力量透過你呼喚獨孤殤',dark:true,action:()=>{
          if(!G.flags.urge3){
            G.flags.urge3=true;
            showUrge(
              '黑暗的力量在你體內澎湃，魔君透過你說話：「回來吧，我的信徒。我將給你更大的力量，讓那些人付出代價……」\n\n你能借用這份力量——但代價是什麼？',
              ()=>gotoScene(3,2)
            );
          }else gotoScene(3,2);
        }}]:[])
      ]);
    },800);
  },
  2:function(){
    addStory('獨孤殤最終拔劍：「說什麼都沒用了，打敗我再說！」','dialogue');
    if(G.origin==='dark'&&!G.flags.urge2&&!G.flags.urge3){
      G.flags.urge2=true;
      showUrge(
        '戰鬥前，黑暗洶湧而至：「用我的力量……你可以輕鬆摧毀他。只需要放手，讓我進來……」\n\n你的雙手開始顫抖，一股黑暗的快感在脊背上蔓延。',
        ()=>{
          addStory('決戰開始！','action');
          startBattle(
            [{name:'鬼王獨孤殤·半魔化',hp:55,maxHp:55,atk:12,def:4,ac:14,exp:120,
              loot:{name:'悔恨之劍',qty:1,type:'weapon',effect:{},desc:'獨孤殤最後留下的劍，蘊含悔意'}}],
            ()=>gotoScene(3,3),
            ()=>gotoScene(1,'death')
          );
        }
      );
    }else{
      addStory('決戰開始！','action');
      startBattle(
        [{name:'鬼王獨孤殤·半魔化',hp:55,maxHp:55,atk:12,def:4,ac:14,exp:120,
          loot:{name:'悔恨之劍',qty:1,type:'weapon',effect:{},desc:'獨孤殤最後留下的劍，蘊含悔意'}}],
        ()=>gotoScene(3,3),
        ()=>gotoScene(1,'death')
      );
    }
  },
  3:function(){
    addStory('獨孤殤倒下，黑氣從他身上飄散。他抬起頭，眼中那層黑霧慢慢散去，露出一雙混濁的老眼。','narr');
    addStory('「我……做了什麼……女兒，爹不對……」他低聲哽咽，最終閉上了眼睛。','dialogue');
    if(G.flags.compassion||G.flags.persuade){
      addStory('沈夜涼俯身，用靈力撫了撫他的眉心：「願你來世，得見骨肉團聚。」','dialogue');
      G.affection.yuer=Math.min(100,G.affection.yuer+8);
    }
    setTimeout(()=>{
      addStory('然而，地面開始顫抖——封印已經鬆弛到了臨界點。','narr');
      addStory('從深處的石台上，一股黑色的巨大靈壓噴薄而出，轟鳴聲震動整座山岳——','narr');
      addStory('黑淵魔君，正在甦醒。','red');
      setChoices([{label:'→ 前往封印石台，決戰魔君',action:()=>gotoScene(3,4)}]);
    },800);
  },
  4:function(){
    addStory('封印石台位於古跡最深處，圓形大廳中央，一根黑色石柱頂天立地，上面的金色符文正在一點一點熄滅。','narr');
    addStory('石柱中，一個龐大的黑影正在成型，漩渦般的黑氣在廳中盤旋。','narr');
    addStory('「終於……千年了……」聲音從四面八方滲出，低沉而古老，帶著不可名狀的壓迫。','dialogue');
    if(G.origin==='dark'){
      addStory('魔君的目光似乎落在你身上，多了一份奇異的溫柔：「孩子……你回來了。是時候了。」','dark-urge');
    }
    setTimeout(()=>{
      addStory('沈夜涼緊緊握住玉佩，它發出的光已經白熾：「玉佩的力量可以重鑄封印——但需要有人以真心守護它。」','dialogue');
      addStory('裴霜華沉聲：「不管要付出什麼代價，今天就在這裡，結束這一切。」','dialogue');
      setChoices([{label:'→ 與魔君決戰！',action:()=>gotoScene(3,5)}]);
    },700);
  },
  5:function(){
    addStory('黑淵魔君降臨，千年怨念化作無匹的魔力，整個古跡都在顫抖！','action');
    if(G.origin==='dark'&&!G.flags.urge3){
      G.flags.urge3=true;
      showUrge(
        '魔君對你說：「放手吧。你本是我的一部份——你殺了那麼多人，你還記得嗎？記憶的碎片……都在這裡。」\n\n黑暗的真相正在浮現。你是誰？你做了什麼？\n\n現在——選擇。',
        ()=>{
          addStory('決戰！沈夜涼和裴霜華在你身後，緊握著各自的武器。','action');
          startFinalBattle();
        }
      );
    }else{
      addStory('決戰！沈夜涼和裴霜華在你身後，緊握著各自的武器。','action');
      startFinalBattle();
    }
  },
  6:function(){
    determineEnding();
  }
};
