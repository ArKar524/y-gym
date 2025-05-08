"use client";

import { useState, useEffect } from "react";
import { Users, CreditCard, Dumbbell, Package } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type DashboardData = {
  users: {
    total: number;
    byRole: Record<string, number>;
  };
  workouts: {
    total: number;
  };
  payments: {
    total: number;
    totalAmount: number;
  };
  programs: {
    active: number;
  };
  recent: {
    payments: Array<{
      id: string;
      amount: number;
      method: string;
      date: string;
      userName: string;
      userEmail: string;
      programName: string;
    }>;
    workouts: Array<{
      id: string;
      title: string;
      date: string;
      createdAt: string;
      userName: string;
      userEmail: string;
    }>;
  };
};

export default function AdminDashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/admin/dashboard');
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Could not load dashboard data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Overview of your gym management system</p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : error ? (
        <div className="bg-destructive/15 text-destructive p-4 rounded-md">
          {error}
        </div>
      ) : dashboardData ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Total Users Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Users</h3>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold">{dashboardData.users.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.users.byRole.ADMIN || 0} Admins, {dashboardData.users.byRole.MEMBER || 0} Members
              </p>
            </div>
          </div>
          
          {/* Total Workouts Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Workouts</h3>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold">{dashboardData.workouts.total}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Workout plans created
              </p>
            </div>
          </div>
          
          {/* Total Revenue Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Total Revenue</h3>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold">{formatCurrency(dashboardData.payments.totalAmount)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {dashboardData.payments.total} payments processed
              </p>
            </div>
          </div>
          
          {/* Active Programs Card */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 md:p-6">
            <div className="flex flex-row items-center justify-between space-y-0 pb-2">
              <h3 className="text-sm font-medium">Active Programs</h3>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="pt-0">
              <div className="text-2xl font-bold">{dashboardData.programs.active}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Programs available
              </p>
            </div>
          </div>
        </div>
      ) : null}
      
      {!loading && !error && dashboardData && (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {/* Recent Payments */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 lg:col-span-3">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold">Recent Payments</h3>
              <p className="text-sm text-muted-foreground">Latest transactions</p>
            </div>
            <div className="pt-6">
              {dashboardData.recent.payments.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recent.payments.map(payment => (
                    <div key={payment.id} className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <CreditCard className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{payment.userName}</p>
                        <p className="text-sm text-muted-foreground">{payment.programName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(payment.amount)}</p>
                        <p className="text-xs text-muted-foreground">{new Date(payment.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent payments found
                </div>
              )}
            </div>
          </div>
          
          {/* Recent Workouts */}
          <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 lg:col-span-3">
            <div className="flex flex-col space-y-1.5">
              <h3 className="text-lg font-semibold">Recent Workouts</h3>
              <p className="text-sm text-muted-foreground">Latest workout plans</p>
            </div>
            <div className="pt-6">
              {dashboardData.recent.workouts.length > 0 ? (
                <div className="space-y-4">
                  {dashboardData.recent.workouts.map(workout => (
                    <div key={workout.id} className="flex items-center">
                      <div className="bg-primary/10 p-2 rounded-full mr-3">
                        <Dumbbell className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{workout.title}</p>
                        <p className="text-sm text-muted-foreground">For: {workout.userName}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{new Date(workout.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">Created: {new Date(workout.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No recent workouts found
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
