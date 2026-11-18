import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { Directory, File, Paths } from 'expo-file-system';
import { randomUUID } from 'expo-crypto';
export async function pickPhoto(camera: boolean): Promise<string | null> {
  const permission = camera
    ? await ImagePicker.requestCameraPermissionsAsync()
    : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!permission.granted)
    throw new Error(
      `${camera ? 'Câmera' : 'Galeria'} sem permissão. Autorize o acesso nas configurações do aplicativo e tente novamente.`,
    );
  if (
    camera &&
    !(await MediaLibrary.requestPermissionsAsync(true, ['photo'])).granted
  )
    throw new Error('Permita salvar fotos na galeria antes de tirar uma foto.');
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [4, 3],
    quality: 0.75,
  };
  const result = camera
    ? await ImagePicker.launchCameraAsync(options)
    : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled || !result.assets[0]) return null;
  const uri = result.assets[0].uri;
  if (camera) await MediaLibrary.Asset.create(uri);
  const directory = new Directory(Paths.document, 'diary-photos');
  directory.create({ idempotent: true, intermediates: true });
  const source = new File(uri);
  const destination = new File(
    directory,
    `${randomUUID()}${source.extension || '.jpg'}`,
  );
  source.copy(destination);
  // shortcut: unlinked photos stay in app storage; add collection if storage use becomes significant.
  return destination.uri;
}
