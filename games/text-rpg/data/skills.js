/* 技能定義
   type: 'attack'  攻擊（傷害 = base + 屬性加成×mult + 隨機）
         'drain'   吸取（造成傷害並回復傷害一半的 HP）
         'heal'    回復（amount HP）
         'buff'    強化（下一次造成的傷害 ×2）
         'devour'  捕食（衰弱的敵人可整隻吞下）
         'passive' 被動，不出現在戰鬥選單 */
export const SKILLS = {
  /* —— 邪念 —— */
  whisper: {
    name: '蝕心低語', cost: 4, type: 'attack', stat: 'int', base: 6, mult: 2,
    desc: '以言語侵蝕心靈，造成智力傷害', evil: true,
  },
  fearFeast: {
    name: '噬懼', cost: 5, type: 'drain', stat: 'int', base: 6, mult: 2,
    desc: '撕咬對手的恐懼，造成傷害並回復其一半的 HP', evil: true,
  },
  abyssGaze: {
    name: '深淵凝視', cost: 8, type: 'attack', stat: 'cha', base: 13, mult: 2,
    desc: '讓對手直視你的本質——深淵。魅力重傷害', evil: true,
  },
  /* —— 劍士 —— */
  cleave: {
    name: '烈空斬', cost: 4, type: 'attack', stat: 'str', base: 7, mult: 2,
    desc: '灌注鬥氣的一閃，力量重擊',
  },
  warCry: {
    name: '戰意高揚', cost: 3, type: 'buff',
    desc: '提振戰意，下一次造成的傷害加倍',
  },
  crossSlash: {
    name: '十文字斬', cost: 7, type: 'attack', stat: 'str', base: 13, mult: 2,
    desc: '縱橫交錯的二連斬，力量大傷害',
  },
  /* —— 魔導士 —— */
  starFire: {
    name: '星炎彈', cost: 5, type: 'attack', stat: 'int', base: 8, mult: 2,
    desc: '壓縮星髓的火團，智力爆發傷害',
  },
  starMend: {
    name: '星髓治癒', cost: 4, type: 'heal', amount: 14,
    desc: '引星髓之流修復身體，回復 14 HP',
  },
  meteor: {
    name: '隕星', cost: 9, type: 'attack', stat: 'int', base: 14, mult: 2,
    desc: '召落一顆小型隕星，智力大傷害',
  },
  /* —— 盜賊 —— */
  ambush: {
    name: '影襲', cost: 3, type: 'attack', stat: 'agi', base: 5, mult: 3,
    desc: '自陰影中的奇襲，敏捷連擊',
  },
  venomEdge: {
    name: '毒刃', cost: 4, type: 'attack', stat: 'agi', base: 8, mult: 2,
    desc: '淬毒的突刺，敏捷傷害',
  },
  deathStrike: {
    name: '致命突襲', cost: 6, type: 'attack', stat: 'agi', base: 12, mult: 2,
    desc: '直取要害的一擊，敏捷大傷害',
  },
  /* —— 固有（轉生後取得） —— */
  sense: {
    name: '魔力感知', cost: 0, type: 'passive',
    desc: '以魔素流動代替視聽，感知周圍世界',
  },
  devour: {
    name: '捕食', cost: 3, type: 'devour',
    desc: '吞噬並解析目標；衰弱的敵人可整隻吞下',
  },
};

/* 各起源的專屬技能（依習得順序：建角 → 獲名 → 序章完） */
export const ORIGIN_SKILLS = {
  evil: ['whisper', 'fearFeast', 'abyssGaze'],
  knight: ['cleave', 'warCry', 'crossSlash'],
  mage: ['starFire', 'starMend', 'meteor'],
  rogue: ['ambush', 'venomEdge', 'deathStrike'],
};
