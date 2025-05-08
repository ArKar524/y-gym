"use client";

import { ProfilePage } from "@/components/profile/ProfilePage";

export default function AdminProfilePage() {
  return (
    <ProfilePage
      title="Admin Profile"
      subtitle="Manage your admin account settings"
      accentColor="primary"
      apiBasePath="/api/users/me"
    />
  );
}
