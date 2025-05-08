"use client";

import { useState, useEffect } from "react";
import { ProfileForm } from "./ProfileForm";
import { PasswordForm } from "./PasswordForm";
import { ProfileImage } from "./ProfileImage";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  address: string | null;
  phone: string | null;
  imageUrl: string | null;
  role: string;
};

interface ProfilePageProps {
  title?: string;
  subtitle?: string;
  accentColor?: "primary" | "green";
  apiBasePath?: string;
}

export function ProfilePage({
  title = "My Profile",
  subtitle = "Manage your account settings",
  accentColor = "primary",
  apiBasePath = "/api/users/me"
}: ProfilePageProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [formData, setFormData] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    address: "",
    phone: "",
    imageUrl: null,
    role: ""
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch(apiBasePath);
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile");
        }
        
        const userData = await response.json();
        setFormData(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsFetching(false);
      }
    };

    fetchCurrentUser();
  }, [apiBasePath]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Create a preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
      
      // In a real application, you would upload the file to a server here
      // For now, we're just showing the preview
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setMessage(null);

    try {
      // Update the user profile
      const response = await fetch(`${apiBasePath}/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          address: formData.address,
          phone: formData.phone,
          // Image handling would be done separately
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update profile");
      }

      setMessage("Profile updated successfully");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setPasswordError(null);

    // Validate passwords
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("New passwords do not match");
      setIsLoading(false);
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${apiBasePath}/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update password");
      }

      // Reset password fields and show success message
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setMessage("Password updated successfully");
    } catch (err) {
      setPasswordError(err instanceof Error ? err.message : "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
          <span className="block sm:inline">{message}</span>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <div className="space-y-6">
          <ProfileImage 
            imageUrl={formData.imageUrl} 
            name={formData.name} 
            onImageChange={handleImageChange}
            accentColor={accentColor}
          />
          
          <ProfileForm
            profile={formData}
            onProfileChange={setFormData}
            onSubmit={handleProfileSubmit}
            isLoading={isLoading}
            error={error}
            buttonColor={accentColor}
          />
        </div>

        {/* Change Password */}
        <div className="space-y-6">
          <PasswordForm
            passwordData={passwordData}
            onPasswordChange={setPasswordData}
            onSubmit={handlePasswordSubmit}
            isLoading={isLoading}
            error={passwordError}
            buttonColor={accentColor}
          />
        </div>
      </div>
    </div>
  );
}
