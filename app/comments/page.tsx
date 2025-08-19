import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { CommentsOverview } from "@/components/comments/comments-overview";
import { AuthGuard } from "@/components/auth/auth-guard";

export default function CommentsPage() {
  return (
    <AuthGuard requireAuth={true}>
      <DashboardLayout>
        <CommentsOverview />
      </DashboardLayout>
    </AuthGuard>
  );
}
