import { useState } from 'react';
import { FlatList, Pressable, Text, TextInput, View } from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  filterPlaces,
  statistics,
  statusLabels,
  type Status,
} from '../core';
import { usePlaces } from '../context/PlacesContext';
import { Action, Badge, Empty, colors, styles } from '../components/ui';
import type { RootStackParams, TabParams } from '../navigation';
type Props = CompositeScreenProps<
  BottomTabScreenProps<TabParams, 'List'>,
  NativeStackScreenProps<RootStackParams>
>;
export function ListScreen({ navigation }: Props) {
  const { places } = usePlaces();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState<Status | 'all'>('all');
  const stats = statistics(places);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <FlatList
        data={filterPlaces(places, query, status)}
        keyExtractor={(p) => p.id}
        contentContainerStyle={styles.content}
        ListHeaderComponent={
          <View style={{ gap: 20 }}>
            <Text style={[styles.title, { fontSize: 30, color: colors.green }]}>
              passo.
            </Text>
            <View>
              <Text style={styles.eyebrow}>SEU DIÁRIO DE VIAGENS</Text>
              <Text style={styles.heading}>Cada lugar, uma história.</Text>
              <Text style={styles.muted}>
                Guarde o que viveu. Sonhe com o que ainda vem.
              </Text>
            </View>
            <View style={[styles.panel, { backgroundColor: '#e9eee2' }]}>
              <Text style={styles.title}>
                O mundo espera seu próximo passo.
              </Text>
              <Text style={styles.muted}>
                {stats.total} lugares · {stats.visited} visitados ·{' '}
                {stats.cities.length} cidades
              </Text>
              <Action
                title="+ Adicionar lugar"
                onPress={() => navigation.navigate('Form')}
              />
            </View>
            <TextInput
              style={styles.input}
              value={query}
              onChangeText={setQuery}
              placeholder="Buscar lugar ou cidade…"
              placeholderTextColor={colors.muted}
              accessibilityLabel="Buscar lugar ou cidade"
            />
            <View style={styles.row}>
              {(['all', 'wishlist', 'visited'] as const).map((value) => (
                <Pressable
                  key={value}
                  accessibilityRole="button"
                  accessibilityState={{ selected: status === value }}
                  onPress={() => setStatus(value)}
                  style={{
                    backgroundColor: status === value ? '#dce8d6' : '#eeefe7',
                    padding: 12,
                    borderRadius: 7,
                  }}
                >
                  <Text
                    style={{
                      color: status === value ? colors.green : colors.muted,
                      fontSize: 11,
                    }}
                  >
                    {value === 'all' ? 'Todos' : statusLabels[value]}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <Empty
            title={
              places.length
                ? 'Nada por aqui.'
                : 'Um diário inteiro pela frente.'
            }
            text={
              places.length
                ? 'Tente outra busca ou altere o filtro.'
                : 'Adicione um lugar para guardar sua primeira história.'
            }
          />
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.name}, ${item.city}, ${statusLabels[item.status]}. Ver detalhes`}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            style={styles.card}
          >
            <Image
              source={{ uri: item.photo }}
              style={styles.photo}
              contentFit="cover"
              accessibilityLabel={item.name}
            />
            <View style={styles.cardBody}>
              <Badge status={item.status} />
              <Text style={styles.muted}>
                ⌖ {item.city}, {item.state}
              </Text>
              <Text style={styles.title}>{item.name}</Text>
              <Text numberOfLines={2} style={styles.muted}>
                {item.description}
              </Text>
              <Text style={{ fontSize: 11, color: colors.green }}>
                Ver essa história ↗
              </Text>
            </View>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}
