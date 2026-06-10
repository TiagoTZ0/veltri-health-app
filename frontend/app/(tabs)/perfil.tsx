import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, Platform, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function PerfilScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Perfil</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>MV</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>MVP User</Text>
            <Text style={styles.profileSub}>Bajar de peso • 75kg</Text>
          </View>
          <TouchableOpacity style={styles.editBtn}>
            <Ionicons name="pencil" size={18} color="#00D09E" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Objetivos y Dieta</Text>
        
        <View style={styles.menuGroup}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FCE7F3' }]}>
              <Ionicons name="body" size={20} color="#EC4899" />
            </View>
            <Text style={styles.menuText}>Actualizar Peso y Medidas</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#FEF3C7' }]}>
              <Ionicons name="restaurant" size={20} color="#F59E0B" />
            </View>
            <Text style={styles.menuText}>Preferencias y Alergias</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="wallet" size={20} color="#10B981" />
            </View>
            <Text style={styles.menuText}>Ajustar Presupuesto Límite</Text>
            <Text style={styles.menuBadge}>S/ 150</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionTitle}>Configuración</Text>

        <View style={styles.menuGroup}>
          <View style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="notifications" size={20} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Recordatorios de comida</Text>
            <Switch value={true} onValueChange={() => {}} trackColor={{ false: '#D1D5DB', true: '#00D09E' }} />
          </View>
          <View style={styles.divider} />
          <TouchableOpacity style={styles.menuItem}>
            <View style={[styles.menuIconBg, { backgroundColor: '#F3F4F6' }]}>
              <Ionicons name="location" size={20} color="#6B7280" />
            </View>
            <Text style={styles.menuText}>Ubicación para precios</Text>
            <Text style={styles.menuBadgeSecondary}>Trujillo</Text>
            <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Cerrar Sesión</Text>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F9FAFB', paddingTop: Platform.OS === 'android' ? 25 : 0 },
  header: { padding: 16, backgroundColor: '#FFF', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  headerTitle: { fontSize: 22, fontWeight: '800', color: '#111827' },
  container: { padding: 16 },
  profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 20, borderRadius: 20, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  avatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#00D09E', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#FFF', fontSize: 20, fontWeight: '800' },
  profileInfo: { flex: 1, marginLeft: 16 },
  profileName: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 4 },
  profileSub: { fontSize: 13, color: '#6B7280' },
  editBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#ECFDF5', justifyContent: 'center', alignItems: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, letterSpacing: 0.5 },
  menuGroup: { backgroundColor: '#FFF', borderRadius: 20, paddingHorizontal: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.03, shadowRadius: 8, elevation: 2 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16 },
  menuIconBg: { width: 36, height: 36, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuText: { flex: 1, fontSize: 16, fontWeight: '500', color: '#111827' },
  menuBadge: { fontSize: 14, fontWeight: '600', color: '#10B981', marginRight: 8 },
  menuBadgeSecondary: { fontSize: 14, color: '#6B7280', marginRight: 8 },
  divider: { height: 1, backgroundColor: '#F3F4F6', marginLeft: 52 },
  logoutBtn: { paddingVertical: 16, alignItems: 'center', marginTop: 10 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: '600' }
});
