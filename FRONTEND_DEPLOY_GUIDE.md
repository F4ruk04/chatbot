# 🚀 GUIA DE DEPLOY DO FRONTEND

## OPÇÃO 1: VERCEL (RECOMENDADO - GRÁTIS)

### 1. PREPARAR FRONTEND PARA PRODUÇÃO:

```bash
# No diretório frontend/
npm run build
```

### 2. CONFIGURAR VARIÁVEL DE AMBIENTE:
- Criar arquivo `.env.local` no frontend/:
```
NEXT_PUBLIC_API_URL=https://chatbot-production-d2d7.up.railway.app
```

### 3. DEPLOY NO VERCEL:
1. Ir para: https://vercel.com
2. Conectar com GitHub
3. Importar repositório: F4ruk04/chatbot
4. Configurar:
   - **Framework Preset**: Next.js
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Output Directory**: .next
5. Adicionar Environment Variable:
   - **Name**: NEXT_PUBLIC_API_URL
   - **Value**: https://chatbot-production-d2d7.up.railway.app
6. Deploy!

### 4. RESULTADO:
- Frontend: https://seu-projeto.vercel.app
- Backend: https://chatbot-production-d2d7.up.railway.app

## OPÇÃO 2: RAILWAY (FRONTEND + BACKEND)

### 1. CRIAR NOVO SERVIÇO NO RAILWAY:
1. Dashboard Railway > New Project
2. Deploy from GitHub repo
3. Selecionar: F4ruk04/chatbot
4. Configurar:
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Start Command**: npm start

### 2. VARIÁVEIS DE AMBIENTE:
```
NEXT_PUBLIC_API_URL=https://chatbot-production-d2d7.up.railway.app
```

## OPÇÃO 3: NETLIFY (ALTERNATIVA GRÁTIS)

### 1. PREPARAR BUILD:
```bash
cd frontend
npm run build
npm run export  # Se configurado
```

### 2. DEPLOY:
1. https://netlify.com
2. Drag & drop da pasta `out/` ou `.next/`
3. Configurar variáveis de ambiente

## RECOMENDAÇÃO: VERCEL
- ✅ Especializado em Next.js
- ✅ Deploy automático do GitHub
- ✅ SSL grátis
- ✅ CDN global
- ✅ Fácil configuração