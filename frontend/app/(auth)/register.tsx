import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { Link } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import api from '@/api/axios';

export default function RegisterScreen() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  // Step 1: Cuenta
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Step 2: Datos Personales
  const [genero, setGenero] = useState(''); // 'M' o 'F'
  const [edad, setEdad] = useState('');
  const [peso, setPeso] = useState('');
  const [altura, setAltura] = useState('');

  // Step 3: Objetivos
  const [objetivo, setObjetivo] = useState('mantener'); // bajar_peso, mantener, ganar_masa
  const [presupuesto, setPresupuesto] = useState('');

  const { login } = useAuth();

  const calculateCalories = () => {
    // Mifflin-St Jeor Equation
    const w = parseFloat(peso);
    const h = parseFloat(altura);
    const a = parseInt(edad);
    let bmr = 0;
    
    if (genero === 'M') {
      bmr = 10 * w + 6.25 * h - 5 * a + 5;
    } else {
      bmr = 10 * w + 6.25 * h - 5 * a - 161;
    }

    // TDEE estimate (assuming sedentary/light activity 1.2)
    let tdee = bmr * 1.2;

    if (objetivo === 'bajar_peso') {
      tdee -= 500;
    } else if (objetivo === 'ganar_masa') {
      tdee += 500;
    }

    return Math.round(tdee);
  };

  const handleNext = () => {
    if (step === 1) {
      if (!username || !email || !password) {
        Alert.alert('Error', 'Por favor completa todos los campos de la cuenta');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!genero || !edad || !peso || !altura) {
        Alert.alert('Error', 'Por favor completa todos los datos físicos');
        return;
      }
      setStep(3);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRegister = async () => {
    if (!presupuesto || !objetivo) {
      Alert.alert('Error', 'Por favor completa tus objetivos y presupuesto');
      return;
    }
    
    setLoading(true);
    try {
      const metaCalorica = calculateCalories();
      
      const response = await api.post('/api/users/register/', {
        username,
        email,
        password,
        perfilusuario: {
            genero,
            edad: parseInt(edad),
            peso_actual: parseFloat(peso),
            altura: parseFloat(altura),
            objetivo_salud: objetivo,
            presupuesto_semanal_limite: parseFloat(presupuesto),
            meta_calorica_diaria: metaCalorica
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
      Alert.alert('Error', 'No se pudo crear la cuenta. Verifica tus datos.');
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => (
    <View style={styles.stepIndicatorContainer}>
      <View style={[styles.stepDot, step >= 1 ? styles.stepDotActive : null]} />
      <View style={[styles.stepLine, step >= 2 ? styles.stepLineActive : null]} />
      <View style={[styles.stepDot, step >= 2 ? styles.stepDotActive : null]} />
      <View style={[styles.stepLine, step >= 3 ? styles.stepLineActive : null]} />
      <View style={[styles.stepDot, step >= 3 ? styles.stepDotActive : null]} />
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Crea tu Cuenta</Text>
        <Text style={styles.subtitle}>Únete a Veltri Health</Text>
        
        {renderStepIndicator()}

        <View style={styles.inputContainer}>
          {step === 1 && (
            <View>
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
            </View>
          )}

          {step === 2 && (
            <View>
              <View style={styles.rowContainer}>
                <TouchableOpacity 
                  style={[styles.genderButton, genero === 'M' ? styles.genderActive : null]}
                  onPress={() => setGenero('M')}
                >
                  <Text style={[styles.genderText, genero === 'M' ? styles.genderTextActive : null]}>Masculino</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.genderButton, genero === 'F' ? styles.genderActive : null]}
                  onPress={() => setGenero('F')}
                >
                  <Text style={[styles.genderText, genero === 'F' ? styles.genderTextActive : null]}>Femenino</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.input}
                placeholder="Edad (años)"
                placeholderTextColor="#888"
                value={edad}
                onChangeText={setEdad}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Peso Actual (kg)"
                placeholderTextColor="#888"
                value={peso}
                onChangeText={setPeso}
                keyboardType="numeric"
              />
              <TextInput
                style={styles.input}
                placeholder="Altura (cm)"
                placeholderTextColor="#888"
                value={altura}
                onChangeText={setAltura}
                keyboardType="numeric"
              />
            </View>
          )}

          {step === 3 && (
            <View>
              <Text style={styles.label}>¿Cuál es tu objetivo principal?</Text>
              <View style={styles.optionsContainer}>
                {['bajar_peso', 'mantener', 'ganar_masa'].map((obj) => (
                  <TouchableOpacity
                    key={obj}
                    style={[styles.optionButton, objetivo === obj ? styles.optionActive : null]}
                    onPress={() => setObjetivo(obj)}
                  >
                    <Text style={[styles.optionText, objetivo === obj ? styles.optionTextActive : null]}>
                      {obj === 'bajar_peso' ? 'Bajar Peso' : obj === 'mantener' ? 'Mantener' : 'Ganar Masa'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              
              <Text style={styles.label}>Presupuesto Semanal</Text>
              <TextInput
                style={styles.input}
                placeholder="Monto límite (S/)"
                placeholderTextColor="#888"
                value={presupuesto}
                onChangeText={setPresupuesto}
                keyboardType="numeric"
              />
            </View>
          )}
        </View>

        <View style={styles.buttonRow}>
          {step > 1 && (
            <TouchableOpacity 
              style={[styles.button, styles.buttonSecondary]} 
              onPress={handleBack}
              disabled={loading}
            >
              <Text style={styles.buttonTextSecondary}>Atrás</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, step === 1 ? {flex: 1} : {flex: 1, marginLeft: 12}]} 
            onPress={step < 3 ? handleNext : handleRegister}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="#000" /> : <Text style={styles.buttonText}>{step < 3 ? 'Siguiente' : 'Completar Registro'}</Text>}
          </TouchableOpacity>
        </View>

        {step === 1 && (
          <View style={styles.footer}>
            <Text style={styles.footerText}>¿Ya tienes una cuenta? </Text>
            {/* @ts-ignore */}
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.linkText}>Inicia Sesión</Text>
              </TouchableOpacity>
            </Link>
          </View>
        )}
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
    marginBottom: 24,
    textAlign: 'center',
  },
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#333',
  },
  stepDotActive: {
    backgroundColor: '#00ffcc',
    shadowColor: '#00ffcc',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 5,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#333',
    marginHorizontal: 8,
  },
  stepLineActive: {
    backgroundColor: '#00ffcc',
  },
  inputContainer: {
    marginBottom: 24,
    minHeight: 240,
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
  label: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    marginTop: 8,
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  genderButton: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    height: 56,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333',
    marginHorizontal: 4,
  },
  genderActive: {
    borderColor: '#00ffcc',
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
  },
  genderText: {
    color: '#888',
    fontSize: 16,
    fontWeight: '500',
  },
  genderTextActive: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionButton: {
    backgroundColor: '#1a1a1a',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  optionActive: {
    borderColor: '#00ffcc',
    backgroundColor: 'rgba(0, 255, 204, 0.1)',
  },
  optionText: {
    color: '#888',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  optionTextActive: {
    color: '#00ffcc',
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
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
  buttonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#333',
    shadowOpacity: 0,
    elevation: 0,
    flex: 0.4,
  },
  buttonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
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
