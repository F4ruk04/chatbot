# 🚀 Setup Rápido para Testes

## 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
# Google Gemini AI
GEMINI_API_KEY=sua_chave_gemini_aqui

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# JWT Secret
JWT_SECRET=seu_jwt_secret_super_seguro_2024
```

## 2. Obter Chaves

### Google Gemini AI:
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API Key
3. Copie para `GEMINI_API_KEY`

### Twilio WhatsApp:
1. Acesse: https://console.twilio.com/
2. Crie conta gratuita
3. Vá para "Messaging" → "Try it out" → "Send a WhatsApp message"
4. Copie Account SID, Auth Token e número WhatsApp Sandbox

## 3. Iniciar Sistema

```bash
# Construir e iniciar
docker-compose up --build

# Aguardar todos os serviços estarem prontos
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

## 4. Configurar ngrok

```bash
# Em novo terminal
./ngrok.exe http 8000

# Copie a URL HTTPS gerada
```

## 5. Configurar Webhook Twilio

1. Acesse: https://console.twilio.com/
2. Messaging → Settings → WhatsApp Sandbox Settings
3. Webhook URL: `https://abc123.ngrok.io/whatsapp/webhook`

## 6. Testar

1. Crie conta em http://localhost:3000/register
2. Adicione empresa com número Twilio Sandbox
3. Envie "join <código>" para número Twilio
4. Teste mensagens!

## 🔧 Comandos Úteis

```bash
# Ver logs
docker-compose logs -f backend

# Reiniciar
docker-compose restart

# Parar tudo
docker-compose down

# Limpar e recomeçar
docker-compose down -v
docker-compose up --build
```
