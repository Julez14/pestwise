"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddCommentDialog } from "./add-comment-dialog";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";

interface Comment {
  id: number;
  content: string;
  author_name: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  category: string;
  location_detail: string | null;
  report_id: number | null;
  priority: "low" | "medium" | "high";
}

const categories = [
  "All Categories",
  "Observation",
  "Treatment",
  "Inspection",
  "Emergency",
  "Prevention",
  "Education",
  "Recommendation",
  "Follow-up",
];

const priorities = ["All Priorities", "low", "medium", "high"];

export function CommentsOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedPriority, setSelectedPriority] = useState("All Priorities");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    commentId: number;
    commentContent: string;
  } | null>(null);
  const [editingComment, setEditingComment] = useState<Comment | null>(null);
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { profile } = useAuth();

  const {
    data: comments = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Comment[]>({
    queryKey: ["comments", "list"],
    queryFn: async () => {
      const [commentsResult, profilesResult] = await Promise.all([
        supabase
          .from("comments")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("id, name"),
      ]);

      if (commentsResult.error) throw commentsResult.error;
      if (profilesResult.error) throw profilesResult.error;

      const profilesMap = (profilesResult.data || []).reduce((acc, profile) => {
        acc[profile.id] = profile.name;
        return acc;
      }, {} as Record<string, string>);

      const transformedComments = (commentsResult.data || []).map(
        (comment) => ({
          ...comment,
          author_name: profilesMap[comment.author_id] || "Unknown User",
        })
      );

      return transformedComments;
    },
  });

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comment.location_detail &&
        comment.location_detail
          .toLowerCase()
          .includes(searchQuery.toLowerCase()));
    const matchesCategory =
      selectedCategory === "All Categories" ||
      comment.category === selectedCategory;
    const matchesPriority =
      selectedPriority === "All Priorities" ||
      comment.priority === selectedPriority;
    return matchesSearch && matchesCategory && matchesPriority;
  });

  const highPriorityCount = comments.filter(
    (c) => c.priority === "high"
  ).length;
  const mediumPriorityCount = comments.filter(
    (c) => c.priority === "medium"
  ).length;
  const lowPriorityCount = comments.filter((c) => c.priority === "low").length;

  // Delete mutation
  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "list"] });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      console.error("Error deleting comment:", error);
      alert(`Failed to delete comment: ${error.message}`);
    },
  });

  // Update mutation
  const updateCommentMutation = useMutation({
    mutationFn: async (updatedComment: Partial<Comment> & { id: number }) => {
      const { error } = await supabase
        .from("comments")
        .update({
          content: updatedComment.content,
          category: updatedComment.category,
          priority: updatedComment.priority,
          location_detail: updatedComment.location_detail,
        })
        .eq("id", updatedComment.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["comments", "list"] });
      setEditingComment(null);
    },
    onError: (error: Error) => {
      console.error("Error updating comment:", error);
      alert(`Failed to update comment: ${error.message}`);
    },
  });

  // Check if user can edit/delete a comment
  const canModifyComment = (comment: Comment) => {
    if (!profile) return false;
    // Admins can modify any comment
    if (isAdmin(profile.role)) return true;
    // Authors can modify their own comments
    return comment.author_id === profile.id;
  };

  const handleDeleteComment = (commentId: number, commentContent: string) => {
    setDeleteConfirm({ commentId, commentContent });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteCommentMutation.mutate(deleteConfirm.commentId);
    }
  };

  const addComment = useMutation({
    mutationFn: async (
      newComment: Omit<
        Comment,
        "id" | "created_at" | "updated_at" | "author_name"
      >
    ) => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("comments")
        .insert([
          {
            ...newComment,
            author_id: user.id,
          },
        ])
        .select("*")
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["comments", "list"] });
    },
  });

  type DialogCommentInput = {
    content: string;
    author: string;
    category: string;
    location?: string;
    reportId?: string;
    priority: "low" | "medium" | "high";
  };

  const handleAddCommentFromDialog = async (
    dialogComment: DialogCommentInput
  ) => {
    const numericReportId = (() => {
      if (!dialogComment.reportId) return null;
      const digits = dialogComment.reportId.match(/\d+/g)?.join("");
      if (!digits) return null;
      const parsed = parseInt(digits, 10);
      return Number.isNaN(parsed) ? null : parsed;
    })();

    await addComment.mutateAsync({
      content: dialogComment.content,
      category: dialogComment.category,
      location_detail: dialogComment.location || null,
      report_id: numericReportId,
      priority: dialogComment.priority,
    } as Omit<Comment, "id" | "created_at" | "updated_at" | "author_name">);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Emergency":
        return "bg-red-100 text-red-800";
      case "Treatment":
        return "bg-blue-100 text-blue-800";
      case "Observation":
        return "bg-orange-100 text-orange-800";
      case "Inspection":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading comments...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load comments</p>
            <Button onClick={() => refetch()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Comments & Notes</h1>
          <p className="text-gray-600 mt-1">
            Track observations, treatments, and important notes
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Comment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {highPriorityCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {mediumPriorityCount}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Low Priority</p>
                <p className="text-2xl font-bold text-gray-900">
                  {lowPriorityCount}
                </p>
              </div>
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
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "All Priorities"
                  ? priority
                  : `${
                      priority.charAt(0).toUpperCase() + priority.slice(1)
                    } Priority`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(comment.category)}>
                      {comment.category}
                    </Badge>
                    <Badge className={getPriorityColor(comment.priority)}>
                      {comment.priority.charAt(0).toUpperCase() +
                        comment.priority.slice(1)}
                    </Badge>
                    {comment.report_id && (
                      <Badge variant="outline" className="text-xs">
                        RPT-{comment.report_id}
                      </Badge>
                    )}
                  </div>
                  {canModifyComment(comment) && (
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingComment(comment)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:border-red-300"
                        onClick={() =>
                          handleDeleteComment(
                            comment.id,
                            comment.content.slice(0, 50) + "..."
                          )
                        }
                        disabled={deleteCommentMutation.isPending}
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                {editingComment?.id === comment.id ? (
                  <div className="space-y-3 mb-3">
                    <textarea
                      value={editingComment.content}
                      onChange={(e) =>
                        setEditingComment({
                          ...editingComment,
                          content: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                    <div className="flex flex-wrap gap-2">
                      <select
                        value={editingComment.category}
                        onChange={(e) =>
                          setEditingComment({
                            ...editingComment,
                            category: e.target.value,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        {categories.slice(1).map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                      <select
                        value={editingComment.priority}
                        onChange={(e) =>
                          setEditingComment({
                            ...editingComment,
                            priority: e.target.value as
                              | "low"
                              | "medium"
                              | "high",
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Location (optional)"
                        value={editingComment.location_detail || ""}
                        onChange={(e) =>
                          setEditingComment({
                            ...editingComment,
                            location_detail: e.target.value || null,
                          })
                        }
                        className="px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        onClick={() =>
                          updateCommentMutation.mutate(editingComment)
                        }
                        disabled={updateCommentMutation.isPending}
                        className="bg-orange-500 hover:bg-orange-600"
                      >
                        {updateCommentMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingComment(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-900 mb-3 leading-relaxed">
                    {comment.content}
                  </p>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{comment.author_name}</span>
                    {comment.location_detail && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
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
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span>{comment.location_detail}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <span>{formatDate(comment.created_at)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-6 h-6 text-red-600"
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
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Delete Comment
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this comment: "
                {deleteConfirm.commentContent}"? This action cannot be undone.
              </p>
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteCommentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                  disabled={deleteCommentMutation.isPending}
                >
                  {deleteCommentMutation.isPending
                    ? "Deleting..."
                    : "Delete Comment"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Comment Dialog */}
      <AddCommentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddCommentFromDialog}
        availableCategories={categories.slice(1)} // Remove "All Categories"
      />
    </div>
  );
}
