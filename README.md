# Veltri Health App

Proyecto fullstack con backend en Django y frontend en Expo (React Native). Esta aplicación está orientada a la salud, nutrición y seguimiento de dietas, contando con funcionalidades para escanear alimentos, generar planes alimenticios y llevar un control del progreso del usuario.

## 1. Cómo correrlo

### Backend (Django)

1. Abre una terminal en la carpeta raíz del proyecto y dirígete al backend:
   ```bash
   cd backend
   ```
2. Activa el entorno virtual. Si usas Windows (PowerShell):
   ```powershell
   .\venv\Scripts\Activate.ps1
   ```
   *(Si no existe, créalo con `python -m venv venv` y actívalo).*
3. Instala las dependencias:
   ```bash
   pip install -r requirements.txt
   ```
4. Aplica las migraciones a la base de datos (SQLite por defecto):
   ```bash
   python manage.py migrate
   ```
5. Inicia el servidor de desarrollo:
   ```bash
   python manage.py runserver
   ```
   El backend estará disponible en `http://127.0.0.1:8000/`.

### Frontend (Expo / React Native)

1. Abre una nueva terminal en la carpeta raíz y dirígete al frontend:
   ```bash
   cd frontend
   ```
2. Instala las dependencias de Node:
   ```bash
   npm install
   ```
3. Inicia el servidor de Expo:
   ```bash
   npm start
   ```
4. Opciones de ejecución desde Expo:
   - Presiona `a` para abrir en un emulador Android.
   - Presiona `i` para abrir en el simulador de iOS (solo en macOS).
   - Presiona `w` para correr la versión web en tu navegador.

---

## 2. Cómo funciona

**Veltri Health App** funciona bajo una arquitectura cliente-servidor estándar:
- **Frontend (Cliente):** Una aplicación móvil construida con React Native (Expo) que provee la interfaz gráfica. Los usuarios pueden registrarse, visualizar su dieta diaria, escanear alimentos con la cámara y consultar su progreso. Se comunica con el backend mediante peticiones HTTP (API REST).
- **Backend (Servidor):** Una API construida con Django y Django REST Framework. Se encarga de la lógica de negocio, autenticación, conexión a la base de datos (SQLite) y de cualquier procesamiento complejo, como la integración con modelos de IA o APIs externas (ej. OpenAI para generación de dietas).

El flujo típico consiste en que el usuario se autentica en el frontend, el backend le devuelve un token (JWT o similar), y con este token el usuario puede solicitar su dieta, enviar imágenes para escanear alimentos o actualizar su información personal.

---

## 3. Módulos del Frontend

El frontend está estructurado utilizando el enrutamiento basado en archivos de Expo Router. Sus principales módulos (pantallas) son:

- **Auth (`/app/(auth)`):** 
  - `login.tsx` & `register.tsx`: Pantallas encargadas de la autenticación, inicio de sesión y creación de cuentas de usuario.
- **Tabs (`/app/(tabs)`):** Barra de navegación principal de la app.
  - `index.tsx` (Dashboard): Pantalla principal donde el usuario ve el resumen de su día, su progreso y dieta actual.
  - `scan.tsx` (Escáner): Interfaz que utiliza la cámara o galería para escanear alimentos, probablemente conectada al modelo de IA en el backend para detectar qué alimento es.
  - `search.tsx` (Buscador): Permite buscar alimentos específicos, recetas o información nutricional.
  - `finanzas.tsx` (Finanzas): Módulo para llevar control de gastos relacionados con la dieta, compras de supermercado o suscripciones.
  - `perfil.tsx` (Perfil): Gestión de la cuenta del usuario, ajustes personales y métricas físicas.
- **Componentes (`/components`):** Elementos de interfaz reutilizables (botones, tarjetas, tipografía, layouts) que mantienen la consistencia visual de la app.

---

## 4. Módulos del Backend

El backend está construido de forma modular utilizando "Apps" de Django. Cada app maneja una responsabilidad específica:

- **`core`:** Contiene las configuraciones principales de Django, variables de entorno, y el enrutador principal de URLs.
- **`users`:** Gestiona el modelo de usuario personalizado, la autenticación, el registro y los perfiles de usuario.
- **`diets`:** El núcleo de la lógica nutricional. Administra la creación de dietas, el catálogo de alimentos (`load_food_data.py`), y la asignación de comidas diarias para los usuarios.
- **`scanner`:** Módulo encargado de procesar las imágenes enviadas desde el frontend. Aquí se integrarían los modelos de Inteligencia Artificial para la detección y clasificación de alimentos.
- **`tracker`:** Permite hacer seguimiento (tracking) del progreso del usuario, registrar qué comió en el día, calcular calorías consumidas vs objetivo, y mantener un historial de salud.
