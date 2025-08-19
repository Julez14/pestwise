import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { ReportsOverview } from "@/components/reports/reports-overview";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function ReportsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <ReportsOverview />
      </DashboardLayout>
    </AuthGuard>
  );
}
