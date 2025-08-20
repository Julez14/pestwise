/**
 * Utility functions for role-based access control
 */

export type UserRole = "technician" | "supervisor" | "manager" | "admin";

/**
 * Check if a user has administrative privileges (supervisor, manager, or admin)
 */
export function isAdmin(role: string): boolean {
    return ["supervisor", "manager", "admin"].includes(role.toLowerCase());
}

/**
 * Check if a user can manage other users (supervisor, manager, or admin)
 */
export function canManageUsers(role: string): boolean {
    return ["supervisor", "manager", "admin"].includes(role.toLowerCase());
}

/**
 * Check if a user is a supervisor
 */
export function isSupervisor(role: string): boolean {
    return role.toLowerCase() === "supervisor";
}

/**
 * Check if a user is a manager
 */
export function isManager(role: string): boolean {
    return role.toLowerCase() === "manager";
}

/**
 * Check if a user is a technician
 */
export function isTechnician(role: string): boolean {
    return role.toLowerCase() === "technician";
}

/**
 * Get the display name for a role
 */
export function getRoleDisplayName(role: string): string {
    const roleMap: Record<string, string> = {
        "technician": "Technician",
        "supervisor": "Supervisor",
        "manager": "Manager",
        "admin": "Admin",
    };

    return roleMap[role.toLowerCase()] || "Unknown";
}

/**
 * Check if a user can manage a specific target user based on role hierarchy
 */
export function canManageUserWithRole(
    currentUserRole: string,
    targetUserRole: string,
): boolean {
    const currentRole = currentUserRole.toLowerCase();
    const targetRole = targetUserRole.toLowerCase();

    // Admin can manage everyone
    if (currentRole === "admin") {
        return true;
    }

    // Manager can manage technicians and supervisors
    if (currentRole === "manager") {
        return ["technician", "supervisor"].includes(targetRole);
    }

    // Supervisor can only manage technicians
    if (currentRole === "supervisor") {
        return targetRole === "technician";
    }

    // Technicians can't manage anyone
    return false;
}

/**
 * Get the roles that a user can create based on their role
 */
export function getRolesUserCanCreate(currentUserRole: string): UserRole[] {
    const role = currentUserRole.toLowerCase();

    // Admin can create all roles except admin
    if (role === "admin") {
        return ["technician", "supervisor", "manager"];
    }

    // Manager can create technicians and supervisors
    if (role === "manager") {
        return ["technician", "supervisor"];
    }

    // Supervisor can only create technicians
    if (role === "supervisor") {
        return ["technician"];
    }

    // Technicians can't create users
    return [];
}

/**
 * Filter users that the current user can see/manage
 */
export function filterUsersBasedOnRole(
    currentUserRole: string,
    users: any[],
): any[] {
    return users.filter((user) =>
        canManageUserWithRole(currentUserRole, user.role)
    );
}

/**
 * Check if a user is the System Administrator (should not be deleted)
 */
export function isSystemAdministrator(
    user: { name: string; role: string },
): boolean {
    return user.name === "System Administrator" || user.role === "admin";
}

/**
 * Get all available roles for user creation (kept for backward compatibility)
 */
export function getAvailableRoles(): UserRole[] {
    return ["technician", "supervisor", "manager"];
}
