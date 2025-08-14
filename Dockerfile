# Multi-stage build para otimizar o deploy
FROM node:18-alpine AS frontend-build

# Build do Frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci --only=production
COPY frontend/ ./
RUN npm run build

# Backend Python
FROM python:3.11-slim AS backend

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Configurar diretório de trabalho
WORKDIR /app

# Instalar dependências Python
COPY backend/requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código do backend
COPY backend/ ./backend/

# Copiar build do frontend
COPY --from=frontend-build /app/frontend/out ./frontend/out

# Copiar script de inicialização
COPY start.sh ./
RUN chmod +x start.sh

# Criar usuário não-root para segurança
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expor porta
EXPOSE 8000

# Comando para iniciar a aplicação
CMD ["./start.sh"]