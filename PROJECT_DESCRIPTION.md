# SaaS Chatbot Inteligente - Descrição do Projeto

## Visão Geral
Sistema SaaS (Software as a Service) que permite empresas criarem e gerenciarem chatbots inteligentes integrados ao WhatsApp Business via Twilio. O sistema utiliza IA do Google Gemini para gerar respostas contextualizadas e personalizadas para cada empresa.

## Arquitetura Técnica

### Backend (FastAPI + Python)
- **API REST** com FastAPI para gerenciamento de empresas, usuários e mensagens
- **Banco PostgreSQL** para persistência de dados (usuários, empresas, mensagens)
- **Integração Twilio** para receber/enviar mensagens WhatsApp via webhooks
- **IA Google Gemini** para gerar respostas inteligentes baseadas no contexto da empresa
- **Autenticação JWT** para segurança e controle de acesso
- **Deploy Railway** com variáveis de ambiente para configuração

### Frontend (Next.js + React)
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

### Próximos Passos
- Corrigir carregamento CSS no frontend Vercel
- Configurar webhook Twilio para produção
- Testes finais da integração WhatsApp end-to-end
- Sistema pronto para uso comercial