'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  AlertCircle,
  X,
  TrendingUp,
  Zap
} from 'lucide-react';
import { usePermissions } from '@/hooks/usePermissions';
import { useNotification } from '@/hooks/useNotification';

interface UsageAlertProps {
  className?: string;
  autoHide?: boolean;
  hideDelay?: number;
}

export default function UsageAlert({
  className = '',
  autoHide = false,
  hideDelay = 10000
}: UsageAlertProps) {
  const router = useRouter();
  const { permissions } = usePermissions();
  const { showNotification } = useNotification();
  const [isVisible, setIsVisible] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (autoHide && isVisible) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, hideDelay);

      return () => clearTimeout(timer);
    }
  }, [autoHide, hideDelay, isVisible]);

  if (!permissions || dismissed || !isVisible) {
    return null;
  }

  const messageUsage = permissions.usage.messages;
  const companyUsage = permissions.usage.companies;

  // Verificar se há alertas necessários
  const messageAlert = messageUsage.percentage >= 80;
  const companyAlert = !companyUsage.within_limit;

  if (!messageAlert && !companyAlert) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
  };

  const handleUpgrade = () => {
    router.push('/billing');
    showNotification({
      type: 'info',
      title: 'Redirecionando para Upgrade',
      message: 'Você será redirecionado para a página de faturamento para fazer upgrade do seu plano.',
      duration: 5000
    });
  };

  // Determinar tipo de alerta mais crítico
  const isCritical = messageUsage.percentage >= 100 || companyAlert;

  return (
    <div className={`rounded-lg border p-4 ${className} ${
      isCritical 
        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' 
        : 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
    }`}>
      <div className="flex items-start space-x-3">
        <div className={`flex-shrink-0 ${
          isCritical ? 'text-red-500' : 'text-yellow-500'
        }`}>
          {isCritical ? (
            <AlertCircle className="h-5 w-5" />
          ) : (
            <AlertTriangle className="h-5 w-5" />
          )}
        </div>
        
        <div className="flex-1">
          <h3 className={`font-semibold ${
            isCritical 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            {isCritical ? 'Limite Atingido!' : 'Atenção ao Uso'}
          </h3>
          
          <div className="mt-2 space-y-2">
            {messageAlert && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-gray-500" />
                  <span className={`text-sm ${
                    isCritical 
                      ? 'text-red-700 dark:text-red-300' 
                      : 'text-yellow-700 dark:text-yellow-300'
                  }`}>
                    Mensagens: {messageUsage.used.toLocaleString()} / {messageUsage.quota.toLocaleString()}
                  </span>
                </div>
                <span className={`text-sm font-semibold ${
                  isCritical 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  {messageUsage.percentage.toFixed(1)}%
                </span>
              </div>
            )}
            
            {companyAlert && (
              <div className="flex items-center space-x-2">
                <span className={`text-sm ${
                  isCritical 
                    ? 'text-red-700 dark:text-red-300' 
                    : 'text-yellow-700 dark:text-yellow-300'
                }`}>
                  Limite de empresas atingido ({companyUsage.used}/{companyUsage.quota})
                </span>
              </div>
            )}
          </div>
          
          <p className={`mt-2 text-sm ${
            isCritical 
              ? 'text-red-600 dark:text-red-400' 
              : 'text-yellow-600 dark:text-yellow-400'
          }`}>
            {isCritical 
              ? 'Você atingiu o limite do seu plano. Faça upgrade para continuar.' 
              : 'Você está próximo do limite. Considere fazer upgrade.'}
          </p>
          
          <div className="mt-3 flex items-center space-x-3">
            <button
              onClick={handleUpgrade}
              className={`inline-flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isCritical
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Fazer Upgrade</span>
            </button>
            
            <button
              onClick={handleDismiss}
              className={`text-sm ${
                isCritical 
                  ? 'text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-200' 
                  : 'text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 dark:hover:text-yellow-200'
              }`}
            >
              Dispensar
            </button>
          </div>
        </div>
        
        <button
          onClick={handleDismiss}
          className={`flex-shrink-0 ${
            isCritical 
              ? 'text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-300' 
              : 'text-yellow-400 hover:text-yellow-600 dark:text-yellow-500 dark:hover:text-yellow-300'
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

// Componente para mostrar alertas em formato de toast
export function UsageToast() {
  const [isVisible, setIsVisible] = useState(true);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <UsageAlert 
        className="shadow-lg"
        autoHide={false}
      />
    </div>
  );
}