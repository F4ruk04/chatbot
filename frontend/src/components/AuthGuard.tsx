/**
 * Componente de Proteção de Autenticação
 * Verifica se o utilizador está autenticado antes de renderizar o conteúdo
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, verifyAuthDataSaved } from '@/lib/auth';

interface AuthGuardProps {
  children: React.ReactNode;
}

import React from 'react'; // Import React
export default React.memo(function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = isAuthenticated() && verifyAuthDataSaved();
      
      if (!authenticated) {
        router.push('/login');
        return;
      }
      
      setIsAuthorized(true);
      setIsLoading(false);
    };

    // Verificar autenticação com um pequeno delay
    const timer = setTimeout(checkAuth, 100);
    
    return () => clearTimeout(timer);
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}); // Wrap with React.memo
