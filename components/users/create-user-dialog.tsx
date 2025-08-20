"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  getAvailableRoles,
  getRoleDisplayName,
  getRolesUserCanCreate,
  type UserRole,
} from "@/lib/roles";
import { useAuth } from "@/contexts/auth-context";

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated: () => void;
}

interface CreatedUserData {
  email: string;
  password?: string;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onUserCreated,
}: CreateUserDialogProps) {
  const { profile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("technician");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdUserData, setCreatedUserData] =
    useState<CreatedUserData | null>(null);
  const [passwordCopied, setPasswordCopied] = useState(false);

  // Get available roles based on current user's permissions
  const availableRoles = profile ? getRolesUserCanCreate(profile.role) : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setCreatedUserData(null);

    try {
      const response = await fetch("/api/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include", // Ensure cookies are sent
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setCreatedUserData(data.user);
    } catch (err) {
      console.error("Error creating user:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create user. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setName("");
    setEmail("");
    setRole("technician");
    setError(null);
    setCreatedUserData(null);
    setPasswordCopied(false);

    // After finishing with the password dialog and choosing to create another,
    // refresh the user list in the parent
    try {
      onUserCreated();
    } catch (err) {
      console.error("Error in onUserCreated callback (resetForm):", err);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      // If a user was created, refresh the list before closing
      if (createdUserData) {
        try {
          onUserCreated();
        } catch (err) {
          console.error("Error in onUserCreated callback (handleClose):", err);
        }
      }
      resetForm();
      onOpenChange(false);
    }
  };

  const handleCopyPassword = () => {
    if (createdUserData?.password) {
      navigator.clipboard.writeText(createdUserData.password);
      setPasswordCopied(true);
      setTimeout(() => setPasswordCopied(false), 2000); // Reset after 2 seconds
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {createdUserData ? "User Created Successfully" : "Create New User"}
          </DialogTitle>
          {!createdUserData && (
            <DialogDescription>
              Create a new user account. Their password will be displayed for
              you to share.
            </DialogDescription>
          )}
        </DialogHeader>

        {createdUserData ? (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              Please securely share this password with the new user.
            </p>
            <div className="space-y-2">
              <Label htmlFor="created-password">Generated Password</Label>
              <div className="flex gap-2">
                <Input
                  id="created-password"
                  type="text"
                  value={createdUserData.password}
                  readOnly
                  className="h-11 bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopyPassword}
                  className="h-11 px-3"
                >
                  {passwordCopied ? (
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                      />
                    </svg>
                  )}
                </Button>
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleClose} className="w-full">
                Done
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="create-name">Full Name</Label>
              <Input
                id="create-name"
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-email">Email Address</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="john.doe@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="create-role">Role</Label>
              <select
                id="create-role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
                disabled={isLoading}
                className="w-full h-11 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                {availableRoles.map((roleOption) => (
                  <option key={roleOption} value={roleOption}>
                    {getRoleDisplayName(roleOption)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isLoading}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Creating...
                  </>
                ) : (
                  "Create User"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
