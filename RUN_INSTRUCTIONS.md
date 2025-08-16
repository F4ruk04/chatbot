# 🚀 **Instruções para Executar a Aplicação**

## 📋 **Pré-requisitos**

- Python 3.11+
- PostgreSQL (ou usar Railway/Supabase)
- Node.js 18+ (para o frontend)

## 🔧 **Configuração do Backend**

### **1. Instalar Dependências:**
```bash
cd backend
pip install -r requirements.txt
```

### **2. Configurar Variáveis de Ambiente:**
Copie `.env.example` para `.env` e configure:
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key-here
GEMINI_API_KEY=your-gemini-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
```

### **3. Executar Migrações:**
```bash
alembic upgrade head
```

### **4. Iniciar o Servidor:**

**Opção A - Comando direto:**
```bash
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

**Opção B - Script Windows:**
```bash
# Na raiz do projeto
start.bat
```

**Opção C - Script Unix/Linux:**
```bash
# Na raiz do projeto
chmod +x start.sh
./start.sh
```

## 🌐 **Configuração do Frontend**

### **1. Instalar Dependências:**
```bash
cd frontend
npm install
```

### **2. Configurar Variáveis de Ambiente:**
```bash
cp .env.example .env.local
```

### **3. Iniciar o Servidor de Desenvolvimento:**
```bash
npm run dev
```

## 🐳 **Executar com Docker**

### **1. Build da Imagem:**
```bash
docker build -t saas-chatbot .
```

### **2. Executar Container:**
```bash
docker run -p 8000:8000 -e DATABASE_URL=your-db-url saas-chatbot
```

## ☁️ **Deploy no Railway**

### **1. Conectar Repositório:**
- Faça push do código para GitHub
- Conecte o repositório no Railway

### **2. Configurar Variáveis de Ambiente:**
No Railway, adicione:
- `DATABASE_URL`
- `SECRET_KEY`
- `GEMINI_API_KEY`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`

### **3. Deploy Automático:**
O Railway usará o `Dockerfile` e `railway.toml` automaticamente.

## 🧪 **Testar a Aplicação**

### **1. Testar Importações:**
```bash
python test_import.py
```

### **2. Verificar API:**
```bash
curl http://localhost:8000/
curl http://localhost:8000/health
```

### **3. Acessar Documentação:**
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## 🔍 **Solução de Problemas**

### **Erro: "Multiple head revisions"**
```bash
cd backend
alembic heads
alembic upgrade head
```

### **Erro: "Module not found"**
```bash
cd backend
pip install -r requirements.txt
```

### **Erro: "Redis connection failed"**
A aplicação funciona sem Redis. Verifique os logs para warnings.

### **Erro: "Database connection failed"**
Verifique se o PostgreSQL está rodando e a `DATABASE_URL` está correta.

## 📊 **Estrutura da Aplicação**

```
saas-chatbot-inteligente-twilio/
├── backend/                 # API FastAPI
│   ├── app/
│   │   ├── models/         # Modelos SQLAlchemy
│   │   ├── routers/        # Endpoints da API
│   │   ├── services/       # Lógica de negócio
│   │   └── middleware/     # Middlewares
│   ├── alembic/            # Migrações do banco
│   └── main.py             # Ponto de entrada
├── frontend/               # Interface Next.js
│   ├── src/
│   │   ├── app/           # Páginas (App Router)
│   │   ├── components/    # Componentes React
│   │   └── hooks/         # Hooks customizados
└── docs/                  # Documentação
```

## 🎯 **Funcionalidades Implementadas**

- ✅ **Autenticação** completa (registro, login, JWT)
- ✅ **Gestão de empresas** e chatbots
- ✅ **Integração WhatsApp** via Twilio
- ✅ **IA Conversacional** com Google Gemini
- ✅ **Sistema de assinaturas** com planos
- ✅ **Controle de acesso** por funcionalidade
- ✅ **Notificações por email** automáticas
- ✅ **Dashboard** com métricas
- ✅ **Interface responsiva** e moderna

## 🆘 **Suporte**

Se encontrar problemas:

1. Verifique os logs da aplicação
2. Confirme que todas as dependências estão instaladas
3. Verifique as variáveis de ambiente
4. Teste as importações com `python test_import.py`

**A aplicação está pronta para produção! 🚀**