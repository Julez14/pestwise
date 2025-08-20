"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreateUserDialog } from "./create-user-dialog";
import { PasswordResetDialog } from "./password-reset-dialog";
import { DeleteUserDialog } from "./delete-user-dialog";
import { useAuth } from "@/contexts/auth-context";
import {
  canManageUsers,
  getRoleDisplayName,
  filterUsersBasedOnRole,
  canManageUserWithRole,
  isSystemAdministrator,
} from "@/lib/roles";
import { supabase } from "@/lib/supabase/client";

interface User {
  id: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
  email?: string;
}

export function UsersOverview() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [resetPasswordLoading, setResetPasswordLoading] = useState<
    string | null
  >(null);
  const [showPasswordResetDialog, setShowPasswordResetDialog] = useState(false);
  const [resetPasswordData, setResetPasswordData] = useState<{
    email: string;
    password: string;
    userName: string;
  } | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Filter users based on current user's role permissions
  const visibleUsers = profile
    ? filterUsersBasedOnRole(profile.role, users)
    : [];

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch users from profiles table
      const { data, error } = await supabase
        .from("profiles")
        .select(
          `
          id,
          name,
          role,
          created_at,
          updated_at
        `
        )
        .order("created_at", { ascending: false });

      if (error) {
        throw error;
      }

      setUsers(data || []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleUserCreated = () => {
    // Refresh users list after creating a new user
    fetchUsers();
    // Don't close the dialog here - let the user close it after seeing the password
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
    setShowDeleteDialog(true);
  };

  const handleUserDeleted = () => {
    setShowDeleteDialog(false);
    setUserToDelete(null);
    fetchUsers();
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    try {
      setResetPasswordLoading(userId);

      const response = await fetch("/api/users/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          userId: userId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      // Show the password reset dialog with the new credentials
      setResetPasswordData({
        email: data.email,
        password: data.password,
        userName: userName,
      });
      setShowPasswordResetDialog(true);
    } catch (err) {
      console.error("Error resetting password:", err);
      // You could add error handling here with a toast or alert
      alert(
        err instanceof Error
          ? err.message
          : "Failed to reset password. Please try again."
      );
    } finally {
      setResetPasswordLoading(null);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "manager":
        return "bg-purple-100 text-purple-800";
      case "supervisor":
        return "bg-blue-100 text-blue-800";
      case "technician":
        return "bg-green-100 text-green-800";
      case "admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Check if user has permission to access this page
  if (!profile || !canManageUsers(profile.role)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don't have permission to access user management.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading users...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-orange-500 hover:bg-orange-600 text-white"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Create User
        </Button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg
              className="w-5 h-5 text-red-500 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <p className="text-red-800 font-medium">Error loading users</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            className="mt-3 border-red-300 text-red-700 hover:bg-red-50"
          >
            Try Again
          </Button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">
                  Visible Users
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {visibleUsers.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-green-600"
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
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Technicians</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visibleUsers.filter((u) => u.role === "technician").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Supervisors</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visibleUsers.filter((u) => u.role === "supervisor").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Managers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {visibleUsers.filter((u) => u.role === "manager").length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users List */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-semibold">All Users</h2>
        </CardHeader>
        <CardContent>
          {visibleUsers.length === 0 ? (
            <div className="text-center py-8">
              <svg
                className="w-12 h-12 text-gray-400 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                />
              </svg>
              <p className="text-gray-600">No users you can manage found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {visibleUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
                        {user.name
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase())
                          .join("")
                          .slice(0, 2)}
                      </span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-sm font-medium text-gray-900">
                        {user.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Created {formatDate(user.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={getRoleBadgeColor(user.role)}>
                      {getRoleDisplayName(user.role)}
                    </Badge>
                    {profile &&
                      canManageUserWithRole(profile.role, user.role) && (
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleResetPassword(user.id, user.name)
                            }
                            disabled={resetPasswordLoading === user.id}
                            className="text-xs"
                          >
                            {resetPasswordLoading === user.id ? (
                              <>
                                <div className="w-3 h-3 border-2 border-gray-600 border-t-transparent rounded-full animate-spin mr-1"></div>
                                Sending...
                              </>
                            ) : (
                              <>
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                  />
                                </svg>
                                Reset Password
                              </>
                            )}
                          </Button>
                          {!isSystemAdministrator(user) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDeleteUser(user)}
                              className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <svg
                                className="w-3 h-3 mr-1"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create User Dialog */}
      <CreateUserDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onUserCreated={handleUserCreated}
      />

      {/* Password Reset Dialog */}
      {resetPasswordData && (
        <PasswordResetDialog
          open={showPasswordResetDialog}
          onOpenChange={setShowPasswordResetDialog}
          userEmail={resetPasswordData.email}
          userName={resetPasswordData.userName}
          newPassword={resetPasswordData.password}
        />
      )}

      {/* Delete User Dialog */}
      <DeleteUserDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onUserDeleted={handleUserDeleted}
        user={userToDelete}
      />
    </div>
  );
}
