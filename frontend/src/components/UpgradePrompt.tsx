'use client';

import { useRouter } from 'next/navigation';
import {
  Crown,
  Zap,
  ArrowRight,
  X,
  Lock
} from 'lucide-react';
import { useState } from 'react';
import { useNotification } from '@/hooks/useNotification';

interface UpgradePromptProps {
  feature: string;
  message: string;
  requiredPlan?: 'pro' | 'business';
  onClose?: () => void;
  variant?: 'modal' | 'banner' | 'inline';
  className?: string;
}

export default function UpgradePrompt({ 
  message, 
  requiredPlan = 'pro',
  onClose,
  variant = 'inline',
  className = ''
}: UpgradePromptProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(true);
  const { showNotification } = useNotification();

  const handleUpgrade = () => {
    router.push(`/billing?plan=${requiredPlan}`);
    showNotification({
      type: 'info',
      title: 'Redirecionando para Upgrade',
      message: `Você será redirecionado para a página de faturamento para fazer upgrade para o plano ${requiredPlan.toUpperCase()}.`,
      duration: 5000
    });
  };

  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  if (!isVisible) return null;

  const planConfig = {
    pro: {
      name: 'Pro',
      color: 'from-blue-500 to-blue-600',
      icon: Zap,
      price: '2.499 MZN'
    },
    business: {
      name: 'Business', 
      color: 'from-purple-500 to-purple-600',
      icon: Crown,
      price: '6.999 MZN'
    }
  };

  const config = planConfig[requiredPlan];
  const Icon = config.icon;

  if (variant === 'modal') {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 relative">
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="text-center mb-6">
            <div className={`w-16 h-16 bg-gradient-to-r ${config.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <Lock className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Funcionalidade Premium
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {message}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3">
              <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center`}>
                <Icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">
                  Plano {config.name}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {config.price}/mês
                </p>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpgrade}
              className={`flex-1 px-4 py-2 bg-gradient-to-r ${config.color} text-white rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2`}
            >
              <span>Fazer Upgrade</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'banner') {
    return (
      <div className={`bg-gradient-to-r ${config.color} text-white p-4 rounded-lg ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Icon className="h-6 w-6" />
            <div>
              <p className="font-semibold">{message}</p>
              <p className="text-sm opacity-90">
                Upgrade para {config.name} - {config.price}/mês
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleUpgrade}
              className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <span>Upgrade</span>
              <ArrowRight className="h-4 w-4" />
            </button>
            {onClose && (
              <button
                onClick={handleClose}
                className="text-white/70 hover:text-white p-1"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Variant inline (default)
  return (
    <div className={`bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <div className={`w-10 h-10 bg-gradient-to-r ${config.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
          <Lock className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
            Funcionalidade Premium
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
            {message}
          </p>
          <button
            onClick={handleUpgrade}
            className={`inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${config.color} text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity`}
          >
            <Icon className="h-4 w-4" />
            <span>Upgrade para {config.name}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {onClose && (
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
}