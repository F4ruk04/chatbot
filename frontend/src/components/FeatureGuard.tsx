'use client';

import { ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import UpgradePrompt from './UpgradePrompt';

interface FeatureGuardProps {
  feature: string;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradePrompt?: boolean;
  upgradePromptVariant?: 'modal' | 'banner' | 'inline';
}

export default function FeatureGuard({
  feature,
  children,
  fallback,
  showUpgradePrompt = true,
  upgradePromptVariant = 'inline'
}: FeatureGuardProps) {
  const { hasFeature, getUpgradeMessage, loading } = usePermissions();

  // Mostrar loading se ainda carregando
  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
      </div>
    );
  }

  // Se tem acesso à funcionalidade, mostrar conteúdo
  if (hasFeature(feature)) {
    return <>{children}</>;
  }

  // Se tem fallback customizado, usar ele
  if (fallback) {
    return <>{fallback}</>;
  }

  // Se não deve mostrar prompt de upgrade, não mostrar nada
  if (!showUpgradePrompt) {
    return null;
  }

  // Mostrar prompt de upgrade
  const message = getUpgradeMessage(feature);
  
  // Determinar plano necessário baseado na funcionalidade
  const requiredPlan = feature.includes('business') || feature.includes('unlimited') || feature.includes('custom') ? 'business' : 'pro';
  
  return (
    <UpgradePrompt
      feature={feature}
      message={message}
      requiredPlan={requiredPlan}
      variant={upgradePromptVariant}
    />
  );
}

// Hook para usar dentro de componentes
export function useFeatureGuard(feature: string) {
  const { hasFeature, getUpgradeMessage } = usePermissions();
  
  return {
    hasAccess: hasFeature(feature),
    upgradeMessage: getUpgradeMessage(feature)
  };
}

// Componente para desabilitar botões/links
interface ProtectedButtonProps {
  feature: string;
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  showTooltip?: boolean;
  disabled?: boolean;
}

export function ProtectedButton({
  feature,
  children,
  className = '',
  onClick,
  showTooltip = true,
  disabled = false
}: ProtectedButtonProps) {
  const { hasFeature, getUpgradeMessage } = usePermissions();
  const hasAccess = hasFeature(feature);
  
  const handleClick = () => {
    if (hasAccess && !disabled && onClick) {
      onClick();
    }
  };

  return (
    <div className="relative group">
      <button
        onClick={handleClick}
        disabled={!hasAccess || disabled}
        className={`${className} ${
          !hasAccess || disabled 
            ? 'opacity-50 cursor-not-allowed' 
            : 'cursor-pointer'
        }`}
      >
        {children}
      </button>
      
      {showTooltip && !hasAccess && (
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
          {getUpgradeMessage(feature)}
          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
        </div>
      )}
    </div>
  );
}