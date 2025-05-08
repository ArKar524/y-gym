"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { WorkoutCard } from "./WorkoutCard";
import { WorkoutForm } from "./WorkoutForm";
import { Workout, WorkoutFormData } from "@/types/workout";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export function WorkoutList() {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [deleteWorkoutId, setDeleteWorkoutId] = useState<string | null>(null);

  // Fetch workouts
  const fetchWorkouts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/workouts');
      
      if (!response.ok) {
        throw new Error('Failed to fetch workouts');
      }
      
      const data = await response.json();
      
      // Transform the data to match our Workout type
      const transformedWorkouts: Workout[] = data.map((workout: any) => ({
        id: workout.id,
        userId: workout.userId,
        title: workout.title,
        date: new Date(workout.date).toISOString(),
        exercises: workout.details.exercises || [],
        notes: workout.details.notes,
        createdAt: new Date(workout.createdAt).toISOString()
      }));
      
      setWorkouts(transformedWorkouts);
    } catch (err) {
      console.error('Error fetching workouts:', err);
      setError('Failed to load workouts. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, []);

  // Create a new workout
  const handleCreateWorkout = async (data: WorkoutFormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create workout');
      }
      
      const result = await response.json();
      
      // Close form and refresh workouts
      setIsFormOpen(false);
      fetchWorkouts();
    } catch (err) {
      console.error('Error creating workout:', err);
      setError('Failed to create workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update an existing workout
  const handleUpdateWorkout = async (data: WorkoutFormData) => {
    if (!editingWorkout) return;
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch(`/api/workouts/${editingWorkout.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update workout');
      }
      
      // Close form and refresh workouts
      setEditingWorkout(null);
      fetchWorkouts();
    } catch (err) {
      console.error('Error updating workout:', err);
      setError('Failed to update workout. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete a workout
  const handleDeleteWorkout = async () => {
    if (!deleteWorkoutId) return;
    
    try {
      const response = await fetch(`/api/workouts/${deleteWorkoutId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete workout');
      }
      
      // Refresh workouts
      fetchWorkouts();
    } catch (err) {
      console.error('Error deleting workout:', err);
      setError('Failed to delete workout. Please try again.');
    } finally {
      setDeleteWorkoutId(null);
    }
  };

  // Open create form
  const openCreateForm = () => {
    setEditingWorkout(null);
    setIsFormOpen(true);
  };

  // Open edit form
  const openEditForm = (workout: Workout) => {
    setEditingWorkout(workout);
  };

  // Close form
  const closeForm = () => {
    setIsFormOpen(false);
    setEditingWorkout(null);
  };

  // Confirm delete
  const confirmDelete = (workoutId: string) => {
    setDeleteWorkoutId(workoutId);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Workouts</h1>
        <Button onClick={openCreateForm}>
          <Plus className="h-4 w-4 mr-2" />
          New Workout
        </Button>
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
          <h3 className="text-lg font-medium">No workouts yet</h3>
          <p className="text-muted-foreground mt-1">Create your first workout to get started</p>
          <Button onClick={openCreateForm} className="mt-4">
            <Plus className="h-4 w-4 mr-2" />
            Create Workout
          </Button>
        </div>
      ) : (
        <div>
          {workouts.map((workout) => (
            <WorkoutCard
              key={workout.id}
              workout={workout}
              onEdit={openEditForm}
              onDelete={confirmDelete}
            />
          ))}
        </div>
      )}

      {/* Create Workout Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Create New Workout</DialogTitle>
          </DialogHeader>
          <WorkoutForm
            onSubmit={handleCreateWorkout}
            onCancel={closeForm}
            isSubmitting={isSubmitting}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Workout Dialog */}
      <Dialog open={!!editingWorkout} onOpenChange={(open) => !open && setEditingWorkout(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Edit Workout</DialogTitle>
          </DialogHeader>
          {editingWorkout && (
            <WorkoutForm
              initialData={editingWorkout}
              onSubmit={handleUpdateWorkout}
              onCancel={() => setEditingWorkout(null)}
              isSubmitting={isSubmitting}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteWorkoutId} onOpenChange={(open) => !open && setDeleteWorkoutId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the workout and all its data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
