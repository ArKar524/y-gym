"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronDown, ChevronUp, Eye } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Exercise } from "@/types/workout";

interface User {
  id: string;
  name: string;
  email: string;
}

interface DailyPlan {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  title: string;
  date: string;
  details: {
    exercises: Exercise[];
    notes?: string;
  };
  createdAt: string;
}

export function AdminWorkoutList() {
  const [dailyPlans, setDailyPlans] = useState<DailyPlan[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [viewPlan, setViewPlan] = useState<DailyPlan | null>(null);

  // Fetch all users
  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      
      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }
      
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    }
  };

  // Fetch daily plans
  const fetchDailyPlans = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = selectedUserId === 'all' 
        ? '/api/admin/workouts' 
        : `/api/admin/workouts?userId=${selectedUserId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch daily plans');
      }
      
      const data = await response.json();
      setDailyPlans(data);
    } catch (err) {
      console.error('Error fetching daily plans:', err);
      setError('Failed to load daily plans. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchDailyPlans();
  }, [selectedUserId]);

  const toggleExpand = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const viewPlanDetails = (plan: DailyPlan) => {
    setViewPlan(plan);
  };

  // Group daily plans by date (with null check)
  const groupedPlans = dailyPlans?.length > 0 ? dailyPlans.reduce((groups: Record<string, DailyPlan[]>, plan) => {
    if (!plan || !plan.date) return groups;
    
    const date = new Date(plan.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(plan);
    return groups;
  }, {}) : {};

  // Sort dates in descending order (with null check)
  const sortedDates = Object.keys(groupedPlans || {}).sort((a, b) => 
    new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Workout Management</h1>
        <div className="w-full sm:w-64">
          <Select value={selectedUserId} onValueChange={setSelectedUserId}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by user" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              {users?.length > 0 ? users.map(user => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name}
                </SelectItem>
              )) : <SelectItem value="none" disabled>No users found</SelectItem>}
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded-md mb-6">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : dailyPlans.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium">No daily plans found</h3>
          <p className="text-muted-foreground mt-1">
            {selectedUserId === 'all' 
              ? 'No daily plans have been created yet' 
              : 'This user has not created any daily plans yet'}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="byDate" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="byDate">By Date</TabsTrigger>
            <TabsTrigger value="byUser">By User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="byDate">
            {sortedDates.map(date => {
              if (!date || !groupedPlans[date]) return null;
              return (
                <div key={date} className="mb-6">
                  <h2 className="text-lg font-medium mb-3">{formatDate(new Date(date))}</h2>
                  <div className="space-y-3">
                    {groupedPlans[date].map(plan => {
                      if (!plan || !plan.id) return null;
                      return (
                        <Card key={plan.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{plan.title}</CardTitle>
                                <CardDescription>
                                  {plan.userName} ({plan.userEmail})
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => viewPlanDetails(plan)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleExpand(plan.id)}
                                  className="h-8 w-8"
                                >
                                  {expandedPlan === plan.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedPlan === plan.id && (
                            <CardContent>
                              <div className="text-sm">
                                <p className="font-medium mb-2">Exercises:</p>
                                {plan.details?.exercises ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {plan.details.exercises.map((exercise, index) => (
                                      <li key={index}>
                                        <span className="font-medium">{exercise.name}</span>: {exercise.sets} sets x {exercise.reps} reps
                                        {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                                        {exercise.duration ? ` for ${exercise.duration} min` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-muted-foreground">No exercises found</p>}
                                {plan.details?.notes && (
                                  <div className="mt-3">
                                    <p className="font-medium">Notes:</p>
                                    <p className="text-muted-foreground">{plan.details.notes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>
          
          <TabsContent value="byUser">
            {users?.filter(user => 
              selectedUserId === 'all' || user.id === selectedUserId
            ).map(user => {
              if (!user) return null;
              const userPlans = dailyPlans?.filter(p => p?.userId === user.id) || [];
              if (userPlans.length === 0) return null;
              
              return (
                <div key={user.id} className="mb-6">
                  <h2 className="text-lg font-medium mb-3">{user.name} ({user.email})</h2>
                  <div className="space-y-3">
                    {userPlans.map(plan => {
                      if (!plan || !plan.id) return null;
                      return (
                        <Card key={plan.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{plan.title}</CardTitle>
                                <CardDescription>
                                  {plan.date ? formatDate(new Date(plan.date)) : 'No date'}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => viewPlanDetails(plan)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleExpand(plan.id)}
                                  className="h-8 w-8"
                                >
                                  {expandedPlan === plan.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedPlan === plan.id && (
                            <CardContent>
                              <div className="text-sm">
                                <p className="font-medium mb-2">Exercises:</p>
                                {plan.details?.exercises ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {plan.details.exercises.map((exercise, index) => (
                                      <li key={index}>
                                        <span className="font-medium">{exercise.name}</span>: {exercise.sets} sets x {exercise.reps} reps
                                        {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                                        {exercise.duration ? ` for ${exercise.duration} min` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-muted-foreground">No exercises found</p>}
                                {plan.details?.notes && (
                                  <div className="mt-3">
                                    <p className="font-medium">Notes:</p>
                                    <p className="text-muted-foreground">{plan.details.notes}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          )}
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </TabsContent>
        </Tabs>
      )}

      {/* Daily Plan Details Dialog */}
      <Dialog open={!!viewPlan} onOpenChange={(open) => !open && setViewPlan(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>{viewPlan?.title}</DialogTitle>
          </DialogHeader>
          
          {viewPlan && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p>{viewPlan.userName} ({viewPlan.userEmail})</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{formatDate(new Date(viewPlan.date))}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Exercises</h3>
                <div className="space-y-4">
                  {viewPlan?.details?.exercises?.map((exercise, index) => (
                    <Card key={index}>
                      <CardHeader className="py-3">
                        <CardTitle className="text-base">{exercise.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="py-0">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Sets</p>
                            <p>{exercise.sets}</p>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">Reps</p>
                            <p>{exercise.reps}</p>
                          </div>
                          {exercise.weight && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Weight</p>
                              <p>{exercise.weight} kg</p>
                            </div>
                          )}
                          {exercise.duration && (
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Duration</p>
                              <p>{exercise.duration} min</p>
                            </div>
                          )}
                        </div>
                        
                        {exercise.notes && (
                          <div className="mt-4">
                            <p className="text-sm font-medium text-muted-foreground">Notes</p>
                            <p className="text-sm">{exercise.notes}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
              
              {viewPlan.details?.notes && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Plan Notes</h3>
                  <p className="text-sm">{viewPlan.details.notes}</p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Created on {formatDate(new Date(viewPlan.createdAt))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
