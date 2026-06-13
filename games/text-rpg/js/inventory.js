/* 背包、裝備、道具系統 */
import { ITEMS } from '../data/items.js';
import { G, $, pushLog, refresh, save } from './core.js';

/* ---------- 背包操作 ---------- */
export function addItem(id, qty = 1, silent) {
  const slot = G.bag.find(s => s.id === id);
  if (slot) slot.qty += qty;
  else G.bag.push({ id, qty });
  if (!silent) pushLog('《獲得道具：' + ITEMS[id].name + (qty > 1 ? ' ×' + qty : '') + '。》', 'system');
  refresh();
}

export function removeItem(id, qty = 1) {
  const i = G.bag.findIndex(s => s.id === id);
  if (i === -1) return false;
  G.bag[i].qty -= qty;
  if (G.bag[i].qty <= 0) {
    if (G.equip.weapon === id) G.equip.weapon = null;
    G.bag.splice(i, 1);
  }
  refresh();
  return true;
}

export function hasItem(id) { return G.bag.some(s => s.id === id); }
export function itemQty(id) { const s = G.bag.find(s => s.id === id); return s ? s.qty : 0; }

/* ---------- 裝備 ---------- */
export function equipWeapon(id) {
  G.equip.weapon = (G.equip.weapon === id) ? null : id; // 再點一次卸下
  pushLog(G.equip.weapon
    ? '《裝備武器：' + ITEMS[id].name + '（攻擊 +' + ITEMS[id].atk + '）。》'
    : '《卸下武器：' + ITEMS[id].name + '。》', 'system');
  save();
  refresh();
}

export function weaponAtk() {
  return G.equip.weapon ? (ITEMS[G.equip.weapon].atk || 0) : 0;
}

/* ---------- 使用道具（劇情與戰鬥共用） ---------- */
export function consumables() {
  return G.bag.filter(s => ITEMS[s.id].type === 'consumable')
    .map(s => ({ ...s, ...ITEMS[s.id] }));
}

export function useItem(id) {
  const it = ITEMS[id];
  if (!it || it.type !== 'consumable' || !hasItem(id)) return false;
  const parts = [];
  if (it.hp) { const healed = Math.min(it.hp, G.maxHp - G.hp); G.hp += healed; parts.push('HP +' + healed); }
  if (it.mp) { const gained = Math.min(it.mp, G.maxMp - G.mp); G.mp += gained; parts.push('MP +' + gained); }
  removeItem(id, 1);
  pushLog('《使用道具：' + it.name + '。' + (parts.join('、') || '沒有任何效果') + '。》', 'system');
  save();
  refresh();
  return true;
}

/* ---------- 側欄渲染 ---------- */
export function renderInventory() {
  // 裝備欄
  const w = G.equip.weapon;
  $('equip-box').innerHTML =
    '<div class="equip-slot"><span class="slot-label">武器</span>' +
    (w ? '<span class="slot-item">' + ITEMS[w].name + ' +' + ITEMS[w].atk + '</span>'
       : '<span class="slot-empty">— 空 —</span>') +
    '</div>';

  // 背包
  const list = $('bag-list');
  if (!G.bag.length) {
    list.innerHTML = '<div class="bag-empty">— 背包是空的 —</div>';
    return;
  }
  list.innerHTML = '';
  G.bag.forEach(slot => {
    const it = ITEMS[slot.id];
    const b = document.createElement('button');
    b.className = 'bag-item' + (it.type === 'weapon' ? ' weapon-item' : it.type === 'key' ? ' key-item' : '');
    b.title = it.desc;
    const right = it.type === 'weapon'
      ? (G.equip.weapon === slot.id ? '<span class="item-equipped">●裝備中</span>' : '<span class="item-qty">可裝備</span>')
      : it.type === 'key' ? '<span class="item-qty">關鍵</span>'
      : '<span class="item-qty">×' + slot.qty + '</span>';
    b.innerHTML = '<span>' + it.name + '</span>' + right;
    if (it.type === 'weapon') b.onclick = () => equipWeapon(slot.id);
    else if (it.type === 'consumable') b.onclick = () => useItem(slot.id);
    list.appendChild(b);
  });
}
