import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ActivityIndicator, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PlacesProvider, usePlaces } from './src/store';
import { ListScreen } from './src/screens/ListScreen';
import { FormScreen } from './src/screens/FormScreen';
import { DetailScreen } from './src/screens/DetailScreen';
import { MapScreen } from './src/screens/MapScreen';
import { StatsScreen } from './src/screens/StatsScreen';
import { colors, styles } from './src/components/ui';
import type { RootStackParams, TabParams } from './src/navigation';
const Stack = createNativeStackNavigator<RootStackParams>();
const Tabs = createBottomTabNavigator<TabParams>();
const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: colors.green,
    background: colors.background,
    card: colors.white,
    text: colors.ink,
    border: colors.line,
  },
};
function Home() {
  return (
    <Tabs.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarStyle: { backgroundColor: colors.white },
        tabBarLabelStyle: { fontSize: 11 },
      }}
    >
      <Tabs.Screen
        name="List"
        component={ListScreen}
        options={{
          title: 'Meu diário',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>☷</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Map"
        component={MapScreen}
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>⌖</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="Stats"
        component={StatsScreen}
        options={{
          title: 'Estatísticas',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 22 }}>◔</Text>
          ),
        }}
      />
    </Tabs.Navigator>
  );
}
function Diary() {
  const { ready, error } = usePlaces();
  if (error)
    return (
      <View style={[styles.center, { padding: 28 }]}>
        <Text accessibilityRole="alert" style={styles.error}>
          {error}
        </Text>
      </View>
    );
  if (!ready)
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.green} />
        <Text style={styles.muted}>Abrindo seu diário…</Text>
      </View>
    );
  return (
    <NavigationContainer theme={theme}>
      <Stack.Navigator
        screenOptions={{
          headerTintColor: colors.ink,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: colors.background },
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen
          name="Home"
          component={Home}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Form"
          component={FormScreen}
          options={({ route }) => ({
            title: route.params?.id ? 'Editar lugar' : 'Novo lugar',
          })}
        />
        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{ title: 'Uma história no mundo' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <PlacesProvider storage={AsyncStorage}>
        <StatusBar style="dark" />
        <Diary />
      </PlacesProvider>
    </SafeAreaProvider>
  );
}
