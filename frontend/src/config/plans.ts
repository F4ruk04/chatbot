import { MessageCircle, DollarSign, Calendar, Shield, Zap, Crown, LucideIcon } from 'lucide-react';

export interface PlanFeature {
  text: string;
}

export interface PlanDetails {
  id: string; // Usado para identificação interna, pode ser o mesmo que o nome
  name: string;
  price: number; // Preço em MZN
  priceDisplay: string; // Preço formatado para exibição
  description: string;
  features: PlanFeature[];
  ctaText: string;
  popular?: boolean;
  color: string; // Cor de fundo para cards
  gradient: string; // Gradiente para cards
  icon: LucideIcon; // Ícone Lucide
  companyLimit: number;
  messageLimit: number;
  // Novos campos para melhor controle
  hasDetailedHistory: boolean;
  hasExport: boolean;
  supportLevel: 'basic' | 'priority' | 'vip';
  dashboardType: 'basic' | 'advanced' | 'complete';
}

export const PLANS: PlanDetails[] = [
  {
    id: 'Básico',
    name: 'Básico',
    price: 0,
    priceDisplay: '0 MZN',
    description: 'Para testar a plataforma e para negócios com baixo volume de conversas.',
    features: [
      { text: '1 conexão WhatsApp (1 empresa)' },
      { text: '150 mensagens/mês' },
      { text: 'Dashboard simples: uso de mensagens + status da assinatura' },
      { text: '⚠️ Aviso automático aos 80% do limite' },
      { text: 'Limitação: sem histórico detalhado e sem exportação' },
    ],
    ctaText: 'Comece Grátis',
    color: 'bg-gray-500',
    gradient: 'from-gray-500 to-gray-600',
    icon: Shield,
    companyLimit: 1,
    messageLimit: 150,
    hasDetailedHistory: false,
    hasExport: false,
    supportLevel: 'basic',
    dashboardType: 'basic',
  },
  {
    id: 'Profissional',
    name: 'Profissional',
    price: 2499,
    priceDisplay: '2.499 MZN',
    description: 'A escolha ideal para empresas que buscam profissionalizar o atendimento e vender mais.',
    features: [
      { text: '1 conexão WhatsApp (1 empresa)' },
      { text: '5.000 mensagens/mês' },
      { text: 'Dashboard avançado: histórico de mensagens usadas + gráficos de consumo mensal' },
      { text: '⚠️ Aviso automático aos 80% do limite' },
      { text: 'Suporte básico por email' },
    ],
    ctaText: 'Escolher Plano Profissional',
    popular: true,
    color: 'bg-blue-500',
    gradient: 'from-blue-500 to-blue-600',
    icon: Zap,
    companyLimit: 1,
    messageLimit: 5000,
    hasDetailedHistory: true,
    hasExport: false,
    supportLevel: 'priority',
    dashboardType: 'advanced',
  },
  {
    id: 'Business',
    name: 'Business',
    price: 6999,
    priceDisplay: '6.999 MZN',
    description: 'Para negócios que exigem o máximo de performance e um suporte personalizado.',
    features: [
      { text: 'Até 3 conexões WhatsApp (3 empresas)' },
      { text: '10.000 mensagens/mês' },
      { text: 'Dashboard completo: estatísticas por empresa + comparação entre conexões' },
      { text: '⚠️ Aviso automático aos 80% do limite' },
      { text: 'Exportação de relatórios (CSV/Excel)' },
      { text: 'Suporte prioritário' },
    ],
    ctaText: 'Escolher Plano Business',
    color: 'bg-purple-500',
    gradient: 'from-purple-500 to-purple-600',
    icon: Crown,
    companyLimit: 3,
    messageLimit: 10000,
    hasDetailedHistory: true,
    hasExport: true,
    supportLevel: 'vip',
    dashboardType: 'complete',
  }
];

// Funções utilitárias para trabalhar com planos
export const getPlanById = (id: string): PlanDetails | undefined => {
  return PLANS.find(plan => plan.id === id);
};

export const getPlanByName = (name: string): PlanDetails | undefined => {
  return PLANS.find(plan => plan.name === name);
};

export const getAllPlans = (): PlanDetails[] => {
  return PLANS;
};

export const getPlanLimits = (planId: string) => {
  const plan = getPlanById(planId);
  if (!plan) return { companyLimit: 0, messageLimit: 0 };

  return {
    companyLimit: plan.companyLimit,
    messageLimit: plan.messageLimit,
  };
};

export const canAccessFeature = (planId: string, feature: keyof PlanDetails): boolean => {
  const plan = getPlanById(planId);
  if (!plan) return false;

  switch (feature) {
    case 'hasDetailedHistory':
      return plan.hasDetailedHistory;
    case 'hasExport':
      return plan.hasExport;
    default:
      return true;
  }
};
