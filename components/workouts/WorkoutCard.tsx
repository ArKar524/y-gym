"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { Workout, Exercise } from "@/types/workout";

interface WorkoutCardProps {
  workout: Workout;
  onEdit: (workout: Workout) => void;
  onDelete: (workoutId: string) => void;
}

export function WorkoutCard({ workout, onEdit, onDelete }: WorkoutCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const toggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <Card className="mb-4 overflow-hidden bg-white">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{workout.title}</CardTitle>
            <CardDescription>
              {formatDate(new Date(workout.date))}
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onEdit(workout)}
              className="h-8 w-8"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon" 
              onClick={() => onDelete(workout.id)}
              className="h-8 w-8 text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">
            {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleExpand}
            className="h-8 px-2"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        {expanded && (
          <div className="mt-4 space-y-4">
            {workout.exercises.map((exercise: Exercise) => (
              <div key={exercise.id} className="border rounded-md p-3">
                <h4 className="font-medium">{exercise.name}</h4>
                <div className="grid grid-cols-3 gap-2 mt-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Sets:</span> {exercise.sets}
                  </div>
                  <div>
                    <span className="text-muted-foreground">Reps:</span> {exercise.reps}
                  </div>
                  {exercise.weight && (
                    <div>
                      <span className="text-muted-foreground">Weight:</span> {exercise.weight}kg
                    </div>
                  )}
                  {exercise.duration && (
                    <div>
                      <span className="text-muted-foreground">Duration:</span> {exercise.duration}min
                    </div>
                  )}
                </div>
                {exercise.notes && (
                  <p className="text-sm mt-2 text-muted-foreground">{exercise.notes}</p>
                )}
              </div>
            ))}
            
            {workout.notes && (
              <div className="mt-4">
                <h4 className="text-sm font-medium">Notes</h4>
                <p className="text-sm text-muted-foreground mt-1">{workout.notes}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-2">
        <p className="text-xs text-muted-foreground">
          Created on {formatDate(new Date(workout.createdAt))}
        </p>
      </CardFooter>
    </Card>
  );
}
