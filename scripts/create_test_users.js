// Script to create test users in Supabase Auth
// Run this with: node scripts/create_test_users.js
// Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env.local

const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables. Make sure you have:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  console.error("Set these in your .env.local file");
  process.exit(1);
}

// Create admin client (can create users)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const testUsers = [
  {
    email: "john.doe@pestcontrol.com",
    password: "TestPassword123!",
    user_metadata: {
      name: "John Doe",
      role: "technician",
    },
  },
  {
    email: "sarah.johnson@pestcontrol.com",
    password: "TestPassword123!",
    user_metadata: {
      name: "Sarah Johnson",
      role: "supervisor",
    },
  },
  {
    email: "mike.chen@pestcontrol.com",
    password: "TestPassword123!",
    user_metadata: {
      name: "Mike Chen",
      role: "technician",
    },
  },
  {
    email: "emily.davis@pestcontrol.com",
    password: "TestPassword123!",
    user_metadata: {
      name: "Emily Davis",
      role: "manager",
    },
  },
];

async function createTestUsers() {
  console.log("Creating test users...");

  for (const userData of testUsers) {
    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: userData.email,
        password: userData.password,
        user_metadata: userData.user_metadata,
        email_confirm: true, // Skip email confirmation
      });

      if (error) {
        console.error(
          `Failed to create user ${userData.email}:`,
          error.message
        );
      } else {
        console.log(`✅ Created user: ${userData.email} (${data.user.id})`);
      }
    } catch (err) {
      console.error(`Error creating user ${userData.email}:`, err.message);
    }
  }

  console.log("\nDone! Check your Supabase Dashboard → Authentication → Users");
  console.log("The profiles should be automatically created by the trigger.");
}

createTestUsers();
