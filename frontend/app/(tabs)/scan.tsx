import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator, Alert, SafeAreaView, Platform, ScrollView, TextInput } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import api from '@/api/axios';

export default function ScanScreen() {
  const { meal } = useLocalSearchParams<{ meal?: string }>();
  const tipoComida = (meal as string) || 'Almuerzo';

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any>(null);
  const [gramos, setGramos] = useState('150');
  const [saving, setSaving] = useState(false);

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la cámara.');
      return;
    }

    let result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a tus fotos.');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets) {
      setImageUri(result.assets[0].uri);
      uploadImage(result.assets[0].uri);
    }
  };

  const uploadImage = async (uri: string) => {
    setScanning(true);
    setScanResult(null);

    let formData = new FormData();
    formData.append('image', {
      uri: uri,
      name: 'scan.jpg',
      type: 'image/jpeg',
    } as any);

    try {
      const response = await api.post(`/api/scanner/analyze/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setScanResult(response.data);
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.error || 'No se pudo analizar la imagen.');
      setImageUri(null);
    } finally {
      setScanning(false);
    }
  };

  const saveToDiary = async () => {
    if (!scanResult || !scanResult.food_id) return;
    setSaving(true);
    try {
      await api.post('/api/tracker/log-food/', {
        food_id: scanResult.food_id,
        cantidad_gramos: parseFloat(gramos),
        tipo_comida: tipoComida,   // Usa el tipo de comida correcto según desde dónde vino
        costo_estimado: scanResult.economics?.base_price * (parseFloat(gramos) / 1000)
      });
      Alert.alert('Éxito', `Alimento guardado en ${tipoComida}`);
      router.replace('/(tabs)/');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar el registro');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escáner IA</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        
        {!imageUri ? (
          <View style={styles.emptyState}>
            <View style={styles.cameraIconBg}>
              <Ionicons name="camera" size={60} color="#00D09E" />
            </View>
            <Text style={styles.emptyTitle}>Identifica tu comida</Text>
            <Text style={styles.emptySub}>Usa la Inteligencia Artificial para calcular calorías y obtener el precio de mercado al instante.</Text>
            
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.primaryBtn} onPress={takePhoto}>
                <Ionicons name="camera-outline" size={20} color="#FFF" style={{ marginRight: 8 }} />
                <Text style={styles.primaryBtnText}>Tomar Foto</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondaryBtn} onPress={pickImage}>
                <Ionicons name="image-outline" size={20} color="#111827" style={{ marginRight: 8 }} />
                <Text style={styles.secondaryBtnText}>Galería</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.resultContainer}>
            <Image source={{ uri: imageUri }} style={styles.previewImage} />
            
            {scanning ? (
              <View style={styles.scanningCard}>
                <ActivityIndicator size="large" color="#00D09E" />
                <Text style={styles.scanningText}>Analizando nutrientes y precios...</Text>
              </View>
            ) : scanResult ? (
              <View style={styles.resultCard}>
                <View style={styles.resultHeader}>
                  <Text style={styles.foodName}>{scanResult.prediction}</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>Match {(scanResult.confidence * 100).toFixed(0)}%</Text>
                  </View>
                </View>

                <View style={styles.nutritionRow}>
                  <View style={styles.nutriBox}>
                    <Text style={styles.nutriVal}>{Math.round((scanResult.nutrition_per_100g?.kcal || 0) * (parseFloat(gramos || '0') / 100))}</Text>
                    <Text style={styles.nutriLabel}>Kcal Totales</Text>
                  </View>
                  <View style={styles.nutriDivider} />
                  <View style={styles.nutriBox}>
                    <TextInput 
                      style={styles.gramosInput}
                      value={gramos}
                      onChangeText={setGramos}
                      keyboardType="numeric"
                    />
                    <Text style={styles.nutriLabel}>Porción (g)</Text>
                  </View>
                </View>

                <View style={styles.priceSection}>
                  <Text style={styles.sectionTitle}>Análisis de Mercado</Text>
                  <View style={styles.priceRow}>
                    <Text style={styles.priceLabel}>Precio Estimado:</Text>
                    <Text style={styles.priceBest}>S/ {((scanResult.economics?.base_price || 0) * (parseFloat(gramos || '0') / 1000)).toFixed(2)}</Text>
                  </View>
                </View>

                <TouchableOpacity style={styles.saveBtn} onPress={saveToDiary} disabled={saving}>
                  {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar en Diario</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={styles.retakeBtn} onPress={() => setImageUri(null)}>
                  <Text style={styles.retakeBtnText}>Volver a escanear</Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, backgroundColor: '#FFF' },
  backBtn: { width: 40, height: 40, justifyContent: 'center' },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  container: { flexGrow: 1 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, marginTop: 40 },
  cameraIconBg: { width: 120, height: 120, borderRadius: 60, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 12 },
  emptySub: { fontSize: 15, color: '#6B7280', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  buttonRow: { flexDirection: 'row', width: '100%', justifyContent: 'space-between' },
  primaryBtn: { flex: 1, backgroundColor: '#00D09E', flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginRight: 8 },
  primaryBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  secondaryBtn: { flex: 1, backgroundColor: '#F3F4F6', flexDirection: 'row', paddingVertical: 16, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },
  secondaryBtnText: { color: '#111827', fontSize: 16, fontWeight: '700' },
  resultContainer: { padding: 16 },
  previewImage: { width: '100%', height: 300, borderRadius: 24, marginBottom: -40, zIndex: 1 },
  scanningCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 30, alignItems: 'center', zIndex: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5, marginHorizontal: 16 },
  scanningText: { marginTop: 16, fontSize: 16, color: '#4B5563', fontWeight: '600' },
  resultCard: { backgroundColor: '#FFF', borderRadius: 24, padding: 24, zIndex: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 5 },
  resultHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  foodName: { fontSize: 24, fontWeight: '800', color: '#111827', flex: 1 },
  badge: { backgroundColor: '#ECFDF5', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#00D09E', fontWeight: '700', fontSize: 12 },
  nutritionRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB', borderRadius: 16, padding: 16, marginBottom: 24 },
  nutriBox: { alignItems: 'center', flex: 1 },
  nutriVal: { fontSize: 24, fontWeight: '800', color: '#111827' },
  nutriLabel: { fontSize: 13, color: '#6B7280', marginTop: 4 },
  nutriDivider: { width: 1, height: 40, backgroundColor: '#E5E7EB' },
  priceSection: { marginBottom: 24 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#374151', marginBottom: 12 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  priceLabel: { fontSize: 14, color: '#6B7280' },
  priceStrike: { fontSize: 14, color: '#9CA3AF', textDecorationLine: 'line-through' },
  priceBest: { fontSize: 16, fontWeight: '700', color: '#111827' },
  savingsBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', padding: 10, borderRadius: 8, marginTop: 8 },
  savingsText: { color: '#00D09E', fontWeight: '600', fontSize: 13 },
  saveBtn: { backgroundColor: '#00D09E', paddingVertical: 16, borderRadius: 16, alignItems: 'center', marginBottom: 12 },
  saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: '700' },
  retakeBtn: { paddingVertical: 16, alignItems: 'center' },
  retakeBtnText: { color: '#6B7280', fontSize: 16, fontWeight: '600' },
  gramosInput: { fontSize: 24, fontWeight: '800', color: '#111827', borderBottomWidth: 1, borderColor: '#E5E7EB', minWidth: 60, textAlign: 'center' }
});
