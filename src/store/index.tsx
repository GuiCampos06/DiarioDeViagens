import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { type Place } from '../core';
import { PlaceRepository, type Storage } from './repository';
export type { Storage } from './repository';
type Diary = {
  places: Place[];
  ready: boolean;
  error: string | null;
  save(place: Place): Promise<void>;
  remove(id: string): Promise<void>;
  markVisited(id: string): Promise<void>;
};
const Context = createContext<Diary | null>(null);

export function PlacesProvider({
  storage,
  children,
}: {
  storage: Storage;
  children: ReactNode;
}) {
  const [repository] = useState(() => new PlaceRepository(storage));
  const [places, setPlaces] = useState<Place[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    repository
      .load()
      .then((data) => {
        if (active) {
          setPlaces(data);
          setReady(true);
        }
      })
      .catch(() => {
        if (active)
          setError(
            'Não foi possível ler o diário. Os dados originais foram preservados. Verifique o armazenamento e reabra o aplicativo.',
          );
      });
    return () => {
      active = false;
    };
  }, [repository]);
  async function commit(change: (current: Place[]) => Place[]) {
    setPlaces(await repository.update(change));
  }
  return (
    <Context.Provider
      value={{
        places,
        ready,
        error,
        save: (place) =>
          commit((current) =>
            current.some((p) => p.id === place.id)
              ? current.map((p) => (p.id === place.id ? place : p))
              : [place, ...current],
          ),
        remove: (id) => commit((current) => current.filter((p) => p.id !== id)),
        markVisited: (id) =>
          commit((current) =>
            current.map((p) => (p.id === id ? { ...p, status: 'visited' } : p)),
          ),
      }}
    >
      {children}
    </Context.Provider>
  );
}

export function usePlaces() {
  const context = useContext(Context);
  if (!context) throw new Error('usePlaces precisa de PlacesProvider.');
  return context;
}
