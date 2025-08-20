import { AuthGuard } from "@/components/auth/auth-guard";
import { EditReportForm } from "@/components/reports/edit-report-form";

export default function EditReportPage({ params }: { params: { id: string } }) {
  return (
    <AuthGuard>
      <EditReportForm reportId={parseInt(params.id, 10)} />
    </AuthGuard>
  );
}
