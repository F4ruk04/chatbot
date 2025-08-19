# Changelog

## 2025-08-19
- **Fix**: Resolved `Unexpected any` TypeScript error in `frontend/src/components/DashboardChart.tsx` by explicitly typing `apiData` in `processChartData` function.
- **Fix**: Corrected `useCallback` dependency warning in `frontend/src/contexts/NotificationContext.tsx` by reordering and adding `removeNotification` to the dependency array.
- **Fix**: Ensured `useNotification` hook is used within `NotificationProvider` by wrapping `children` in `frontend/src/app/layout.tsx` with `NotificationProvider` to resolve prerendering error on `/login` page.
- **Fix**: Refactored `frontend/src/app/register/plan/page.tsx` to dynamically import `PlanContentClient.tsx` with `ssr: false` to resolve `useSearchParams` prerendering error. Created `frontend/src/app/register/plan/PlanContentClient.tsx` to house the client-side logic.
- **Fix**: Removed `ssr: false` from dynamic import in `frontend/src/app/register/plan/page.tsx` as it's not allowed in Server Components, relying on `'use client'` in `PlanContentClient.tsx` for client-side rendering.
- **Troubleshooting**: Encountered `ENOENT` error for `pages-manifest.json` and `MODULE_NOT_FOUND` for `/companies/new/page.js` during local build. Cleaned `node_modules` and reinstalled dependencies.
- **Troubleshooting**: Persistent "npm error Invalid Version" on Vercel. Incremented `package.json` version to `0.1.1` to trigger rebuild. Attempted aggressive local cleanup and reinstall.
- **Final Diagnosis (Frontend Build)**: The "npm error Invalid Version" on Vercel was due to a corrupted Vercel build cache.
- **Solution (Frontend Build)**: Modified `frontend/vercel.json` to include `rm -rf node_modules package-lock.json` in the `installCommand` to force a clean dependency installation on Vercel.
- **New Errors (Runtime)**: "Cannot show subscription status" and "Error creating account" on the deployed site.
- **Diagnosis (Backend Runtime)**: Backend API calls are failing, likely due to unapplied database migrations or database connectivity issues on Railway. The `RAILWAY_DEPLOY_READY.md` indicates `start.sh` runs migrations.
- **Solution (Backend Runtime)**: User needs to manually ensure PostgreSQL database is correctly provisioned and connected on Railway, and trigger a redeploy of the backend application to ensure `start.sh` runs and applies migrations.

## Resumo do Projeto: SaaS Chatbot Inteligente

### Visão Geral
Sistema SaaS (Software as a Service) que permite empresas criarem e gerenciarem chatbots inteligentes integrados ao WhatsApp Business via Twilio. O sistema utiliza IA do Google Gemini para gerar respostas contextualizadas e personalizadas para cada empresa.

### Arquitetura Técnica

#### Backend (FastAPI + Python)
- **API REST** com FastAPI para gerenciamento de empresas, usuários e mensagens
- **Banco PostgreSQL** para persistência de dados (usuários, empresas, mensagens)
- **Integração Twilio** para receber/enviar mensagens WhatsApp via webhooks
- **IA Google Gemini** para gerar respostas inteligentes baseadas no contexto da empresa
- **Autenticação JWT** para segurança e controle de acesso
- **Deploy Railway** com variáveis de ambiente para configuração

#### Frontend (Next.js + React)
- **Interface web responsiva** para gerenciamento do sistema
- **Dashboard** com estatísticas de mensagens e conversas
- **CRUD de empresas** com configuração de contexto para IA
- **Sistema de autenticação** integrado com backend
- **Deploy Vercel** com integração contínua

### Fluxo de Funcionamento
1. **Empresa se registra** no sistema web
2. **Configura contexto** específico para seu chatbot (produtos, serviços, tom de voz)
3. **Cliente envia mensagem** WhatsApp para número Twilio da empresa
4. **Webhook recebe** mensagem e identifica empresa pelo número
5. **IA Gemini gera resposta** usando contexto da empresa + histórico da conversa
6. **Sistema envia resposta** via Twilio de volta ao cliente
7. **Tudo é registrado** no banco para análise e histórico

### Tecnologias Principais
- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic, Pydantic
- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **IA**: Google Gemini API
- **Messaging**: Twilio WhatsApp Business API
- **Deploy**: Railway (backend), Vercel (frontend)
- **Database**: PostgreSQL com migrações Alembic

### Funcionalidades SaaS
- **Multi-tenant**: Cada empresa tem seu próprio contexto e configurações
- **Dashboard analytics**: Estatísticas de mensagens, conversas ativas
- **Gestão de empresas**: CRUD completo com configuração de contexto IA
- **Histórico de conversas**: Todas as mensagens são armazenadas
- **Autenticação segura**: JWT com controle de acesso por empresa
- **Interface responsiva**: Funciona em desktop e mobile

### Estado Atual
- **Backend**: 100% funcional no Railway com PostgreSQL
- **Frontend**: Deployado no Vercel (com problemas CSS)
- **Integração WhatsApp**: Configurada e testada
- **IA**: Integrada e gerando respostas contextualizadas
- **CORS**: Corrigido para comunicação frontend-backend
- **Database**: Migrações funcionando, dados persistindo

### Próximas Melhorias (DEPOIS):
1. **Sistema pagamentos** (M-Pesa, E-Mola, cartões)
2. **Compra automática números** Twilio
3. **Planos e cobrança** por mensagens
4. **Landing page** comercial
5. **Analytics avançado**
