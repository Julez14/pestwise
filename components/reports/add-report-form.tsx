"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import SignatureCanvas from "react-signature-canvas";

interface PestFinding {
  id: string;
  type: "captured" | "sighted" | "evidence";
  target: string;
  notes: string;
  location: string;
}

interface Location {
  id: number;
  name: string;
}

interface Material {
  id: number;
  name: string;
}

export function AddReportForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const [formData, setFormData] = useState({
    title: "",
    location_id: "",
    unit: "",
    description: "",
    comments: "",
    status: "draft" as "draft" | "completed",
    time_in: "",
    time_out: "",
    customer_name: "",
  });

  const [pestFindings, setPestFindings] = useState<PestFinding[]>([]);
  const [newPestFinding, setNewPestFinding] = useState<Omit<PestFinding, "id">>(
    {
      type: "sighted",
      target: "",
      notes: "",
      location: "",
    }
  );

  const [selectedMaterials, setSelectedMaterials] = useState<number[]>([]);

  const { data: locations, isLoading: isLoadingLocations } = useQuery<
    Location[]
  >({
    queryKey: ["locationsForReports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("locations")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: availableMaterials, isLoading: isLoadingMaterials } = useQuery<
    Material[]
  >({
    queryKey: ["materialsForReports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const pestTypes = [
    "Ants",
    "Cockroaches",
    "Rodents",
    "Flies",
    "Spiders",
    "Beetles",
    "Moths",
    "Wasps",
    "Other",
  ];

  const addMaterial = (materialId: number) => {
    if (materialId && !selectedMaterials.includes(materialId)) {
      setSelectedMaterials([...selectedMaterials, materialId]);
    }
  };

  const removeMaterial = (materialId: number) => {
    setSelectedMaterials(selectedMaterials.filter((id) => id !== materialId));
  };

  const addPestFinding = () => {
    if (newPestFinding.target && newPestFinding.location) {
      const finding: PestFinding = {
        ...newPestFinding,
        id: Date.now().toString(),
      };
      setPestFindings([...pestFindings, finding]);
      setNewPestFinding({
        type: "sighted",
        target: "",
        notes: "",
        location: "",
      });
    }
  };

  const removePestFinding = (id: string) => {
    setPestFindings(pestFindings.filter((f) => f.id !== id));
  };

  const addReportMutation = useMutation({
    mutationFn: async ({
      formData,
      pestFindings,
      selectedMaterials,
    }: {
      formData: {
        title: string;
        location_id: string;
        unit: string;
        description: string;
        comments: string;
        status: "draft" | "completed";
        time_in?: string;
        time_out?: string;
        customer_name?: string;
      };
      pestFindings: PestFinding[];
      selectedMaterials: number[];
    }) => {
      if (!profile) throw new Error("User is not authenticated.");

      const reportToInsert = {
        title: formData.title,
        location_id: parseInt(formData.location_id, 10),
        unit: formData.unit || null,
        description: formData.description || null,
        comments: formData.comments || null,
        status: formData.status,
        author_id: profile.id,
        time_in: formData.time_in
          ? new Date(formData.time_in).toISOString()
          : null,
        time_out: formData.time_out
          ? new Date(formData.time_out).toISOString()
          : null,
        customer_name: formData.customer_name || null,
      };

      const { data: newReport, error: reportError } = await supabase
        .from("reports")
        .insert(reportToInsert)
        .select()
        .single();

      if (reportError) throw reportError;
      if (!newReport) throw new Error("Failed to create report.");

      const reportId = newReport.id;

      if (pestFindings.length > 0) {
        const findingsToInsert = pestFindings.map((finding) => ({
          report_id: reportId,
          finding_type: finding.type,
          target_pest: finding.target,
          location_detail: finding.location,
          notes: finding.notes,
        }));
        const { error: findingsError } = await supabase
          .from("pest_findings")
          .insert(findingsToInsert);
        if (findingsError) throw findingsError;
      }

      if (selectedMaterials.length > 0) {
        const materialsToInsert = selectedMaterials.map((materialId) => ({
          report_id: reportId,
          material_id: materialId,
        }));
        const { error: materialsError } = await supabase
          .from("report_materials")
          .insert(materialsToInsert);
        if (materialsError) throw materialsError;
      }

      return newReport;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["location_summary"] });
      router.push("/reports");
    },
    onError: (error: Error) => {
      console.error("Error creating report:", error);
      alert(`Failed to create report: ${error.message}`);
    },
  });

  const handleFormSubmit = (status: "draft" | "completed") => {
    if (!formData.title || !formData.location_id) {
      alert("Please fill in the report title and location.");
      return;
    }

    if (formData.time_in && formData.time_out) {
      const tin = new Date(formData.time_in).getTime();
      const tout = new Date(formData.time_out).getTime();
      if (Number.isFinite(tin) && Number.isFinite(tout) && tout < tin) {
        alert("Time out cannot be earlier than time in.");
        return;
      }
    }

    addReportMutation.mutate({
      formData: { ...formData, status },
      pestFindings,
      selectedMaterials,
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleFormSubmit(formData.status as "draft" | "completed");
  };

  const getPestTypeColor = (type: string) => {
    switch (type) {
      case "captured":
        return "bg-red-100 text-red-800";
      case "sighted":
        return "bg-yellow-100 text-yellow-800";
      case "evidence":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Add New Report</h1>
          <p className="text-gray-600 mt-1">
            Create a detailed pest control inspection report
          </p>
        </div>
        <Button variant="outline" onClick={() => router.push("/reports")}>
          Cancel
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Kitchen Inspection - Unit 4B"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <select
                  id="location"
                  value={formData.location_id}
                  onChange={(e) =>
                    setFormData({ ...formData, location_id: e.target.value })
                  }
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isLoadingLocations}
                >
                  <option value="">
                    {isLoadingLocations
                      ? "Loading locations..."
                      : "Select a location"}
                  </option>
                  {locations?.map((location) => (
                    <option key={location.id} value={location.id}>
                      {location.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="time_in">Time In</Label>
                <Input
                  id="time_in"
                  type="datetime-local"
                  value={formData.time_in}
                  onChange={(e) =>
                    setFormData({ ...formData, time_in: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="time_out">Time Out</Label>
                <Input
                  id="time_out"
                  type="datetime-local"
                  value={formData.time_out}
                  onChange={(e) =>
                    setFormData({ ...formData, time_out: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit/Area</Label>
              <Input
                id="unit"
                placeholder="e.g., Unit 4B, Kitchen, Basement"
                value={formData.unit}
                onChange={(e) =>
                  setFormData({ ...formData, unit: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the inspection or treatment"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        {/* Materials Used */}
        <Card>
          <CardHeader>
            <CardTitle>Materials Used</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {isLoadingMaterials
                ? "Loading materials..."
                : availableMaterials?.map((material) => (
                    <Button
                      key={material.id}
                      type="button"
                      variant={
                        selectedMaterials.includes(material.id)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      onClick={() =>
                        selectedMaterials.includes(material.id)
                          ? removeMaterial(material.id)
                          : addMaterial(material.id)
                      }
                      className={
                        selectedMaterials.includes(material.id)
                          ? "bg-blue-600 hover:bg-blue-700"
                          : ""
                      }
                    >
                      {material.name}
                    </Button>
                  ))}
            </div>

            {selectedMaterials.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Materials:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterials.map((materialId) => {
                    const material = availableMaterials?.find(
                      (m) => m.id === materialId
                    );
                    if (!material) return null;
                    return (
                      <Badge
                        key={material.id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {material.name}
                        <button
                          type="button"
                          onClick={() => removeMaterial(material.id)}
                          className="ml-1 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pest Findings */}
        <Card>
          <CardHeader>
            <CardTitle>Pest Findings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs defaultValue="add" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="add">Add Finding</TabsTrigger>
                <TabsTrigger value="list">
                  Current Findings ({pestFindings.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="add" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Finding Type</Label>
                    <select
                      value={newPestFinding.type}
                      onChange={(e) =>
                        setNewPestFinding({
                          ...newPestFinding,
                          type: e.target.value as
                            | "captured"
                            | "sighted"
                            | "evidence",
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="sighted">Sighted</option>
                      <option value="captured">Captured</option>
                      <option value="evidence">Evidence</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Target Pest</Label>
                    <select
                      value={newPestFinding.target}
                      onChange={(e) =>
                        setNewPestFinding({
                          ...newPestFinding,
                          target: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select pest type</option>
                      {pestTypes.map((pest) => (
                        <option key={pest} value={pest}>
                          {pest}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Specific Location</Label>
                    <Input
                      placeholder="e.g., Under sink, Near window"
                      value={newPestFinding.location}
                      onChange={(e) =>
                        setNewPestFinding({
                          ...newPestFinding,
                          location: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional details about the finding"
                    value={newPestFinding.notes}
                    onChange={(e) =>
                      setNewPestFinding({
                        ...newPestFinding,
                        notes: e.target.value,
                      })
                    }
                    rows={2}
                  />
                </div>
                <Button
                  type="button"
                  onClick={addPestFinding}
                  disabled={!newPestFinding.target || !newPestFinding.location}
                  className="bg-orange-500 hover:bg-orange-600"
                >
                  Add Pest Finding
                </Button>
              </TabsContent>

              <TabsContent value="list" className="space-y-4">
                {pestFindings.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No pest findings added yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {pestFindings.map((finding) => (
                      <div
                        key={finding.id}
                        className="flex items-start justify-between p-3 border border-gray-200 rounded-lg"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getPestTypeColor(finding.type)}>
                              {finding.type.charAt(0).toUpperCase() +
                                finding.type.slice(1)}
                            </Badge>
                            <span className="font-medium">
                              {finding.target}
                            </span>
                            <span className="text-sm text-gray-500">
                              at {finding.location}
                            </span>
                          </div>
                          {finding.notes && (
                            <p className="text-sm text-gray-600">
                              {finding.notes}
                            </p>
                          )}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removePestFinding(finding.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Signatures */}
        <Card>
          <CardHeader>
            <CardTitle>Signatures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Technician Signature</Label>
                <p className="text-xs text-gray-500">
                  You can apply your saved signature from your profile or sign
                  on the Edit page after saving.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="customer_name">Customer Name</Label>
                <Input
                  id="customer_name"
                  value={formData.customer_name}
                  onChange={(e) =>
                    setFormData({ ...formData, customer_name: e.target.value })
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional observations, recommendations, or follow-up actions needed"
              value={formData.comments}
              onChange={(e) =>
                setFormData({ ...formData, comments: e.target.value })
              }
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleFormSubmit("draft")}
            disabled={addReportMutation.isPending}
          >
            {addReportMutation.isPending ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => handleFormSubmit("completed")}
            disabled={addReportMutation.isPending}
          >
            {addReportMutation.isPending ? "Completing..." : "Complete Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
