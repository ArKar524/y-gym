"use client";

import { UserMetricsManager } from "@/components/admin/UserMetricsManager";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminUserMetricsPage() {
  return (
    <div className="container mx-auto py-6 px-4 md:px-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Metrics Management</h1>
        <p className="text-muted-foreground mt-2">
          View and manage metrics for all users in the system
        </p>
      </div>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>About User Metrics</CardTitle>
          <CardDescription>
            This section allows you to view and record metrics for any user in the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>
            As an administrator, you can:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1">
            <li>View metrics for any user</li>
            <li>Record new metrics for users</li>
            <li>Track progress over time</li>
            <li>Help trainers monitor member development</li>
          </ul>
        </CardContent>
      </Card>
      
      <UserMetricsManager />
    </div>
  );
}
