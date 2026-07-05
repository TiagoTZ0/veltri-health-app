import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

export default function RegisterScreen() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [presupuesto, setPresupuesto] = useState('');
  const [metaCalorica, setMetaCalorica] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  
  const handleRegister = async () => {
    if (!username || !email || !password || !presupuesto || !metaCalorica) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }
    
    setLoading(true);
    try {
      const response = await api.post('/api/users/register/', {
        username,
        email,
        password,
        perfilusuario: {
            presupuesto_semanal_limite: parseFloat(presupuesto),
            meta_calorica_diaria: parseInt(metaCalorica)
        }
      });
      
      // Auto login after register
      if (response.status === 201) {
        const loginResponse = await api.post('/api/users/login/', {
          username,
          password
        });
        const { access } = loginResponse.data;
        if (access) {
          await login(access);
        }
      }
    } catch (error: any) {
      console.log(error.response?.data);
      Alert.alert('Error', 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crea tu Cuenta</Text>
        <Text style={styles.subtitle}>Únete a Veltri Health</Text>
        
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Nombre de Usuario"
            placeholderTextColor="#888"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder="Correo Electrónico"
            placeholderTextColor="#888"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#888"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          <TextInput
            style={styles.input}
            placeholder="Presupuesto Semanal (S/)"
            placeholderTextColor="#888"
            value={presupuesto}
            onChangeText={setPresupuesto}
            keyboardType="numeric"
          />
          <TextInput
            style={styles.input}
            placeholder="Meta Calórica Diaria (Kcal)"
            placeholderTextColor="#888"
            value={metaCalorica}
            onChangeText={setMetaCalorica}
            keyboardType="numeric"
          />
        </View>

        <TouchableOpacity 
          style={styles.button} 
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>Registrarse</Text>}
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
          {/* @ts-ignore */}
          <Link href="/login" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Inicia Sesión</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#00ffcc',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#aaa',
    marginBottom: 40,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1a1a1a',
    color: '#fff',
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  button: {
    backgroundColor: '#00ffcc',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 24,
  },
  footerText: {
    color: '#888',
  },
  linkText: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
});
