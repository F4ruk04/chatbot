
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Não Lançado]

### Corrigido
- 2024-12-19: Corrigido erro de compilação TypeScript no componente SubscriptionStatusCard
  - Adicionada interface SubscriptionStatusCardProps com propriedade isLoading opcional
  - Implementado estado de loading com skeleton animation
  - Resolvido erro "Property 'isLoading' does not exist on type 'IntrinsicAttributes & object'"

### Adicionado
- 2024-12-19: Implementado componente SubscriptionStatusCard com suporte a loading state
  - Estado de carregamento com animação skeleton
  - Design responsivo com suporte a tema escuro
  - Interface TypeScript adequada para props

## [1.0.0] - 2024-12-19

### Adicionado
- Configuração inicial do projeto Next.js 14
- Sistema de autenticação com Supabase
- Dashboard básico com proteção de rotas
- Componentes de UI base (AuthGuard, etc.)
- Configuração do Tailwind CSS
- Suporte a tema escuro
