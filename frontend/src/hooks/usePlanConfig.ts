import { useMemo } from 'react';
import { PLANS, PlanDetails, getPlanById, getPlanLimits, canAccessFeature } from '@/config/plans';

export const usePlanConfig = () => {
  return useMemo(() => ({
    plans: PLANS,
    getPlanById,
    getPlanLimits,
    canAccessFeature,
    getAllPlans: () => PLANS,
  }), []);
};

export const useCurrentPlanFeatures = (planId: string) => {
  return useMemo(() => {
    const plan = getPlanById(planId);
    if (!plan) return null;

    return {
      hasDetailedHistory: plan.hasDetailedHistory,
      hasExport: plan.hasExport,
      supportLevel: plan.supportLevel,
      dashboardType: plan.dashboardType,
      companyLimit: plan.companyLimit,
      messageLimit: plan.messageLimit,
      features: plan.features,
    };
  }, [planId]);
};

export default usePlanConfig;