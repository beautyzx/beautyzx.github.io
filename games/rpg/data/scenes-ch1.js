import {G,setChapterBanner,addStory,addStoryHTML,setChoices,gotoScene,addItem,showNotif,showUrge,loadGame,restartGame} from '../js/api.js';
import {startBattle} from '../js/battle.js';

export const CH1={
  0:function(){
    setChapterBanner(1,'第一章·渝州煙雨');
    addStory('渝州，古城。','narr');
    addStory('青石板路被細雨打濕，茶館的燈籠在風中搖曳。街上行人匆匆，眉宇間藏著說不清的不安。','narr');
    addStory('你踏入城中，空氣中飄著藥草的清香。','');
    setTimeout(()=>{
      addStory('不遠處，一間小藥鋪的木牌在風中搖晃：「沈夜涼草堂」。','');
      addStory('鋪前，一個穿著淡青色衣裙的少女正在整理藥草，眉目如畫，神情溫柔。','narr');
      setChoices([
        {label:'走向藥鋪，打聲招呼',action:()=>gotoScene(1,1)},
        {label:'先在街上打探消息',action:()=>gotoScene(1,2)}
      ]);
    },800);
  },
  1:function(){
    G.companions.yuer=true;
    addStory('你走近藥鋪，少女抬起頭，眼中有幾分訝異，卻很快展露出一個微笑。','narr');
    addStory('「客人是外鄉人吧？渝州最近不太平，你要小心。」她聲音輕柔，如山泉般清澈。','dialogue');
    addStory('「我叫沈夜涼，這是我家的草堂。你若是受了傷，或是需要藥草，儘管說。」','dialogue');
    addStory('她遞過來一包小小的藥包，說是驅邪的香包，不收錢。','narr');
    G.affection.yuer=Math.min(100,G.affection.yuer+8);
    addItem({name:'辟邪香包',qty:1,type:'consumable',effect:{cure:'all'},desc:'驅除邪穢，消除負面狀態'});
    showNotif('結識了沈夜涼 · 緣份+8');
    setTimeout(()=>{
      addStory('你們正說著話，街角突然傳來一陣喧嘩——','narr');
      setChoices([{label:'→ 前往查看',action:()=>gotoScene(1,3)}]);
    },700);
  },
  2:function(){
    addStory('你在街上轉了一圈，從茶館老闆口中得知：渝州近來常有人失蹤，山中出現不明的黑霧。','');
    addStory('更怪的是，城外古廟的神像接連破碎，祭司說這是不祥之兆。','narr');
    addStory('你記下了這些，準備繼續打探——卻聽見街角傳來喧嘩聲。','narr');
    setChoices([{label:'→ 前往查看',action:()=>gotoScene(1,3)}]);
  },
  3:function(){
    addStory('街角，一名身材魁梧的惡霸正押著一個老人，要強搶他的藥材。','narr');
    addStory('「老頭，你這藥材獻給鬼王寨，是你的榮幸！還不識好歹？」','dialogue');
    addStory('圍觀的百姓都低著頭，不敢出聲。老人老淚縱橫，卻無力反抗。','narr');
    if(!G.companions.yuer){
      addStory('這時，一個穿著淡青衣裙的少女從人群中擠出來：「放開他！」','narr');
      addStory('那是藥鋪的沈夜涼，她的聲音雖然顫抖，眼神卻堅定。','narr');
      G.companions.yuer=true;
      G.affection.yuer=Math.min(100,G.affection.yuer+5);
    }
    setTimeout(()=>{
      addStory('惡霸轉向你，嗤笑道：「又一個不知死活的！」','dialogue');
      setChoices([
        {label:'挺身而出，正面對抗',action:()=>gotoScene(1,4)},
        {label:'[感知DC12] 察言觀色，尋找弱點',dc:12,stat:'wis',
          onSuccess:()=>{
            addStory('你一眼看出惡霸身上的腰牌——是鬼王寨的護法，卻只是個小角色，靠恐嚇為生，膽子其實不大。','action');
            G.flags.scoutBully=true;
            setTimeout(()=>gotoScene(1,4),600);
          },
          onFail:()=>{
            addStory('你未能看出什麼破綻，只好直接上前。','action');
            setTimeout(()=>gotoScene(1,4),600);
          }
        },
        ...(G.origin==='dark'?[{label:'[邪念] 感受到血腥的衝動……',dark:true,action:()=>{
          showUrge(
            '黑暗在你心底低語：「殺了他。用力，用那股黑暗的力量——讓他付出代價。血的滋味是那麼美妙……」\n\n你的手微微顫抖。',
            ()=>gotoScene(1,4)
          );
        }}]:[])
      ]);
    },600);
  },
  4:function(){
    addStory(G.flags.scoutBully
      ? '你故意大聲說出惡霸腰牌的秘密，讓他在圍觀百姓前顏面盡失。惡霸惱羞成怒，揮拳而來！'
      : '你擋在老人與沈夜涼身前，冷冷地說：「放開他。」惡霸二話不說，揮拳向你衝來！','action');
    startBattle(
      [{name:'鬼王寨惡霸',hp:22,maxHp:22,atk:6,def:2,ac:11,exp:40,loot:{name:'銀兩',qty:1,type:'key',effect:{},desc:'一些銀兩'}}],
      ()=>gotoScene(1,5),
      ()=>gotoScene(1,'death')
    );
  },
  5:function(){
    addStory('惡霸落敗，狼狽逃竄，人群中爆發出掌聲。老人含淚道謝，沈夜涼走到你身邊，眼中閃著感激的光。','narr');
    addStory('「謝謝你。」她的聲音輕得像風，「你……要去哪裡？」','dialogue');
    addStory('你說起封印的事，沈夜涼沉默片刻，從懷中取出一枚玉佩，上面刻著奇異的符文。','narr');
    addStory('「這是我娘留下的，她說和封印有關。我……我想跟你一起去。」','dialogue');
    G.affection.yuer=Math.min(100,G.affection.yuer+12);
    showNotif('沈夜涼加入同行 · 緣份+12');
    setTimeout(()=>{
      addStory('夜幕降臨，渝州城中升起裊裊炊煙。你和沈夜涼在茶館中相對而坐，談起各自的往事。','narr');
      if(G.affection.yuer>=20){
        addStoryHTML('沈夜涼的眼睛在燈火下閃著溫柔的光芒，她說：「你和我見過的人都不一樣——你的眼神裡有一種很深的東西。」','romance');
      }
      if(G.origin==='dark'){
        addStory('你幾乎要告訴她關於夢魘的事——但那股黑暗的低語提醒你：有些秘密，不該說出口。','dark-urge');
      }
      setChoices([{label:'→ 次日，啟程前往蜀山',action:()=>gotoScene(2,0)}]);
    },700);
  },
  death:function(){
    addStory('你力竭倒地，意識在黑暗中消散……','red');
    addStory('（戰鬥失敗。你可以讀取存檔，或重新開始。）','dim');
    setChoices([
      {label:'讀取存檔',action:loadGame},
      {label:'重新開始',action:restartGame}
    ]);
  }
};
