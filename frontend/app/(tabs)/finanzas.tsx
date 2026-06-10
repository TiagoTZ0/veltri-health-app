import React from 'react';
import { StyleSheet, View, Text, ScrollView, SafeAreaView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function FinanzasScreen() {
  const stats = {
    gasto: 45.2,
    limite: 150.0,
    ahorroMensual: 85.0
  };

  const progress = Math.min(100, (stats.gasto / stats.limite) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Presupuesto Veltri</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Disponible esta semana</Text>
          <Text style={styles.balanceAmount}>S/ {(stats.limite - stats.gasto).toFixed(2)}</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={styles.limitRow}>
            <Text style={styles.limitText}>S/ {stats.gasto.toFixed(2)} gastado</Text>
            <Text style={styles.limitText}>S/ {stats.limite.toFixed(2)} límite</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Estadísticas</Text>

        <View style={styles.statGrid}>
          <View style={styles.statBox}>
            <View style={styles.iconCircle}>
              <Ionicons name="trending-up" size={24} color="#00D09E" />
            </View>
            <Text style={styles.statTitle}>S/ {stats.ahorroMensual.toFixed(2)}</Text>
            <Text style={styles.statSub}>Ahorro Mensual Proyectado</Text>
          </View>
          <View style={styles.statBox}>
            <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="cart" size={24} color="#6B7280" />
            </View>
            <Text style={styles.statTitle}>-25%</Text>
            <Text style={styles.statSub}>Promedio descuento vs Lima</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={20} color="#3B82F6" />
            <Text style={styles.infoTitle}>Algoritmo Smart-Budget</Text>
          </View>
          <Text style={styles.infoText}>
            Tu dieta se ajusta automáticamente a los precios regionales. Para tu distrito (Trujillo), el costo de vegetales frescos y proteínas es en promedio 25% más barato que en supermercados tradicionales.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  container: { padding: 16 },
  balanceCard: { backgroundColor: '#111827', borderRadius: 24, padding: 24, marginBottom: 24, shadowColor: '#00D09E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.2, shadowRadius: 16, elevation: 10 },
  balanceLabel: { color: '#9CA3AF', fontSize: 14, marginBottom: 8 },
  balanceAmount: { color: '#FFF', fontSize: 36, fontWeight: '800', marginBottom: 24 },
  progressBg: { height: 8, backgroundColor: '#374151', borderRadius: 4, overflow: 'hidden', marginBottom: 12 },
  progressFill: { height: '100%', backgroundColor: '#00D09E', borderRadius: 4 },
  limitRow: { flexDirection: 'row', justifyContent: 'space-between' },
  limitText: { color: '#9CA3AF', fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  statGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, backgroundColor: '#FFF', borderRadius: 20, padding: 20, marginRight: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  iconCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  statTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  statSub: { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16 },
  infoHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  infoTitle: { color: '#1E3A8A', fontWeight: '700', fontSize: 15, marginLeft: 8 },
  infoText: { color: '#1E3A8A', fontSize: 13, lineHeight: 20, opacity: 0.8 }
});
