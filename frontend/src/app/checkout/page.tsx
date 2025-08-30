'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Checkout from '@/components/Checkout';

// Mapeamento dos planos para os novos nomes
const planMapping = {
  'basic': 'Básico',
  'professional': 'Profissional',
  'business': 'Business',
  'free': 'Básico',
  'pro': 'Profissional',
  'enterprise': 'Business'
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const planParam = searchParams.get('plan') || 'professional';
  const plan = planMapping[planParam as keyof typeof planMapping] || 'Profissional';

  return (
    <Checkout
      plan={plan}
    />
  );
}

export default function CheckoutPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Suspense fallback={
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        }>
          <CheckoutContent />
        </Suspense>
      </div>
    </div>
  );
}
