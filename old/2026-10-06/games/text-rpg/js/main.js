/* 進入點：畫面接線、建角、開始／繼續遊戲 */
import {
  $, G, setG, newGame, load, wipeSave, SAVE_KEY,
  registerRenderer, refresh, registerScenes, runScene,
  record, appendPara, clearScene, setChoices, showScreen, renderStats, renderHistory,
} from './core.js';
import { renderSkills } from './skills.js';
import { renderInventory } from './inventory.js';
import { ORIGINS } from '../data/origins.js';
import { PROLOGUE } from '../data/prologue.js';

/* 舊版（v1）存檔不相容，直接清掉 */
localStorage.removeItem('starcore-echoes-save-v1');

registerScenes(PROLOGUE);
registerRenderer(renderStats);
registerRenderer(renderSkills);
registerRenderer(renderInventory);

/* ---------- 開始／繼續 ---------- */
function startGame(name, originKey) {
  newGame(name, originKey);
  showScreen('screen-game');
  refresh();
  runScene('p1');
}

function resumeGame(saved) {
  setG(saved);
  showScreen('screen-game');
  refresh();
  clearScene();
  if (saved.scene === 'end') {
    appendPara('— 序章已通關 —', 'system');
    setChoices([
      { tag: '重來', text: '以另一個起源，重新經歷序章', fn: () => { wipeSave(); location.reload(); } },
      { tag: '離開', text: '回到花園首頁', fn: () => { location.href = '/'; } },
    ]);
  } else {
    record('— 從上次的場景繼續 —', 'system');
    appendPara('— 從上次的場景繼續 —', 'system');
    runScene(saved.scene);
  }
}

/* ---------- 建角畫面 ---------- */
(function buildCreation() {
  const grid = $('origin-grid');
  Object.entries(ORIGINS).forEach(([key, o]) => {
    const card = document.createElement('button');
    card.className = 'origin-card' + (o.evil ? ' evil-card' : '');
    card.innerHTML =
      '<h4>' + o.name + '</h4><div class="origin-sub">' + o.sub + '</div>' +
      '<div class="origin-desc">' + o.desc + '</div>' +
      '<div class="origin-stats">力' + o.stats.str + ' · 敏' + o.stats.agi + ' · 智' + o.stats.int + ' · 魅' + o.stats.cha + ' ｜ HP ' + o.hp + ' · MP ' + o.mp + '</div>';
    card.onclick = () => {
      const name = $('name-input').value.trim() || (o.evil ? '無名之念' : '無名旅人');
      startGame(name, key);
    };
    grid.appendChild(card);
  });
})();

/* ---------- 按鈕接線 ---------- */
$('btn-new').onclick = () => { wipeSave(); showScreen('screen-create'); };
$('btn-restart').onclick = () => { if (confirm('要放棄目前進度，重新開始序章嗎？')) { wipeSave(); location.reload(); } };
$('btn-history').onclick = () => { renderHistory(); $('history-overlay').classList.add('show'); };
$('btn-history-close').onclick = () => $('history-overlay').classList.remove('show');
$('history-overlay').addEventListener('click', e => { if (e.target === $('history-overlay')) e.currentTarget.classList.remove('show'); });

const saved = load();
if (saved && saved.scene) {
  const btn = $('btn-continue');
  btn.style.display = '';
  btn.onclick = () => resumeGame(saved);
}
