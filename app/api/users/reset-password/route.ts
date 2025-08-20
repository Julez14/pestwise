import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
    createAdminClient,
    generateSecurePassword,
} from "@/lib/user-management";
import { canManageUsers, canManageUserWithRole } from "@/lib/roles";

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
                { error: "Insufficient permissions to reset user passwords" },
                { status: 403 },
            );
        }

        // Parse request body
        const { userId } = await request.json();

        // Validate input
        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 },
            );
        }

        // Get user's profile to check permissions
        const { data: targetProfile, error: targetProfileError } =
            await supabase
                .from("profiles")
                .select("role")
                .eq("id", userId)
                .single();

        if (targetProfileError || !targetProfile) {
            return NextResponse.json(
                { error: "Target user not found" },
                { status: 404 },
            );
        }

        // Check if current user can manage the target user
        if (!canManageUserWithRole(profile.role, targetProfile.role)) {
            return NextResponse.json(
                {
                    error:
                        "You don't have permission to reset this user's password",
                },
                { status: 403 },
            );
        }

        // Get user's email from auth.users using admin client
        const adminClient = createAdminClient();
        const { data: userData, error: userError } = await adminClient.auth
            .admin.getUserById(userId);

        if (userError || !userData.user) {
            return NextResponse.json(
                { error: "User not found" },
                { status: 404 },
            );
        }

        const userEmail = userData.user.email;
        if (!userEmail) {
            return NextResponse.json(
                { error: "User email not found" },
                { status: 400 },
            );
        }

        // Generate a new password and update it directly
        const newPassword = generateSecurePassword();

        const { error: updateError } = await adminClient.auth.admin
            .updateUserById(
                userId,
                { password: newPassword },
            );

        if (updateError) {
            console.error("Error updating user password:", updateError);

            return NextResponse.json(
                {
                    error: "Failed to reset password. Please try again.",
                },
                { status: 500 },
            );
        }

        // Return success with the new password
        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
            email: userEmail,
            password: newPassword,
        });
    } catch (error) {
        console.error("Unexpected error in password reset:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
