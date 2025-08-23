# Changelog

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

## Tarefas Pendentes para Implantação em Produção

*   Deploy backend para Railway com base de dados PostgreSQL
*   Deploy frontend para Vercel com URL da API de produção
*   Configurar domínios personalizados para ambos os serviços
*   Configurar monitoramento e rastreamento de erros
*   Testar implantação em produção minuciosamente
*   Configurar webhook do Twilio para ambiente de produção
*   Configurar pipelines CI/CD para implantações automatizadas
