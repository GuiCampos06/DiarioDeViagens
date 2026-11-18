import { useCallback, useEffect, useRef } from 'react';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import {
  useIsFocused,
  type CompositeScreenProps,
} from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { statusColors } from '../core';
import { usePlaces } from '../context/PlacesContext';
import { useLocation } from '../hooks/useLocation';
import { Action, styles } from '../components/ui';
import type { RootStackParams, TabParams } from '../navigation';
type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParams, 'Map'>,
  NativeStackScreenProps<RootStackParams>
>;
export function MapScreen({ navigation }: Props) {
  const { places } = usePlaces();
  const focused = useIsFocused();
  const { coordinates, error, loading, refresh } = useLocation(focused);
  const map = useRef<MapView>(null);
  const mapReady = useRef(false);
  const fit = useCallback(() => {
    if (!mapReady.current) return;
    const points = places.map((p) => ({
      latitude: p.latitude,
      longitude: p.longitude,
    }));
    if (coordinates) points.push(coordinates);
    if (points.length)
      map.current?.fitToCoordinates(points, {
        edgePadding: { top: 60, right: 60, bottom: 60, left: 60 },
        animated: true,
      });
  }, [places, coordinates]);
  useEffect(() => {
    if (focused) fit();
  }, [fit, focused]);
  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={{ padding: 22, gap: 10 }}>
        <Text style={styles.eyebrow}>CONEXÕES PELO CAMINHO</Text>
        <Text style={styles.heading}>O mundo no seu mapa.</Text>
        <Text style={styles.muted}>
          Toque em um marcador para abrir a história.
        </Text>
      </View>
      {error ? (
        <Text
          accessibilityRole="alert"
          style={[styles.error, { marginHorizontal: 22, marginBottom: 15 }]}
        >
          {error}
        </Text>
      ) : null}
      <MapView
        ref={map}
        style={{ flex: 1 }}
        initialRegion={{
          latitude: -15.78,
          longitude: -47.92,
          latitudeDelta: 35,
          longitudeDelta: 35,
        }}
        onMapReady={() => {
          mapReady.current = true;
          fit();
        }}
      >
        {places.map((p) => (
          <Marker
            key={p.id}
            coordinate={p}
            title={p.name}
            description={`${p.city}, ${p.state}`}
            pinColor={statusColors[p.status]}
            onPress={() => navigation.navigate('Detail', { id: p.id })}
          />
        ))}
        {coordinates ? (
          <Marker
            coordinate={coordinates}
            title="Você está aqui"
            pinColor="#3877cd"
          />
        ) : null}
      </MapView>
      <View style={{ padding: 18, gap: 12 }}>
        <Text style={styles.muted}>
          ● Visitado (verde) · Quero visitar (amarelo)
        </Text>
        {!places.length ? (
          <Text style={styles.muted}>
            Adicione lugares para começar a preencher seu mapa.
          </Text>
        ) : null}
        <Action
          title={loading ? 'Aguardando GPS…' : 'Atualizar minha localização'}
          secondary
          disabled={loading}
          onPress={() => void refresh()}
        />
      </View>
    </SafeAreaView>
  );
}
