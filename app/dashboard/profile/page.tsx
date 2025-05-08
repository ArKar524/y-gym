"use client";

import { ProfilePage } from "@/components/profile/ProfilePage";


export default function MemberProfilePage() {
  return (
    <ProfilePage
      title="Member Profile"
      subtitle="Manage your membership account settings"
      accentColor="green"
      apiBasePath="/api/users/me"
    />
  );
}
