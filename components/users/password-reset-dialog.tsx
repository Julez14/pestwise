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

interface PasswordResetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  userName: string;
  newPassword: string;
}

export function PasswordResetDialog({
  open,
  onOpenChange,
  userEmail,
  userName,
  newPassword,
}: PasswordResetDialogProps) {
  const [passwordCopied, setPasswordCopied] = useState(false);

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(newPassword);
    setPasswordCopied(true);
    setTimeout(() => setPasswordCopied(false), 2000); // Reset after 2 seconds
  };

  const handleClose = () => {
    setPasswordCopied(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Password Reset Successful</DialogTitle>
          <DialogDescription>
            A new password has been generated for {userName}. Please securely
            share these credentials with the user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="reset-email">Email Address</Label>
            <Input
              id="reset-email"
              type="text"
              value={userEmail}
              readOnly
              className="h-11 bg-muted"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reset-password">New Password</Label>
            <div className="flex gap-2">
              <Input
                id="reset-password"
                type="text"
                value={newPassword}
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-start">
              <svg
                className="w-5 h-5 text-yellow-600 mr-2 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L3.35 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
              <div>
                <p className="text-sm font-medium text-yellow-800">
                  Security Notice
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  The user's previous password has been invalidated. They must
                  use this new password to log in.
                </p>
              </div>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button onClick={handleClose} className="flex-1">
              Done
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
