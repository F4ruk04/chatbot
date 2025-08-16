'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Loader2 } from 'lucide-react';

interface CheckoutProps {
  plan: string;
  amount: number;
}

export default function Checkout({ plan, amount }: CheckoutProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('mpesa');

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/checkout/' + plan, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payment_method: selectedMethod,
        }),
      });

      const data = await response.json();

      if (data.payment_link) {
        router.push(data.payment_link);
      } else if (data.message) {
        // Handle cases where a direct link is not returned, e.g., show a success message
        alert(data.message); 
        router.push('/dashboard'); // Redirect to dashboard or payment status page
      }
    } catch (error) {
      console.error('Erro ao iniciar checkout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h2>
      
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">Plano Selecionado</h3>
        <div className="p-4 border rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">{plan.charAt(0).toUpperCase() + plan.slice(1)}</span>
            <span className="text-lg font-bold">{amount} MZN</span>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4">Método de Pagamento</h3>
        <div className="space-y-3">
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500">
            <input
              type="radio"
              name="payment"
              value="mpesa"
              checked={selectedMethod === 'mpesa'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mr-3"
            />
            <span>M-PESA</span>
          </label>
          
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500">
            <input
              type="radio"
              name="payment"
              value="emola"
              checked={selectedMethod === 'emola'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mr-3"
            />
            <span>E-MOLA</span>
          </label>
          
          <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:border-blue-500">
            <input
              type="radio"
              name="payment"
              value="card"
              checked={selectedMethod === 'card'}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="mr-3"
            />
            <span>Cartão de Crédito/Débito</span>
          </label>
        </div>
      </div>

      <button
        onClick={handleCheckout}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center mb-6"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            Pagar Agora
            <ArrowRight className="ml-2 w-5 h-5" />
          </>
        )}
      </button>

      {/* Selos de Segurança e Métodos de Pagamento (Genéricos) */}
      <div className="border-t border-gray-200 pt-6">
        <div className="flex flex-col items-center space-y-4">
          <p className="text-sm text-gray-600 text-center mb-4">
            Pagamento seguro e protegido.
          </p>
          
          {/* Ícones de Segurança */}
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
              <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span className="text-xs font-medium">Pagamento Seguro</span>
            </div>
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-lg">
              <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-xs font-medium">Dados Criptografados</span>
            </div>
          </div>

          {/* Texto de Garantia */}
          <p className="text-xs text-gray-500 text-center mt-4">
            Suas informações de pagamento são processadas com segurança. 
            Seus dados pessoais são protegidos em conformidade com os padrões de segurança de dados.
          </p>
        </div>
      </div>
    </div>
  );
}
