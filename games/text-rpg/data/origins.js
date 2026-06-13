/* 起源（職業）定義：屬性、初始資源、初始技能 */
import { ORIGIN_SKILLS } from './skills.js';

export const ORIGINS = {
  evil: {
    name: '邪念', sub: 'THE MALICE · 深淵殘念',
    desc: '你不是「人」。你是寄宿在某個人心底的一縷邪念——嫉妒、飢渴、想吞掉全世界的衝動。宿主死去的那一夜，你終於自由了。',
    stats: { str: 2, agi: 2, int: 4, cha: 4 }, hp: 26, mp: 16,
    skills: [ORIGIN_SKILLS.evil[0]],
    evil: true,
  },
  knight: {
    name: '劍士', sub: 'THE BLADE · 餘燼傭兵',
    desc: '曾是星髓巨企「神籠」的親衛劍士，親眼看見星球被抽乾後叛逃。你的劍很重，因為上面掛著舊日的罪。',
    stats: { str: 5, agi: 3, int: 1, cha: 2 }, hp: 34, mp: 8,
    skills: [ORIGIN_SKILLS.knight[0]],
  },
  mage: {
    name: '魔導士', sub: 'THE ARCANIST · 星髓學者',
    desc: '研究星髓能量的學者，發現了「星核」的祕密之後被通緝。你相信知識能救星球——也知道知識會殺人。',
    stats: { str: 1, agi: 2, int: 5, cha: 3 }, hp: 24, mp: 20,
    skills: [ORIGIN_SKILLS.mage[0]],
  },
  rogue: {
    name: '盜賊', sub: 'THE SHADOW · 下城之影',
    desc: '在鋼鐵都市的下水道長大，靠偷神籠的物資活到今天。世界沒給過你什麼，所以你打算自己拿。',
    stats: { str: 2, agi: 5, int: 3, cha: 2 }, hp: 28, mp: 10,
    skills: [ORIGIN_SKILLS.rogue[0]],
  },
};
