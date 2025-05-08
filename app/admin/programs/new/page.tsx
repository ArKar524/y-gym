import { ProgramForm } from "@/components/admin/ProgramForm";

export default function NewProgramPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">New Program</h1>
        <p className="text-muted-foreground">
          Create a new training program for your gym
        </p>
      </div>
      <ProgramForm />
    </div>
  );
}
