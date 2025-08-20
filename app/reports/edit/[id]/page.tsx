import { AuthGuard } from "@/components/auth/auth-guard";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { EditReportForm } from "@/components/reports/edit-report-form";

export default function EditReportPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <DashboardLayout>
        <EditReportForm reportId={parseInt(params.id, 10)} />
      </DashboardLayout>
    </AuthGuard>
  );
}
