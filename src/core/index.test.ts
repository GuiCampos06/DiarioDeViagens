import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  emptyDraft,
  filterPlaces,
  fullAddress,
  parsePlaces,
  serializePlaces,
  statistics,
  validCoordinates,
  validateDraft,
  type Place,
} from './index.ts';
const place: Place = {
  ...emptyDraft,
  id: '1',
  name: 'Praça',
  description: 'Uma memória',
  street: 'Rua Um',
  number: '10',
  city: 'São Paulo',
  state: 'SP',
  photo: 'https://example.com/p.jpg',
  latitude: 0,
  longitude: 0,
  createdAt: '2026-11-14T12:00:00Z',
};
test('validates required fields, photo, status and coordinates including zero', () => {
  assert.equal(validateDraft(place), null);
  assert.ok(validateDraft({ ...place, city: ' ' }));
  assert.ok(validateDraft({ ...place, photo: 'javascript:alert(1)' }));
  assert.equal(validCoordinates(place), true);
  assert.equal(validCoordinates({ latitude: NaN, longitude: 0 }), false);
  assert.equal(validCoordinates({ latitude: 91, longitude: 0 }), false);
  assert.match(fullAddress(place), /Rua Um, 10, São Paulo, SP, Brasil/);
});
test('filters without accents and computes both charts from the current records', () => {
  const records = [
    place,
    { ...place, id: '2', city: 'são paulo', status: 'visited' as const },
  ];
  assert.equal(filterPlaces(records, 'sao', 'all').length, 2);
  assert.equal(filterPlaces(records, '', 'visited').length, 1);
  assert.deepEqual(statistics([]), {
    total: 0,
    visited: 0,
    wishlist: 0,
    cities: [],
  });
  assert.deepEqual(statistics(records), {
    total: 2,
    visited: 1,
    wishlist: 1,
    cities: [{ label: 'São Paulo, SP', value: 2 }],
  });
});
test('versioned persistence rejects corrupted records and duplicate ids', () => {
  assert.deepEqual(parsePlaces(serializePlaces([place])), [place]);
  assert.deepEqual(parsePlaces(null), []);
  for (const raw of [
    'bad json',
    '{"version":2,"places":[]}',
    serializePlaces([place, place]),
    serializePlaces([{ ...place, latitude: Infinity }]),
  ]) {
    assert.throws(() => parsePlaces(raw));
  }
});
