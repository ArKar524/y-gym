import { AdminProgramList } from "@/components/admin/AdminProgramList";

export default function ProgramsPage() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Programs</h1>
        <p className="text-muted-foreground">
          Manage your gym&apos;s training programs
        </p>
      </div>
      <AdminProgramList />
    </div>
  );
}
