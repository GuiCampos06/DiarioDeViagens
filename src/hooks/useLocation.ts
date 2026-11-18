import { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import type { Coordinates } from '../core';
export function useLocation(enabled: boolean) {
  const [coordinates, setCoordinates] = useState<Coordinates>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [requestId, setRequestId] = useState(0);
  useEffect(() => {
    if (!enabled) return;
    let active = true;
    let subscription: Location.LocationSubscription | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;
    async function start() {
      try {
        const permission = await Location.requestForegroundPermissionsAsync();
        if (!active) return;
        setLoading(true);
        setError('');
        if (!permission.granted)
          throw new Error(
            'Localização negada. Permita o acesso nas configurações do dispositivo para mostrar sua posição.',
          );
        timer = setTimeout(() => {
          if (active) {
            setLoading(false);
            setError(
              'O GPS não respondeu. Confira se está ativado e tente novamente.',
            );
          }
        }, 15000);
        subscription = await Location.watchPositionAsync(
          { accuracy: Location.Accuracy.Balanced, distanceInterval: 20 },
          (position) => {
            if (active) {
              clearTimeout(timer);
              setCoordinates(position.coords);
              setLoading(false);
              setError('');
            }
          },
        );
        if (!active) subscription.remove();
      } catch (e) {
        if (active) {
          clearTimeout(timer);
          setError(
            e instanceof Error
              ? e.message
              : 'Não foi possível obter sua posição. Confira o GPS e tente novamente.',
          );
          setLoading(false);
        }
      }
    }
    void start();
    return () => {
      active = false;
      clearTimeout(timer);
      subscription?.remove();
    };
  }, [enabled, requestId]);
  return {
    coordinates,
    error,
    loading,
    refresh: () => {
      setLoading(true);
      setError('');
      setRequestId((current) => current + 1);
    },
  };
}
