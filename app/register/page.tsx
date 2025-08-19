import { RegisterForm } from "@/components/auth/register-form";
import { AuthGuard } from "@/components/auth/auth-guard";
import { SupabaseConfigError } from "@/components/auth/supabase-config-error";

export default function RegisterPage() {
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
    <AuthGuard requireAuth={false}>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">PestHub</h1>
            <p className="text-muted-foreground">
              Join our pest control platform
            </p>
          </div>
          <RegisterForm />
        </div>
      </div>
    </AuthGuard>
  );
}
