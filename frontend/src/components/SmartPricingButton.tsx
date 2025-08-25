'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated } from '@/lib/auth';
import clsx from 'clsx';

interface SmartPricingButtonProps {
  planId: string;
  planTitle: string;
  ctaText: string;
  popular?: boolean;
  className?: string;
}

export default function SmartPricingButton({
  planId,
  planTitle,
  ctaText,
  popular,
  className
}: SmartPricingButtonProps) {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(isAuthenticated());
    
    // Fetch current user plan if logged in
    if (isAuthenticated()) {
      fetchCurrentPlan();
    }
  }, [fetchCurrentPlan]);

  const fetchCurrentPlan = useCallback(async () => {
    try {
      const { api } = await import('@/lib/api');
      const response = await api.get('/api/subscription/status');
      setCurrentPlan(response.data.plan || 'free');
    } catch (error) {
      console.error('Error fetching current plan:', error);
      setCurrentPlan('free');
    }
  }, []);

  const handleClick = () => {
    if (!mounted || loading) return;

    // If user is on this plan already, don't do anything
    if (currentPlan === planId.toLowerCase()) {
      return;
    }

    setLoading(true);
    
    if (isLoggedIn) {
      // Usuário logado: vai para billing com plano pré-selecionado
      router.push(`/billing?plan=${planId.toLowerCase()}`);
    } else {
      // Usuário não logado: vai para registro com plano pré-selecionado
      router.push(`/register?plan=${planId.toLowerCase()}`);
    }
  };

  // Determine button text based on state
  const getButtonText = () => {
    if (!mounted) return ctaText;
    
    if (isLoggedIn && currentPlan) {
      if (currentPlan === planId.toLowerCase()) {
        return 'Plano Atual';
      }
      if (planId.toLowerCase() === 'free') {
        return 'Downgrade não disponível';
      }
      return `Fazer Upgrade para ${planTitle}`;
    }
    
    return ctaText;
  };

  // Check if button should be disabled
  const isDisabled = () => {
    if (!mounted || loading) return true;
    if (isLoggedIn && currentPlan) {
      // Disable if current plan or trying to downgrade to free
      return currentPlan === planId.toLowerCase() ||
             (planId.toLowerCase() === 'free' && currentPlan !== 'free');
    }
    return false;
  };

  // Evita hidration mismatch
  if (!mounted) {
    return (
      <div className={clsx(
        "w-full py-3 px-6 rounded-lg font-semibold transition-colors text-center",
        popular
          ? "bg-blue-500 text-white"
          : "border-2 border-blue-500 text-blue-500",
        className
      )}>
        {ctaText}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={isDisabled()}
      className={clsx(
        "w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200",
        isDisabled()
          ? popular
            ? "bg-gray-400 text-white cursor-not-allowed"
            : "border-2 border-gray-400 text-gray-400 cursor-not-allowed"
          : popular
            ? "bg-blue-500 text-white hover:bg-blue-600 hover:shadow-lg transform hover:scale-[1.02]"
            : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50 hover:shadow-md",
        loading && "opacity-50",
        className
      )}
    >
      {loading ? (
        <span className="flex items-center justify-center">
          <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
          Carregando...
        </span>
      ) : (
        getButtonText()
      )}
    </button>
  );
}