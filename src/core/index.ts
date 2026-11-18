export type Status = 'wishlist' | 'visited';
export type Coordinates = { latitude: number; longitude: number };
export type PlaceDraft = {
  name: string;
  description: string;
  street: string;
  number: string;
  city: string;
  state: string;
  status: Status;
  photo: string;
};
export type Place = PlaceDraft &
  Coordinates & { id: string; createdAt: string };
export const statusLabels = { wishlist: 'Quero visitar', visited: 'Visitado' };
export const statusColors = { wishlist: '#d59a41', visited: '#197264' };
export const emptyDraft: PlaceDraft = {
  name: '',
  description: '',
  street: '',
  number: '',
  city: '',
  state: '',
  status: 'wishlist',
  photo: '',
};

export function validateDraft(draft: PlaceDraft): string | null {
  for (const key of [
    'name',
    'description',
    'street',
    'number',
    'city',
    'state',
  ] as const) {
    if (typeof draft[key] !== 'string' || !draft[key].trim())
      return 'Preencha todos os campos do lugar.';
    if (draft[key].length > (key === 'description' ? 2000 : 150))
      return 'Um dos campos ultrapassou o tamanho permitido.';
  }
  if (!['wishlist', 'visited'].includes(draft.status))
    return 'Selecione um status válido.';
  if (!isPhoto(draft.photo))
    return 'Adicione uma foto válida para guardar essa memória.';
  return null;
}

export function isPhoto(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.length < 4_000_000 &&
    /^(https:\/\/|file:\/\/|content:\/\/|data:image\/(jpeg|png|webp);base64,)/i.test(
      value,
    )
  );
}

export function validCoordinates(value: Coordinates): boolean {
  return (
    Number.isFinite(value.latitude) &&
    Math.abs(value.latitude) <= 90 &&
    Number.isFinite(value.longitude) &&
    Math.abs(value.longitude) <= 180
  );
}

export function fullAddress(
  place: Pick<PlaceDraft, 'street' | 'number' | 'city' | 'state'>,
): string {
  return `${place.street.trim()}, ${place.number.trim()}, ${place.city.trim()}, ${place.state.trim()}, Brasil`;
}

export function cleanDraft(draft: PlaceDraft): PlaceDraft {
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    street: draft.street.trim(),
    number: draft.number.trim(),
    city: draft.city.trim(),
    state: draft.state.trim().toUpperCase(),
    status: draft.status,
    photo: draft.photo,
  };
}

export function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export function filterPlaces(
  places: Place[],
  query: string,
  status: Status | 'all',
): Place[] {
  const text = normalize(query);
  return places.filter(
    (p) =>
      (status === 'all' || p.status === status) &&
      normalize(`${p.name} ${p.city} ${p.state}`).includes(text),
  );
}

export function statistics(places: Place[]) {
  const cities = new Map<string, { label: string; value: number }>();
  let visited = 0;
  for (const place of places) {
    if (place.status === 'visited') visited++;
    const label = `${place.city}, ${place.state}`;
    const key = normalize(label);
    const city = cities.get(key);
    if (city) city.value++;
    else cities.set(key, { label, value: 1 });
  }
  return {
    total: places.length,
    visited,
    wishlist: places.length - visited,
    cities: [...cities.values()].sort(
      (a, b) => b.value - a.value || a.label.localeCompare(b.label, 'pt-BR'),
    ),
  };
}

export function parsePlaces(raw: string | null): Place[] {
  if (raw === null) return [];
  const data: unknown = JSON.parse(raw);
  if (
    !data ||
    typeof data !== 'object' ||
    !('version' in data) ||
    data.version !== 1 ||
    !('places' in data) ||
    !Array.isArray(data.places)
  )
    throw new Error(
      'Formato de diário inválido. Seus dados foram preservados.',
    );
  const ids = new Set<string>();
  for (const p of data.places) {
    if (
      !p ||
      typeof p !== 'object' ||
      validateDraft(p) ||
      !validCoordinates(p) ||
      typeof p.id !== 'string' ||
      !p.id ||
      ids.has(p.id) ||
      typeof p.createdAt !== 'string' ||
      !Number.isFinite(Date.parse(p.createdAt))
    )
      throw new Error(
        'Diário com dados inválidos. O arquivo original foi preservado.',
      );
    ids.add(p.id);
  }
  return data.places as Place[];
}

export function serializePlaces(places: Place[]): string {
  return JSON.stringify({ version: 1, places });
}
