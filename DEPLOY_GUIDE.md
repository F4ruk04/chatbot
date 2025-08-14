# 🚀 Guia de Deploy - Railway

## 📋 Arquivos Criados para Deploy

### ✅ Arquivos de Configuração
- `railway.toml` - Configuração do Railway
- `Dockerfile` - Container otimizado para produção
- `.dockerignore` - Arquivos ignorados no build
- `.env.example` - Template de variáveis de ambiente

### ✅ Modificações Realizadas
- `backend/main.py` - CORS atualizado para produção + health check
- Endpoint `/health` para monitoramento Railway

## 🔧 Próximos Passos

### 1. Push para GitHub
```bash
git add .
git commit -m "Add Railway deploy configuration"
git push origin main
```

### 2. Deploy no Railway
1. Acessar railway.app
2. "Deploy from GitHub repo"
3. Selecionar repositório
4. Adicionar PostgreSQL
5. Configurar variáveis de ambiente

### 3. Variáveis de Ambiente Necessárias
```
TWILIO_ACCOUNT_SID=seu_account_sid
TWILIO_AUTH_TOKEN=seu_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
GEMINI_API_KEY=sua_chave_gemini
JWT_SECRET_KEY=chave_secreta_jwt
```

### 4. URLs Geradas
- Backend: https://backend-production-xxxx.railway.app
- Webhook: https://backend-production-xxxx.railway.app/whatsapp/webhook
- Health: https://backend-production-xxxx.railway.app/health
- Docs: https://backend-production-xxxx.railway.app/docs

## ✅ Sistema Pronto para Deploy!

O sistema está configurado e otimizado para deploy no Railway com:
- ✅ Container Docker otimizado
- ✅ Health check configurado
- ✅ CORS para produção
- ✅ Variáveis de ambiente organizadas
- ✅ Build multi-stage eficiente