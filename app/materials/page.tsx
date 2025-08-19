import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { MaterialsOverview } from "@/components/materials/materials-overview";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function MaterialsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <MaterialsOverview />
      </DashboardLayout>
    </AuthGuard>
  );
}
