FROM python:3.11-slim

# Evitar que Python escriba archivos .pyc y forzar stdout sin buffer
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

WORKDIR /app

# Instalar dependencias del sistema necesarias para PostgreSQL y otras herramientas
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    netcat-openbsd \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

COPY . /app/

# Hacer el script de entrada ejecutable
RUN chmod +x /app/entrypoint.sh

# El puerto que expone Django
EXPOSE 8000

# Script de inicio
ENTRYPOINT ["/app/entrypoint.sh"]
