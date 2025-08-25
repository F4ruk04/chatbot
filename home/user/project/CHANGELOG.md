
# Changelog

Todas as mudanças notáveis neste projeto serão documentadas neste arquivo.

## [Não Lançado]

### Corrigido
- 2024-12-19: Corrigido erro de compilação TypeScript no componente SubscriptionStatusCard
  - Criado componente SubscriptionStatusCard com interface TypeScript adequada
  - Adicionada propriedade isLoading opcional com tipo boolean
  - Implementado estado de loading com skeleton animation
  - Corrigido import no dashboard page
  - Resolvido erro "Property 'isLoading' does not exist on type 'IntrinsicAttributes & object'"

### Adicionado
- 2024-12-19: Implementado componente SubscriptionStatusCard completo
  - Estado de carregamento com animação skeleton
  - Design responsivo com suporte a tema escuro
  - Interface TypeScript adequada para props
  - Exportação default correta do componente

## [1.0.0] - 2024-12-19

### Adicionado
- Configuração inicial do projeto Next.js 14
- Sistema de autenticação com Supabase
- Dashboard básico com proteção de rotas
- Componentes de UI base (AuthGuard, etc.)
- Configuração do Tailwind CSS
- Suporte a tema escuro
