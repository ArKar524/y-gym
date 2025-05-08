import { Button } from "../../../components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { PlusCircle, Search, Filter, MoreHorizontal, Pencil, Trash2, User } from "lucide-react";
import Link from "next/link";
import prisma from "../../../lib/prisma";
import { format } from "date-fns";

// Import dropdown components
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";


// Define a type for our user data
type UserWithPlan = {
  id: string;
  name: string;
  email: string;
  joinedDate: string;
  role: string;
};

// Temporarily removed sorting types and functions

// Function to fetch users from the database
async function getUsers(): Promise<UserWithPlan[]> {
  try {
    // Use raw SQL query to avoid type conversion issues
    const users = await prisma.$queryRaw`SELECT id, name, email, "createdAt", role FROM "User"`;
    
    // Define a type for the raw query result
    type RawUser = {
      id: string;
      name: string;
      email: string;
      createdAt: Date | null;
      role: string;
    };
    
    // Transform the data to match our UI needs - simplified without plan determination
    return (users as RawUser[]).map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    // Format the joined date
    joinedDate: user.createdAt ? format(new Date(user.createdAt), 'yyyy-MM-dd') : 'Unknown',
    // Include role information
    role: user.role || 'MEMBER'
  }));
    
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}
export default async function UsersPage() {
  // Fetch users from the database without sorting
  const users = await getUsers();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Users</h1>
          <p className="text-muted-foreground">Manage gym members and their accounts</p>
        </div>
        <Link href="/admin/users/create">
          <Button className="flex items-center gap-1">
            <PlusCircle className="h-4 w-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search users..."
            className="w-full rounded-md border border-input bg-background pl-8 pr-4 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <Button variant="outline" size="icon" className="h-9 w-9">
          <Filter className="h-4 w-4" />
          <span className="sr-only">Filter</span>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[250px]">
                <div className="flex items-center gap-1">
                  Name
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  Email
                </div>
              </TableHead>
              
              <TableHead>
                <div className="flex items-center gap-1">
                  Role
                </div>
              </TableHead>

              <TableHead>
                <div className="flex items-center gap-1">
                  Joined
                </div>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  <Link href={`/admin/users/${user.id}/profile`} className="hover:underline">
                    {user.name}
                  </Link>
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${user.role === "ADMIN" ? "bg-purple-50 text-purple-700" : "bg-blue-50 text-blue-700"}`}>
                    {user.role}
                  </span>
                </TableCell>
                <TableCell>{user.joinedDate}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/profile`} className="flex w-full cursor-pointer items-center">
                          <User className="mr-2 h-4 w-4" />
                          View Profile
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin/users/${user.id}/edit`} className="flex w-full cursor-pointer items-center">
                          <Pencil className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing <strong>{users.length}</strong> of <strong>{users.length}</strong> users
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
          <Button variant="outline" size="sm">
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
