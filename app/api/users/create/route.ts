import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createUserWithAdmin, sendWelcomeEmail } from "@/lib/user-management";
import { canManageUsers, getRolesUserCanCreate } from "@/lib/roles";

export async function POST(request: NextRequest) {
    try {
        // Authenticate the requesting user
        const supabase = await createClient();
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: "Authentication required" },
                { status: 401 },
            );
        }

        // Get the user's profile to check permissions
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile || !canManageUsers(profile.role)) {
            return NextResponse.json(
                { error: "Insufficient permissions to create users" },
                { status: 403 },
            );
        }

        // Parse request body
        const { name, email, role } = await request.json();

        // Validate input
        if (!name || !email || !role) {
            return NextResponse.json(
                { error: "Name, email, and role are required" },
                { status: 400 },
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 },
            );
        }

        // Validate role based on current user's permissions
        const allowedRoles = getRolesUserCanCreate(profile.role);
        if (!allowedRoles.includes(role)) {
            return NextResponse.json(
                {
                    error:
                        `You don't have permission to create users with role '${role}'`,
                },
                { status: 403 },
            );
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", user.id);

        // Create the user
        const { user: newUser, password, error: createError } =
            await createUserWithAdmin(
                name.trim(),
                email.trim().toLowerCase(),
                role,
            );

        if (createError) {
            console.error("Error creating user:", createError);

            // Handle specific error cases
            if (
                createError.code === "email_exists" ||
                createError.message?.includes("already been registered") ||
                createError.message?.includes("User already registered")
            ) {
                return NextResponse.json(
                    { error: "A user with this email address already exists" },
                    { status: 409 },
                );
            }

            // Handle validation errors
            if (createError.status === 422) {
                return NextResponse.json(
                    {
                        error: createError.message ||
                            "Invalid user data provided",
                    },
                    { status: 422 },
                );
            }

            return NextResponse.json(
                { error: "Failed to create user. Please try again." },
                { status: 500 },
            );
        }

        // Send welcome email (optional for now)
        const emailResult = await sendWelcomeEmail(email, name, password);
        if (!emailResult.success) {
            console.warn("Failed to send welcome email:", emailResult.error);
            // Don't fail the entire operation if email fails
        }

        // Return success, now including the password
        return NextResponse.json({
            success: true,
            message: "User created successfully",
            user: {
                id: newUser.id,
                email: newUser.email,
                name,
                role,
                password, // Include password in the response
            },
        });
    } catch (error) {
        console.error("Unexpected error in user creation:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
