'use client';
import { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react';

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
  const [status, setStatus] = useState<SubscriptionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchSubscriptionStatus();
  }, []);

  const fetchSubscriptionStatus = async () => {
    try {
      // Use o cliente axios configurado para incluir Authorization
      const { api } = await import('@/lib/api');
      const response = await api.get('/subscription/status');
      setStatus(response.data);
    } catch (error) {
      console.error('Erro ao carregar status:', error);
      setError('Erro ao carregar status da assinatura');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
        <div className="flex items-center text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!status) return null;

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
        return <AlertCircle className="h-5 w-5 mr-2" />;
      case 'MEDIUM':
        return <AlertTriangle className="h-5 w-5 mr-2" />;
      default:
        return <CheckCircle className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Status da Assinatura
      </h3>
      
      <div className="space-y-4">
        {/* Plano atual */}
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">Plano:</span>
          <p className="font-medium text-gray-900 dark:text-white capitalize">{status.plan}</p>
        </div>

        {/* Uso de mensagens */}
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Uso de mensagens:
            </span>
            <span className={`ml-auto font-medium ${getStatusColor(status.warning_level)}`}>
              {status.messages_used} / {status.messages_quota}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`rounded-full h-2 transition-all ${
                status.warning_level === 'HIGH'
                  ? 'bg-red-500'
                  : status.warning_level === 'MEDIUM'
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
              }`}
              style={{ width: `${Math.min(status.usage_percent, 100)}%` }}
            ></div>
          </div>
        </div>

        {/* Dias restantes */}
        <div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Renovação em:
          </span>
          <p className="font-medium text-gray-900 dark:text-white">
            {status.days_remaining} dias
          </p>
        </div>

        {/* Alertas */}
        {status.warning_level !== 'LOW' && (
          <div className={`flex items-center mt-4 ${getStatusColor(status.warning_level)}`}>
            {getStatusIcon(status.warning_level)}
            <span className="text-sm">
              {status.warning_level === 'HIGH'
                ? 'Você está próximo do limite de mensagens!'
                : 'Considere fazer upgrade do seu plano.'}
            </span>
          </div>
        )}

        {/* Botão de Upgrade */}
        {status.warning_level !== 'LOW' && (
          <a
            href={`/pricing?from=${status.plan}`}
            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Fazer Upgrade
          </a>
        )}
      </div>
    </div>
  );
}
