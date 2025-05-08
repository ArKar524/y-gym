"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  imageUrl: string | null;
  role: string;
};

interface ProfileFormProps {
  profile: UserProfile;
  onProfileChange: (profile: UserProfile) => void;
  onSubmit: (e: React.FormEvent) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  buttonColor?: string;
}

export function ProfileForm({
  profile,
  onProfileChange,
  onSubmit,
  isLoading,
  error,
  buttonColor = "primary"
}: ProfileFormProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onProfileChange({
      ...profile,
      [name]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Profile Information</h2>
        <p className="text-sm text-muted-foreground">Update your account details</p>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            placeholder="John Doe"
            value={profile.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="john@example.com"
            value={profile.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            name="phone"
            placeholder="+1 (555) 123-4567"
            value={profile.phone || ''}
            onChange={handleChange}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            name="address"
            placeholder="123 Main St, City, Country"
            value={profile.address || ''}
            onChange={handleChange}
          />
        </div>

        <Button 
          type="submit" 
          disabled={isLoading} 
          className={`w-full ${buttonColor === "green" ? "bg-green-600 hover:bg-green-700" : ""}`}
        >
          {isLoading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
