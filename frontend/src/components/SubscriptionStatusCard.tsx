'use client';
import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle,
  Crown,
  Calendar,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useNotification } from '@/hooks/useNotification';

interface SubscriptionStatus {
  plan: string;
  status: string;
  messages_used: number;
  messages_quota: number;
  usage_percent: number;
  days_remaining: number;
  renewal_date: string;
  warning_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

export default function SubscriptionStatusCard() {
  const router = useRouter();
  const { showNotification } = useNotification();
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionError, setSubscriptionError] = useState<string | null>(null);
  const [hasShownNotification, setHasShownNotification] = useState(false); // Renamed and re-purposed

  const fetchSubscriptionStatus = useCallback(async (retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 segundo

    try {
      if (retryCount === 0) {
        setLoading(true);
        setSubscriptionError(null);
        setHasShownNotification(false);
      }

      const { subscriptionAPI, api } = await import('@/lib/api');
      console.log('API Base URL:', api.defaults.baseURL);
      console.log('Request headers:', api.defaults.headers);
      console.log('Attempting to fetch subscription status... (attempt', retryCount + 1, ')');
      
      const data = await subscriptionAPI.getStatus();
      console.log('Subscription data received:', data);
      
      // Sempre definir status, mesmo se dados incompletos
      if (data && data.plan && data.status) {
        setStatus(data);
        console.log('Subscription status set successfully');
      } else {
        console.warn('Incomplete subscription data received, using defaults');
        const defaultStatus = {
          plan: 'free',
          status: 'active',
          messages_used: 0,
          messages_quota: 150,
          usage_percent: 0,
          days_remaining: 30,
          renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          warning_level: 'LOW' as const
        };
        setStatus(defaultStatus);
        
        if (!hasShownNotification) {
          showNotification({
            type: 'warning',
            title: 'Dados de assinatura incompletos',
            message: 'Usando dados padrão para o status da assinatura.',
            duration: 7000
          });
          setHasShownNotification(true);
        }
      }
      
      // Sempre definir loading como false quando dados são recebidos
      setLoading(false);
      
    } catch (err: unknown) {
      console.error('Subscription status error (attempt', retryCount + 1, '):', err);
      
      // Se ainda há tentativas disponíveis, tentar novamente
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms... (${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchSubscriptionStatus(retryCount + 1);
        }, retryDelay);
        return; // Não definir erro ainda, aguardar retry
      }
      
      // Se esgotaram as tentativas, mostrar erro e dados padrão
      let errorMessage = 'Erro ao carregar assinatura - Network Error';
      
      if (err instanceof Error) {
        if (err.message.includes('Network Error')) {
          errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
        } else if (err.message.includes('401')) {
          errorMessage = 'Sessão expirada. Faça login novamente.';
        } else if (err.message.includes('500')) {
          errorMessage = 'Erro interno do servidor. Tente novamente em alguns minutos.';
        } else {
          errorMessage = err.message || errorMessage;
        }
      } else if (typeof err === 'string') {
        errorMessage = err;
      }
      
      setSubscriptionError(errorMessage);
      
      // Sempre definir dados padrão em caso de erro
      const defaultStatus = {
        plan: 'free',
        status: 'active',
        messages_used: 0,
        messages_quota: 150,
        usage_percent: 0,
        days_remaining: 30,
        renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        warning_level: 'LOW' as const
      };
      setStatus(defaultStatus);
      
      // Sempre definir loading como false em caso de erro
      setLoading(false);
      
      if (!hasShownNotification) {
        showNotification({
          type: 'error',
          title: 'Erro ao carregar assinatura',
          message: errorMessage,
          duration: 7000
        });
        setHasShownNotification(true);
      }
    }
  }, [showNotification, hasShownNotification]);

  useEffect(() => {
    console.log('SubscriptionStatusCard: useEffect triggered');
    fetchSubscriptionStatus();
    
    // Timeout de segurança para evitar loading infinito
    const timeoutId = setTimeout(() => {
      if (loading) {
        console.warn('SubscriptionStatusCard: Loading timeout reached, forcing completion');
        setLoading(false);
        if (!status) {
          setStatus({
            plan: 'free',
            status: 'active',
            messages_used: 0,
            messages_quota: 150,
            usage_percent: 0,
            days_remaining: 30,
            renewal_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            warning_level: 'LOW'
          });
        }
      }
    }, 10000); // 10 segundos de timeout
    
    return () => clearTimeout(timeoutId);
  }, [fetchSubscriptionStatus, loading, status]); // Adicionar loading e status como dependências

  const getPlanDisplayName = (plan: string) => {
    const planNames = {
      'free': 'Plano Gratuito',
      'pro': 'Plano Pro',
      'business': 'Plano Business'
    };
    return planNames[plan as keyof typeof planNames] || `Plano ${plan}`;
  };

  const getPlanColor = (plan: string) => {
    const colors = {
      'free': 'from-gray-500 to-gray-600',
      'pro': 'from-blue-500 to-blue-600',
      'business': 'from-purple-500 to-purple-600'
    };
    return colors[plan as keyof typeof colors] || 'from-gray-500 to-gray-600';
  };

  const formatRenewalDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-PT', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const getStatusColor = (warning_level: string) => {
    switch (warning_level) {
      case 'HIGH':
        return 'text-red-600 dark:text-red-400';
      case 'MEDIUM':
        return 'text-yellow-600 dark:text-yellow-400';
      default:
        return 'text-green-600 dark:text-green-400';
    }
  };

  const getStatusIcon = (warning_level: string) => {
    switch (warning_level) {
      case 'HIGH':
        return <AlertCircle className="h-4 w-4" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const handleUpgradeClick = () => {
    router.push('/billing');
  };

  if (loading) {
    console.log('SubscriptionStatusCard: Rendering loading state');
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        {/* Header skeleton */}
        <div className="h-24 bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 p-6">
          <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
        </div>
        
        {/* Content skeleton */}
        <div className="p-6 space-y-6">
          <div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
          </div>
          
          <div className="h-16 bg-gray-100 dark:bg-gray-700 rounded-lg"></div>
          
          <div className="h-10 bg-blue-200 dark:bg-blue-900 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (subscriptionError) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center text-red-700 dark:text-red-400">
            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
            <span className="text-sm">{subscriptionError}</span>
          </div>
          <button
            onClick={() => fetchSubscriptionStatus()}
            disabled={loading}
            className="ml-4 px-3 py-1 text-xs bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Tentando...' : 'Tentar Novamente'}
          </button>
        </div>
      </div>
    );
  }

  if (!status) {
    console.log('SubscriptionStatusCard: No status data, returning null');
    return null;
  }

  console.log('SubscriptionStatusCard: Rendering with status:', status);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header com plano atual */}
      <div className={`bg-gradient-to-r ${getPlanColor(status.plan)} p-6 text-white`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {getPlanDisplayName(status.plan)}
              </h3>
              <p className="text-sm opacity-90 capitalize">
                Status: {status.status}
              </p>
            </div>
          </div>
          {status.plan !== 'business' && (
            <button
              onClick={handleUpgradeClick}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center space-x-1"
            >
              <TrendingUp className="h-4 w-4" />
              <span>Upgrade</span>
            </button>
          )}
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="p-6 space-y-6">
        {/* Contador de mensagens com barra de progresso */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Zap className="h-4 w-4 text-gray-500 dark:text-gray-400" />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Mensagens Utilizadas
              </span>
            </div>
            <span className={`text-sm font-semibold ${getStatusColor(status.warning_level)}`}>
              {status.messages_used.toLocaleString()} / {status.messages_quota.toLocaleString()}
            </span>
          </div>
          
          {/* Barra de progresso visual */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ease-out rounded-full ${
                status.warning_level === 'HIGH'
                  ? 'bg-gradient-to-r from-red-500 to-red-600'
                  : status.warning_level === 'MEDIUM'
                  ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                  : 'bg-gradient-to-r from-green-500 to-green-600'
              }`}
              style={{ width: `${Math.min(status.usage_percent, 100)}%` }}
            ></div>
          </div>
          
          {/* Percentual */}
          <div className="flex justify-between items-center mt-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {status.usage_percent.toFixed(1)}% utilizado
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {(status.messages_quota - status.messages_used).toLocaleString()} restantes
            </span>
          </div>
        </div>

        {/* Data de renovação */}
        <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              Renovação do Plano
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {formatRenewalDate(status.renewal_date)} ({status.days_remaining} dias)
            </p>
          </div>
        </div>

        {/* Alertas de uso */}
        {status.warning_level !== 'LOW' && (
          <div className={`flex items-start space-x-3 p-3 rounded-lg ${
            status.warning_level === 'HIGH' 
              ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' 
              : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
          }`}>
            <div className={`flex-shrink-0 ${getStatusColor(status.warning_level)}`}>
              {getStatusIcon(status.warning_level)}
            </div>
            <div>
              <p className={`text-sm font-medium ${getStatusColor(status.warning_level)}`}>
                {status.warning_level === 'HIGH' 
                  ? 'Limite quase atingido!' 
                  : 'Atenção ao uso'}
              </p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {status.warning_level === 'HIGH'
                  ? 'Você está próximo do limite de mensagens. Considere fazer upgrade.'
                  : 'Monitore seu uso para evitar interrupções no serviço.'}
              </p>
            </div>
          </div>
        )}

        {/* Botão de Upgrade - sempre visível para planos não-business */}
        {status.plan !== 'business' && (
          <button
            onClick={handleUpgradeClick}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center justify-center space-x-2"
          >
            <TrendingUp className="h-4 w-4" />
            <span>Fazer Upgrade do Plano</span>
          </button>
        )}
      </div>
    </div>
  );
}
