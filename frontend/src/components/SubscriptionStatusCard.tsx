'use client';

import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { MessageCircle, DollarSign, Calendar, AlertTriangle, Info, LucideIcon } from 'lucide-react';

interface Subscription {
  plan: string;
  status: string;
  messages_used: number;
  messages_quota: number;
  usage_percent: number;
  days_remaining: number;
  renewal_date: string;
  warning_level: 'LOW' | 'MEDIUM' | 'HIGH';
}

// Define plan details with colors and icons
const planDetails: { [key: string]: { color: string; icon: LucideIcon } } = {
  Básico: { color: 'bg-gray-500', icon: MessageCircle },
  Profissional: { color: 'bg-blue-500', icon: DollarSign },
  Enterprise: { color: 'bg-purple-500', icon: Calendar },
  // Add other plans if necessary
};

export default function SubscriptionStatusCard() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        setLoading(true);
        const data = await subscriptionsAPI.getStatus();
        if (data) {
          setSubscription(data);
        } else {
          setSubscription(null);
        }
        setError(null);
      } catch (err) {
        setError('Failed to load subscription details.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []); // O array de dependências vazio garante que isso rode apenas uma vez.

  if (loading) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700" />
          <Skeleton className="h-4 w-1/4 bg-gray-200 dark:bg-gray-700" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="dark:text-white">Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500 dark:text-red-400">{error}</p>
        </CardContent>
      </Card>
    );
  }

  const currentPlanDetail = subscription ? planDetails[subscription.plan] : null;
  const PlanIcon = currentPlanDetail?.icon || Info; // Default icon if plan not found

  return (
    <Card className="dark:bg-gray-800 dark:border-gray-700">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium dark:text-gray-300">
          Subscription Status
        </CardTitle>
        <PlanIcon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold capitalize text-gray-900 dark:text-white">
                {subscription.plan} Plan
              </h3>
              <Badge
                variant={subscription.status === 'active' ? 'default' : 'secondary'}
                className={`capitalize ${
                  subscription.status === 'active'
                    ? 'bg-green-500 text-white dark:bg-green-600'
                    : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                {subscription.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Messages Used */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Messages Used
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {subscription.messages_used} / {subscription.messages_quota}
                  </p>
                </div>
                <Progress value={subscription.usage_percent} className="w-full h-2 mt-1" />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{subscription.usage_percent.toFixed(1)}% used</p>
              </div>

              {/* Days Remaining */}
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Days Remaining
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subscription.days_remaining} days
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Renews on: {new Date(subscription.renewal_date).toLocaleDateString()}
                </p>
              </div>
            </div>

            {subscription.warning_level === 'HIGH' && (
              <div className="bg-red-100 dark:bg-red-900/20 border-l-4 border-red-500 text-red-700 dark:text-red-400 p-3 rounded-md" role="alert">
                <p className="font-bold flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" /> Warning!
                </p>
                <p>You are almost out of messages. Consider upgrading your plan.</p>
              </div>
            )}
            {subscription.warning_level === 'MEDIUM' && (
              <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-400 p-3 rounded-md" role="alert">
                <p className="font-bold flex items-center">
                  <Info className="h-5 w-5 mr-2" /> Heads up!
                </p>
                <p>You've used a significant portion of your messages. Keep an eye on your usage.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600 dark:text-gray-400">
            <p>No active subscription found. Please choose a plan to get started!</p>
            {/* Optionally add a link to pricing page here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
