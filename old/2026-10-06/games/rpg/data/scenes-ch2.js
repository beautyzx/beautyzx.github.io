import {G,setChapterBanner,clearStory,addStory,addStoryHTML,setChoices,gotoScene,addItem,showNotif,showUrge,checkLevelGate} from '../js/api.js';
import {startBattle} from '../js/battle.js';
import {addRomanceScene} from '../js/romance.js';

export const CH2={
  0:function(){
    setChapterBanner(2,'第二章·蜀山問道');
    addStory('蜀山古道，峰巒如聚，白雲深處隱隱有鐘聲傳來。','narr');
    addStory('你與沈夜涼沿著山路前行，四周松濤陣陣，空氣中瀰漫著靈氣。','narr');
    setTimeout(()=>{
      addStory('突然，山道旁傳來兵器相交的聲音——','narr');
      addStory('一個蒙著面的刺客正與一名女劍客激烈交鬥。女劍客雖然功夫了得，卻已是孤立無援，受了些傷。','narr');
      setChoices([
        {label:'立刻衝上去幫助女劍客',action:()=>gotoScene(2,1)},
        {label:'[感知DC10] 先觀察局勢',dc:10,stat:'wis',
          onSuccess:()=>{
            addStory('你看出刺客背後有鬼王寨的標記——是追殺女劍客的殺手。她是個值得信任的人。','action');
            G.flags.scoutAssassin=true;
            setTimeout(()=>gotoScene(2,1),600);
          },
          onFail:()=>{
            addStory('情況危急，你來不及細想，直接衝了上去。','action');
            setTimeout(()=>gotoScene(2,1),600);
          }
        }
      ]);
    },700);
  },
  1:function(){
    addStory('你拔出武器，加入戰鬥！刺客見勢不妙，倉皇撤退。','action');
    startBattle(
      [{name:'蒙面刺客',hp:30,maxHp:30,atk:8,def:3,ac:13,exp:60,gold:35,loot:{name:'毒刃匕首',qty:1,type:'weapon',effect:{},desc:'塗有毒藥的匕首'}}],
      ()=>gotoScene(2,2),
      ()=>gotoScene(1,'death')
    );
  },
  2:function(){
    G.companions.jianmei=true;
    addStory('刺客敗退，女劍客收刀回鞘，微微喘息，轉向你。','narr');
    addStory('她蛾眉長劍，眼神銳利卻帶著幾分謝意。','narr');
    addStory('「我叫裴霜華。欠了你一個人情。」她說話簡短，但語氣誠懇。','dialogue');
    G.affection.jianmei=Math.min(100,G.affection.jianmei+10);
    showNotif('結識了裴霜華 · 緣份+10');
    setTimeout(()=>{
      addStory('裴霜華說她一直在追查鬼王寨的動向，他們似乎和封印的事有關。','narr');
      addStory('「封魔古跡，」她沉聲說，「鬼王寨的人頻繁出入那裡。我懷疑他們想要破壞封印，解放魔君。」','dialogue');
      setChoices([
        {label:'「你願意一起行動嗎？」',action:()=>{
          G.affection.jianmei=Math.min(100,G.affection.jianmei+8);
          gotoScene(2,3);
        }},
        {label:'「你一個人追查，不危險嗎？」',action:()=>{
          G.affection.jianmei=Math.min(100,G.affection.jianmei+5);
          gotoScene(2,3);
        }}
      ]);
    },700);
  },
  3:function(){
    addStory('裴霜華沉默片刻，點了點頭。「好。」','dialogue');
    addStory('三人繼續沿山道前行。薄霧中，一座道觀隱約可見——','narr');
    setTimeout(()=>{
      addStory('觀前站著一個鬚髮皆白的老道人，正閉目打坐，對你們的到來似乎毫不在意。','narr');
      addStory('沈夜涼輕聲說：「這位道長，好像在等我們……」','dialogue');
      setChoices([{label:'上前與老道人搭話',action:()=>gotoScene(2,4)}]);
    },600);
  },
  4:function(){
    addStory('老道人緩緩睜眼，目光如電，掃過三人，最後落在你身上。','narr');
    addStory('「老道玄機子，等你們許久了。」他的聲音低沉，不疾不徐。','dialogue');
    addStory('「封印將破，魔君將醒。而你——」他指向你，「——是命運選中的人，也是最危險的人。」','dialogue');
    if(G.origin==='dark'){
      addStory('玄機子的目光在你身上停留更久，若有所思：「黑暗之人，能否在最後一刻選擇光明，端看你自己。」','dark-urge');
    }
    setTimeout(()=>{
      addStory('玄機子傳授了你一套封魔心法，並告知封魔古跡的位置。','action');
      addItem({name:'封魔心法殘卷',qty:1,type:'key',effect:{},desc:'記載著封魔古法的殘卷'});
      G.maxMp=Math.min(G.maxMp+6,50);
      G.mp=Math.min(G.mp+6,G.maxMp);
      showNotif('靈力上限+6，獲得封魔心法殘卷');
      setChoices([
        {label:'「封印為何會衰退？」',action:()=>gotoScene(2,5)},
        {label:'「鬼王寨是誰在幕後操縱？」',action:()=>gotoScene(2,5)}
      ]);
    },800);
  },
  5:function(){
    addStory('玄機子長嘆一聲：「封印以生靈之願力為支撐，然千年來，人心向私，怨氣積累，封印便日漸鬆弛。」','dialogue');
    addStory('「至於鬼王寨——」他頓了頓，「其首領本是修道之人，卻因摯愛之人死於非命，墮入魔道，甘願替魔君破封。」','dialogue');
    addStory('「你們要快。封印還剩三日。」','dialogue');
    if(G.origin==='dark'&&!G.flags.urge1){
      G.flags.urge1=true;
      setTimeout(()=>{
        showUrge(
          '玄機子的話讓你想起夢中的聲音：「三日……三日之後，我將重獲自由……」那是魔君的聲音，還是你心底的聲音？\n\n你感到一陣昏眩，黑暗在心底洶湧——',
          ()=>{
            setChoices([{label:'→ 連夜前往封魔古跡',action:()=>gotoScene(2,6)}]);
          }
        );
      },400);
    }else{
      setTimeout(()=>{
        if(G.affection.yuer>=30||G.affection.jianmei>=30){
          const comp=G.affection.yuer>=G.affection.jianmei?'yuer':'jianmei';
          addRomanceScene(comp,'chapter2',()=>{
            setChoices([{label:'→ 連夜前往封魔古跡',action:()=>gotoScene(2,6)}]);
          });
        }else{
          setChoices([{label:'→ 連夜前往封魔古跡',action:()=>gotoScene(2,6)}]);
        }
      },600);
    }
  },
  6:function(){
    addStory('夜色深沉，山風獵獵。三人沿著玄機子指引的山路，向著封魔古跡進發。','narr');
    addStory('裴霜華走在前方探路，沈夜涼緊靠著你，手中的玉佩散發出淡淡的光芒。','narr');
    setTimeout(()=>{
      addStory('「那塊玉佩……是指引我們的嗎？」你問。','');
      addStory('沈夜涼點頭：「娘說，玉佩能感應封印的位置。它越來越熱了……」','dialogue');
      addStory('突然，前方山道上出現了十幾個黑影——鬼王寨的人！','narr');
      const goToGrindOrMsg=()=>{
        setChoices([
          {label:'前往山林歷練',action:()=>gotoScene(2,'grind')},
          {label:'← 回到山道休整',action:()=>gotoScene(2,6)}
        ]);
      };
      setChoices([
        {label:'正面突破！',action:()=>{
          if(checkLevelGate(6,'封魔古跡深處'))gotoScene(2,7);
          else goToGrindOrMsg();
        }},
        {label:'[敏捷DC13] 繞行小路，避開伏擊',dc:13,stat:'dex',
          onSuccess:()=>{
            addStory('你帶著眾人悄悄繞過伏擊，毫髮無傷地抵達古跡入口。','action');
            G.exp=Math.min(G.exp+30,999);
            setTimeout(()=>{
              if(checkLevelGate(6,'封魔古跡深處'))gotoScene(3,0);
              else goToGrindOrMsg();
            },600);
          },
          onFail:()=>{
            addStory('你未能找到繞行路線，只好正面迎戰！','action');
            setTimeout(()=>gotoScene(2,7),600);
          }
        }
      ]);
    },700);
  },
  7:function(){
    addStory('你們與鬼王寨的先鋒交戰，沈夜涼在後方施術，裴霜華劍法淩厲，你衝殺在前！','action');
    startBattle(
      [
        {name:'鬼王寨先鋒甲',hp:35,maxHp:35,atk:9,def:3,ac:12,exp:50,gold:30,loot:null},
        {name:'鬼王寨先鋒乙',hp:28,maxHp:28,atk:7,def:2,ac:11,exp:40,gold:25,loot:null}
      ],
      ()=>{
        addItem({name:'精鐵護腕',qty:1,type:'armor',def:5,desc:'鬼王寨先鋒留下的護腕，防禦+5'});
        showNotif('獲得精鐵護腕（在背包中可裝備）');
        if(checkLevelGate(6,'封魔古跡深處')){
          gotoScene(3,0);
        }else{
          setChoices([
            {label:'前往山林歷練',action:()=>gotoScene(2,'grind')},
            {label:'← 回到山道休整',action:()=>gotoScene(2,6)}
          ]);
        }
      },
      ()=>gotoScene(1,'death')
    );
  },
  grind:function(){
    clearStory();
    addStory('【蜀山山林】','narr');
    addStory('蜀山深處，山間靈氣濃郁，常有妖獸出沒。這裡的對手比渝州凶險得多。','narr');
    setChoices([
      {label:'狩獵山妖（戰鬥）',action:()=>{
        const loot=Math.random()<0.25?{name:'妖骨',qty:1,type:'consumable',effect:{mp:12},desc:'蘊含妖力的骨頭 (+12MP)'}:null;
        const enemies=[
          {name:'山妖',hp:30+G.level*3,maxHp:30+G.level*3,atk:8+G.level,def:2,ac:13,exp:50,gold:15,loot}
        ];
        if(Math.random()<0.3){
          enemies.push({name:'山妖幼崽',hp:15+G.level*2,maxHp:15+G.level*2,atk:6,def:1,ac:11,exp:25,gold:8,loot:null});
        }
        startBattle(enemies,()=>gotoScene(2,'grind'),()=>gotoScene(1,'death'));
      }},
      {label:'狩獵鬼王寨小隊（戰鬥）',action:()=>{
        const loot=Math.random()<0.2?{name:'鬼王寨腰牌',qty:1,type:'key',effect:{},desc:'鬼王寨成員的身份證明'}:null;
        startBattle(
          [{name:'鬼王寨遊兵',hp:35+G.level*3,maxHp:35+G.level*3,atk:9+G.level,def:3,ac:13,exp:60,gold:20,loot}],
          ()=>gotoScene(2,'grind'),()=>gotoScene(1,'death')
        );
      }},
      {label:'← 回到山道',action:()=>gotoScene(2,6)}
    ]);
  }
};
