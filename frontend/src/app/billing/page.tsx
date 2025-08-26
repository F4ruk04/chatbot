/**
 * Página de Billing/Checkout
 * Interface para upgrade de planos e pagamentos
 */

import Layout from '@/components/Layout';
import AuthGuard from '@/components/AuthGuard';
import BillingContent from './BillingContent';
import { Suspense } from 'react';

export default function BillingPage() {
  return (
    <Layout>
      <AuthGuard>
        <Suspense fallback={<div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-60"></div></div>}>
          <BillingContent />
        </Suspense>
      </AuthGuard>
    </Layout>
  );
}
