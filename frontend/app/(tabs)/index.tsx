import React, { useState, useCallback } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useFocusEffect } from 'expo-router';
import api from '@/api/axios';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export default function DiarioScreen() {
  const [stats, setStats] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  React.useEffect(() => {
    (async () => {
      const perms = await Notifications.getPermissionsAsync() as any;
      let finalGranted = perms.granted || perms.status === 'granted';
      if (!finalGranted) {
        const req = await Notifications.requestPermissionsAsync() as any;
        finalGranted = req.granted || req.status === 'granted';
      }
      if (finalGranted) {
        // Programar recordatorio de agua cada 2 horas si no hay ya uno
        const scheduled = await Notifications.getAllScheduledNotificationsAsync();
        if (scheduled.length === 0) {
          await Notifications.scheduleNotificationAsync({
            content: {
              title: '¡Hora de hidratarte! 💧',
              body: 'Toma un vaso de agua para mantenerte saludable y cumplir tu meta.',
            },
            trigger: {
              type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
              seconds: 60 * 60 * 2, // 2 horas
              repeats: true,
            },
          });
        }
      }
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchStats(selectedDate);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedDate])
  );

  const formatDateParam = (date: Date) => date.toISOString().split('T')[0];

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Hoy';
    return date.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric', month: 'short' });
  };

  const goToPrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const goToNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    // No permitir ir al futuro
    if (d <= new Date()) setSelectedDate(d);
  };

  const fetchStats = async (date: Date = selectedDate) => {
    try {
      const dateParam = formatDateParam(date);
      const response = await api.get(`/api/tracker/daily-stats/?date=${dateParam}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const addWater = async () => {
    try {
      await api.post('/api/tracker/log-water/', { cantidad_ml: 250 });
      fetchStats(); // recargar
    } catch (error) {
      console.error('Error log water:', error);
    }
  };

  const macros = stats?.macros_consumidos_hoy || { carbohidratos: 0, proteinas: 0, grasas: 0 };
  const totalCalories = Math.round(stats?.calorias_consumidas_hoy || 0);
  const goalCalories = stats?.calorias_meta || 2000;
  const remaining = goalCalories - totalCalories;
  const progressPercentage = Math.min(100, (totalCalories / goalCalories) * 100);

  // Metas de macros (del backend o valores por defecto nutritivos estándar)
  const macroGoals = {
    carbohidratos: stats?.metas_macros?.carbohidratos || 200,
    proteinas: stats?.metas_macros?.proteinas || 120,
    grasas: stats?.metas_macros?.grasas || 65,
  };
  const carboPct = Math.min(100, macroGoals.carbohidratos > 0 ? (macros.carbohidratos / macroGoals.carbohidratos) * 100 : 0);
  const proteinPct = Math.min(100, macroGoals.proteinas > 0 ? (macros.proteinas / macroGoals.proteinas) * 100 : 0);
  const fatPct = Math.min(100, macroGoals.grasas > 0 ? (macros.grasas / macroGoals.grasas) * 100 : 0);


  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* Header - Fechas */}
        <View style={styles.header}>
          <TouchableOpacity onPress={goToPrevDay}>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.dateText}>{getDateLabel(selectedDate)}</Text>
          <TouchableOpacity onPress={goToNextDay} style={{ opacity: isToday(selectedDate) ? 0.3 : 1 }}>
            <Ionicons name="chevron-forward" size={24} color="#111827" />
          </TouchableOpacity>
        </View>

        {/* Círculo de Calorías Principal (Estilo Fitia) */}
        <View style={styles.calorieCard}>
          <Text style={styles.cardTitle}>Resumen Diario</Text>
          <View style={styles.calorieOverview}>
            <View style={styles.calorieDetail}>
              <Text style={styles.calorieValue}>{totalCalories}</Text>
              <Text style={styles.calorieLabel}>Consumidas</Text>
            </View>
            
            <View style={styles.circleContainer}>
              {/* Pseudo-Circle Progress */}
              <View style={styles.circleBg}>
                <View style={[styles.circleFill, { height: `${progressPercentage}%` }]} />
                <View style={styles.circleInner}>
                  <Text style={styles.circleValue}>{remaining > 0 ? remaining : 0}</Text>
                  <Text style={styles.circleLabel}>Restantes</Text>
                </View>
              </View>
            </View>

            <View style={styles.calorieDetail}>
              <Text style={styles.calorieValue}>{goalCalories}</Text>
              <Text style={styles.calorieLabel}>Meta Diaria</Text>
            </View>
          </View>

          {/* Macros */}
          <View style={styles.macrosContainer}>
            <View style={styles.macroBox}>
              <Text style={styles.macroTitle}>Carbohidratos</Text>
              <View style={[styles.macroBarBg, { backgroundColor: '#E0F2FE' }]}>
                <View style={[styles.macroBarFill, { width: `${carboPct}%`, backgroundColor: '#0EA5E9' }]} />
              </View>
              <Text style={styles.macroValue}>{Math.round(macros.carbohidratos)}g / {macroGoals.carbohidratos}g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroTitle}>Proteínas</Text>
              <View style={[styles.macroBarBg, { backgroundColor: '#FCE7F3' }]}>
                <View style={[styles.macroBarFill, { width: `${proteinPct}%`, backgroundColor: '#EC4899' }]} />
              </View>
              <Text style={styles.macroValue}>{Math.round(macros.proteinas)}g / {macroGoals.proteinas}g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroTitle}>Grasas</Text>
              <View style={[styles.macroBarBg, { backgroundColor: '#FEF3C7' }]}>
                <View style={[styles.macroBarFill, { width: `${fatPct}%`, backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.macroValue}>{Math.round(macros.grasas)}g / {macroGoals.grasas}g</Text>
            </View>
          </View>
        </View>

        {/* Tracking de Agua */}
        <View style={styles.waterCard}>
          <View style={styles.waterHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="water" size={24} color="#3B82F6" />
              <Text style={styles.waterTitle}>Agua</Text>
            </View>
            <Text style={styles.waterSubtitle}>{stats?.vasos_agua || 0} de 8 vasos</Text>
          </View>
          <View style={styles.waterDrops}>
            {[...Array(8)].map((_, i) => (
              <Ionicons 
                key={i} 
                name={i < (stats?.vasos_agua || 0) ? "water" : "water-outline"} 
                size={28} 
                color={i < (stats?.vasos_agua || 0) ? "#3B82F6" : "#D1D5DB"} 
              />
            ))}
          </View>
          <TouchableOpacity style={styles.addWaterBtn} onPress={addWater}>
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addWaterText}>Añadir Vaso (250ml)</Text>
          </TouchableOpacity>
        </View>

        {/* Comidas */}
        <View style={styles.mealsContainer}>
          {['Desayuno', 'Almuerzo', 'Cena', 'Snacks'].map((meal, idx) => (
            <View key={idx} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal}</Text>
                <Text style={styles.mealKcal}>0 kcal</Text>
              </View>
              <View style={styles.mealActions}>
                <TouchableOpacity style={styles.addFoodBtn} onPress={() => router.push({ pathname: '/scan', params: { meal } })}>
                  <Ionicons name="camera" size={20} color="#00D09E" />
                  <Text style={styles.addFoodText}>Escáner IA</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.addFoodBtn, { marginLeft: 15 }]} onPress={() => router.push({ pathname: '/search' as any, params: { meal } })}>
                  <Ionicons name="search" size={20} color="#6B7280" />
                  <Text style={[styles.addFoodText, { color: '#6B7280' }]}>Buscar</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>

        
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  waterCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
  },
  waterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  waterTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginLeft: 8,
  },
  waterSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  waterDrops: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  addWaterBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
  },
  addWaterText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
  },
  dateText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  calorieCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 20,
  },
  calorieOverview: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  calorieDetail: {
    alignItems: 'center',
    flex: 1,
  },
  calorieValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
  },
  calorieLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  circleContainer: {
    flex: 1.5,
    alignItems: 'center',
  },
  circleBg: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#F3F4F6',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  circleFill: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#00D09E',
  },
  circleInner: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  circleValue: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
  },
  circleLabel: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  macrosContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  macroBox: {
    flex: 1,
    marginHorizontal: 5,
  },
  macroTitle: {
    fontSize: 12,
    color: '#4B5563',
    fontWeight: '600',
    marginBottom: 6,
  },
  macroBarBg: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 6,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  macroValue: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  mealsContainer: {
    marginTop: 5,
  },
  mealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  mealKcal: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '600',
  },
  addFoodBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addFoodText: {
    color: '#00D09E',
    fontWeight: '600',
    fontSize: 15,
    marginLeft: 8,
  }
});
