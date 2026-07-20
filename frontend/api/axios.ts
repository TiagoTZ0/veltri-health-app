import axios from 'axios';
import { getItemAsync, setItemAsync, deleteItemAsync } from '../utils/storage';
import { router } from 'expo-router';
import { Platform } from 'react-native';

// Configura EXPO_PUBLIC_API_URL en tu .env para dispositivo físico o producción
// Ejemplo: EXPO_PUBLIC_API_URL=http://192.168.1.X:8000
// Para emulador Android: http://10.0.2.2:8000
// Para emulador iOS:     http://localhost:8000
let BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:8000';
if (Platform.OS === 'web' && BASE_URL.includes('10.0.2.2')) {
  BASE_URL = 'http://127.0.0.1:8000';
}

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// --- Interceptor de REQUEST: agrega el access token ---
api.interceptors.request.use(
  async (config) => {
    const token = await getItemAsync('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- Interceptor de RESPONSE: refresh automático en 401 ---
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token!);
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Encolar requests mientras se refresca
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        }).catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getItemAsync('refresh_token');
        if (!refreshToken) throw new Error('No refresh token');

        const res = await axios.post(`${BASE_URL}/api/users/token/refresh/`, {
          refresh: refreshToken,
        });

        const newAccessToken: string = res.data.access;
        await setItemAsync('access_token', newAccessToken);
        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        // Si el refresh también falla, cerrar sesión
        await deleteItemAsync('access_token');
        await deleteItemAsync('refresh_token');
        router.replace('/login' as any);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;
