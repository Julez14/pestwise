"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
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
import { isAdmin } from "@/lib/roles";
import SignatureCanvas from "react-signature-canvas";

interface PestFinding {
  id: string;
  type: "captured" | "sighted" | "evidence";
  target: string;
  notes: string;
  location: string;
  report_id?: number;
}

interface Location {
  id: number;
  name: string;
}

interface Material {
  id: number;
  name: string;
}

interface ExistingReport {
  id: number;
  title: string;
  description: string | null;
  location_id: number;
  unit: string | null;
  status: string;
  comments: string | null;
  author_id: string;
  time_in?: string | null;
  time_out?: string | null;
  customer_name?: string | null;
}

interface EditReportFormProps {
  reportId: number;
}

export function EditReportForm({ reportId }: EditReportFormProps) {
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
  const [isAuthorized, setIsAuthorized] = useState(false);
  const techSigRef = useRef<SignatureCanvas | null>(null);
  const custSigRef = useRef<SignatureCanvas | null>(null);
  const [savingSignatures, setSavingSignatures] = useState(false);

  // Fetch existing report data
  const { data: existingReport, isLoading: isLoadingReport } =
    useQuery<ExistingReport>({
      queryKey: ["report", reportId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from("reports")
          .select("*")
          .eq("id", reportId)
          .single();
        if (error) throw error;
        return data;
      },
      enabled: !!reportId,
    });

  // Fetch existing pest findings
  const { data: existingPestFindings } = useQuery({
    queryKey: ["pest_findings", reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pest_findings")
        .select("*")
        .eq("report_id", reportId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!reportId,
  });

  // Fetch existing materials
  const { data: existingMaterials } = useQuery({
    queryKey: ["report_materials", reportId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("report_materials")
        .select("material_id")
        .eq("report_id", reportId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!reportId,
  });

  // Check authorization
  useEffect(() => {
    if (existingReport && profile) {
      const canEdit =
        isAdmin(profile.role) || existingReport.author_id === profile.id;
      setIsAuthorized(canEdit);
      if (!canEdit) {
        alert("You don't have permission to edit this report.");
        router.push("/reports");
      }
    }
  }, [existingReport, profile, router]);

  // Populate form when data is loaded
  useEffect(() => {
    if (existingReport) {
      setFormData({
        title: existingReport.title,
        location_id: existingReport.location_id.toString(),
        unit: existingReport.unit || "",
        description: existingReport.description || "",
        comments: existingReport.comments || "",
        status: existingReport.status as "draft" | "completed",
        time_in: existingReport.time_in
          ? new Date(existingReport.time_in).toISOString().slice(0, 16)
          : "",
        time_out: existingReport.time_out
          ? new Date(existingReport.time_out).toISOString().slice(0, 16)
          : "",
        customer_name: existingReport.customer_name || "",
      });
    }
  }, [existingReport]);

  useEffect(() => {
    if (existingPestFindings) {
      const findings = existingPestFindings.map((finding: any) => ({
        id: finding.id.toString(),
        type: finding.finding_type as "captured" | "sighted" | "evidence",
        target: finding.target_pest,
        notes: finding.notes || "",
        location: finding.location_detail,
        report_id: finding.report_id,
      }));
      setPestFindings(findings);
    }
  }, [existingPestFindings]);

  useEffect(() => {
    if (existingMaterials) {
      setSelectedMaterials(existingMaterials.map((rm: any) => rm.material_id));
    }
  }, [existingMaterials]);

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

  const updateReportMutation = useMutation({
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

      const reportToUpdate = {
        title: formData.title,
        location_id: parseInt(formData.location_id, 10),
        unit: formData.unit || null,
        description: formData.description || null,
        comments: formData.comments || null,
        status: formData.status,
        time_in: formData.time_in
          ? new Date(formData.time_in).toISOString()
          : null,
        time_out: formData.time_out
          ? new Date(formData.time_out).toISOString()
          : null,
        customer_name: formData.customer_name || null,
      };

      // Update report
      const { error: reportError } = await supabase
        .from("reports")
        .update(reportToUpdate)
        .eq("id", reportId);

      if (reportError) throw reportError;

      // Delete existing pest findings and materials
      await Promise.all([
        supabase.from("pest_findings").delete().eq("report_id", reportId),
        supabase.from("report_materials").delete().eq("report_id", reportId),
      ]);

      // Insert updated pest findings
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

      // Insert updated materials
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

      return { id: reportId };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
      queryClient.invalidateQueries({ queryKey: ["location_summary"] });
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      router.push("/reports");
    },
    onError: (error: Error) => {
      console.error("Error updating report:", error);
      alert(`Failed to update report: ${error.message}`);
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

    updateReportMutation.mutate({
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

  const applyMySignature = async () => {
    if (!profile) return alert("Not authenticated");
    try {
      const { data: me } = await supabase
        .from("profiles")
        .select("signature_url")
        .eq("id", profile.id)
        .single();
      if (!me?.signature_url) {
        alert("No saved signature found in your profile");
        return;
      }
      const { error } = await supabase
        .from("reports")
        .update({
          technician_signature_url: me.signature_url,
          signed_at: new Date().toISOString(),
        })
        .eq("id", reportId);
      if (error) throw error;
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      alert("Technician signature applied");
    } catch (e: any) {
      alert(e.message || "Failed to apply signature");
    }
  };

  const saveCustomerSignature = async () => {
    try {
      if (!custSigRef.current || custSigRef.current.isEmpty()) {
        alert("Please draw the customer signature first");
        return;
      }
      setSavingSignatures(true);
      const dataUrl = custSigRef.current
        .getTrimmedCanvas()
        .toDataURL("image/png");
      const blob = await (await fetch(dataUrl)).blob();
      const filePath = `report/${reportId}/customer_signature_${Date.now()}.png`;
      const { data, error } = await supabase.storage
        .from("signatures")
        .upload(filePath, blob, { upsert: true });
      if (error) throw error;
      const { data: pub } = await supabase.storage
        .from("signatures")
        .getPublicUrl(data.path);
      const publicUrl = pub.publicUrl;
      const { error: upErr } = await supabase
        .from("reports")
        .update({
          customer_signature_url: publicUrl,
          customer_name: formData.customer_name || null,
        })
        .eq("id", reportId);
      if (upErr) throw upErr;
      queryClient.invalidateQueries({ queryKey: ["report", reportId] });
      alert("Customer signature saved");
    } catch (e: any) {
      alert(e.message || "Failed to save customer signature");
    } finally {
      setSavingSignatures(false);
    }
  };

  if (isLoadingReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading report...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!existingReport || !isAuthorized) {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Edit Report</h1>
          <p className="text-gray-600 mt-1">
            Update your pest control inspection report
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
                  Use your saved signature from your Profile page or sign below.
                </p>
                <div className="border rounded">
                  <SignatureCanvas
                    ref={techSigRef as any}
                    penColor="black"
                    canvasProps={{
                      width: 600,
                      height: 120,
                      className: "sigCanvas",
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => techSigRef.current?.clear()}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyMySignature}
                  >
                    Use Saved Signature
                  </Button>
                </div>
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
                <p className="text-xs text-gray-500 mt-2">Customer Signature</p>
                <div className="border rounded">
                  <SignatureCanvas
                    ref={custSigRef as any}
                    penColor="black"
                    canvasProps={{
                      width: 600,
                      height: 120,
                      className: "sigCanvas",
                    }}
                  />
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => custSigRef.current?.clear()}
                  >
                    Clear
                  </Button>
                  <Button
                    type="button"
                    onClick={saveCustomerSignature}
                    disabled={savingSignatures}
                  >
                    {savingSignatures ? "Saving..." : "Save Customer Signature"}
                  </Button>
                </div>
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
            disabled={updateReportMutation.isPending}
          >
            {updateReportMutation.isPending ? "Saving..." : "Save as Draft"}
          </Button>
          <Button
            type="button"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => handleFormSubmit("completed")}
            disabled={updateReportMutation.isPending}
          >
            {updateReportMutation.isPending ? "Updating..." : "Update Report"}
          </Button>
        </div>
      </form>
    </div>
  );
}
