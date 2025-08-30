'use client';

import { useRouter } from 'next/navigation';
import { XCircle, ArrowLeft, RefreshCw, Home } from 'lucide-react';
import Link from 'next/link';

export default function CancelPage() {
  const router = useRouter();

  const handleRetry = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Ícone de cancelamento */}
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-600" />
        </div>

        {/* Título */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Pagamento Cancelado
        </h1>

        {/* Mensagem */}
        <p className="text-gray-600 mb-6">
          O pagamento foi cancelado e nenhuma cobrança foi realizada.
        </p>

        {/* Detalhes */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="text-sm text-gray-600 space-y-2">
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="text-red-600 font-medium">Cancelado</span>
            </div>
            <div className="flex justify-between">
              <span>Cobrança:</span>
              <span className="text-green-600 font-medium">Nenhuma</span>
            </div>
          </div>
        </div>

        {/* Opções */}
        <div className="space-y-3 mb-6">
          <button
            onClick={handleRetry}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
          >
            <RefreshCw className="mr-2 w-5 h-5" />
            Tentar Novamente
          </button>

          <Link
            href="/pricing"
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <ArrowLeft className="mr-2 w-5 h-5" />
            Ver Outros Planos
          </Link>

          <Link
            href="/dashboard"
            className="w-full border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            <Home className="mr-2 w-5 h-5" />
            Voltar ao Dashboard
          </Link>
        </div>

        {/* Informações adicionais */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            Precisa de ajuda?
          </h3>
          <p className="text-xs text-blue-800 mb-3">
            Se teve algum problema durante o pagamento ou mudou de ideia,
            estamos aqui para ajudar.
          </p>
          <div className="text-xs text-blue-700">
            <p>• ✅ Sem cobrança realizada</p>
            <p>• ✅ Pode tentar novamente a qualquer momento</p>
            <p>• ✅ Suporte disponível 24/7</p>
          </div>
        </div>

        {/* Suporte */}
        <div className="text-center">
          <p className="text-xs text-gray-500 mb-2">
            Entre em contato com nosso suporte
          </p>
          <div className="space-y-1">
            <a
              href="mailto:suporte@seusite.com"
              className="text-xs text-blue-600 hover:text-blue-800 block"
            >
              📧 suporte@seusite.com
            </a>
            <a
              href="tel:+258840000000"
              className="text-xs text-blue-600 hover:text-blue-800 block"
            >
              📱 +258 84 000 0000
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}