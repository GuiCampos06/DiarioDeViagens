import { Pressable, StyleSheet, Text, View } from 'react-native';
import { statusColors, statusLabels, type Status } from '../core';
export const colors = {
  background: '#f7f6f2',
  white: '#ffffff',
  ink: '#223b34',
  muted: '#788673',
  green: '#197264',
  line: '#e1e6da',
};
export function Action({
  title,
  onPress,
  secondary = false,
  danger = false,
  disabled = false,
}: {
  title: string;
  onPress(): void;
  secondary?: boolean;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        secondary && styles.secondary,
        danger && { backgroundColor: '#f9eae1' },
        { opacity: disabled ? 0.5 : pressed ? 0.75 : 1 },
      ]}
    >
      <Text
        style={[
          styles.buttonText,
          secondary && { color: colors.ink },
          danger && { color: '#975b42' },
        ]}
      >
        {title}
      </Text>
    </Pressable>
  );
}
export function Badge({ status }: { status: Status }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: status === 'visited' ? '#e7efe5' : '#f4ecd8' },
      ]}
    >
      <Text
        style={{ color: statusColors[status], fontSize: 11, fontWeight: '600' }}
      >
        ● {statusLabels[status]}
      </Text>
    </View>
  );
}
export function Empty({ title, text }: { title: string; text: string }) {
  return (
    <View style={styles.empty}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.muted}>{text}</Text>
    </View>
  );
}
export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: 22, gap: 18, paddingBottom: 35 },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 15,
  },
  eyebrow: {
    color: '#829375',
    fontSize: 10,
    letterSpacing: 2,
    fontWeight: '700',
  },
  heading: {
    color: colors.ink,
    fontSize: 31,
    fontWeight: '700',
    letterSpacing: -1.2,
    marginTop: 7,
  },
  title: {
    color: colors.ink,
    fontSize: 21,
    fontWeight: '600',
    letterSpacing: -0.6,
  },
  muted: { fontSize: 13, color: colors.muted, lineHeight: 21 },
  button: {
    minHeight: 46,
    backgroundColor: colors.green,
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 13,
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondary: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  buttonText: { fontSize: 13, fontWeight: '600', color: colors.white },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  card: {
    backgroundColor: colors.white,
    borderColor: colors.line,
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardBody: { padding: 19, gap: 10 },
  photo: { width: '100%', height: 210, backgroundColor: '#e3e9dd' },
  badge: {
    borderRadius: 6,
    alignSelf: 'flex-start',
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  input: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: colors.ink,
    minHeight: 46,
  },
  label: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  error: {
    padding: 16,
    backgroundColor: '#fff0e5',
    color: '#925c37',
    fontSize: 13,
    lineHeight: 21,
    borderRadius: 8,
  },
  empty: {
    padding: 25,
    gap: 12,
    alignItems: 'center',
    backgroundColor: '#eef2e6',
    borderRadius: 12,
  },
  panel: {
    padding: 22,
    gap: 18,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
  },
});
