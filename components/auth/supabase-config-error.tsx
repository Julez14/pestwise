"use client";

export function SupabaseConfigError() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-600 rounded-lg flex items-center justify-center">
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
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.962-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Supabase Configuration Missing
          </h1>
          <p className="text-muted-foreground mb-6">
            Your Supabase environment variables are not configured properly.
          </p>
        </div>

        <div className="bg-card border rounded-lg p-6 space-y-4">
          <h2 className="text-lg font-semibold">Setup Instructions:</h2>

          <div className="space-y-3">
            <div>
              <h3 className="font-medium">1. Get your Supabase credentials</h3>
              <p className="text-sm text-muted-foreground">
                Go to your Supabase project dashboard → Settings → API
              </p>
            </div>

            <div>
              <h3 className="font-medium">2. Update your .env.local file</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Replace the placeholder values with your actual Supabase
                credentials:
              </p>
              <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
                {`NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here`}
              </pre>
            </div>

            <div>
              <h3 className="font-medium">
                3. Restart your development server
              </h3>
              <p className="text-sm text-muted-foreground">
                After updating the .env.local file, restart your Next.js dev
                server
              </p>
              <pre className="bg-muted p-3 rounded text-sm mt-2">
                <code>pnpm dev</code>
              </pre>
            </div>
          </div>

          <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>Note:</strong> Make sure your .env.local file is in the
              root directory of your project and restart your development server
              after making changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
