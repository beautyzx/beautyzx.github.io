import {G,setChapterBanner,addStory,setChoices,gotoScene,showUrge} from '../js/api.js';

export const CH0={
  0:function(){
    setChapterBanner(0,'序章·千年封印');
    addStory('千年前，天地初分，日月錯位。','narr');
    addStory('黑淵魔君，以怨氣與執念凝聚而成，橫行三界，殺戮蒼生。','narr');
    addStory('蜀山劍派諸仙，集五行靈力，祭出封魔古印，將魔君封印於幽冥深淵。','narr');
    addStory('然而，封印需人心為引——每隔千年，便有一人以心血鑄守。','narr');
    setTimeout(()=>{
      addStory('——現在，千年之期將至。','narr');
      addStory('封印之力，正在一點一點地消散……','narr');
      setTimeout(()=>{
        const isDark=G.origin==='dark';
        if(isDark){
          addStory('你從夢魘中驚醒。','');
          addStory('夢裡有一片黑暗的深淵，有低語，有血，還有——你自己的笑聲。','dark-urge');
          addStory('記憶如碎片，無法拼湊。你只記得一個名字：渝州。','');
        }else{
          addStory('你踏上征途，懷揣著師門的囑託：前往渝州，尋訪封印的源頭。','');
          addStory('天光未亮，霧氣籠罩著古道，遠山如墨。','narr');
        }
        setChoices([{label:'→ 前往渝州',action:()=>gotoScene(1,0)}]);
      },1200);
    },1200);
  }
};
