# Dockerfile para o Frontend Next.js
# Imagem base do Node.js
FROM node:20-alpine

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
# RUN npm ci --only=production
RUN npm install

# Copiar código da aplicação
COPY . .

# Construir a aplicação
RUN npm run build

# Expor porta
EXPOSE 3000

# Comando para executar a aplicação
CMD ["npm", "start"]

