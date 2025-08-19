import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { LocationsOverview } from "@/components/locations/locations-overview";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function LocationsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <LocationsOverview />
      </DashboardLayout>
    </AuthGuard>
  );
}
