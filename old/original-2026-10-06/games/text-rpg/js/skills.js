/* 技能系統：習得、查詢、側欄渲染 */
import { SKILLS, ORIGIN_SKILLS } from '../data/skills.js';
import { G, $, pushLog, refresh } from './core.js';

export function hasSkill(id) { return G.skills.includes(id); }

export function learnSkill(id, silent) {
  if (hasSkill(id)) return;
  G.skills.push(id);
  if (!silent) pushLog('《獲得技能：【' + SKILLS[id].name + '】。》', 'system');
  refresh();
}

/** 習得本起源的第 n 個專屬技能（0 起算） */
export function learnOriginSkill(index) {
  const id = ORIGIN_SKILLS[G.origin][index];
  if (id) learnSkill(id);
  return id;
}

/** 戰鬥選單用：可主動施放的技能（捕食另列） */
export function activeSkills() {
  return G.skills
    .map(id => ({ id, ...SKILLS[id] }))
    .filter(s => s.cost > 0 && s.type !== 'devour' && s.type !== 'passive');
}

export function renderSkills() {
  $('skill-list').innerHTML = G.skills.map(id => {
    const s = SKILLS[id];
    return '<div class="skill-item">【' + s.name + '】' +
      (s.cost ? ' <span style="color:#7d8a85">MP' + s.cost + '</span><br>' : '<br>') +
      '<span style="color:#7d8a85">' + s.desc + '</span></div>';
  }).join('');
}
