"use client";

import { useState, useEffect, useCallback } from "react";
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

interface Workout {
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
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedPlan, setExpandedPlan] = useState<string | null>(null);
  const [viewWorkout, setViewWorkout] = useState<Workout | null>(null);

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

  // Fetch workouts
  const fetchWorkouts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const url = selectedUserId === 'all' 
        ? '/api/admin/workouts' 
        : `/api/admin/workouts?userId=${selectedUserId}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      
      const data = await response.json();
      setWorkouts(data);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedUserId]);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchWorkouts();
  }, [selectedUserId, fetchWorkouts]);

  const toggleExpand = (planId: string) => {
    setExpandedPlan(expandedPlan === planId ? null : planId);
  };

  const viewWorkoutDetails = (workout: Workout) => {
    setViewWorkout(workout);
  };

  // Group workouts by date (with null check)
  const groupedWorkouts = workouts?.length > 0 ? workouts.reduce((groups: Record<string, Workout[]>, workout) => {
    if (!workout || !workout.date) return groups;
    
    const date = new Date(workout.date).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(workout);
    return groups;
  }, {}) : {};

  // Sort dates in descending order (with null check)
  const sortedDates = Object.keys(groupedWorkouts || {}).sort((a, b) => 
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
      ) : workouts.length === 0 ? (
        <div className="text-center py-12 border rounded-md">
          <h3 className="text-lg font-medium">No workouts found</h3>
          <p className="text-muted-foreground mt-1">
            {selectedUserId === 'all' 
              ? 'No workouts have been created yet' 
              : 'This user has not created any workouts yet'}
          </p>
        </div>
      ) : (
        <Tabs defaultValue="byDate" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="byDate">By Date</TabsTrigger>
            <TabsTrigger value="byUser">By User</TabsTrigger>
          </TabsList>
          
          <TabsContent value="byDate">
            {sortedDates.map(date => (
              <div key={date} className="space-y-4">
                <h2 className="text-lg font-semibold">{formatDate(new Date(date))}</h2>
                <div className="space-y-3">
                  {groupedWorkouts[date].map(workout => {
                    if (!workout || !workout.id) return null;
                    return (
                      <Card key={workout.id} className="overflow-hidden">
                        <CardHeader className="py-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-base">{workout.title}</CardTitle>
                              <CardDescription>
                                {workout.userName} ({workout.userEmail})
                              </CardDescription>
                            </div>
                            <div className="flex gap-2">
                              <Button 
                                variant="outline" 
                                size="icon" 
                                onClick={() => viewWorkoutDetails(workout)}
                                className="h-8 w-8"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => toggleExpand(workout.id)}
                                className="h-8 w-8"
                              >
                                {expandedPlan === workout.id ? (
                                  <ChevronUp className="h-4 w-4" />
                                ) : (
                                  <ChevronDown className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                        </CardHeader>
                        {expandedPlan === workout.id && (
                          <CardContent>
                            <div className="text-sm">
                              <p className="font-medium mb-2">Exercises:</p>
                              {workout.details?.exercises ? (
                                <ul className="list-disc pl-5 space-y-1">
                                  {workout.details.exercises.map((exercise, index) => (
                                    <li key={index}>
                                      <span className="font-medium">{exercise.name}</span>: {exercise.sets} sets x {exercise.reps} reps
                                      {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                                      {exercise.duration ? ` for ${exercise.duration} min` : ''}
                                    </li>
                                  ))}
                                </ul>
                              ) : <p className="text-muted-foreground">No exercises found</p>}
                              {workout.details?.notes && (
                                <div className="mt-3">
                                  <p className="font-medium">Notes:</p>
                                  <p className="text-muted-foreground">{workout.details.notes}</p>
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
            ))}
          </TabsContent>
          
          <TabsContent value="byUser">
            {users?.filter(user => 
              selectedUserId === 'all' || user.id === selectedUserId
            ).map(user => {
              if (!user) return null;
              const userWorkouts = workouts?.filter(p => p?.userId === user.id) || [];
              if (userWorkouts.length === 0) return null;
              
              return (
                <div key={user.id} className="mb-6">
                  <h2 className="text-lg font-medium mb-3">{user.name} ({user.email})</h2>
                  <div className="space-y-3">
                    {userWorkouts.map(workout => {
                      if (!workout || !workout.id) return null;
                      return (
                        <Card key={workout.id}>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{workout.title}</CardTitle>
                                <CardDescription>
                                  {workout.date ? formatDate(new Date(workout.date)) : 'No date'}
                                </CardDescription>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  variant="outline" 
                                  size="icon" 
                                  onClick={() => viewWorkoutDetails(workout)}
                                  className="h-8 w-8"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => toggleExpand(workout.id)}
                                  className="h-8 w-8"
                                >
                                  {expandedPlan === workout.id ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </div>
                          </CardHeader>
                          {expandedPlan === workout.id && (
                            <CardContent>
                              <div className="text-sm">
                                <p className="font-medium mb-2">Exercises:</p>
                                {workout.details?.exercises ? (
                                  <ul className="list-disc pl-5 space-y-1">
                                    {workout.details.exercises.map((exercise, index) => (
                                      <li key={index}>
                                        <span className="font-medium">{exercise.name}</span>: {exercise.sets} sets x {exercise.reps} reps
                                        {exercise.weight ? ` @ ${exercise.weight}kg` : ''}
                                        {exercise.duration ? ` for ${exercise.duration} min` : ''}
                                      </li>
                                    ))}
                                  </ul>
                                ) : <p className="text-muted-foreground">No exercises found</p>}
                                {workout.details?.notes && (
                                  <div className="mt-3">
                                    <p className="font-medium">Notes:</p>
                                    <p className="text-muted-foreground">{workout.details.notes}</p>
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

      {/* Workout Details Dialog */}
      <Dialog open={!!viewWorkout} onOpenChange={(open) => !open && setViewWorkout(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
              <DialogTitle>{viewWorkout?.title}</DialogTitle>
          </DialogHeader>
          
          {viewWorkout && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">User</p>
                  <p>{viewWorkout.userName} ({viewWorkout.userEmail})</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Date</p>
                  <p>{formatDate(new Date(viewWorkout.date))}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Exercises</h3>
                <div className="space-y-4">
                  {viewWorkout?.details?.exercises?.map((exercise, index) => (
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
              
              {viewWorkout.details?.notes && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Plan Notes</h3>
                  <p className="text-sm">{viewWorkout.details.notes}</p>
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Created on {formatDate(new Date(viewWorkout.createdAt))}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
