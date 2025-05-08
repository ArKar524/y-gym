"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Calendar, Dumbbell, Heart, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from "date-fns";

type DashboardData = {
  todayPlan: any;
  caloriesBurned: number;
  workoutStreak: number;
  healthScore: number;
  latestMetrics: any[];
  upcomingSessions: any[];
  recentPayments: any[];
};

export default function UserDashboard() {
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/dashboard/user-stats');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch dashboard data');
        }
        
        const data = await response.json();
        setDashboardData(data);
      } catch (err: any) {
        console.error('Error fetching dashboard data:', err);
        if (err.message === 'Unauthorized') {
          setError('Please log in to view your dashboard data.');
        } else {
          setError('Unable to load dashboard data. Please try again later.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading dashboard data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 md:space-y-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
          <p className="text-sm md:text-base text-muted-foreground">Welcome to your Y-Gym dashboard</p>
        </div>
        
        <div className="p-4 border border-red-200 bg-red-50 rounded-md text-red-700">
          {error}
        </div>
        
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Placeholder cards with default values */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today&apos;s Plan</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">No workout planned</div>
              <p className="text-xs text-muted-foreground">Schedule your next workout</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">From your recent workouts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
              <Dumbbell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0 Days</div>
              <p className="text-xs text-muted-foreground">Building consistency</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Health Score</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0%</div>
              <p className="text-xs text-muted-foreground">Based on your metrics</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const data = dashboardData || {
    todayPlan: null,
    caloriesBurned: 0,
    workoutStreak: 0,
    healthScore: 0,
    latestMetrics: [],
    upcomingSessions: [],
    recentPayments: []
  };

  // Format today's plan title and description
  const todayPlanTitle = data.todayPlan?.title || 'No workout planned';
  const todayPlanDesc = data.todayPlan?.description || 'Schedule your next workout';

  return (
    <div className="space-y-6 md:space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">Dashboard</h1>
        <p className="text-sm md:text-base text-muted-foreground">Welcome to your Y-Gym dashboard</p>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today&apos;s Plan</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayPlanTitle}</div>
            <p className="text-xs text-muted-foreground">{todayPlanDesc}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Calories Burned</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.caloriesBurned.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From your recent workouts</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Workout Streak</CardTitle>
            <Dumbbell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.workoutStreak} Days</div>
            <p className="text-xs text-muted-foreground">{data.workoutStreak > 5 ? 'Keep it up!' : 'Building consistency'}</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <Heart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.healthScore}%</div>
            <p className="text-xs text-muted-foreground">Based on your metrics</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Latest Metrics</CardTitle>
            <CardDescription>Your recent body measurements</CardDescription>
          </CardHeader>
          <CardContent>
            {data.latestMetrics.length > 0 ? (
              <div className="space-y-4">
                {data.latestMetrics.slice(0, 5).map((metric: any) => (
                  <div key={metric.id} className="flex justify-between items-center border-b pb-2">
                    <div>
                      <p className="font-medium">{metric.key}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(metric.recordedAt), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">
                        {metric.value} {metric.unit}
                      </p>
                      {metric.notes && (
                        <p className="text-xs text-muted-foreground">{metric.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-[180px] flex items-center justify-center border rounded-md">
                <p className="text-sm text-muted-foreground">No metrics recorded yet</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Upcoming Sessions</CardTitle>
            <CardDescription>Your scheduled workouts</CardDescription>
          </CardHeader>
          <CardContent>
            {data.upcomingSessions.length > 0 ? (
              <div className="space-y-4">
                {data.upcomingSessions.map((session: any) => (
                  <div key={session.id} className="flex items-center gap-4">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{session.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(session.date), 'EEEE, h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-[100px] border rounded-md">
                <p className="text-sm text-muted-foreground">No upcoming sessions</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
