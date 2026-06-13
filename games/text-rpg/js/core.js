/* 遊戲核心：狀態管理、存檔、單場景渲染、選項、擲骰、場景路由 */
import { ORIGINS } from '../data/origins.js';

export const SAVE_KEY = 'starcore-echoes-save-v2';
export const $ = id => document.getElementById(id);

/* ---------- 狀態 ---------- */
export let G = null;

export function newGame(name, originKey) {
  const o = ORIGINS[originKey];
  G = {
    name, origin: originKey,
    stats: { ...o.stats },
    hp: o.hp, maxHp: o.hp,
    mp: o.mp, maxMp: o.mp,
    skills: [...o.skills],          // 技能 id 列表
    bag: [],                        // [{ id, qty }]
    equip: { weapon: null },        // 裝備欄：武器一格
    flags: {},
    scene: 'p1',
    log: [],
  };
  return G;
}
export function setG(state) { G = state; }
export const isEvil = () => G && G.origin === 'evil';
export const mod = stat => Math.floor((G.stats[stat] - 1) / 2) + (G.stats[stat] >= 4 ? 1 : 0);

export function save() { try { localStorage.setItem(SAVE_KEY, JSON.stringify(G)); } catch (e) {} }
export function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; } }
export function wipeSave() { localStorage.removeItem(SAVE_KEY); }

/* ---------- 側欄渲染（各模組註冊自己的渲染器） ---------- */
const renderers = [];
export function registerRenderer(fn) { renderers.push(fn); }
export function refresh() { if (G) renderers.forEach(fn => fn()); }

/* ---------- 畫面輸出（單場景模式） ---------- */
const MAX_BATTLE_LINES = 5;

export function record(html, cls) { G.log.push({ html, cls }); }

export function pushLog(html, cls) {
  record(html, cls);
  appendPara(html, cls);
}
export function appendPara(html, cls) {
  const log = $('log');
  const p = document.createElement('div');
  p.className = 'para' + (cls ? ' ' + cls : '');
  p.innerHTML = html;
  log.appendChild(p);
  // 戰鬥訊息只保留最近幾行，於同一區域內更新
  if (cls && cls.indexOf('battle') !== -1) {
    const lines = log.querySelectorAll('.para.battle');
    for (let i = 0; i < lines.length - MAX_BATTLE_LINES; i++) lines[i].remove();
  }
  log.scrollTop = log.scrollHeight;
}
export function pushTitle(t) {
  record(t, 'is-title');
  const log = $('log');
  const el = document.createElement('div');
  el.className = 'scene-title';
  el.innerHTML = t;
  log.appendChild(el);
}
export function pushEcho(text) { record(text, 'is-echo'); } // 只記入紀錄，不佔場景畫面

export function clearScene() { $('log').innerHTML = ''; $('choices').innerHTML = ''; }

/** 舊內容淡出 → 清空 → 執行 fn 產生新內容 → 淡入 */
export function sceneSwap(fn) {
  const area = $('scene-area');
  area.classList.add('fade-out');
  setTimeout(() => {
    clearScene();
    fn();
    requestAnimationFrame(() => area.classList.remove('fade-out'));
  }, 360);
}

/* ---------- 選項 ---------- */
let logMark = 0; // 點選選項當下的段落數，用來判斷是否有後續補述文字
export function setChoices(list) {
  const box = $('choices');
  box.innerHTML = '';
  list.forEach((c, i) => {
    if (c.hidden && c.hidden()) return;
    const b = document.createElement('button');
    b.className = 'choice-btn' + (c.evil ? ' evil' : '') + (c.back ? ' back-btn' : '');
    b.style.animationDelay = (i * 0.12) + 's';
    b.innerHTML = (c.tag ? '<span class="tag">' + c.tag + '</span>' : '') + c.text;
    b.onclick = () => {
      box.innerHTML = '';
      logMark = $('log').children.length;
      if (!c.noEcho) pushEcho(c.text.replace(/<[^>]+>/g, ''));
      c.fn();
    };
    box.appendChild(b);
  });
}

/* ---------- 場景路由 ---------- */
const SCENES = {};
export function registerScenes(obj) { Object.assign(SCENES, obj); }
export function runScene(id) { SCENES[id](); }

export function go(id) {
  G.scene = id;
  save();
  // 若選擇之後產生了新的補述文字（擲骰結果、過場敘述），先讓玩家讀完再換場
  if ($('log').children.length > logMark) {
    setChoices([{ tag: '▸', text: '繼續', noEcho: true, fn: () => sceneSwap(() => SCENES[id]()) }]);
  } else {
    sceneSwap(() => SCENES[id]());
  }
}

/* ---------- 擲骰（BG3 風格 d20 檢定） ---------- */
export function rollCheck(label, stat, dc, onPass, onFail) {
  const bonus = mod(stat);
  const overlay = $('dice-overlay');
  const numEl = $('d20-num');
  const resEl = $('dice-result');
  $('dice-name').textContent = label + ' · 難度 ' + dc;
  resEl.innerHTML = '';
  overlay.classList.add('show');
  $('d20').classList.add('rolling');

  let ticks = 0;
  const spin = setInterval(() => {
    numEl.textContent = 1 + Math.floor(Math.random() * 20);
    if (++ticks >= 14) {
      clearInterval(spin);
      $('d20').classList.remove('rolling');
      const die = 1 + Math.floor(Math.random() * 20);
      const total = die + bonus;
      const pass = die === 20 || (die !== 1 && total >= dc);
      numEl.textContent = die;
      resEl.innerHTML = '🎲 ' + die + (bonus ? ' + ' + bonus : '') + ' = ' + total +
        (die === 20 ? '（大成功！）' : die === 1 ? '（大失敗…）' : '') +
        (pass ? '<span class="ok">檢 定 成 功</span>' : '<span class="ng">檢 定 失 敗</span>');
      setTimeout(() => {
        overlay.classList.remove('show');
        pushLog('🎲 ' + label + '檢定 DC' + dc + ' — 擲出 ' + die + (bonus ? '+' + bonus : '') + ' = ' + total + (pass ? '，成功' : '，失敗'), 'roll' + (pass ? '' : ' fail'));
        (pass ? onPass : onFail)();
      }, 1300);
    }
  }, 70);
}

/* ---------- 角色狀態列 ---------- */
export function renderStats() {
  $('char-name').textContent = G.name;
  $('char-origin').textContent = ORIGINS[G.origin].sub + (G.flags.slime ? ' · 史萊姆' : '');
  $('hp-text').textContent = G.hp + ' / ' + G.maxHp;
  $('mp-text').textContent = G.mp + ' / ' + G.maxMp;
  $('hp-fill').style.width = Math.max(0, G.hp / G.maxHp * 100) + '%';
  $('mp-fill').style.width = Math.max(0, G.mp / G.maxMp * 100) + '%';
  $('st-str').textContent = G.stats.str;
  $('st-agi').textContent = G.stats.agi;
  $('st-int').textContent = G.stats.int;
  $('st-cha').textContent = G.stats.cha;
}

/* ---------- 畫面切換 ---------- */
export function showScreen(id) {
  ['screen-title', 'screen-create', 'screen-game'].forEach(s =>
    $(s).style.display = s === id ? (s === 'screen-game' ? 'grid' : 'block') : 'none');
}

/* ---------- 回顧 ---------- */
export function renderHistory() {
  const body = $('history-body');
  if (!G || !G.log.length) { body.innerHTML = '<div class="history-empty">— 旅程尚未開始 —</div>'; return; }
  body.innerHTML = '';
  G.log.forEach(item => {
    const p = document.createElement('div');
    if (item.cls === 'is-title') { p.className = 'scene-title'; p.innerHTML = item.html; }
    else if (item.cls === 'is-echo') { p.className = 'choice-echo'; p.textContent = item.html; }
    else { p.className = 'para' + (item.cls ? ' ' + item.cls : ''); p.innerHTML = item.html; }
    body.appendChild(p);
  });
  body.scrollTop = body.scrollHeight;
}
