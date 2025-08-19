"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Comment {
  content: string;
  author: string;
  category: string;
  location?: string;
  reportId?: string;
  priority: "low" | "medium" | "high";
}

interface AddCommentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (comment: Comment) => void;
  availableCategories: string[];
}

export function AddCommentDialog({
  isOpen,
  onClose,
  onAdd,
  availableCategories,
}: AddCommentDialogProps) {
  const [formData, setFormData] = useState<Comment>({
    content: "",
    author: "John Doe", // In a real app, this would come from auth context
    category: availableCategories[0] || "Observation",
    location: "",
    reportId: "",
    priority: "medium",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.content.trim()) {
      const commentToAdd = {
        ...formData,
        location: formData.location || undefined,
        reportId: formData.reportId || undefined,
      };

      onAdd(commentToAdd);

      // Reset form
      setFormData({
        content: "",
        author: "John Doe",
        category: availableCategories[0] || "Observation",
        location: "",
        reportId: "",
        priority: "medium",
      });

      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      content: "",
      author: "John Doe",
      category: availableCategories[0] || "Observation",
      location: "",
      reportId: "",
      priority: "medium",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Comment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="content">Comment</Label>
            <Textarea
              id="content"
              placeholder="Enter your observation, note, or comment..."
              value={formData.content}
              onChange={(e) =>
                setFormData({ ...formData, content: e.target.value })
              }
              rows={4}
              required
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {availableCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <select
                id="priority"
                value={formData.priority}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    priority: e.target.value as "low" | "medium" | "high",
                  })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location (Optional)</Label>
            <Input
              id="location"
              placeholder="e.g., Building A - Kitchen, Unit 4B"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportId">Related Report ID (Optional)</Label>
            <Input
              id="reportId"
              placeholder="e.g., RPT-001"
              value={formData.reportId}
              onChange={(e) =>
                setFormData({ ...formData, reportId: e.target.value })
              }
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Add Comment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
