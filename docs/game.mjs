export const STORAGE_KEY = 'lang-gopet-v1';
export const QUESTS = [
  { key:'fed', title:'Cho Cáo Lửa ăn', target:1, reward:25 },
  { key:'trained', title:'Luyện tập cùng Cáo Lửa', target:2, reward:35 },
  { key:'won', title:'Thắng một trận đấu', target:1, reward:55 },
];
export const ENEMIES = [
  { name:'Mầm Nấm', icon:'🍄', hp:35, atk:7 },
  { name:'Ong Mật', icon:'🐝', hp:47, atk:10 },
  { name:'Rồng Rêu', icon:'🐲', hp:60, atk:13 },
];
export function fresh() {
  return { level:1, xp:0, hp:85, energy:75, coins:120, food:3, training:0, opponent:0, battle:null,
    totals:{ fed:0, trained:0, won:0 }, claimed:{}, journal:['Chào mừng đến làng! Cáo Lửa đang chờ bạn.'] };
}
export const maxHp = s => 100 + 10 * (s.level - 1);
export const nextLevel = s => 40 + 15 * (s.level - 1);
export const power = s => 11 + s.training + 3 * (s.level - 1);
export const petName = s => s.level >= 4 ? 'Cáo Nhật Hỏa' : 'Cáo Lửa';
const log = (s, text) => { s.journal = [text, ...s.journal].slice(0, 8); };
function gain(s, amount) {
  s.xp += amount;
  while (s.xp >= nextLevel(s)) {
    s.xp -= nextLevel(s); s.level++; s.hp = maxHp(s);
    log(s, `${petName(s)} đạt cấp ${s.level}${s.level === 4 ? ' và đã tiến hóa' : ''}!`);
  }
}
export function readSave(text) {
  try {
    const s = JSON.parse(text);
    if (!s || !['level','xp','hp','energy','coins','food','training','opponent'].every(k => Number.isSafeInteger(s[k]) && s[k] >= 0) || s.level < 1 || s.level > 100000 || s.hp > maxHp(s) || s.energy > 100 || s.xp >= nextLevel(s) || s.opponent >= ENEMIES.length || !Array.isArray(s.journal) || !s.journal.every(x => typeof x === 'string') || !s.totals || !s.claimed || !QUESTS.every(q => Number.isSafeInteger(s.totals[q.key]) && s.totals[q.key] >= 0)) return fresh();
    if (s.battle !== null && (!s.battle || !ENEMIES[s.battle.id] || !Number.isSafeInteger(s.battle.hp) || s.battle.hp < 1 || s.battle.hp > ENEMIES[s.battle.id].hp)) return fresh();
    return s;
  } catch { return fresh(); }
}
export function act(previous, action) {
  const s = structuredClone(previous);
  if (s.battle && !['strike','flame','flee'].includes(action)) return previous;
  const name = petName(s);
  switch (action) {
    case 'feed':
      if (!s.food || (s.hp === maxHp(s) && s.energy === 100)) return previous;
      s.food--; s.hp = Math.min(maxHp(s), s.hp + 18); s.energy = Math.min(100, s.energy + 12); s.totals.fed++;
      log(s, `${name} ăn một quả táo và hồi phục thể lực.`); gain(s, 5); break;
    case 'train':
      if (s.energy < 15) return previous;
      s.energy -= 15; s.training++; s.totals.trained++;
      log(s, `${name} luyện tập: +1 sức mạnh, +12 XP.`); gain(s, 12); break;
    case 'rest':
      if (s.energy === 100 && s.hp === maxHp(s)) return previous;
      s.energy = Math.min(100, s.energy + 35); s.hp = Math.min(maxHp(s), s.hp + 30);
      log(s, `${name} nghỉ ngơi và hồi phục thể lực.`); break;
    case 'buy':
      if (s.coins < 15) return previous;
      s.coins -= 15; s.food++;
      log(s, 'Bạn mua một quả táo với 15 xu.'); break;
    case 'next':
      s.opponent = (s.opponent + 1) % ENEMIES.length; break;
    case 'battle':
      if (s.hp < 12 || s.energy < 10) return previous;
      s.energy -= 10; s.battle = { id:s.opponent, hp:ENEMIES[s.opponent].hp };
      log(s, `${name} chạm trán ${ENEMIES[s.opponent].name}!`); break;
    case 'flee':
      if (!s.battle) return previous;
      s.battle = null; log(s, `${name} đã rút lui an toàn.`); break;
    case 'strike': case 'flame': {
      if (!s.battle || (action === 'flame' && s.energy < 8)) return previous;
      const enemy = ENEMIES[s.battle.id];
      const damage = power(s) + (action === 'flame' ? 8 : 0);
      if (action === 'flame') s.energy -= 8;
      s.battle.hp -= damage;
      if (s.battle.hp <= 0) {
        const reward = 20 + 10 * s.battle.id;
        const xp = 18 + 5 * s.battle.id;
        s.battle = null; s.coins += reward; s.food++; s.totals.won++;
        log(s, `Thắng ${enemy.name}! +${reward} xu, +1 táo, +${xp} XP.`); gain(s, xp);
      } else {
        s.hp = Math.max(0, s.hp - enemy.atk);
        if (!s.hp) { s.battle = null; log(s, `${name} đã kiệt sức. Hãy về làng để nghỉ ngơi.`); }
        else log(s, `${name} gây ${damage} sát thương. ${enemy.name} phản công, mất ${enemy.atk} sinh lực.`);
      }
      break;
    }
    default: {
      const q = QUESTS.find(q => action === `claim:${q.key}`);
      if (!q || s.claimed[q.key] || s.totals[q.key] < q.target) return previous;
      s.claimed[q.key] = true; s.coins += q.reward; log(s, `Hoàn thành “${q.title}”: +${q.reward} xu.`);
    }
  }
  return s;
}
