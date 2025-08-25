# Changelog

## [1.1.4] - 2025-08-25
### Fixed
- Fixed additional TypeScript build errors in Vercel deployment:
 - Removed unused eslint-disable directive in frontend/src/app/companies/page.tsx
  - Fixed React Hook useEffect missing dependency: 'loadDashboardData' in frontend/src/app/dashboard/page.tsx
  - Fixed React Hook useEffect missing dependency: 'fetchCurrentPlan' in frontend/src/components/SmartPricingButton.tsx
  - Fixed React Hook useEffect missing dependency: 'fetchCurrentPlan' in frontend/src/app/billing/page.tsx
  - Fixed unexpected any type in frontend/src/lib/utils.ts
## [1.1.3] - 2025-08-25
### Fixed
- Fixed TypeScript build errors in Vercel deployment:
  - Created proper SubscriptionStatus interface in frontend/src/lib/api.ts
  - Updated subscriptionAPI.getStatus to use explicit type instead of any
  - Fixed generic types in frontend/src/lib/utils.ts
  - Fixed React hook dependencies in frontend/src/components/SubscriptionStatusCard.tsx
## [1.1.2] - 2025-08-25
### Fixed
- Added explicit Promise type annotation to subscriptionAPI.getStatus function in frontend/src/lib/api.ts to improve TypeScript type safety
## [1.1.1] - 2025-08-24
### Fixed
- Fixed missing logger import in Twilio WhatsApp service that was causing webhook failures
## [2025-08-24] - Correção de `undefined` `response.data` no SubscriptionStatusCard

### Fixed
*   **`response.data` `undefined` no `SubscriptionStatusCard`**:
    - Corrigido o problema onde `response.data` era `undefined` no `SubscriptionStatusCard` mesmo após uma resposta 200 OK da API.
    - Identificado que `frontend/src/lib/api.ts` já retornava o payload de dados diretamente (`response.data`), mas `frontend/src/components/SubscriptionStatusCard.tsx` estava incorretamente tentando acessar `response?.data` novamente.
    - A linha `const data = response?.data;` foi alterada para `const data = response;` em `frontend/src/components/SubscriptionStatusCard.tsx` para acessar o payload de dados diretamente.
    - Removidos logs de depuração temporários e a exibição de `rawApiResponseData` da UI.

## [2025-08-23] - Robustecimento do SubscriptionStatusCard e tratamento de erros (Iteração 2)

### Fixed
*   **Comportamento inconsistente do SubscriptionStatusCard**:
    - Ajustado `frontend/src/components/SubscriptionStatusCard.tsx` para garantir que o card exiba imediatamente os dados do plano, mesmo se a resposta da API estiver parcial ou incompleta, aplicando valores padrão (`plan: "FREE"`, `status: "inactive"`, `renewal_date: new Date().toISOString()`).
    - Implementado um bloco `finally` na função `fetchSubscriptionStatus` para assegurar que `setLoading(false)` seja sempre chamado, evitando que o card fique travado em "processando" ou piscando repetidamente.
    - Reforçado o tratamento de 429 (Too Many Requests) com exponential backoff de até 5 tentativas.
    - Garantido fallback visual consistente e mensagens claras em caso de falha de conexão ou erro do backend.
    - Preservada compatibilidade total com a interface TypeScript `SubscriptionStatus`.

### Added
*   **Logs de depuração temporários (aprimorados e UI-visible)**:
    - Re-adicionados e aprimorados logs em `frontend/src/components/SubscriptionStatusCard.tsx` para depurar o processamento da resposta da API (`DEBUG: Subscription API raw response data:`, `DEBUG: Processed subscription status:`) e a atualização do estado, bem como o fluxo de carregamento.
    - Adicionada exibição temporária do `rawApiResponseData` diretamente na UI do `SubscriptionStatusCard` em caso de erro ou dados incompletos para facilitar a depuração.
    - Adicionados logs em `frontend/src/lib/api.ts` dentro de `subscriptionAPI.getStatus` para inspecionar o objeto `response` completo e `response.data` antes de ser retornado.

## [2025-08-23] - Melhorias no tratamento de erros e otimização de chamadas de API

### Fixed
*   **Tratamento de erros no Dashboard**:
    - Corrigido erro de tipo TypeScript "'err.response.status' is possibly 'undefined'" em `frontend/src/app/dashboard/page.tsx`.
    - Implementado tratamento robusto para erros de rede e HTTP (400, 401, >=500), garantindo mensagens de erro padrão.
*   **Problemas de status da subscrição e 429 Too Many Requests**:
    - Implementado mecanismo de exponential backoff e retries em `frontend/src/components/SubscriptionStatusCard.tsx` para reduzir a frequência de chamadas de API e lidar com erros 429.
    - Corrigido erro de tipo TypeScript no bloco `catch` de `SubscriptionStatusCard.tsx`.

### Removed
*   **Logs de depuração temporários (anteriores)**:
    - Removidos logs adicionados em `frontend/src/lib/api.ts` para `API_BASE_URL` e headers de requisição.
    - Removidos logs adicionados em `backend/app/utils/auth.py` para token JWT e payload decodificado.

## [2025-08-23] - Aumento do limite de taxa da API

### Changed
*   **Limite de taxa da API**:
    - Aumentado o limite de taxa para 500 requisições por minuto por IP em `backend/app/middleware/performance.py` para mitigar erros 429 persistentes.

## [2025-08-23] - Correção de erro de tipo TypeScript no tratamento de erros do dashboard

### Fixed
*   **Problemas de tipo TypeScript no dashboard**:
    - Corrigido erro "'err.response.status' is possibly 'undefined'" no build do Next.js
    - Implementado tratamento seguro de erros de rede e HTTP no componente de dashboard
    - Adicionado tratamento para códigos de status 400, 401 e >=500
    - Garantido que errorMessage sempre recebe um valor string padrão
## [2025-08-23] - Correção de problemas críticos identificados pelo TestSprite e autenticação

### Fixed
*   **Problemas críticos identificados pelo TestSprite**:
    - Corrigido erro SQLAlchemy no health check usando `text()` para evitar warnings
    - Resolvido problema `net::ERR_EMPTY_RESPONSE` no carregamento de recursos JavaScript
    - Corrigidos timeouts na navegação com otimizações de performance
    - Melhorada configuração CORS para resolver problemas de comunicação cross-domain
*   **Problemas de autenticação**:
    - Corrigido erro "Erro ao salvar dados de autenticação" no login
    - Removida configuração de domínio específico para cookies que causava problemas cross-domain
    - Melhorada verificação de cookies com logs detalhados e mais tentativas
    - Adicionados headers `Cookie` e `Set-Cookie` na configuração CORS
*   **Otimizações de performance**:
    - Configurado pool de conexões do banco de dados com `pool_pre_ping` e reciclagem
    - Adicionadas otimizações de webpack no Next.js para desenvolvimento
    - Configurada compressão e cache otimizado para recursos estáticos
    - Melhorado timeout e configuração `withCredentials` no cliente API

### Added
*   **Configurações de otimização**:
    - `experimental.optimizePackageImports` para reduzir bundle size
    - Headers de cache otimizados para recursos estáticos
    - Configuração de pool de conexões para PostgreSQL em produção
    - Logs detalhados para debug de autenticação
*   **Melhorias de segurança**:
    - Configuração CORS expandida com cache de preflight requests
    - Headers de segurança mantidos e otimizados
    - Verificação robusta de dados de autenticação

### Changed
*   **Configuração de banco de dados**:
    - Alterado para usar PostgreSQL em produção (Railway)
    - Mantido SQLite para desenvolvimento local
    - Configurado pool de conexões com 10 conexões base + 20 overflow
*   **Configuração de cookies**:
    - Cookies salvos no domínio do frontend (Vercel)
    - Backend recebe cookies via CORS configurado
    - Removida configuração de domínio específico que causava problemas
*   **Processo de verificação de autenticação**:
    - Aumentado número de tentativas de 10 para 20
    - Aumentado delay entre tentativas de 50ms para 100ms
    - Adicionados logs detalhados para cada tentativa

### Technical Details
*   **Backend (FastAPI)**:
    - `backend/app/routers/health.py`: Corrigido uso de `text()` do SQLAlchemy
    - `backend/main.py`: CORS otimizado com headers específicos
    - `backend/app/database.py`: Pool de conexões configurado
    - `backend/app/config.py`: PostgreSQL configurado para produção
*   **Frontend (Next.js)**:
    - `frontend/next.config.ts`: Otimizações de carregamento e cache
    - `frontend/src/lib/api.ts`: Timeout e withCredentials adicionados
    - `frontend/src/app/layout.tsx`: Metadata otimizado
    - `frontend/src/middleware.ts`: Roteamento corrigido
    - `frontend/src/lib/auth.ts`: Verificação de cookies melhorada
    - `frontend/src/app/login/page.tsx`: Processo de login robusto

## [2025-08-23] - TestSprite integration and frontend fixes

### Fixed
*   Corrigido problema de carregamento de recursos estáticos do frontend que causava falhas nos testes TestSprite
*   Removida configuração `output: 'standalone'` do next.config.ts que era incompatível com o modo de desenvolvimento
*   Resolvido problema de chunks JavaScript não encontrados que impediam a execução dos testes automatizados

### Added
*   Configurada integração com TestSprite para testes automatizados
*   Verificada e corrigida a configuração do servidor MCP TestSprite
## [2025-08-23] - Fix API URL configuration issues

### Fixed
*   Corrigido problema de configuração de URL da API que causava erros de rede
*   Ajustado a regra de reescrita no next.config.ts para evitar caminhos de API duplicados
*   Corrigida a configuração do ambiente para evitar erros de "not found"

## [2025-08-23] - Fix dashboard "not found" issue in production

### Fixed
*   Corrigido problema de "not found" no dashboard em produção
*   Ajustado a configuração do Next.js para evitar caminhos de API duplicados
*   Corrigida a regra de reescrita para encaminhar corretamente as chamadas da API

## [2025-08-23] - Correção de bugs críticos e preparação para implantação em produção

### Fixed
*   Corrigido problema com o endpoint de status da subscrição (rota incorreta)
*   Resolvido problema de compatibilidade com SQLite nas migrações
*   Corrigido problema com o modelo de resposta da empresa
*   Corrigido problema com o caminho do endpoint da subscrição
*   Resolvido problema de tratamento de erros no componente de gráfico do dashboard
*   Corrigido problema com o tipo de variável na cláusula catch do componente de status da subscrição
*   Resolvido problema com a configuração do ambiente
*   Corrigido problema com a verificação do fluxo de autenticação e registo
*   Resolvido problema com as migrações da base de dados e o esquema
*   Corrigido problema com a validação dos endpoints da API e tratamento de erros
*   Resolvido problema com as configurações de implantação

### Added
*   Adicionada verificação abrangente do fluxo de autenticação
*   Adicionados testes para as migrações da base de dados
*   Adicionada validação de endpoints da API
*   Adicionadas verificações de configuração de implantação

### Changed
*   Melhorado o tratamento de erros em toda a aplicação
*   Atualizada a documentação com tarefas pendentes para implantação em produção

## [2025-08-22] - Correção de bugs críticos

### Fixed
*   Corrigido problema com o endpoint de status da subscrição
*   Resolvido problema com o modelo de resposta da empresa
*   Corrigido problema com o caminho do endpoint da subscrição
*   Resolvido problema de tratamento de erros no componente de gráfico do dashboard
*   Corrigido problema com o tipo de variável na cláusula catch do componente de status da subscrição

## [2025-08-21] - Correção de bugs críticos

### Fixed
*   Corrigido problema com a importação do modelo de subscrição nas migrações
*   Resolvido problema com o caminho do endpoint de status da subscrição
*   Corrigido problema com a validação do modelo de resposta da empresa

## Próximas Mudanças Planejadas

### [Em Desenvolvimento] - Melhorias de Performance e Monitoramento
*   **Monitoramento e Logs**:
    - Implementar sistema de logs estruturados (Structured Logging)
    - Adicionar métricas de performance (APM)
    - Configurar alertas automáticos para erros críticos
    - Implementar health checks mais robustos
*   **Otimizações de Performance**:
    - Implementar cache Redis para sessões e dados frequentes
    - Otimizar queries do banco de dados com índices
    - Implementar lazy loading para componentes pesados
    - Adicionar service workers para cache offline
*   **Segurança**:
    - Implementar rate limiting para APIs
    - Adicionar validação de entrada mais robusta
    - Implementar auditoria de ações do usuário
    - Configurar HTTPS strict transport security

### [Planejado] - Novas Funcionalidades
*   **Dashboard Avançado**:
    - Gráficos interativos com filtros avançados
    - Exportação de relatórios em PDF/Excel
    - Dashboard personalizável por usuário
    - Notificações em tempo real
*   **Integrações**:
    - Integração com CRM (HubSpot, Salesforce)
    - Webhooks personalizáveis
    - API REST completa com documentação
    - SDK para desenvolvedores
*   **Chatbot Inteligente**:
    - Treinamento personalizado por empresa
    - Suporte a múltiplos idiomas
    - Análise de sentimento das conversas
    - Integração com IA avançada (GPT-4, Claude)

### [Futuro] - Escalabilidade e Arquitetura
*   **Microserviços**:
    - Separação em serviços independentes
    - Message queues para processamento assíncrono
    - Load balancing e auto-scaling
    - Circuit breakers para resiliência
*   **Multi-tenancy**:
    - Suporte a múltiplas organizações
    - Isolamento de dados por tenant
    - Customização por organização
    - White-label solutions

## Tarefas Pendentes para Implantação em Produção

*   ✅ Deploy backend para Railway com base de dados PostgreSQL
*   ✅ Deploy frontend para Vercel com URL da API de produção
*   Configurar domínios personalizados para ambos os serviços
*   Configurar monitoramento e rastreamento de erros
*   Testar implantação em produção minuciosamente
*   Configurar webhook do Twilio para ambiente de produção
*   Configurar pipelines CI/CD para implantações automatizadas

## [2025-08-24] - Correção de envio de mensagens WhatsApp e robustez do serviço Twilio

### Fixed
*   **Falha no envio de mensagens WhatsApp**:
    - Corrigido o problema onde mensagens recebidas via WhatsApp não estavam sendo respondidas.
    - Identificado que `twilio_whatsapp_number` em `backend/app/config.py` não estava lendo a variável de ambiente `TWILIO_WHATSAPP_NUMBER`, fazendo com que sempre usasse o número do sandbox do Twilio (`whatsapp:+14155238886`) como fallback.
    - Corrigido `backend/app/config.py` para mapear corretamente `twilio_whatsapp_number` à variável de ambiente `TWILIO_WHATSAPP_NUMBER`.
    - Adicionado `TWILIO_WHATSAPP_NUMBER` ao `backend/.env` com um placeholder para facilitar a configuração.
*   **Robustez do serviço Twilio**:
    - Adicionado logging detalhado em `backend/app/services/twilio_whatsapp_service.py` para traçar os valores de `to_number`, `message`, e `from_number` durante o envio de mensagens, facilitando a depuração futura.
