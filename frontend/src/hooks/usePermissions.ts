'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

interface Permission {
  plan: string;
  features: string[];
  limits: {
    messages_per_month: number;
    whatsapp_connections: number;
    companies: number;
  };
  usage: {
    messages: {
      within_limit: boolean;
      used: number;
      quota: number;
      percentage: number;
    };
    companies: {
      within_limit: boolean;
      used: number;
      quota: number;
      percentage: number;
    };
  };
}

export function usePermissions() {
  const [permissions, setPermissions] = useState<Permission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPermissions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/permissions/permissions');
      setPermissions(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Erro ao carregar permissões:', err);
      setError('Erro ao carregar permissões');
      
      // Fallback para dados padrão
      setPermissions({
        plan: 'free',
        features: ['basic_dashboard', 'basic_companies', 'basic_messages'],
        limits: {
          messages_per_month: 150,
          whatsapp_connections: 1,
          companies: 1
        },
        usage: {
          messages: {
            within_limit: true,
            used: 0,
            quota: 150,
            percentage: 0
          },
          companies: {
            within_limit: true,
            used: 0,
            quota: 1,
            percentage: 0
          }
        }
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPermissions();
  }, []);

  const hasFeature = (feature: string): boolean => {
    return permissions?.features.includes(feature) || false;
  };

  const canCreateCompany = (): boolean => {
    return permissions?.usage.companies.within_limit || false;
  };

  const canSendMessage = (): boolean => {
    return permissions?.usage.messages.within_limit || false;
  };

  const isPlan = (planName: string): boolean => {
    return permissions?.plan === planName;
  };

  const hasMinimumPlan = (minPlan: string): boolean => {
    const planHierarchy = { free: 0, pro: 1, business: 2 };
    const userLevel = planHierarchy[permissions?.plan as keyof typeof planHierarchy] || 0;
    const requiredLevel = planHierarchy[minPlan as keyof typeof planHierarchy] || 0;
    return userLevel >= requiredLevel;
  };

  const getUpgradeMessage = (feature: string): string => {
    if (hasFeature(feature)) return '';
    
    const featureMessages = {
      'advanced_dashboard': 'Upgrade para Pro para acessar dashboard avançado',
      'advanced_reports': 'Upgrade para Pro para acessar relatórios detalhados',
      'priority_support': 'Upgrade para Pro para suporte prioritário',
      'custom_branding': 'Upgrade para Pro para remover nossa marca',
      'unlimited_connections': 'Upgrade para Business para conexões ilimitadas',
      'custom_api': 'Upgrade para Business para API personalizada',
      'vip_support': 'Upgrade para Business para suporte VIP',
      'custom_onboarding': 'Upgrade para Business para onboarding personalizado'
    };
    
    return featureMessages[feature as keyof typeof featureMessages] || 'Upgrade necessário para esta funcionalidade';
  };

  return {
    permissions,
    loading,
    error,
    hasFeature,
    canCreateCompany,
    canSendMessage,
    isPlan,
    hasMinimumPlan,
    getUpgradeMessage,
    refetch: fetchPermissions
  };
}