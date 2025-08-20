"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddMaterialDialog } from "./add-material-dialog";
import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { isAdmin, isManager } from "@/lib/roles";

interface Material {
  id: number;
  name: string;
  description: string | null;
  material_group: string;
  in_stock: boolean;
  last_used: string | null;
  usage_count: number;
}

const materialGroups = [
  "All Groups",
  "Baits",
  "Bait Stations",
  "Sprays",
  "Dusts",
  "Traps",
  "Exclusion Materials",
  "Sanitizers",
  "Monitoring",
];

export function MaterialsOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("All Groups");
  const [deleteConfirm, setDeleteConfirm] = useState<{
    materialId: number;
    materialName: string;
  } | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { profile } = useAuth();

  const {
    data: materials = [],
    isLoading,
    error,
    refetch,
  } = useQuery<Material[]>({
    queryKey: ["materials"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("materials")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (material.description &&
        material.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesGroup =
      selectedGroup === "All Groups" ||
      material.material_group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const inStockCount = materials.filter((m) => m.in_stock).length;
  const outOfStockCount = materials.filter((m) => !m.in_stock).length;
  const totalUsage = materials.reduce((sum, m) => sum + m.usage_count, 0);

  // Delete mutation
  const deleteMaterialMutation = useMutation({
    mutationFn: async (materialId: number) => {
      // First delete all report_materials references
      await supabase
        .from("report_materials")
        .delete()
        .eq("material_id", materialId);
      // Then delete the material itself
      const { error } = await supabase
        .from("materials")
        .delete()
        .eq("id", materialId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setDeleteConfirm(null);
    },
    onError: (error: Error) => {
      console.error("Error deleting material:", error);
      alert(`Failed to delete material: ${error.message}`);
    },
  });

  // Update mutation
  const updateMaterialMutation = useMutation({
    mutationFn: async (updatedMaterial: Material) => {
      const { error } = await supabase
        .from("materials")
        .update({
          name: updatedMaterial.name,
          description: updatedMaterial.description,
          material_group: updatedMaterial.material_group,
          in_stock: updatedMaterial.in_stock,
        })
        .eq("id", updatedMaterial.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["materials"] });
      setEditingMaterial(null);
    },
    onError: (error: Error) => {
      console.error("Error updating material:", error);
      alert(`Failed to update material: ${error.message}`);
    },
  });

  // Check if user can edit/delete a material (admins and managers only)
  const canModifyMaterial = () => {
    if (!profile) return false;
    return isAdmin(profile.role) || isManager(profile.role);
  };

  const handleDeleteMaterial = (materialId: number, materialName: string) => {
    setDeleteConfirm({ materialId, materialName });
  };

  const confirmDelete = () => {
    if (deleteConfirm) {
      deleteMaterialMutation.mutate(deleteConfirm.materialId);
    }
  };

  const addMaterial = useMutation({
    mutationFn: async (
      newMaterial: Omit<Material, "id" | "usage_count" | "last_used">
    ) => {
      const { data, error } = await supabase
        .from("materials")
        .insert([
          {
            ...newMaterial,
            usage_count: 0,
            last_used: null,
          },
        ])
        .select()
        .single();
      if (error) throw error;
      return data as Material;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["materials"] });
    },
  });

  type DialogMaterial = {
    name: string;
    description: string;
    group: string;
    inStock: boolean;
  };

  const handleAddMaterialFromDialog = async (material: DialogMaterial) => {
    await addMaterial.mutateAsync({
      name: material.name,
      description: material.description,
      material_group: material.group,
      in_stock: material.inStock,
    });
  };

  const toggleStock = async (id: number) => {
    const material = materials.find((m) => m.id === id);
    if (!material) return;
    const { error: updateError } = await supabase
      .from("materials")
      .update({ in_stock: !material.in_stock })
      .eq("id", id);
    if (updateError) {
      console.error("Error updating material stock:", updateError);
      return;
    }
    await queryClient.invalidateQueries({ queryKey: ["materials"] });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading materials...</p>
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
            <p className="text-red-600 mb-4">Failed to load materials</p>
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
            Materials Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your pest control materials and inventory
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Material
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {inStockCount}
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

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900">
                  {outOfStockCount}
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
                <p className="text-sm text-gray-600">Total Usage</p>
                <p className="text-2xl font-bold text-gray-900">{totalUsage}</p>
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
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
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
            placeholder="Search materials..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <select
          value={selectedGroup}
          onChange={(e) => setSelectedGroup(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {materialGroups.map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
        </select>
      </div>

      {/* Materials List */}
      <Card>
        <CardHeader>
          <CardTitle>Materials ({filteredMaterials.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredMaterials.map((material) => (
              <div
                key={material.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-medium text-gray-900">
                          {material.name}
                        </h3>
                        <Badge variant="outline" className="text-xs">
                          {material.material_group}
                        </Badge>
                        <Badge
                          className={
                            material.in_stock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {material.in_stock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {material.description || "No description"}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Used {material.usage_count} times</span>
                        {material.last_used && (
                          <>
                            <span className="mx-2">•</span>
                            <span>
                              Last used{" "}
                              {new Date(
                                material.last_used
                              ).toLocaleDateString()}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleStock(material.id)}
                        className={
                          material.in_stock
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        }
                      >
                        {material.in_stock
                          ? "Mark Out of Stock"
                          : "Mark In Stock"}
                      </Button>
                      {canModifyMaterial() && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditingMaterial(material)}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700 hover:border-red-300"
                            onClick={() =>
                              handleDeleteMaterial(material.id, material.name)
                            }
                            disabled={deleteMaterialMutation.isPending}
                          >
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Material Dialog */}
      {editingMaterial && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Edit Material
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={editingMaterial.name}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      name: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={editingMaterial.description || ""}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      description: e.target.value || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group
                </label>
                <select
                  value={editingMaterial.material_group}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      material_group: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {materialGroups.slice(1).map((group) => (
                    <option key={group} value={group}>
                      {group}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="in_stock"
                  checked={editingMaterial.in_stock}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      in_stock: e.target.checked,
                    })
                  }
                  className="mr-2"
                />
                <label
                  htmlFor="in_stock"
                  className="text-sm font-medium text-gray-700"
                >
                  In Stock
                </label>
              </div>
            </div>
            <div className="flex space-x-3 justify-end mt-6">
              <Button
                variant="outline"
                onClick={() => setEditingMaterial(null)}
              >
                Cancel
              </Button>
              <Button
                onClick={() => updateMaterialMutation.mutate(editingMaterial)}
                disabled={updateMaterialMutation.isPending}
                className="bg-orange-500 hover:bg-orange-600"
              >
                {updateMaterialMutation.isPending ? "Saving..." : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}

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
                Delete Material
              </h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete the material "
                {deleteConfirm.materialName}"? This action cannot be undone and
                will also remove this material from all reports.
              </p>
              <div className="flex space-x-3 justify-center">
                <Button
                  variant="outline"
                  onClick={() => setDeleteConfirm(null)}
                  disabled={deleteMaterialMutation.isPending}
                >
                  Cancel
                </Button>
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={confirmDelete}
                  disabled={deleteMaterialMutation.isPending}
                >
                  {deleteMaterialMutation.isPending
                    ? "Deleting..."
                    : "Delete Material"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Material Dialog */}
      <AddMaterialDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMaterialFromDialog}
        availableGroups={materialGroups.slice(1)} // Remove "All Groups"
      />
    </div>
  );
}
