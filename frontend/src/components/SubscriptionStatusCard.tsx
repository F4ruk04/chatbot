'use client';

import { useState, useEffect } from 'react';
import { subscriptionsAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

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
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Subscription Status</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Status</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold capitalize">{subscription.plan} Plan</h3>
              <Badge variant={subscription.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                {subscription.status}
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Messages Used</p>
                <p className="text-lg font-semibold">{subscription.messages_used} / {subscription.messages_quota}</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                  <div
                    className={`h-2.5 rounded-full ${
                      subscription.usage_percent > 90 ? 'bg-red-500' : subscription.usage_percent > 70 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${subscription.usage_percent}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">{subscription.usage_percent.toFixed(1)}% used</p>
              </div>

              <div>
                <p className="text-sm text-gray-500">Days Remaining</p>
                <p className="text-lg font-semibold">{subscription.days_remaining} days</p>
                <p className="text-sm text-gray-500 mt-1">Renews on: {new Date(subscription.renewal_date).toLocaleDateString()}</p>
              </div>
            </div>

            {subscription.warning_level === 'HIGH' && (
              <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3" role="alert">
                <p className="font-bold">Warning!</p>
                <p>You are almost out of messages. Consider upgrading your plan.</p>
              </div>
            )}
            {subscription.warning_level === 'MEDIUM' && (
              <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-3" role="alert">
                <p className="font-bold">Heads up!</p>
                <p>You've used a significant portion of your messages. Keep an eye on your usage.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-600">
            <p>No active subscription found. Please choose a plan to get started!</p>
            {/* Optionally add a link to pricing page here */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
