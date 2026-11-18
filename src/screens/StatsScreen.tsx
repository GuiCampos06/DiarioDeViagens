import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PieChart, BarChart, Grid } from 'react-native-svg-charts';
import { statistics, statusColors } from '../core';
import { usePlaces } from '../context/PlacesContext';
import { Empty, colors, styles } from '../components/ui';
export function StatsScreen() {
  const { places } = usePlaces();
  const stats = statistics(places);
  const slices = [
    {
      key: 'visited',
      value: stats.visited,
      svg: { fill: statusColors.visited },
    },
    {
      key: 'wishlist',
      value: stats.wishlist,
      svg: { fill: statusColors.wishlist },
    },
  ].filter((s) => s.value > 0);
  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>SEU CAMINHO EM NÚMEROS</Text>
        <Text style={styles.heading}>Planos que viram memórias.</Text>
        <Text style={styles.muted}>
          {stats.total} lugares guardados em {stats.cities.length} cidades.
        </Text>
        {!places.length ? (
          <Empty
            title="As histórias viram números."
            text="Adicione seu primeiro lugar para ver os gráficos ganharem vida."
          />
        ) : (
          <>
            <View style={styles.panel}>
              <Text style={styles.title}>Seu ritmo de descoberta</Text>
              <View
                accessible
                accessibilityLabel={`${stats.visited} visitados e ${stats.wishlist} para visitar`}
              >
                <PieChart
                  style={{ height: 220 }}
                  data={slices}
                  innerRadius="62%"
                  padAngle={0.035}
                />
              </View>
              <View style={styles.row}>
                <Text style={{ color: colors.green }}>
                  ● Visitado: {stats.visited}
                </Text>
                <Text style={{ color: '#936a28' }}>
                  ● Quero visitar: {stats.wishlist}
                </Text>
              </View>
            </View>
            <View style={styles.panel}>
              <Text style={styles.title}>Por onde seu diário passa</Text>
              <View
                accessible
                accessibilityLabel={stats.cities
                  .map((c) => `${c.label}: ${c.value}`)
                  .join('. ')}
              >
                <BarChart
                  style={{ height: 220 }}
                  data={stats.cities.map((c) => c.value)}
                  svg={{ fill: '#729b81' }}
                  yMin={0}
                  contentInset={{ top: 20, bottom: 10 }}
                  spacingInner={0.35}
                >
                  <Grid direction={Grid.Direction.HORIZONTAL} belowChart />
                </BarChart>
              </View>
              {stats.cities.map((city, index) => (
                <View
                  key={city.label}
                  style={[styles.row, { justifyContent: 'space-between' }]}
                >
                  <Text style={[styles.muted, { flex: 1 }]}>
                    {index + 1}. {city.label}
                  </Text>
                  <Text style={{ color: colors.green, fontWeight: '700' }}>
                    {city.value}
                  </Text>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
