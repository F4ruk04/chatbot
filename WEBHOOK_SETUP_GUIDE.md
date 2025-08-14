# Guia de Configuração do Webhook WhatsApp com Twilio

## Problemas Identificados e Soluções Implementadas

### ✅ Problemas Corrigidos:

1. **Resposta XML TwiML**: O webhook agora retorna XML válido em vez de JSON
2. **Logging Detalhado**: Adicionado logging completo para debug
3. **Variáveis de Ambiente**: Adicionadas configurações do Twilio no `.env`
4. **Endpoints de Teste**: Criados endpoints para testar a funcionalidade

## Configuração do Twilio

### 1. Obter Credenciais do Twilio

1. Acesse o [Console do Twilio](https://console.twilio.com/)
2. Copie o **Account SID** e **Auth Token**
3. Configure um número do WhatsApp Business (Sandbox ou Produção)

### 2. Atualizar Variáveis de Ambiente

Edite o arquivo `backend/.env` com suas credenciais reais:

```env
# Configurações do Twilio para WhatsApp
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcdef  # Seu Account SID real
TWILIO_AUTH_TOKEN=1234567890abcdef1234567890abcdef      # Seu Auth Token real
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886            # Seu número do Twilio WhatsApp
```

## Configuração do Ngrok

### 1. Instalar e Configurar Ngrok

```bash
# Se ainda não tiver o ngrok instalado
# Baixe de: https://ngrok.com/download

# Autenticar (obtenha o token em https://dashboard.ngrok.com/get-started/your-authtoken)
./ngrok authtoken SEU_TOKEN_AQUI
```

### 2. Expor o Backend

```bash
# Navegar para o diretório do projeto
cd c:/Users/Faruk/Desktop/saas-chatbot-inteligente-twilio

# Iniciar o ngrok para expor a porta 8000 (backend)
./ngrok http 8000
```

### 3. Obter URL do Ngrok

Após executar o comando acima, você verá algo como:
```
Forwarding    https://abc123.ngrok.io -> http://localhost:8000
```

**Sua URL do webhook será**: `https://abc123.ngrok.io/whatsapp/webhook`

## Configuração no Console do Twilio

### 1. Configurar Webhook no Twilio

1. Acesse [Twilio Console > WhatsApp > Sandbox](https://console.twilio.com/us1/develop/sms/try-it-out/whatsapp-learn)
2. Na seção "Sandbox Configuration":
   - **When a message comes in**: `https://SEU_NGROK_URL.ngrok.io/whatsapp/webhook`
   - **HTTP Method**: `POST`

### 2. Para Produção (WhatsApp Business)

1. Acesse [Twilio Console > Messaging > Services](https://console.twilio.com/us1/develop/sms/services)
2. Selecione seu serviço do WhatsApp
3. Configure o webhook:
   - **Inbound webhook URL**: `https://SEU_NGROK_URL.ngrok.io/whatsapp/webhook`
   - **HTTP Method**: `POST`

## Testando a Configuração

### 1. Iniciar o Sistema

```bash
# Terminal 1: Iniciar Docker
docker-compose up -d

# Terminal 2: Iniciar Ngrok
./ngrok http 8000
```

### 2. Testar Endpoints

#### Teste Básico (GET):
```bash
curl https://SEU_NGROK_URL.ngrok.io/whatsapp/test
```

#### Teste de Webhook (POST):
```bash
curl -X POST https://SEU_NGROK_URL.ngrok.io/whatsapp/test-webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+1234567890&To=whatsapp:+14155238886&Body=Teste&MessageSid=SM123"
```

### 3. Verificar Logs

Monitore os logs do Docker para ver as mensagens:

```bash
docker-compose logs -f backend
```

## Estrutura das Rotas

### Rotas Disponíveis:

- **POST** `/whatsapp/webhook` - Webhook principal do Twilio
- **GET** `/whatsapp/test` - Teste básico de conectividade
- **POST** `/whatsapp/test-webhook` - Simulação de webhook
- **GET** `/whatsapp/messages/{company_id}` - Listar mensagens da empresa

### Exemplo de Resposta TwiML:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<Response>
</Response>
```

## Debugging

### Logs Importantes:

O sistema agora registra:
- Timestamp da mensagem recebida
- Número do remetente (From)
- Número do destinatário (To)
- Conteúdo da mensagem (Body)
- ID da mensagem (MessageSid)
- Status do processamento

### Verificar se o Webhook está Funcionando:

1. **Status 200**: Webhook recebido com sucesso
2. **Logs no Terminal**: Mensagens detalhadas aparecem no console
3. **Resposta TwiML**: XML válido retornado ao Twilio

## Solução de Problemas Comuns

### Erro 404:
- ✅ **Corrigido**: Rota `/whatsapp/webhook` está configurada corretamente
- ✅ **Corrigido**: Router incluído no `main.py`

### Timeout do Twilio:
- ✅ **Corrigido**: Resposta TwiML imediata
- ✅ **Corrigido**: Processamento assíncrono

### Mensagens Não Aparecem:
- Verificar se a empresa está cadastrada com o número correto
- Verificar logs para identificar erros
- Testar com endpoint de teste primeiro

## Exemplo Funcional Completo

### 1. Configurar Twilio:
```
Webhook URL: https://abc123.ngrok.io/whatsapp/webhook
Method: POST
```

### 2. Enviar Mensagem de Teste:
- Envie "join <sandbox-name>" para o número do Twilio
- Envie qualquer mensagem para testar o bot

### 3. Verificar Logs:
```bash
docker-compose logs -f backend | grep "WEBHOOK TWILIO"
```

## Próximos Passos

1. **Configurar Credenciais Reais**: Substitua as credenciais de exemplo
2. **Cadastrar Empresa**: Certifique-se de ter uma empresa com o número correto
3. **Testar Fluxo Completo**: Envie mensagens reais via WhatsApp
4. **Monitorar Logs**: Acompanhe o processamento das mensagens

---

**Nota**: Lembre-se de que o ngrok gera uma nova URL a cada reinicialização. Atualize o webhook no Twilio sempre que reiniciar o ngrok.