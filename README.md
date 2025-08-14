# 🤖 SaaS Chatbot Inteligente - Guia de Testes com Twilio

Sistema completo de chatbot inteligente para empresas com integração WhatsApp via Twilio e Gemini AI.

## 📋 Índice

- [Visão Geral do Sistema](#-visão-geral-do-sistema)
- [Lógica de Funcionamento](#-lógica-de-funcionamento)
- [Pré-requisitos](#-pré-requisitos)
- [Configuração Inicial](#-configuração-inicial)
- [Teste com Twilio Sandbox](#-teste-com-twilio-sandbox)
- [Teste com ngrok](#-teste-com-ngrok)
- [Funcionalidades do Frontend](#-funcionalidades-do-frontend)
- [Roadmap para Produção](#-roadmap-para-produção)
- [Resolução de Problemas](#-resolução-de-problemas)

## 🎯 Visão Geral do Sistema

### **Lógica de Funcionamento:**
1. **Multi-tenancy**: Cada empresa tem seu próprio número Twilio WhatsApp
2. **Identificação**: Sistema identifica empresa pelo número WhatsApp que recebeu a mensagem
3. **IA Personalizada**: Cada empresa tem contexto personalizado para o Gemini AI
4. **Fluxo de Mensagens**: Cliente → Número Twilio da Empresa → Sistema → Gemini AI → Resposta → Cliente

### **Arquitetura:**
- **Frontend**: Next.js com interface moderna para gestão
- **Backend**: FastAPI com webhook para Twilio
- **Banco**: PostgreSQL para dados de empresas e mensagens
- **IA**: Google Gemini para respostas inteligentes
- **WhatsApp**: Twilio WhatsApp Business API

## 🔧 Lógica de Funcionamento

### **Fluxo de Teste:**
```
1. Você (cliente) → Envia mensagem para número Twilio Sandbox
2. Twilio → Envia webhook para seu servidor (via ngrok)
3. Sistema → Identifica empresa pelo número recebido
4. Sistema → Gera resposta usando Gemini AI + contexto da empresa
5. Sistema → Envia resposta via Twilio
6. Twilio → Entrega resposta para você (cliente)
```

### **Identificação de Empresa:**
- Cada empresa cadastrada tem um `whatsapp_phone_number` único
- Sistema usa este número para identificar qual empresa deve responder
- Contexto personalizado é aplicado para respostas específicas

## 📋 Pré-requisitos

### **Software Necessário:**
- ✅ **Docker Desktop** (versão 20.0+)
- ✅ **Docker Compose** (versão 2.0+)
- ✅ **ngrok** (já incluído no projeto)
- ✅ **Git** (para clonar o repositório)

### **Contas e Chaves:**
- 🔑 **Google AI Studio** (Gemini API Key)
- 🔑 **Twilio Account** (Account SID, Auth Token, WhatsApp Number)
- 🔑 **ngrok Account** (para túnel público)

## 🚀 Configuração Inicial

### **1. Clonar e Preparar Projeto**
```bash
# Clonar repositório
git clone <url-do-repositorio>
cd saas-chatbot-inteligente-twilio

# Verificar se Docker está rodando
docker --version
docker-compose --version
```

### **2. Configurar Variáveis de Ambiente**
```bash
# Criar arquivo .env na raiz do projeto
touch .env
```

**Conteúdo do arquivo `.env`:**
```env
# Google Gemini AI
GEMINI_API_KEY=sua_chave_gemini_aqui

# Twilio WhatsApp
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=seu_twilio_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886

# JWT Secret
JWT_SECRET=seu_jwt_secret_super_seguro_2024

# ngrok (opcional)
NGROK_AUTH_TOKEN=seu_ngrok_auth_token
```

### **3. Obter Chaves Necessárias**

#### **Google Gemini AI:**
1. Acesse: https://makersuite.google.com/app/apikey
2. Crie uma nova API Key
3. Copie a chave para `GEMINI_API_KEY`

#### **Twilio WhatsApp:**
1. Acesse: https://console.twilio.com/
2. Crie uma conta gratuita
3. Vá para "Messaging" → "Try it out" → "Send a WhatsApp message"
4. Copie:
   - Account SID
   - Auth Token
   - Número WhatsApp Sandbox (ex: +14155238886)

## 🧪 Teste com Twilio Sandbox

### **1. Iniciar Sistema com Docker**
```bash
# Construir e iniciar todos os serviços
docker-compose up --build

# Aguardar todos os serviços estarem prontos
# Backend: http://localhost:8000
# Frontend: http://localhost:3000
# Database: localhost:5432
```

### **2. Criar Conta e Empresa**
1. **Acesse**: http://localhost:3000/register
2. **Crie conta**: Nome, email, senha
3. **Faça login**: http://localhost:3000/login
4. **Vá para Empresas**: http://localhost:3000/companies
5. **Adicione empresa**:
   - Nome: "Minha Empresa Teste"
   - WhatsApp: `+14155238886` (número Twilio Sandbox)
   - Contexto: "Você é um assistente de suporte técnico especializado em produtos eletrônicos. Sempre seja cordial e ajude o cliente com suas dúvidas sobre produtos, garantias e suporte técnico."

### **3. Configurar ngrok**
```bash
# Em novo terminal, na pasta do projeto
./ngrok.exe http 8000

# Copie a URL HTTPS gerada (ex: https://abc123.ngrok.io)
```

### **4. Configurar Webhook no Twilio**
1. **Acesse**: https://console.twilio.com/
2. **Vá para**: Messaging → Settings → WhatsApp Sandbox Settings
3. **Configure Webhook URL**: `https://abc123.ngrok.io/whatsapp/webhook`
4. **Salve configurações**

### **5. Testar Chatbot**
1. **No WhatsApp**: Envie "join <código>" para o número Twilio Sandbox
2. **Envie mensagem**: "Olá, preciso de ajuda com meu produto"
3. **Verifique resposta**: Deve receber resposta baseada no contexto da empresa
4. **Verifique logs**: No terminal do Docker para ver o processamento

## 🌐 Teste com ngrok

### **1. Verificar ngrok**
```bash
# Verificar se ngrok está funcionando
curl https://abc123.ngrok.io/health

# Verificar webhook endpoint
curl -X POST https://abc123.ngrok.io/whatsapp/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+351912345678&To=whatsapp:+14155238886&Body=test&MessageSid=test123"
```

### **2. Monitorar Logs**
```bash
# Ver logs do backend
docker-compose logs -f backend

# Ver logs específicos do webhook
docker-compose logs -f backend | grep webhook
```

### **3. Testar Diferentes Cenários**
```bash
# Teste 1: Mensagem simples
"Olá, como posso ajudar?"

# Teste 2: Pergunta técnica
"Meu produto não liga, o que faço?"

# Teste 3: Informações de garantia
"Qual a garantia do produto?"

# Teste 4: Horário de funcionamento
"Qual o horário de atendimento?"
```

## 🎨 Funcionalidades do Frontend

### **Páginas Funcionais:**

#### **1. Login/Registro** ✅
- **URL**: `/login`, `/register`
- **Funcionalidade**: Autenticação JWT completa
- **Design**: Moderno com gradientes e animações

#### **2. Dashboard** ✅
- **URL**: `/dashboard`
- **Funcionalidade**: Estatísticas em tempo real
- **Cards**: Total empresas, mensagens, conversas ativas
- **Gráfico**: Atividade dos últimos 7 dias

#### **3. Gestão de Empresas** ✅
- **URL**: `/companies`
- **Funcionalidade**: CRUD completo de empresas
- **Formulário**: Nome, descrição, WhatsApp, contexto
- **Lista**: Pesquisa, filtros, ações (editar/excluir)

### **Botões Funcionais:**
- ✅ **Adicionar Empresa**: Formulário completo
- ✅ **Pesquisar**: Filtro em tempo real
- ✅ **Editar**: Modal de edição (preparado)
- ✅ **Excluir**: Confirmação e remoção (preparado)
- ✅ **Navegação**: Links entre páginas
- ✅ **Logout**: Limpeza de cookies e redirecionamento

## 🚀 Roadmap para Produção

### **Fase 1: Preparação para Clientes Reais**
```bash
# 1. Configurar Twilio WhatsApp Business
- Migrar de Sandbox para WhatsApp Business API
- Obter número dedicado para cada empresa
- Configurar webhook de produção

# 2. Melhorar Segurança
- Variáveis de ambiente em produção
- HTTPS obrigatório
- Rate limiting
- Validação de entrada

# 3. Monitoramento
- Logs estruturados
- Métricas de performance
- Alertas de erro
```

### **Fase 2: Funcionalidades Avançadas**
```bash
# 1. Gestão de Conversas
- Histórico completo de conversas
- Status de conversa (aberta/fechada)
- Transferência para humano

# 2. Templates de Mensagem
- Mensagens automáticas
- Respostas rápidas
- Fluxos de conversa

# 3. Analytics Avançado
- Tempo de resposta
- Satisfação do cliente
- Relatórios personalizados
```

### **Fase 3: Escalabilidade**
```bash
# 1. Multi-tenancy Avançado
- Subdomínios por empresa
- Temas personalizados
- Configurações específicas

# 2. Integrações
- CRM (HubSpot, Salesforce)
- E-commerce (Shopify, WooCommerce)
- Pagamentos (Stripe, PayPal)

# 3. IA Avançada
- Treinamento customizado
- Análise de sentimento
- Detecção de intenção
```

### **Fase 4: Monetização**
```bash
# 1. Planos de Assinatura
- Plano Básico: 1 empresa, 1000 mensagens/mês
- Plano Pro: 5 empresas, 10000 mensagens/mês
- Plano Enterprise: Ilimitado

# 2. Recursos Premium
- IA customizada
- Integrações avançadas
- Suporte prioritário
- White-label
```

## 🔧 Resolução de Problemas

### **Problemas Comuns:**

#### **1. Docker não inicia**
```bash
# Verificar se Docker Desktop está rodando
# Limpar containers antigos
docker-compose down -v
docker system prune -a
docker-compose up --build
```

#### **2. ngrok não conecta**
```bash
# Verificar se porta 8000 está livre
netstat -an | findstr :8000

# Usar porta alternativa
./ngrok.exe http 8001
```

#### **3. Webhook não recebe mensagens**
```bash
# Verificar URL no Twilio
# Verificar logs do backend
docker-compose logs -f backend

# Testar endpoint manualmente
curl -X POST http://localhost:8000/whatsapp/webhook \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "From=whatsapp:+351912345678&To=whatsapp:+14155238886&Body=test&MessageSid=test123"
```

#### **4. Gemini não responde**
```bash
# Verificar API Key
echo $GEMINI_API_KEY

# Testar API diretamente
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent \
  -H "Authorization: Bearer $GEMINI_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Olá, como você está?"}]}]}'
```

### **Logs Úteis:**
```bash
# Logs do backend
docker-compose logs -f backend

# Logs do frontend
docker-compose logs -f frontend

# Logs do banco
docker-compose logs -f db

# Logs específicos
docker-compose logs backend | grep -i error
docker-compose logs backend | grep -i webhook
```

## 📞 Suporte

### **Para Testes:**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **Documentação API**: http://localhost:8000/docs
- **Banco de Dados**: localhost:5432

### **Para Produção:**
- **Monitoramento**: Implementar sistema de logs
- **Backup**: Configurar backup automático do banco
- **SSL**: Configurar certificados HTTPS
- **CDN**: Implementar CDN para assets

---

## 🎯 Próximos Passos

1. **Teste Completo**: Execute todos os passos acima
2. **Validação**: Confirme que mensagens são processadas corretamente
3. **Melhorias**: Implemente funcionalidades adicionais conforme necessário
4. **Produção**: Siga o roadmap para preparar para clientes reais

**Boa sorte com os testes! 🚀**

