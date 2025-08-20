import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { UsersOverview } from "@/components/users/users-overview";
import { SupabaseConfigError } from "@/components/auth/supabase-config-error";

export default function UsersPage() {
  // Check if Supabase is configured
  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === "your_supabase_project_url" ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === "your_supabase_anon_key"
  ) {
    return <SupabaseConfigError />;
  }

  return (
    <AuthGuard>
      <DashboardLayout>
        <UsersOverview />
      </DashboardLayout>
    </AuthGuard>
  );
}
