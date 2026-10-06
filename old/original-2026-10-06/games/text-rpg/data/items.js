/* 物品定義
   type: 'consumable' 消耗品（hp/mp 回復量）
         'weapon'     武器（atk 攻擊加成，裝備於武器欄）
         'key'        關鍵道具（解鎖劇情選項用，不可使用） */
export const ITEMS = {
  herb: {
    name: '回復藥草', type: 'consumable', hp: 12,
    desc: '在洞窟白骨旁長出的藥草，由體內精製而成。回復 12 HP',
  },
  manaCrystal: {
    name: '魔素結晶', type: 'consumable', mp: 10,
    desc: '洞窟水晶上凝固的高純度魔素。回復 10 MP',
  },
  starVial: {
    name: '星髓瓶', type: 'consumable', hp: 10, mp: 8,
    desc: '神籠製式的星髓濃縮液。回復 10 HP / 8 MP',
  },
  rustSword: {
    name: '鏽劍', type: 'weapon', atk: 2,
    desc: '無名冒險者的遺物。經捕食解析後，可由黏體具現化揮舞。攻擊 +2',
  },
  shinraCard: {
    name: '神籠識別卡', type: 'key',
    desc: '神籠警備兵的識別卡。也許能打開神籠設施的某些門……（後續章節使用）',
  },
};
