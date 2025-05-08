import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import EditUserForm from './edit-form';

type Props = {
  params: { id: string }
}

export default function EditUserPage({ params }: Props) {
  const { id } = params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Link href="/admin/users" className="flex items-center text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back to Users
        </Link>
      </div>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit User</h1>
        <p className="text-muted-foreground">Update user information</p>
      </div>
      
      <EditUserForm userId={id} />
    </div>
  );
}
