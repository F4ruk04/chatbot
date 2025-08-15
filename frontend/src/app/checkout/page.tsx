'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Checkout from '@/components/Checkout';

const planPrices = {
  free: 0,
  pro: 2499,
  business: 6999
};

function CheckoutContent() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';

  return (
    <Checkout 
      plan={plan} 
      amount={planPrices[plan as keyof typeof planPrices]} 
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
