'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api'; // Import the configured axios instance

interface Feature {
  name: string;
  enabled: boolean;
  requiresUpgrade: boolean;
}

export function useFeatures() {
  const [features, setFeatures] = useState<{ [key: string]: Feature }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatures = async () => {
      try {
        const response = await api.get('/api/subscription/features');
        setFeatures(response.data);
      } catch (error) {
        console.error('Erro ao carregar features:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatures();
  }, []);

  const checkFeature = (featureName: string): boolean => {
    // Durante o carregamento, retornar false para evitar renderização prematura
    if (loading) {
      return false;
    }
    return features[featureName]?.enabled ?? false;
  };

  const needsUpgrade = (featureName: string): boolean => {
    return features[featureName]?.requiresUpgrade ?? true;
  };

  return {
    features,
    loading,
    checkFeature,
    needsUpgrade
  };
}

export function FeatureGate({ 
  feature, 
  children, 
  fallback = null 
}: { 
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  const { checkFeature, loading } = useFeatures();

  if (loading) return null;

  if (!checkFeature(feature)) return fallback;

  return <>{children}</>;
}

// HOC para proteger rotas baseado em features
export function withFeatureAccess(WrappedComponent: React.ComponentType, requiredFeature: string) {
  return function WithFeatureAccessWrapper(props: Record<string, unknown>) {
    const { checkFeature, loading, needsUpgrade } = useFeatures();

    if (loading) {
      return <div>Carregando...</div>;
    }

    if (!checkFeature(requiredFeature)) {
      if (needsUpgrade(requiredFeature)) {
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Funcionalidade não disponível
            </h2>
            <p className="text-gray-600 mb-8">
              Esta funcionalidade requer um plano superior
            </p>
            <a
              href="/pricing"
              className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
            >
              Ver Planos Disponíveis
            </a>
          </div>
        );
      }

      return <div>Acesso não autorizado</div>;
    }

    return <WrappedComponent {...props} />;
  };
}
