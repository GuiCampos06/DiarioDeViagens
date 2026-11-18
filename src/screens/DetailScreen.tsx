import { useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import MapView, { Marker } from 'react-native-maps';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { fullAddress } from '../core';
import { usePlaces } from '../context/PlacesContext';
import { Action, Badge, styles } from '../components/ui';
import type { RootStackParams } from '../navigation';
export function DetailScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Detail'>) {
  const { places, remove, markVisited } = usePlaces();
  const place = places.find((p) => p.id === route.params.id);
  const [busy, setBusy] = useState(false);
  async function change(kind: 'visit' | 'delete') {
    if (!place) return;
    setBusy(true);
    try {
      if (kind === 'visit') await markVisited(place.id);
      else {
        await remove(place.id);
        navigation.popToTop();
      }
    } catch {
      Alert.alert(
        'Alteração não salva',
        'Verifique o espaço de armazenamento e tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  if (!place)
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Lugar não encontrado.</Text>
      </View>
    );
  return (
    <SafeAreaView style={styles.screen} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.content}>
        <Image
          source={{ uri: place.photo }}
          style={[styles.photo, { height: 280, borderRadius: 12 }]}
          contentFit="cover"
          accessibilityLabel={place.name}
        />
        <Badge status={place.status} />
        <Text style={styles.heading}>{place.name}</Text>
        <Text style={styles.muted}>
          ⌖ {place.city}, {place.state}
        </Text>
        <Text style={[styles.muted, { fontSize: 16, lineHeight: 26 }]}>
          {place.description}
        </Text>
        <View style={styles.panel}>
          <Text style={styles.eyebrow}>UM PONTO NO MUNDO</Text>
          <Text style={styles.muted}>{fullAddress(place)}</Text>
          <MapView
            style={{ width: '100%', height: 200, borderRadius: 8 }}
            initialRegion={{
              latitude: place.latitude,
              longitude: place.longitude,
              latitudeDelta: 0.015,
              longitudeDelta: 0.015,
            }}
          >
            <Marker coordinate={place} title={place.name} />
          </MapView>
          <Text style={styles.muted}>
            {place.latitude.toFixed(5)}, {place.longitude.toFixed(5)}
          </Text>
        </View>
        <Text style={styles.muted}>
          Guardado em{' '}
          {new Intl.DateTimeFormat('pt-BR', { dateStyle: 'long' }).format(
            new Date(place.createdAt),
          )}
        </Text>
        {place.status === 'wishlist' ? (
          <Action
            title="✓ Marcar como visitado"
            disabled={busy}
            onPress={() => void change('visit')}
          />
        ) : null}
        <Action
          title="Editar lugar"
          secondary
          disabled={busy}
          onPress={() => navigation.navigate('Form', { id: place.id })}
        />
        <Action
          title="Remover lugar"
          danger
          disabled={busy}
          onPress={() =>
            Alert.alert(
              'Remover lugar?',
              `“${place.name}” será removido do diário. A foto na galeria será mantida.`,
              [
                { text: 'Cancelar', style: 'cancel' },
                {
                  text: 'Remover',
                  style: 'destructive',
                  onPress: () => void change('delete'),
                },
              ],
            )
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
}
