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

      if (data.payment_url) {
        window.location.href = data.payment_url;
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
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors flex items-center justify-center"
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

      <p className="mt-4 text-sm text-gray-600 text-center">
        Seu pagamento será processado de forma segura pelo PagoLu
      </p>
    </div>
  );
}
