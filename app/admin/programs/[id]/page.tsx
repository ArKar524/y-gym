"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ProgramForm } from "@/components/admin/ProgramForm";

interface Program {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
  imageUrl?: string;
  active: boolean;
}

export default function EditProgramPage() {
  const params = useParams();
  const [program, setProgram] = useState<Program | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProgram = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/programs/${params.id}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch program");
        }
        
        const data = await response.json();
        setProgram(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching program:", err);
        setError("Failed to load program. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchProgram();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Program</h1>
          <p className="text-muted-foreground">Loading program details...</p>
        </div>
      </div>
    );
  }

  if (error || !program) {
    return (
      <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Edit Program</h1>
          <p className="text-destructive">{error || "Program not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Edit Program</h1>
        <p className="text-muted-foreground">
          Update the details of {program.name}
        </p>
      </div>
      <ProgramForm initialData={program} isEditing />
    </div>
  );
}
