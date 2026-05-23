"use strict";
import {G,clearStory,addStory,setChoices,showNotif,updateUI,addItem} from './engine.js';
import {showUrge} from './urge.js';

export const SHOP_ITEMS={
  herb:[
    {name:'回靈丹',price:30,qty:1,type:'consumable',effect:{hp:15},desc:'回復15HP'},
    {name:'靈芝仙草',price:55,qty:1,type:'consumable',effect:{hp:25},desc:'回復25HP'},
    {name:'清神符',price:25,qty:1,type:'consumable',effect:{mp:10},desc:'回復10MP'},
    {name:'靈力丹',price:45,qty:1,type:'consumable',effect:{mp:18},desc:'回復18MP'},
    {name:'解毒草',price:20,qty:1,type:'consumable',effect:{cure:'poison'},desc:'解除中毒'},
    {name:'辟邪香包',price:40,qty:1,type:'consumable',effect:{cure:'all'},desc:'消除所有負面狀態'},
  ],
  weapon:[
    {name:'精鐵長劍',price:150,qty:1,type:'weapon',atk:10,weaponType:'sword',desc:'鍛造精良的長劍，攻擊+10'},
    {name:'玄鐵匕首',price:90,qty:1,type:'weapon',atk:7,weaponType:'blade',desc:'輕巧的玄鐵匕首，攻擊+7'},
    {name:'旅者護甲',price:100,qty:1,type:'armor',def:4,desc:'輕盈耐用的旅者護甲，防禦+4'},
    {name:'靈氣玉佩',price:180,qty:1,type:'accessory',effect:'靈力+5',desc:'蘊含靈氣的玉佩飾物'},
  ],
};

function _renderShop(shopName,shopKey,onClose){
  const items=SHOP_ITEMS[shopKey]||[];
  clearStory();
  addStory(`【${shopName}】`,'narr');
  addStory(`持有金幣：${G.gold} 兩`,'dim');

  const choices=items.map(item=>({
    label:`購入 ${item.name}（${item.price}兩）— ${item.desc}`,
    action:()=>{
      if(G.gold<item.price){showNotif('金幣不足！');return;}
      G.gold-=item.price;
      if(item.type==='weapon'){
        G.weapon={name:item.name,atk:item.atk,type:item.weaponType||'sword'};
        showNotif(`裝備 ${item.name}`);
      }else if(item.type==='armor'){
        G.armor={name:item.name,def:item.def};
        showNotif(`裝備 ${item.name}`);
      }else if(item.type==='accessory'){
        G.accessory={name:item.name,effect:item.effect};
        showNotif(`裝備 ${item.name}`);
      }else{
        addItem({...item});
        showNotif(`購入 ${item.name}，花費 ${item.price} 兩`);
      }
      updateUI();
      _renderShop(shopName,shopKey,onClose);
    }
  }));

  const sellable=G.inventory.filter(i=>i.type==='consumable'&&i.qty>0);
  if(sellable.length){
    addStory('── 出售道具 ──','dim');
    sellable.forEach(item=>{
      const sp=Math.floor((item.price||20)/2);
      choices.push({
        label:`售出 ${item.name}×${item.qty}（${sp} 兩／個）`,
        action:()=>{
          const idx=G.inventory.indexOf(item);
          G.gold+=sp;
          item.qty--;
          if(item.qty<=0)G.inventory.splice(idx,1);
          showNotif(`售出 ${item.name}，獲得 ${sp} 兩`);
          updateUI();
          _renderShop(shopName,shopKey,onClose);
        }
      });
    });
  }

  if(G.origin==='dark'&&items.length){
    choices.push({
      label:'[邪念] 趁店主不注意，順走一件……',dark:true,
      action:()=>{
        const target=items[Math.floor(Math.random()*items.length)];
        const prevEmbrace=G.urgeEmbrace;
        showUrge(
          '黑暗在心底低語：「拿走它——他根本不會發現。再說，你比他更需要它……」\n\n你的手緩緩伸向貨架。',
          ()=>{
            if(G.urgeEmbrace>prevEmbrace){
              addItem({...target,qty:1});
              showNotif(`暗中取走了 ${target.name}`);
              updateUI();
              onClose();
            }else{
              _renderShop(shopName,shopKey,onClose);
            }
          }
        );
      }
    });
  }

  choices.push({label:'← 離開',action:onClose});
  setChoices(choices);
}

export function showShop(shopKey,shopName,onClose){
  _renderShop(shopName,shopKey,onClose);
}

export function showTavern(onClose){
  const render=()=>{
    clearStory();
    addStory('【渝州酒館】','narr');
    addStory('酒館中瀰漫著酒香，幾個旅人低聲交談。老闆是個圓臉胖子，笑著招呼：「客官，要喝點什麼？」','narr');
    addStory(`持有金幣：${G.gold} 兩`,'dim');
    setChoices([
      {label:'休息一夜（20兩）— 完全回復HP',action:()=>{
        if(G.gold<20){showNotif('金幣不足！');return;}
        G.gold-=20;G.hp=G.maxHp;
        showNotif('安睡一夜，體力完全恢復');
        updateUI();render();
      }},
      {label:'飲茶靜氣（5兩）— 回復15MP',action:()=>{
        if(G.gold<5){showNotif('金幣不足！');return;}
        G.gold-=5;G.mp=Math.min(G.maxMp,G.mp+15);
        showNotif('清茶入喉，靈力漸復');
        updateUI();render();
      }},
      {label:'打聽消息（10兩）— 獲取情報',action:()=>{
        if(G.gold<10){showNotif('金幣不足！');return;}
        G.gold-=10;updateUI();
        addStory('老闆壓低聲音：「聽說鬼王寨近來動作頻繁，山裡的黑霧越來越重……你若要出城，小心為上。」','dialogue');
        showNotif('獲得情報');
        setChoices([{label:'← 回去',action:render}]);
      }},
      {label:'← 離開酒館',action:onClose}
    ]);
  };
  render();
}
