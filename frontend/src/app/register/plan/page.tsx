import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import Layout from '@/components/Layout';

const PlanContentClient = dynamic(() => import('./PlanContentClient'));

export default function RegisterPlanPage() {
  return (
    <Layout>
      <Suspense fallback={<div>Loading...</div>}>
        <PlanContentClient />
      </Suspense>
    </Layout>
  );
}
