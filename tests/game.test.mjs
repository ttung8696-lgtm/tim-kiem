import test from 'node:test';
import assert from 'node:assert/strict';
import { act, fresh, readSave, petName } from '../docs/game.mjs';

test('feeding restores health and the quest can be claimed once', () => {
  const start = fresh();
  const fed = act(start, 'feed');
  assert.equal(start.hp, 85);
  assert.equal(fed.hp, 100);
  assert.equal(fed.food, 2);
  const claimed = act(fed, 'claim:fed');
  assert.equal(claimed.coins, 145);
  assert.equal(act(claimed, 'claim:fed'), claimed);
});
test('arena supports active turns, saving a battle, and victory rewards', () => {
  const start = act(fresh(), 'battle');
  assert.equal(act(start, 'rest'), start);
  const turn = act(start, 'flame');
  assert.equal(turn.battle.hp, 16);
  assert.equal(turn.hp, 78);
  assert.deepEqual(readSave(JSON.stringify(turn)), turn);
  const win = act(turn, 'flame');
  assert.equal(win.battle, null);
  assert.equal(win.totals.won, 1);
  assert.equal(win.coins, 140);
});
test('an exhausted pet can recover, and training advances evolution', () => {
  const weak = {...fresh(), hp:12, opponent:2};
  const loss = act(act(weak, 'battle'), 'strike');
  assert.equal(loss.hp, 0);
  assert.equal(loss.battle, null);
  assert.equal(act(loss, 'rest').hp, 30);
  let s = fresh();
  while (s.level < 4) s = act(s, s.energy < 15 ? 'rest' : 'train');
  assert.equal(petName(s), 'Cáo Nhật Hỏa');
  assert.deepEqual(readSave('{broken'), fresh());
});
