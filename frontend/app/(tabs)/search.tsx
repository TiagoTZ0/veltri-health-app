import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, FlatList, TouchableOpacity, SafeAreaView, Platform, Alert, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/api/axios';

export default function SearchFoodScreen() {
  const { meal } = useLocalSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [grams, setGrams] = useState('100');

  const searchFoods = async (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      try {
        const response = await api.get(`/api/diets/search/?q=${text}`);
        setResults(response.data);
      } catch (error) {
        console.error(error);
      }
    } else {
      setResults([]);
    }
  };

  const handleSaveFood = async () => {
    try {
      const g = parseFloat(grams);
      if (isNaN(g) || g <= 0) {
        Alert.alert('Error', 'Ingrese una cantidad válida en gramos');
        return;
      }
      
      const estimatedCost = selectedFood.base_price_kg * (g / 1000);

      await api.post('/api/tracker/log-food/', {
        food_id: selectedFood.id,
        cantidad_gramos: g,
        tipo_comida: meal || 'Snacks',
        costo_estimado: estimatedCost
      });

      setSelectedFood(null);
      router.back();
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el alimento');
      console.error(error);
    }
  };

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.itemCard} onPress={() => setSelectedFood(item)}>
      <View>
        <Text style={styles.itemName}>{item.nombre_alimento}</Text>
        <Text style={styles.itemSub}>{item.calorias_100g} kcal / 100g • {item.categoria}</Text>
      </View>
      <Ionicons name="add-circle" size={28} color="#00D09E" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.title}>Agregar a {meal}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar alimento (ej. Pollo, Arroz)"
          value={query}
          onChangeText={searchFoods}
          autoFocus
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          query.length > 2 ? <Text style={styles.emptyText}>No se encontraron resultados</Text> : null
        }
      />

      <Modal visible={!!selectedFood} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{selectedFood?.nombre_alimento}</Text>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Porción (gramos):</Text>
              <TextInput
                style={styles.inputGrams}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.macroRow}>
              <Text style={styles.macroText}>{(selectedFood?.calorias_100g * (parseFloat(grams)||0) / 100).toFixed(0)} kcal</Text>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setSelectedFood(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSaveFood}>
                <Text style={styles.saveText}>Añadir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: Platform.OS === 'android' ? 25 : 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    margin: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    height: 50,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  list: {
    paddingHorizontal: 16,
  },
  itemCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  itemSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#6B7280',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#374151',
  },
  inputGrams: {
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    width: 100,
    textAlign: 'center',
    fontSize: 16,
  },
  macroRow: {
    alignItems: 'center',
    marginBottom: 24,
  },
  macroText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#00D09E',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    marginRight: 8,
  },
  cancelText: {
    color: '#4B5563',
    fontWeight: '600',
    fontSize: 16,
  },
  saveBtn: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
    backgroundColor: '#00D09E',
    borderRadius: 12,
    marginLeft: 8,
  },
  saveText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  }
});
