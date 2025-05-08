"use client";

import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Save } from "lucide-react";
import { Workout, Exercise, WorkoutFormData } from "@/types/workout";

interface WorkoutFormProps {
  initialData?: Workout;
  onSubmit: (data: WorkoutFormData) => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function WorkoutForm({ initialData, onSubmit, onCancel, isSubmitting }: WorkoutFormProps) {
  const [formData, setFormData] = useState<WorkoutFormData>({
    title: initialData?.title || "",
    date: initialData?.date ? new Date(initialData.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    exercises: initialData?.exercises || [createEmptyExercise()],
    notes: initialData?.notes || ""
  });

  function createEmptyExercise(): Exercise {
    return {
      id: uuidv4(),
      name: "",
      sets: 3,
      reps: 10,
      weight: undefined,
      duration: undefined,
      notes: ""
    } as Exercise;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (index: number, field: keyof Exercise, value: string | number) => {
    const updatedExercises = [...formData.exercises];
    
    // Handle number conversions
    if (field === 'sets' || field === 'reps' || field === 'weight' || field === 'duration') {
      updatedExercises[index][field] = value === '' ? undefined : Number(value);
    } else {
      // Type assertion for string fields
      (updatedExercises[index] as any)[field] = value;
    }
    
    setFormData(prev => ({ ...prev, exercises: updatedExercises }));
  };

  const addExercise = () => {
    setFormData(prev => ({
      ...prev,
      exercises: [...prev.exercises, createEmptyExercise()]
    }));
  };

  const removeExercise = (index: number) => {
    if (formData.exercises.length <= 1) return;
    
    const updatedExercises = [...formData.exercises];
    updatedExercises.splice(index, 1);
    
    setFormData(prev => ({
      ...prev,
      exercises: updatedExercises
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Workout Title</Label>
            <Input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Push Day, Leg Day, etc."
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              name="date"
              type="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Exercises</Label>
          {formData.exercises.map((exercise, index) => (
            <Card key={exercise.id} className="mb-4">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base">Exercise {index + 1}</CardTitle>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeExercise(index)}
                    disabled={formData.exercises.length <= 1}
                    className="h-8 w-8 text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pb-2">
                <div className="space-y-2">
                  <Label htmlFor={`exercise-${index}-name`}>Exercise Name</Label>
                  <Input
                    id={`exercise-${index}-name`}
                    value={exercise.name}
                    onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                    placeholder="Bench Press, Squat, etc."
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-${index}-sets`}>Sets</Label>
                    <Input
                      id={`exercise-${index}-sets`}
                      type="number"
                      min="1"
                      value={exercise.sets}
                      onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-${index}-reps`}>Reps</Label>
                    <Input
                      id={`exercise-${index}-reps`}
                      type="number"
                      min="1"
                      value={exercise.reps}
                      onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-${index}-weight`}>Weight (kg) - Optional</Label>
                    <Input
                      id={`exercise-${index}-weight`}
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight || ''}
                      onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor={`exercise-${index}-duration`}>Duration (min) - Optional</Label>
                    <Input
                      id={`exercise-${index}-duration`}
                      type="number"
                      min="0"
                      value={exercise.duration || ''}
                      onChange={(e) => handleExerciseChange(index, 'duration', e.target.value)}
                      placeholder="Optional"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor={`exercise-${index}-notes`}>Notes - Optional</Label>
                  <Textarea
                    id={`exercise-${index}-notes`}
                    value={exercise.notes || ''}
                    onChange={(e) => handleExerciseChange(index, 'notes', e.target.value)}
                    placeholder="Any additional notes for this exercise"
                    rows={2}
                  />
                </div>
              </CardContent>
            </Card>
          ))}
          
          <Button
            type="button"
            variant="outline"
            onClick={addExercise}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Exercise
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">Workout Notes - Optional</Label>
          <Textarea
            id="notes"
            name="notes"
            value={formData.notes || ''}
            onChange={handleChange}
            placeholder="Any additional notes for the entire workout"
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
        >
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>
    </form>
  );
}
