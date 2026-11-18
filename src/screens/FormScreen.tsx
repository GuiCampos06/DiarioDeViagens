import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { usePreventRemove } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import * as Location from 'expo-location';
import { randomUUID } from 'expo-crypto';
import {
  cleanDraft,
  emptyDraft,
  fullAddress,
  validateDraft,
  validCoordinates,
  type PlaceDraft,
} from '../core';
import { usePlaces } from '../context/PlacesContext';
import { Action, colors, styles } from '../components/ui';
import { pickPhoto } from '../services/photos';
import type { RootStackParams } from '../navigation';
const fields = [
  { key: 'name', label: 'Nome do lugar', placeholder: 'Ex.: Jardim Botânico' },
  {
    key: 'description',
    label: 'Sua história',
    placeholder: 'O que faz esse lugar especial?',
  },
  { key: 'street', label: 'Rua', placeholder: 'Nome da rua' },
  { key: 'number', label: 'Número', placeholder: 'Número ou s/n' },
  { key: 'city', label: 'Cidade', placeholder: 'Cidade do lugar' },
  { key: 'state', label: 'Estado / UF', placeholder: 'Ex.: SP' },
] as const;
export function FormScreen({
  route,
  navigation,
}: NativeStackScreenProps<RootStackParams, 'Form'>) {
  const { places, save } = usePlaces();
  const place = places.find((p) => p.id === route.params?.id);
  const [draft, setDraft] = useState<PlaceDraft>(place ?? { ...emptyDraft });
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  usePreventRemove(dirty && !saved, ({ data }) => {
    if (!busy)
      Alert.alert('Descartar alterações?', 'Este lugar ainda não foi salvo.', [
        { text: 'Continuar editando', style: 'cancel' },
        {
          text: 'Descartar',
          style: 'destructive',
          onPress: () => navigation.dispatch(data.action),
        },
      ]);
  });
  function field(key: keyof PlaceDraft, value: string) {
    setDraft((p) => ({ ...p, [key]: value }));
    setDirty(true);
  }
  async function photo(camera: boolean) {
    setBusy(true);
    setError('');
    try {
      const uri = await pickPhoto(camera);
      if (uri) {
        field('photo', uri);
        if (camera)
          Alert.alert(
            'Foto guardada',
            'A foto também foi salva na galeria do dispositivo.',
          );
      }
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : 'Não foi possível abrir ou salvar a foto. Tente novamente.',
      );
    } finally {
      setBusy(false);
    }
  }
  async function submit() {
    const invalid = validateDraft(draft);
    if (invalid) {
      setError(invalid);
      Alert.alert('Confira o cadastro', invalid);
      return;
    }
    setBusy(true);
    setError('');
    try {
      const clean = cleanDraft(draft);
      let coordinates = place
        ? { latitude: place.latitude, longitude: place.longitude }
        : undefined;
      if (!place || fullAddress(place) !== fullAddress(clean)) {
        if (!(await Location.requestForegroundPermissionsAsync()).granted)
          throw new Error(
            'Permita a localização nas configurações do dispositivo para converter o endereço em coordenadas.',
          );
        const found = await Location.geocodeAsync(fullAddress(clean));
        if (!found[0] || !validCoordinates(found[0]))
          throw new Error(
            'Endereço não encontrado. Confira rua, número, cidade e estado. O lugar não foi cadastrado.',
          );
        coordinates = found[0];
      }
      if (!coordinates)
        throw new Error('O lugar precisa de coordenadas válidas.');
      await save({
        ...clean,
        ...coordinates,
        id: place?.id ?? randomUUID(),
        createdAt: place?.createdAt ?? new Date().toISOString(),
      });
      setSaved(true);
    } catch (e) {
      const message =
        e instanceof Error
          ? e.message
          : 'Não foi possível salvar. Confira sua conexão e o armazenamento.';
      setError(message);
      Alert.alert('Não foi possível guardar o lugar', message);
    } finally {
      setBusy(false);
    }
  }
  if (saved)
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Lugar guardado!</Text>
        <Action
          title="Voltar ao diário"
          onPress={() => navigation.popToTop()}
        />
      </View>
    );
  if (route.params?.id && !place)
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Lugar não encontrado.</Text>
      </View>
    );
  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.screen}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.eyebrow}>UM NOVO CAPÍTULO</Text>
          <Text style={styles.heading}>
            {place
              ? 'Editar uma memória.'
              : 'Onde começa sua próxima história?'}
          </Text>
          {fields.map(({ key, label, placeholder }) => (
            <View key={key}>
              <Text style={styles.label}>{label}</Text>
              <TextInput
                accessibilityLabel={label}
                editable={!busy}
                style={[
                  styles.input,
                  key === 'description' && {
                    minHeight: 100,
                    textAlignVertical: 'top',
                  },
                ]}
                value={draft[key]}
                onChangeText={(value) => field(key, value)}
                placeholder={placeholder}
                placeholderTextColor={colors.muted}
                maxLength={key === 'description' ? 2000 : 150}
                multiline={key === 'description'}
                autoCapitalize={key === 'state' ? 'characters' : 'sentences'}
              />
            </View>
          ))}
          <Text style={styles.label}>Status</Text>
          <View style={styles.row}>
            <Action
              title="Quero visitar"
              secondary={draft.status !== 'wishlist'}
              disabled={busy}
              onPress={() => field('status', 'wishlist')}
            />
            <Action
              title="Visitado"
              secondary={draft.status !== 'visited'}
              disabled={busy}
              onPress={() => field('status', 'visited')}
            />
          </View>
          <Text style={styles.label}>Uma foto para lembrar</Text>
          {draft.photo ? (
            <Image
              source={{ uri: draft.photo }}
              style={[styles.photo, { borderRadius: 10 }]}
              accessibilityLabel="Foto do lugar"
              contentFit="cover"
            />
          ) : (
            <View style={styles.empty}>
              <Text style={styles.muted}>
                Adicione uma foto da câmera ou da galeria.
              </Text>
            </View>
          )}
          <View style={styles.row}>
            <Action
              title="Tirar foto"
              secondary
              disabled={busy}
              onPress={() => void photo(true)}
            />
            <Action
              title="Escolher da galeria"
              secondary
              disabled={busy}
              onPress={() => void photo(false)}
            />
          </View>
          <Text style={styles.muted}>
            Endereços no Brasil. O lugar só é salvo depois que o endereço é
            encontrado no mapa.
          </Text>
          {error ? (
            <Text accessibilityRole="alert" style={styles.error}>
              {error}
            </Text>
          ) : null}
          <Action
            title={busy ? 'Preparando e salvando…' : 'Guardar lugar'}
            onPress={() => void submit()}
            disabled={busy}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
