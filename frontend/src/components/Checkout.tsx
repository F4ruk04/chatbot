'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowRight, Loader2, CreditCard, Shield, CheckCircle } from 'lucide-react';
import { paymentsAPI, PaymentSessionResponse } from '@/lib/api';

interface CheckoutProps {
  plan: string;
}

export default function Checkout({ plan }: CheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Verificar se voltou do Stripe
  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    const userId = searchParams.get('user_id');
    const planName = searchParams.get('plan_name');

    if (sessionId) {
      // Verificar status do pagamento
      verifyPayment(sessionId);
    }
  }, [searchParams]);

  const verifyPayment = async (sessionId: string) => {
    try {
      const result = await paymentsAPI.verifyPayment(sessionId);

      if (result.status === 'paid') {
        // Pagamento confirmado
        setTimeout(() => {
          router.push('/dashboard?upgrade=success');
        }, 2000);
      } else {
        setError('Pagamento não foi confirmado. Tente novamente.');
      }
    } catch (err) {
      console.error('Erro ao verificar pagamento:', err);
      setError('Erro ao verificar status do pagamento.');
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);

    try {
      const response: PaymentSessionResponse = await paymentsAPI.createSession(plan);

      if (response.status === 'success' && response.checkout_url) {
        // Redirecionar para Stripe Checkout
        window.location.href = response.checkout_url;
      } else if (response.status === 'success' && response.message) {
        // Plano gratuito ativado
        alert(response.message);
        router.push('/dashboard');
      } else {
        setError('Erro ao iniciar pagamento. Tente novamente.');
      }
    } catch (error: any) {
      console.error('Erro ao iniciar checkout:', error);
      if (error.response?.data?.detail) {
        setError(error.response.data.detail);
      } else {
        setError('Erro ao processar pagamento. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Verificar se o pagamento foi confirmado
  const sessionId = searchParams.get('session_id');
  const isPaymentConfirmed = sessionId && !error;

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isPaymentConfirmed ? 'Pagamento Confirmado!' : 'Checkout Seguro'}
      </h2>

      {isPaymentConfirmed ? (
        // Tela de confirmação
        <div className="text-center space-y-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Upgrade Confirmado!
            </h3>
            <p className="text-gray-600">
              Seu plano {plan} foi ativado com sucesso.
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-blue-800">
              Você será redirecionado para o dashboard em instantes...
            </p>
          </div>
        </div>
      ) : (
        // Tela de checkout
        <>
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Plano Selecionado</h3>
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="font-medium">{plan}</span>
                <span className="text-lg font-bold text-blue-600">
                  {plan === 'Básico' ? 'Gratuito' : 'A partir de 24.99€'}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {plan === 'Básico'
                  ? 'Acesso completo ao plano básico gratuitamente'
                  : 'Pagamento seguro processado por Stripe'
                }
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Pagamento Seguro</h3>
            <div className="space-y-3">
              <div className="flex items-center p-4 border rounded-lg bg-blue-50 border-blue-200">
                <CreditCard className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <span className="font-medium text-blue-900">Cartão de Crédito/Débito</span>
                  <p className="text-sm text-blue-700">Visa, Mastercard, American Express</p>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center mb-6"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {plan === 'Básico' ? 'Ativar Plano Gratuito' : 'Pagar com Stripe'}
                <ArrowRight className="ml-2 w-5 h-5" />
              </>
            )}
          </button>

          {/* Selos de Segurança Stripe */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center justify-center space-x-4 mb-4">
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <Shield className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-xs font-medium">SSL 256-bit</span>
                </div>
                <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
                  <CreditCard className="w-5 h-5 text-blue-600 mr-2" />
                  <span className="text-xs font-medium">PCI DSS</span>
                </div>
              </div>

              <p className="text-xs text-gray-500 text-center">
                Seus dados são processados com segurança pela Stripe,
                líder global em pagamentos online. Não armazenamos
                informações de cartão em nossos servidores.
              </p>

              {plan !== 'Básico' && (
                <div className="text-center">
                  <p className="text-xs text-gray-400">
                    🔒 Criptografia bancária • 💳 Suporte global • ⚡ Processamento instantâneo
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
