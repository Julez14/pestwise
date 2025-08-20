"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { getRoleDisplayName } from "@/lib/roles";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserDeleted: () => void;
  user: {
    id: string;
    name: string;
    role: string;
    email?: string;
  } | null;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  onUserDeleted,
  user,
}: DeleteUserDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch("/api/users/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete user");
      }

      // Close dialog and refresh user list
      onOpenChange(false);
      onUserDeleted();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancel = () => {
    setError(null);
    onOpenChange(false);
  };

  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Delete User</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this user? This action cannot be
            undone.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.94-.833-2.71 0L4.104 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-red-800">
                  User will be permanently deleted
                </h4>
                <div className="mt-2 text-sm text-red-700">
                  <p>
                    <strong>Name:</strong> {user.name}
                  </p>
                  <p>
                    <strong>Role:</strong> {getRoleDisplayName(user.role)}
                  </p>
                  {user.email && (
                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isDeleting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex-1"
            >
              {isDeleting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Deleting...
                </>
              ) : (
                "Delete User"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
