'use client';

import { useSearchParams } from 'next/navigation';
import Checkout from '@/components/Checkout';

const planPrices = {
  free: 0,
  pro: 2499,
  business: 6999
};

export default function CheckoutPage() {
  const searchParams = useSearchParams();
  const plan = searchParams.get('plan') || 'pro';

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Checkout 
          plan={plan} 
          amount={planPrices[plan as keyof typeof planPrices]} 
        />
      </div>
    </div>
  );
}
