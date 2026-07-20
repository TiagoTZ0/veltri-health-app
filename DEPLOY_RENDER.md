# Despliegue en Render — pasos rápidos

1) Conectar el repositorio a Render
   - Entra a https://dashboard.render.com → New → Web Service
   - Puedes importar el `render.yaml` desde la raíz del repo o crear servicios manualmente.

2) Servicios sugeridos (ya declarados en `render.yaml`):
   - `veltri-backend` (Docker) — usa `backend/Dockerfile`
   - `veltri-ai-service` (Docker) — usa `ai-service/Dockerfile`
   - `veltri-frontend` (Node) — root `frontend`, build `npm ci`, start `npm run web`
   - Managed Postgres: `veltri-db`

3) Añadir secrets / env vars
   - Ve a cada servicio → Environment → Environment Keys
   - Backend: añade `SECRET_KEY`, `DATABASE_URL` (o DB_*), `DEBUG=False`, `ALLOWED_HOSTS`.
   - AI service: añade `MODELS_DIR` si distinto (por defecto /app/models).
   - Frontend: añade `EXPO_PUBLIC_API_URL` y `EXPO_PUBLIC_AI_URL`.

4) Modelos del `ai-service`
   - Asegúrate de que `ai-service/models/` contiene `food101_torch.pth`, `food101_classes.npy` y `calories.json`.
   - Si son muy grandes, considera subirlos a un bucket (S3) y modific ar `ai-service/config.py` para descargarlos al inicio.

5) Base de datos
   - Si usas el bloque `databases` del `render.yaml`, Render crea la DB y expone `DATABASE_URL` en el servicio.
   - Si creas la DB manualmente en Render, copia la `DATABASE_URL` y pégala en los secrets del backend.

6) Deploy y ver logs
   - Despliega cada servicio y revisa `Logs` en el panel de Render para corregir errores.
   - Backend: revisa migraciones (entrypoint.sh ejecuta `migrate` automáticamente).

7) Notas sobre almacenamiento estático/media
   - Para producción, usa S3/Backblaze para `MEDIA_ROOT` y `STATICFILES_STORAGE`. Alternativa: disco persistente de Render (limitado).

8) Automatización (opcional)
   - Render tiene una API/CLI; para crear servicios y setear envs programáticamente necesitas el `API key` de Render.
   - No incluyas tu API key en el repo.

Si quieres, puedo:
- Generar un script `render_setup.sh` que use `render` CLI para crear servicios (necesitarás tu API key).
- O puedo guiarte por el proceso en la UI paso a paso.
