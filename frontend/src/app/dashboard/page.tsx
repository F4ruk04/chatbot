import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import CompanyList from "@/components/CompanyList";
import SubscriptionStatusCard from "@/components/SubscriptionStatusCard";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Suspense fallback={<Skeleton className="h-48 w-full" />}>
          <SubscriptionStatusCard />
        </Suspense>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No recent activity to display.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              <li><a href="/settings" className="text-blue-500 hover:underline">Account Settings</a></li>
              <li><a href="/billing" className="text-blue-500 hover:underline">Manage Billing</a></li>
              <li><a href="/help" className="text-blue-500 hover:underline">Help & Support</a></li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-64 w-full" />}>
          <CompanyList />
        </Suspense>
      </div>
    </div>
  );
}