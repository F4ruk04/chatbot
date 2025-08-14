# 🚀 DEPLOY FRONTEND NO VERCEL - PASSO A PASSO

## ✅ ARQUIVOS JÁ PREPARADOS:
- ✅ `frontend/vercel.json` - Configuração Vercel
- ✅ `frontend/next.config.ts` - Configuração Next.js para produção
- ✅ `frontend/.env.local` - URL da API configurada
- ✅ `frontend/.gitignore` - Arquivos ignorados

## 🎯 AGORA VOCÊ PRECISA FAZER:

### **PASSO 1: ACESSAR VERCEL**
1. Ir para: https://vercel.com
2. Clicar em **"Sign Up"** ou **"Login"**
3. Escolher **"Continue with GitHub"**
4. Autorizar Vercel no GitHub

### **PASSO 2: IMPORTAR PROJETO**
1. No dashboard Vercel, clicar **"New Project"**
2. Procurar repositório: **"F4ruk04/chatbot"**
3. Clicar **"Import"**

### **PASSO 3: CONFIGURAR PROJETO**
1. **Project Name**: `chatbot-frontend` (ou nome que preferir)
2. **Framework Preset**: Next.js (detectado automaticamente)
3. **Root Directory**: Clicar **"Edit"** e selecionar **"frontend"**
4. **Build and Output Settings**: Deixar padrão
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

### **PASSO 4: CONFIGURAR VARIÁVEIS DE AMBIENTE**
1. Expandir **"Environment Variables"**
2. Adicionar:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: `https://chatbot-production-d2d7.up.railway.app`
   - **Environment**: Production, Preview, Development (todos)
3. Clicar **"Add"**

### **PASSO 5: DEPLOY**
1. Clicar **"Deploy"**
2. Aguardar build (2-3 minutos)
3. ✅ **Deploy concluído!**

## 🎉 RESULTADO ESPERADO:

### **URL FRONTEND:**
```
https://seu-projeto-nome.vercel.app
```

### **FUNCIONALIDADES:**
- ✅ Login/Registro de usuários
- ✅ Dashboard com estatísticas
- ✅ Gerenciamento de empresas
- ✅ Visualização de mensagens
- ✅ Interface responsiva

## 🔧 SE DER ERRO:

### **Build Error:**
1. Verificar se `frontend/package.json` tem todas dependências
2. Verificar se `next.config.ts` está correto
3. Ver logs de build no Vercel

### **API Error:**
1. Verificar se `NEXT_PUBLIC_API_URL` está configurada
2. Testar se backend Railway está online
3. Verificar CORS no backend

## 📱 TESTAR FRONTEND:

### **APÓS DEPLOY:**
1. **Acessar URL** do Vercel
2. **Registrar usuário** novo
3. **Fazer login**
4. **Criar empresa** com número WhatsApp
5. **Ver dashboard** funcionando

---

## 🎯 PRÓXIMO PASSO:
Após frontend online, configurar webhook Twilio para completar integração WhatsApp!