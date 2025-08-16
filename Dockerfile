# Dockerfile para Railway - Backend FastAPI
FROM python:3.11-slim

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Configurar diretório de trabalho
WORKDIR /app

# Copiar e instalar dependências Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código do backend
COPY backend/ ./

# Expor porta
EXPOSE 8000

# Executar migrações e iniciar aplicação
CMD ["sh", "-c", "alembic upgrade head || echo 'Migrations failed, continuing...' && python -m uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]