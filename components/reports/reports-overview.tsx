"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin } from "@/lib/roles";

interface Report {
  id: number;
  title: string;
  description: string | null;
  location_name: string;
  unit: string | null;
  author_name: string;
  author_id: string;
  updated_at: string;
  status: string;
  pest_findings_count: number;
}

export function ReportsOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    reportId: number;
    reportTitle: string;
  } | null>(null);
  const router = useRouter();
  const { profile } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: reports = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Report[]>({
    queryKey: ["reports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_details")
        .select("*")
        .order("updated_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredReports = reports.filter((report) => {
    const location = report.unit
      ? `${report.location_name}, ${report.unit}`
      : report.location_name;
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate stats from real data
  const totalReports = reports.length;
  const draftReports = reports.filter((r) => r.status === "draft").length;
  const inProgressReports = reports.filter(
    (r) => r.status === "in-progress"
  ).length;
  const completedReports = reports.filter(
    (r) => r.status === "completed"
  ).length;

  // Delete mutation
  const deleteReportMutation = useMutation({
    mutationFn: async (reportId: number) => {
      // Remove child rows first to avoid FK/RLS edge cases
      await Promise.all([
        supabase.from("pest_findings").delete().eq("report_id", reportId),
        supabase.from("report_materials").delete().eq("report_id", reportId),
      ]);

      const { error } = await supabase
        .from("reports")
        .delete()
        .eq("id", reportId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["location_summary"] });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      console.error("Error deleting report:", error);
      alert(`Failed to delete report: ${error.message}`);
    },
  });

  // Check if user can edit/delete a report
  const canModifyReport = (report: Report) => {
    if (!profile) return false;
    // Admins can modify any report
    if (isAdmin(profile.role)) return true;
    // Authors can modify their own reports
    return report.author_id === profile.id;
  };

  const handleDeleteReport = (reportId: number, reportTitle: string) => {
    setDeleteConfirm({ reportId, reportTitle });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteReportMutation.mutate(deleteConfirm.reportId);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "draft":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed";
      case "in-progress":
        return "In Progress";
      case "draft":
        return "Draft";
      default:
        return status;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading reports...</p>
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
            <p className="text-red-600 mb-4">Failed to load reports</p>
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
          <h1 className="text-2xl font-bold text-gray-900">
            Report Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage and track all your reports in one place
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => router.push("/reports/add")}
        >
          Add Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalReports}
                </p>
              </div>
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
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inProgressReports}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-orange-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
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
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">
                  {completedReports}
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
            placeholder="Search reports..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {report.title}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {report.description || "No description"}
                      </p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <svg
                          className="w-4 h-4 mr-1"
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
                        <span>
                          {report.unit
                            ? `${report.location_name}, ${report.unit}`
                            : report.location_name}
                        </span>
                        <span className="mx-2">•</span>
                        <span>{report.author_name}</span>
                        <span className="mx-2">•</span>
                        <span>
                          Updated{" "}
                          {new Date(report.updated_at).toLocaleDateString()}
                        </span>
                        {report.pest_findings_count > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-red-600 font-medium">
                              {report.pest_findings_count} pest finding
                              {report.pest_findings_count > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={getStatusColor(report.status)}>
                        {getStatusLabel(report.status)}
                      </Badge>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={async () => {
                            try {
                              const days = 7;
                              const noExpiry = false;
                              const res = await fetch(
                                `/api/reports/${report.id}/share`,
                                {
                                  method: "POST",
                                  headers: {
                                    "Content-Type": "application/json",
                                  },
                                  body: JSON.stringify({ days, noExpiry }),
                                }
                              );
                              const data = await res.json();
                              if (!res.ok)
                                throw new Error(
                                  data.error || "Failed to create link"
                                );

                              const shareUrl = data.shareUrl as string;

                              // Prefer native share when available
                              if (
                                typeof navigator !== "undefined" &&
                                (navigator as any).share
                              ) {
                                try {
                                  await (navigator as any).share({
                                    title: "Report",
                                    url: shareUrl,
                                  });
                                  return;
                                } catch {
                                  // fall through
                                }
                              }

                              // Clipboard API
                              try {
                                if (
                                  navigator.clipboard &&
                                  typeof navigator.clipboard.writeText ===
                                    "function"
                                ) {
                                  await navigator.clipboard.writeText(shareUrl);
                                  alert(
                                    `Share link copied to clipboard${
                                      noExpiry
                                        ? " (no expiry)"
                                        : ` (expires in ${days} days)`
                                    }`
                                  );
                                  return;
                                }
                                throw new Error("Clipboard API not available");
                              } catch (_) {
                                // Fallback to execCommand copy
                                const textarea =
                                  document.createElement("textarea");
                                textarea.value = shareUrl;
                                textarea.style.position = "fixed";
                                textarea.style.left = "-9999px";
                                document.body.appendChild(textarea);
                                textarea.focus();
                                textarea.select();
                                let copied = false;
                                try {
                                  copied = document.execCommand("copy");
                                } catch {}
                                document.body.removeChild(textarea);
                                if (copied) {
                                  alert(
                                    `Share link copied to clipboard${
                                      noExpiry
                                        ? " (no expiry)"
                                        : ` (expires in ${days} days)`
                                    }`
                                  );
                                } else {
                                  window.prompt("Copy this link:", shareUrl);
                                }
                              }
                            } catch (e: any) {
                              alert(e.message || "Failed to create share link");
                            }
                          }}
                        >
                          Share
                        </Button>
                        {canModifyReport(report) && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                router.push(`/reports/edit/${report.id}`)
                              }
                            >
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:border-red-300"
                              onClick={() =>
                                handleDeleteReport(report.id, report.title)
                              }
                              disabled={deleteReportMutation.isPending}
                            >
                              Delete
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
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
                Delete Report
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the report "
                {deleteConfirm.reportTitle}"? This action cannot be undone and
                will also delete all associated pest findings and material usage
                records.
              </p>
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteReportMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                  disabled={deleteReportMutation.isPending}
                >
                  {deleteReportMutation.isPending
                    ? "Deleting..."
                    : "Delete Report"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
