/* 戰鬥系統：回合制選單（攻擊／技能／道具／捕食） */
import { G, $, mod, isEvil, pushLog, setChoices, sceneSwap, refresh } from './core.js';
import { activeSkills, hasSkill } from './skills.js';
import { consumables, useItem, weaponAtk } from './inventory.js';

let battle = null;

export function startBattle(enemy, onWin) {
  battle = { e: { ...enemy }, onWin, nextMult: 1 };
  sceneSwap(() => {
    $('enemy-box').style.display = 'block';
    $('enemy-name').textContent = enemy.name;
    updateEnemyBar();
    pushLog('—— 戰鬥開始：' + enemy.name + ' ——', 'system');
    battleTurn();
  });
}

function updateEnemyBar() {
  $('enemy-hp-text').textContent = Math.max(0, battle.e.hp) + ' / ' + battle.e.maxHp;
  $('enemy-fill').style.width = Math.max(0, battle.e.hp / battle.e.maxHp * 100) + '%';
}

/* ---------- 主選單 ---------- */
function battleTurn() {
  const opts = [{
    tag: '攻擊', text: '普通攻擊' + (weaponAtk() ? '（武器 +' + weaponAtk() + '）' : ''),
    fn: () => playerHit(3 + Math.floor(Math.random() * 4) + Math.max(mod('str'), mod('agi')) + weaponAtk(), '你發起攻擊'),
  }];
  if (activeSkills().length) opts.push({ tag: '技能', text: '施展技能 ▸', noEcho: true, fn: skillMenu });
  if (consumables().length) opts.push({ tag: '道具', text: '使用道具 ▸', noEcho: true, fn: itemMenu });
  if (hasSkill('devour')) {
    opts.push({
      tag: '固有', text: '【捕食】試圖吞噬對手', evil: isEvil(),
      fn: () => {
        if (battle.e.hp <= battle.e.maxHp * 0.4) {
          pushLog('你的身體張開成一張無聲的口。' + battle.e.name + '連慘叫都來不及，便被整個吞入體內，化為解析中的資訊之流。', isEvil() ? 'evil' : 'battle');
          battle.e.hp = 0; updateEnemyBar();
          return endBattle(true);
        }
        pushLog('對方還太活躍，黏體抓不住它——【捕食】失敗，趁隙挨了一記！', 'battle');
        enemyHit();
      },
    });
  }
  setChoices(opts);
}

/* ---------- 技能子選單 ---------- */
function skillMenu() {
  const opts = activeSkills().map(s => ({
    tag: 'MP' + s.cost,
    text: '【' + s.name + '】' + s.desc,
    evil: !!s.evil,
    fn: () => castSkill(s),
  }));
  opts.push({ tag: '↩', text: '返回', back: true, noEcho: true, fn: battleTurn });
  setChoices(opts);
}

function castSkill(s) {
  if (G.mp < s.cost) {
    pushLog('魔素不足……力量在半途散掉了。', 'battle');
    return battleTurn();
  }
  G.mp -= s.cost;
  refresh();
  switch (s.type) {
    case 'attack': {
      const dmg = s.base + mod(s.stat) * s.mult + Math.floor(Math.random() * 4);
      playerHit(dmg, '你施展【' + s.name + '】');
      break;
    }
    case 'drain': {
      const dmg = s.base + mod(s.stat) * s.mult + Math.floor(Math.random() * 4);
      const heal = Math.min(Math.ceil(dmg / 2), G.maxHp - G.hp);
      G.hp += heal;
      refresh();
      playerHit(dmg, '你施展【' + s.name + '】，吸取了 <b style="color:#7ae0b2">' + heal + '</b> HP');
      break;
    }
    case 'heal': {
      const heal = Math.min(s.amount, G.maxHp - G.hp);
      G.hp += heal;
      refresh();
      pushLog('你施展【' + s.name + '】，回復了 <b style="color:#7ae0b2">' + heal + '</b> HP。', 'battle');
      enemyHit();
      break;
    }
    case 'buff': {
      battle.nextMult = 2;
      pushLog('你施展【' + s.name + '】——下一次造成的傷害將會<b style="color:#d8b56c">加倍</b>！', 'battle');
      enemyHit();
      break;
    }
  }
}

/* ---------- 道具子選單 ---------- */
function itemMenu() {
  const opts = consumables().map(it => ({
    tag: '×' + it.qty,
    text: it.name + ' — ' + it.desc,
    fn: () => { useItem(it.id); enemyHit(); }, // 用道具消耗一回合
  }));
  opts.push({ tag: '↩', text: '返回', back: true, noEcho: true, fn: battleTurn });
  setChoices(opts);
}

/* ---------- 攻防結算 ---------- */
function playerHit(dmg, prefix) {
  if (battle.nextMult > 1) { dmg *= battle.nextMult; battle.nextMult = 1; prefix += '（強化！）'; }
  battle.e.hp -= dmg;
  updateEnemyBar();
  pushLog(prefix + '，造成 <b style="color:#d8b56c">' + dmg + '</b> 點傷害。', 'battle');
  if (battle.e.hp <= 0) return endBattle(true);
  enemyHit();
}

function enemyHit() {
  const dmg = Math.max(1, battle.e.atk + Math.floor(Math.random() * 3) - 1);
  G.hp = Math.max(1, G.hp - dmg); // 序章不死
  refresh();
  pushLog(battle.e.name + ' 反擊，你受到 <b style="color:#c98a93">' + dmg + '</b> 點傷害。', 'battle');
  setTimeout(battleTurn, 250);
}

function endBattle(win) {
  $('enemy-box').style.display = 'none';
  pushLog('—— 戰鬥結束 ——', 'system');
  const cb = battle.onWin;
  battle = null;
  if (win && cb) cb();
}
