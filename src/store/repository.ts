import {
  parsePlaces,
  serializePlaces,
  validateDraft,
  validCoordinates,
  type Place,
} from '../core';
export interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
}
export const STORAGE_KEY = 'diario-de-viagens:v1';

export class PlaceRepository {
  private places: Place[] = [];
  private loaded = false;
  private pending: Promise<unknown> = Promise.resolve();
  constructor(private storage: Storage) {}
  async load() {
    const places = parsePlaces(await this.storage.getItem(STORAGE_KEY));
    this.places = places;
    this.loaded = true;
    return places;
  }
  update(change: (places: Place[]) => Place[]): Promise<Place[]> {
    const operation = this.pending.then(async () => {
      if (!this.loaded)
        throw new Error(
          'Não foi possível abrir o diário. Reabra o aplicativo antes de alterar os dados.',
        );
      const next = change(this.places);
      for (const place of next) {
        const error = validateDraft(place);
        if (error || !validCoordinates(place))
          throw new Error(error || 'O lugar precisa de coordenadas válidas.');
      }
      await this.storage.setItem(STORAGE_KEY, serializePlaces(next));
      this.places = next;
      return next;
    });
    // A failed write must not block a later retry or replace the last saved state.
    this.pending = operation.catch(() => {});
    return operation;
  }
}
