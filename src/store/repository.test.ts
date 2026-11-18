import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyDraft, type Place } from '../core';
import { PlaceRepository } from './repository.ts';
const place: Place = {
  ...emptyDraft,
  id: '1',
  name: 'Museu',
  description: 'Arte',
  street: 'Rua A',
  number: '1',
  city: 'Franca',
  state: 'SP',
  photo: 'file:///photo.jpg',
  latitude: -20.5,
  longitude: -47.4,
  createdAt: new Date().toISOString(),
};
test('serializes simultaneous changes and keeps memory unchanged when storage fails', async () => {
  let saved: string | null = null;
  let fail = false;
  const repo = new PlaceRepository({
    async getItem() {
      return saved;
    },
    async setItem(_key, value) {
      if (fail) throw new Error('disk full');
      saved = value;
    },
  });
  await assert.rejects(repo.update((p) => p));
  await repo.load();
  await Promise.all([
    repo.update((p) => [...p, place]),
    repo.update((p) => [...p, { ...place, id: '2' }]),
  ]);
  assert.equal(JSON.parse(saved!).places.length, 2);
  fail = true;
  await assert.rejects(repo.update(() => []));
  fail = false;
  const remaining = await repo.update((p) => p.filter((x) => x.id !== '1'));
  assert.equal(remaining.length, 1);
  assert.equal(remaining[0].id, '2');
});
test('does not overwrite corrupt storage', async () => {
  let writes = 0;
  const repo = new PlaceRepository({
    async getItem() {
      return 'broken';
    },
    async setItem() {
      writes++;
    },
  });
  await assert.rejects(repo.load());
  await assert.rejects(repo.update(() => []));
  assert.equal(writes, 0);
});
