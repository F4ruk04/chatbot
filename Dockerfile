# Dockerfile simplificado - só backend para Railway
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