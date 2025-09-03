'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, ArrowRight, Home } from 'lucide-react';
import Link from 'next/link';

function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(5);

  const sessionId = searchParams.get('session_id');
  const planName = searchParams.get('plan_name');

  useEffect(() => {
    // Countdown para redirecionamento automático
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push('/dashboard');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de sucesso */}
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-green-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Confirmado!
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          Seu upgrade para o plano <span className="font-semibold text-blue-600">{planName}</span> foi processado com sucesso.
        </p>

        {/* Detalhes */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>ID da transação:</span>
              <span className="font-mono text-xs">{sessionId?.slice(-8)}</span>
            </div>
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-green-600 font-medium">Aprovado</span>
            </div>
          </div>
        </div>

        {/* Contador de redirecionamento */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            Redirecionando para o dashboard em <span className="font-bold">{countdown}</span> segundos...
          </p>
        </div>

        {/* Botões de ação */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            Ir para Dashboard
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>

          <Link
            href="/"
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="mr-2 w-5 h-5" />
            Voltar ao Início
          </Link>
        </div>

        {/* Informações adicionais */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            O que acontece agora?
          </h3>
          <ul className="text-xs text-gray-600 space-y-1 text-left">
            <li>• ✅ Seu plano foi atualizado automaticamente</li>
            <li>• ✅ Novos limites foram aplicados</li>
            <li>• ✅ Você recebeu um email de confirmação</li>
            <li>• ✅ Suporte disponível 24/7</li>
          </ul>
        </div>

        {/* Suporte */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Dúvidas? Entre em contato com nosso suporte
          </p>
          <a
            href="mailto:suporte@seusite.com"
            className="text-xs text-blue-600 hover:text-blue-800"
          >
            suporte@seusite.com
          </a>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Carregando...
          </h1>
        </div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}