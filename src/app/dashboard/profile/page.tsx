import { Metadata } from "next";
import { ProfileForm } from "@/components/features/dashboard/profile-form";
import DashboardContainer from "@/components/shared/layout/dashboard-container";

export const metadata: Metadata = {
  title: "Profile | Dashboard",
  description: "Manage your account settings",
};

export default function ProfilePage() {
  return (
    <DashboardContainer title="My Profile" desc="Manage your account settings and preferences.">
      <div className="max-w-2xl">
        <ProfileForm />
      </div>
    </DashboardContainer>
  );
}
