import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/user-management";
import { canManageUsers, canManageUserWithRole } from "@/lib/roles";

export async function DELETE(request: NextRequest) {
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

        // Get the current user's profile
        const { data: profile, error: profileError } = await supabase
            .from("profiles")
            .select("role")
            .eq("id", user.id)
            .single();

        if (profileError || !profile) {
            return NextResponse.json(
                { error: "User profile not found" },
                { status: 404 },
            );
        }

        // Check if user has permission to manage users
        if (!canManageUsers(profile.role)) {
            return NextResponse.json(
                { error: "Insufficient permissions" },
                { status: 403 },
            );
        }

        // Parse request body
        const { userId } = await request.json();

        if (!userId) {
            return NextResponse.json(
                { error: "User ID is required" },
                { status: 400 },
            );
        }

        // Prevent users from deleting themselves
        if (userId === user.id) {
            return NextResponse.json(
                { error: "You cannot delete your own account" },
                { status: 400 },
            );
        }

        // Get target user's profile to check permissions
        const { data: targetProfile, error: targetProfileError } =
            await supabase
                .from("profiles")
                .select("role, name")
                .eq("id", userId)
                .single();

        if (targetProfileError || !targetProfile) {
            return NextResponse.json(
                { error: "Target user not found" },
                { status: 404 },
            );
        }

        // Prevent deletion of the System Administrator
        if (
            targetProfile.name === "System Administrator" ||
            targetProfile.role === "admin"
        ) {
            return NextResponse.json(
                { error: "The System Administrator account cannot be deleted" },
                { status: 403 },
            );
        }

        // Check if current user can manage the target user
        if (!canManageUserWithRole(profile.role, targetProfile.role)) {
            return NextResponse.json(
                {
                    error: "You don't have permission to delete this user",
                },
                { status: 403 },
            );
        }

        // Use admin client to delete the user from auth.users
        // This will also cascade delete the profile due to foreign key constraints
        const adminClient = createAdminClient();
        const { error: deleteError } = await adminClient.auth.admin.deleteUser(
            userId,
        );

        if (deleteError) {
            console.error("Error deleting user:", deleteError);
            return NextResponse.json(
                { error: "Failed to delete user" },
                { status: 500 },
            );
        }

        return NextResponse.json(
            { message: "User deleted successfully" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Delete user error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 },
        );
    }
}
