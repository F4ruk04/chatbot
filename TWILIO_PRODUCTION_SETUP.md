# 🔗 CONFIGURAÇÃO TWILIO PARA PRODUÇÃO

## ✅ BACKEND JÁ ESTÁ ONLINE:
**URL:** https://chatbot-production-d2d7.up.railway.app

## 🎯 CONFIGURAR WEBHOOK TWILIO:

### 1. ACESSAR CONSOLE TWILIO:
```
https://console.twilio.com/
```

### 2. NAVEGAR PARA WHATSAPP SANDBOX:
1. **Develop** > **Messaging** > **Try it out** > **Send a WhatsApp message**
2. Ou diretamente: https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn

### 3. CONFIGURAR WEBHOOK:
Na seção **"Sandbox Configuration"**:

**When a message comes in:**
```
https://chatbot-production-d2d7.up.railway.app/whatsapp/webhook
```

**HTTP Method:** `POST`

**Status callback URL:** (deixar vazio)

### 4. SALVAR CONFIGURAÇÃO:
Clicar em **"Save Configuration"**

## 📱 TESTAR WHATSAPP:

### 1. NÚMERO SANDBOX:
```
+1 415 523 8886
```

### 2. CÓDIGO DE ATIVAÇÃO:
Enviar mensagem: `join <seu-código-sandbox>`
Exemplo: `join orange-tiger`

### 3. TESTAR CHATBOT:
Após ativar, enviar qualquer mensagem:
- "Olá"
- "Como funciona?"
- "Preciso de ajuda"

### 4. RESPOSTA ESPERADA:
O chatbot deve responder usando IA do Gemini baseado no contexto da empresa.

## 🏢 CRIAR EMPRESA NO SISTEMA:

### 1. ACESSAR API DOCS:
```
https://chatbot-production-d2d7.up.railway.app/docs
```

### 2. REGISTRAR USUÁRIO:
- **POST** `/auth/register`
- Dados: email, nome, password

### 3. FAZER LOGIN:
- **POST** `/auth/login`
- Obter token de acesso

### 4. CRIAR EMPRESA:
- **POST** `/companies/add`
- Dados:
```json
{
  "nome": "Minha Empresa",
  "descricao": "Descrição da empresa",
  "whatsapp_phone_number": "+14155238886",
  "context_prompt": "Você é um assistente da Minha Empresa. Ajude os clientes com informações sobre nossos produtos e serviços."
}
```

## 🔍 VERIFICAR FUNCIONAMENTO:

### 1. LOGS DO RAILWAY:
Verificar se aparecem logs quando mensagens chegam:
```
INFO: Mensagem recebida de +5511999999999: Olá
INFO: Resposta gerada: Olá! Como posso ajudá-lo hoje?
INFO: Mensagem salva no banco de dados com ID: 1
```

### 2. TESTAR ENDPOINTS:
- **GET** `/` - Página inicial
- **GET** `/health` - Status da aplicação
- **GET** `/docs` - Documentação da API

## 🚨 TROUBLESHOOTING:

### Se webhook não funcionar:
1. Verificar URL está correta
2. Verificar se Railway está online
3. Verificar logs do Railway
4. Testar endpoint manualmente

### Se chatbot não responder:
1. Verificar se empresa foi criada
2. Verificar se GEMINI_API_KEY está configurada
3. Verificar logs de erro

## 🎉 SISTEMA COMPLETO:
- ✅ Backend: Railway
- ✅ Banco: PostgreSQL Railway
- ✅ Webhook: Configurado
- ✅ IA: Gemini integrada
- ✅ WhatsApp: Funcionando