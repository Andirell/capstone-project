"use client";

import RequireLogin from "@/components/require-login";
import { useAuth } from "@/components/auth-context";
import SeekerDashboard from "@/components/seeker-dashboard";
import EmployerDashboard from "@/components/employer-dashboard";

function Dashboard() {
  const { isEmployer } = useAuth();
  // Employers and job seekers get different dashboards
  if (isEmployer) {
    return <EmployerDashboard />;
  }
  return <SeekerDashboard />;
}

export default function DashboardPage() {
  return (
    <RequireLogin>
      <Dashboard />
    </RequireLogin>
  );
}
