'use client';

import { useEffect, useState } from 'react';
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setIsLoggedIn(isAuthenticated());
  }, []);

  const handleClick = () => {
    if (!mounted) return;

    if (isLoggedIn) {
      // Usuário logado: vai para billing com plano pré-selecionado
      router.push(`/billing?plan=${planId.toLowerCase()}`);
    } else {
      // Usuário não logado: vai para registro
      router.push('/register');
    }
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
      className={clsx(
        "w-full py-3 px-6 rounded-lg font-semibold transition-colors",
        popular 
          ? "bg-blue-500 text-white hover:bg-blue-600"
          : "border-2 border-blue-500 text-blue-500 hover:bg-blue-50",
        className
      )}
    >
      {isLoggedIn ? (
        planId === 'free' ? 'Plano Atual' : `Upgrade para ${planTitle}`
      ) : (
        ctaText
      )}
    </button>
  );
}