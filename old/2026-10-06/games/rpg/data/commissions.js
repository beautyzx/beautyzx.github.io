export const COMMISSIONS={
  yuzhou:[
    {
      id:'wolf_hunt',
      title:'除後山野狼',
      desc:'城外後山近日狼群作亂，咬傷數名樵夫。獎賞 50 兩。',
      giver:'王老闆',
      reward:{gold:50,exp:30},
      enemy:{name:'惡狼',hp:25,maxHp:25,atk:7,def:1,ac:11,exp:30,gold:0,loot:null},
      enemyCount:2
    },
    {
      id:'lost_sheep',
      title:'尋找走失的羊',
      desc:'柳娘家的羊跑進了西邊林子，膽小的羊，傷不得。獎賞 25 兩與一個香囊。',
      giver:'柳娘',
      reward:{gold:25,item:{name:'平安香囊',qty:1,type:'consumable',effect:{hp:10,cure:'all'},desc:'清香縈繞，回 10 HP 並消除負面狀態'}},
      checkType:'wisdom',
      dc:11
    },
    {
      id:'broken_idol',
      title:'查神像為何破裂',
      desc:'城西古廟神像接連破碎，捕頭懷疑與封印有關。獎賞 80 兩。',
      giver:'趙捕頭',
      reward:{gold:80,exp:50,item:{name:'破碎神像殘片',qty:1,type:'key',effect:{},desc:'蘊含微弱封印之力的殘片'}},
      enemy:{name:'怨靈',hp:35,maxHp:35,atk:9,def:2,ac:13,exp:50,gold:0,status:'fear',loot:null},
      enemyCount:1,
      plotHook:true
    }
  ]
};
