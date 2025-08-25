
import React from 'react';

interface SubscriptionStatusCardProps {
  isLoading?: boolean;
}

export default function SubscriptionStatusCard({ isLoading = false }: SubscriptionStatusCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Status da Assinatura
      </h2>
      <div className="space-y-2">
        <p className="text-2xl font-bold text-green-600 dark:text-green-400">
          Ativo
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sua assinatura está ativa e funcionando normalmente.
        </p>
      </div>
    </div>
  );
}
