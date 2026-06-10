import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, StatusBar, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

const API_BASE_URL = 'http://127.0.0.1:8000/api/diets';

export default function DiarioScreen() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const macros = { carbs: 120, protein: 85, fat: 40 }; // Mocked macros
  const totalCalories = stats?.calorias_consumidas_hoy || 0;
  const goalCalories = stats?.calorias_meta || 2000;
  const remaining = goalCalories - totalCalories;
  
  const progressPercentage = Math.min(100, (totalCalories / goalCalories) * 100);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
        
        {/* Header - Fechas */}
        <View style={styles.header}>
          <TouchableOpacity>
            <Ionicons name="chevron-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.dateText}>Hoy</Text>
          <TouchableOpacity>
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
                <View style={[styles.macroBarFill, { width: '60%', backgroundColor: '#0EA5E9' }]} />
              </View>
              <Text style={styles.macroValue}>{macros.carbs}g / 200g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroTitle}>Proteínas</Text>
              <View style={[styles.macroBarBg, { backgroundColor: '#FCE7F3' }]}>
                <View style={[styles.macroBarFill, { width: '75%', backgroundColor: '#EC4899' }]} />
              </View>
              <Text style={styles.macroValue}>{macros.protein}g / 120g</Text>
            </View>
            <View style={styles.macroBox}>
              <Text style={styles.macroTitle}>Grasas</Text>
              <View style={[styles.macroBarBg, { backgroundColor: '#FEF3C7' }]}>
                <View style={[styles.macroBarFill, { width: '45%', backgroundColor: '#F59E0B' }]} />
              </View>
              <Text style={styles.macroValue}>{macros.fat}g / 65g</Text>
            </View>
          </View>
        </View>

        {/* Comidas */}
        <View style={styles.mealsContainer}>
          {['Desayuno', 'Almuerzo', 'Cena', 'Snacks'].map((meal, idx) => (
            <View key={idx} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{meal}</Text>
                <Text style={styles.mealKcal}>0 kcal</Text>
              </View>
              <TouchableOpacity style={styles.addFoodBtn} onPress={() => router.push('/scan')}>
                <Ionicons name="add-circle" size={24} color="#00D09E" />
                <Text style={styles.addFoodText}>Agregar Alimento con IA</Text>
              </TouchableOpacity>
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
