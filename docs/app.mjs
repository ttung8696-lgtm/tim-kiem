import { act, fresh, readSave, STORAGE_KEY, ENEMIES, QUESTS, maxHp, nextLevel, power, petName } from './game.mjs';
const paths = {
  paw:'<ellipse cx="7" cy="7" rx="2" ry="2.6"/><ellipse cx="17" cy="7" rx="2" ry="2.6"/><ellipse cx="3.5" cy="12" rx="1.5" ry="2"/><ellipse cx="20.5" cy="12" rx="1.5" ry="2"/><path d="M6.5 18c0-2.5 3.2-6 5.5-6s5.5 3.5 5.5 6c0 4-3.6 1.7-5.5 1.7S6.5 22 6.5 18Z"/>',
  home:'<path d="m3 10 9-7 9 7M5 9v11h14V9M10 20v-6h4v6"/>', swords:'<path d="m3 3 5 2 11 11M3 3l2 5 6 6m3 3 3-3m-1 5 4-4m-2 3 3 3M21 3l-5 2-3 3m8-5-2 5-2 2M3 21l6-6m-5 1 4 4"/>',
  bag:'<path d="M7 8V6a5 5 0 0 1 10 0v2M4 8h16l1 11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2L4 8Z"/>', coin:'<circle cx="12" cy="12" r="9"/><path d="M9 8h6l-6 8h6"/>',
  map:'<path d="M20 10c0 5-8 10-8 10S4 15 4 10a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>', spark:'<path d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z"/>',
  flame:'<path d="M12 22c-4 0-7-3-7-7 0-3 1.5-5 4-7 0 3 1 4 2 4 2-4 1-7 1-10 5 3 8 8 8 13 0 4-4 7-8 7Z"/>', heart:'<path d="M20 5c-2-2-6-2-8 1-2-3-6-3-8-1-3 3-1 7 1 9l7 6 7-6c2-2 4-6 1-9Z"/>', bolt:'<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  flag:'<path d="M5 22V3m0 1c4-5 10 4 15 0v11c-5 4-11-5-15 0"/>', book:'<path d="M12 5v16m0-16C9 3 5 3 2 4v15c4-1 7 0 10 2 3-2 6-3 10-2V4c-3-1-7-1-10 1Z"/>', save:'<path d="M4 4h13l3 3v13H4V4Zm4 0v6h8V4M8 20v-6h8v6"/>',
  apple:'<path d="M12 7c-2 0-5-2-8 1s0 13 4 13c2 0 2-1 4-1s2 1 4 1c4 0 7-10 4-13s-6-1-8-1Zm0 0c0-3 1-4 4-5"/>', moon:'<path d="M21 13A9 9 0 0 1 11 3a9 9 0 1 0 10 10Z"/>', arrow:'<path d="M4 12h15m-6-6 6 6-6 6"/>',
};
const svg = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]}</svg>`;
const el = id => document.getElementById(id);
for (const node of document.querySelectorAll('[data-icon]')) node.innerHTML = svg(node.dataset.icon);
const routes = {
  lang:['THUNG LŨNG THÚ CƯNG','Làng thú cưng','Nuôi dưỡng người bạn nhỏ và cùng nhau lên đường phiêu lưu!','Đồng Cỏ Ánh Dương','Một ngày đẹp trời để phiêu lưu','Hành động'],
  'dau-truong':['THỬ THÁCH','Đấu trường','So tài cùng những sinh vật trong thung lũng và nhận phần thưởng.','Sân đấu Đồng Cỏ','Chọn đối thủ hoặc bắt đầu trận đấu','Chiến đấu'],
  'tui-do':['VẬT PHẨM','Túi đồ','Xem thức ăn còn lại hoặc ghé quầy mua thêm táo cho thú cưng.','Quầy vật phẩm','Một quả táo giúp thú cưng hồi sức','Vật phẩm & cửa hàng'],
};
const colors = { green:'#8ce2a7', orange:'#ffad72', blue:'#87bfff', red:'#ff8296', purple:'#baa3ff', gold:'#ffcc72' };
let state;
try { state = readSave(localStorage.getItem(STORAGE_KEY)); } catch { state = fresh(); }
function save() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch { el('save-label').textContent = 'Trình duyệt không cho lưu tiến độ'; }
}
const getRoute = () => Object.hasOwn(routes, location.hash.slice(1)) ? location.hash.slice(1) : 'lang';
function button(id,title,desc,icon,tone,disabled=false) {
  return `<button class="action" data-action="${id}" type="button" style="--tone:${colors[tone]}" ${disabled ? 'disabled' : ''}><span class="action-icon">${svg(icon)}</span><span><strong>${title}</strong><small>${desc}</small></span></button>`;
}
function render() {
  const r = getRoute(); const name = petName(state); const battle = state.battle;
  const arena = r === 'dau-truong' || Boolean(battle);
  const view = routes[battle ? 'dau-truong' : r];
  ['place-label','page-title','page-description','scene-label'].forEach((id,i) => el(id).textContent = view[i]);
  el('scene-hint').lastChild.textContent = battle ? ' Chọn đòn đánh để tiếp tục' : ` ${view[4]}`;
  el('action-title').textContent = view[5];
  for (const link of document.querySelectorAll('[data-route]')) link.dataset.route === (battle ? 'dau-truong' : r) ? link.setAttribute('aria-current','page') : link.removeAttribute('aria-current');
  el('coins').textContent = state.coins.toLocaleString('vi-VN');
  el('pet-tag').textContent = el('pet-heading').textContent = name;
  el('level').textContent = `CẤP ${state.level}`;
  el('scene').classList.toggle('fight', arena);
  el('scene').classList.toggle('evolved', state.level >= 4);
  el('enemy').hidden = !arena;
  const opponent = ENEMIES[battle?.id ?? state.opponent];
  el('enemy-tag').textContent = opponent.name;
  el('enemy-icon').textContent = opponent.icon;
  el('enemy-hp').max = opponent.hp;
  el('enemy-hp').value = battle?.hp ?? opponent.hp;
  const full = state.hp === maxHp(state) && state.energy === 100;
  const feed = () => button('feed','Cho ăn',`${state.food} táo · Hồi 18 sinh lực`,'apple','green',!state.food || full);
  const rest = () => button('rest','Nghỉ ngơi','Hồi sinh lực và năng lượng','moon','blue',full);
  let actions;
  if (battle) actions = [button('strike','Tấn công',`${power(state)} sát thương`,'swords','orange'),button('flame','Cầu lửa',`${power(state)+8} sát thương · 8 NL`,'flame','red',state.energy<8),button('flee','Rút lui','Kết thúc trận đấu','arrow','blue')];
  else if (r === 'dau-truong') actions = [button('battle','Bắt đầu trận','Tốn 10 năng lượng','swords','orange',state.hp<12 || state.energy<10),button('next','Đổi đối thủ','Thử sức với quái khác','arrow','purple'),rest()];
  else if (r === 'tui-do') actions = [feed(),button('buy','Mua táo','15 xu / quả','coin','gold',state.coins<15),rest()];
  else actions = [feed(),button('train','Luyện tập','+12 XP · Tốn 15 năng lượng','bolt','orange',state.energy<15),button('arena','Vào đấu trường','Thách đấu quái vật','swords','purple'),rest()];
  el('actions').innerHTML = actions.join('');
  const meters = [['Sinh lực',state.hp,maxHp(state),'heart','red'],['Năng lượng',state.energy,100,'bolt','gold'],['Kinh nghiệm',state.xp,nextLevel(state),'spark','blue']];
  el('meters').innerHTML = meters.map(([title,value,max,icon,tone]) => `<div class="meter" style="--tone:${colors[tone]}"><label for="meter-${icon}"><span>${svg(icon)} ${title}</span><span>${value} / ${max}</span></label><progress id="meter-${icon}" value="${value}" max="${max}"></progress></div>`).join('');
  el('quests').innerHTML = QUESTS.map(q => `<div class="quest"><span>${q.title}</span>${state.claimed[q.key] ? '<span class="claimed">✓ Đã nhận</span>' : state.totals[q.key] >= q.target ? `<button type="button" data-action="claim:${q.key}" ${battle ? 'disabled' : ''} aria-label="Nhận ${q.reward} xu: ${q.title}">+${q.reward} xu</button>` : `<span>${state.totals[q.key]}/${q.target}</span>`}</div>`).join('');
  if (el('journal').dataset.latest !== state.journal.join('\n')) {
    el('journal').dataset.latest = state.journal.join('\n');
    el('journal').replaceChildren(...state.journal.slice(0,3).map(line => Object.assign(document.createElement('li'),{textContent:line})));
  }
}
addEventListener('hashchange', () => {
  if (state.battle && getRoute() !== 'dau-truong') {
    history.replaceState(null,'','#dau-truong');
    el('scene-hint').lastChild.textContent = ' Hãy kết thúc trận đấu hoặc chọn Rút lui';
  } else render();
});
document.addEventListener('click', e => {
  const btn = e.target.closest('button[data-action]');
  if (!btn) return;
  const { action } = btn.dataset;
  if (action === 'arena') { location.hash = 'dau-truong'; return; }
  const keyboard = e.detail === 0;
  const updated = act(state, action);
  if (updated === state) return;
  state = updated; save(); render();
  if (keyboard) {
    const group = el(action.startsWith('claim:') ? 'quests' : 'actions');
    const target = Array.from(group.querySelectorAll('button:not(:disabled)')).find(b => b.dataset.action === action) ?? group.querySelector('button:not(:disabled)') ?? el('actions').querySelector('button:not(:disabled)');
    target?.focus();
  }
});
if (state.battle && getRoute() !== 'dau-truong') history.replaceState(null,'','#dau-truong');
render();
