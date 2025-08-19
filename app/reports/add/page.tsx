import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AddReportForm } from "@/components/reports/add-report-form";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function AddReportPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <AddReportForm />
      </DashboardLayout>
    </AuthGuard>
  );
}
