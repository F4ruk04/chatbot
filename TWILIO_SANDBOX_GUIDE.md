# 🚀 Guia Rápido - Twilio Sandbox WhatsApp

## ✅ Problemas Corrigidos

O código anterior dava **erro 404** e não retornava resposta. Agora está corrigido:

1. **Rota do webhook**: `/whatsapp/webhook` funciona corretamente
2. **Resposta TwiML**: Retorna XML válido para o Twilio
3. **Logging completo**: Mostra todas as mensagens recebidas
4. **Empresa configurada**: Já existe no banco com número do sandbox

## 🔧 Configuração Rápida

### 1. Configurar Credenciais do Twilio

Edite `backend/.env` com suas credenciais reais:

```env
# Substitua pelos seus valores reais do Twilio
TWILIO_ACCOUNT_SID=ACseu_account_sid_aqui
TWILIO_AUTH_TOKEN=seu_auth_token_aqui
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
```

### 2. Iniciar Sistema

```bash
# Terminal 1: Iniciar Docker
docker-compose up -d

# Terminal 2: Iniciar Ngrok
./ngrok http 8000
```

### 3. Configurar Webhook no Twilio

1. Acesse: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn
2. Na seção "Sandbox Configuration":
   - **When a message comes in**: `https://SEU_NGROK_URL.ngrok.io/whatsapp/webhook`
   - **HTTP Method**: `POST`
3. Clique em "Save Configuration"

### 4. Conectar seu WhatsApp

1. No seu WhatsApp, envie mensagem para: **+1 415 523 8886**
2. Mensagem: `join SEU-SANDBOX-NAME` (aparece no console do Twilio)
3. Aguarde confirmação do Twilio

### 5. Testar o Bot

1. Envie qualquer mensagem para **+1 415 523 8886**
2. O bot deve responder automaticamente via Gemini
3. Verifique os logs: `docker-compose logs -f backend`

## 📋 Como Funciona

```
Seu WhatsApp → Twilio Sandbox → Ngrok → Seu Servidor → Gemini → Resposta
     ↑                                                                ↓
     ←←←←←←←←←←←←←←← Resposta via Twilio ←←←←←←←←←←←←←←←←←←←←←←←←←←←
```

1. **Você envia mensagem** para +1 415 523 8886
2. **Twilio recebe** e chama seu webhook: `/whatsapp/webhook`
3. **Servidor processa** a mensagem e consulta Gemini
4. **Gemini gera resposta** baseada no contexto da empresa
5. **Servidor envia resposta** de volta via Twilio
6. **Você recebe a resposta** no seu WhatsApp

## 🔍 Verificar se Está Funcionando

### Logs Esperados:
```
=== WEBHOOK TWILIO RECEBIDO ===
Timestamp: 2024-01-12 21:00:00
From: whatsapp:+258123456789
To: whatsapp:+14155238886
Body: Olá, preciso de ajuda
MessageSid: SM1234567890abcdef
================================
Empresa encontrada: Empresa Teste Sandbox (ID: 1)
Gerando resposta com Gemini para: Olá, preciso de ajuda
Resposta gerada: Olá! Como posso ajudá-lo hoje?
Resposta enviada com sucesso para +258123456789
```

### Endpoints de Teste:
```bash
# Teste básico
curl https://SEU_NGROK_URL.ngrok.io/whatsapp/test

# Teste webhook
curl -X POST https://SEU_NGROK_URL.ngrok.io/whatsapp/test-webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+258123456789&To=whatsapp:+14155238886&Body=Teste&MessageSid=SM123"
```

## 🚨 Solução de Problemas

### Erro 404:
- ✅ **Corrigido**: Rota `/whatsapp/webhook` está funcionando
- Verifique se o ngrok está rodando
- Confirme a URL no Twilio Console

### Não recebe resposta:
- Verifique se as credenciais do Twilio estão corretas
- Confirme se a empresa está no banco com número `+14155238886`
- Verifique os logs: `docker-compose logs -f backend`

### Timeout do Twilio:
- ✅ **Corrigido**: Resposta TwiML imediata
- O servidor agora responde em XML válido

## 📱 Fluxo de Teste Completo

1. **Configurar credenciais** no `.env`
2. **Iniciar sistema**: `docker-compose up -d`
3. **Iniciar ngrok**: `./ngrok http 8000`
4. **Configurar webhook** no Twilio com URL do ngrok
5. **Conectar WhatsApp** enviando `join sandbox-name`
6. **Enviar mensagem teste** para +1 415 523 8886
7. **Receber resposta automática** do bot

---

**✅ Agora o webhook funciona corretamente e você deve receber respostas do bot no seu WhatsApp!**