// Script to create/update an admin user in Supabase
// Run this with: node scripts/create_admin_user.js
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

// Create admin client
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const adminUserData = {
  email: "admin@pestcontrol.com",
  password: "AdminPassword123!",
  user_metadata: {
    name: "System Administrator",
    role: "admin",
  },
};

async function createAdminUser() {
  console.log("Creating admin user...");

  try {
    // First, try to create the admin user
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminUserData.email,
      password: adminUserData.password,
      user_metadata: adminUserData.user_metadata,
      email_confirm: true, // Skip email confirmation
    });

    if (error) {
      if (error.message?.includes("already been registered")) {
        console.log("Admin user already exists. Updating role...");

        // Get existing user by email
        const { data: existingUsers, error: listError } =
          await supabase.auth.admin.listUsers();

        if (listError) {
          console.error("Error listing users:", listError.message);
          return;
        }

        const existingAdmin = existingUsers.users.find(
          (user) => user.email === adminUserData.email
        );

        if (existingAdmin) {
          // Update user metadata to admin
          const { error: updateError } =
            await supabase.auth.admin.updateUserById(existingAdmin.id, {
              user_metadata: adminUserData.user_metadata,
            });

          if (updateError) {
            console.error("Error updating user to admin:", updateError.message);
            return;
          }

          // Update the profile role directly in the database
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ role: "admin" })
            .eq("id", existingAdmin.id);

          if (profileError) {
            console.error("Error updating profile role:", profileError.message);
            return;
          }

          console.log(
            "✅ Updated existing user to admin role:",
            adminUserData.email
          );
        } else {
          console.error("Could not find existing admin user");
        }
      } else {
        console.error("Failed to create admin user:", error.message);
      }
    } else {
      console.log(
        "✅ Created new admin user:",
        adminUserData.email,
        `(${data.user.id})`
      );
    }
  } catch (err) {
    console.error("Error creating admin user:", err.message);
  }

  console.log("\n📧 Admin Login Credentials:");
  console.log("Email:", adminUserData.email);
  console.log("Password:", adminUserData.password);
  console.log("\nThe admin can now:");
  console.log(
    "- See and manage all users (technicians, supervisors, managers)"
  );
  console.log("- Create users with any role (technician, supervisor, manager)");
  console.log("- Reset passwords for any user");
}

createAdminUser();
