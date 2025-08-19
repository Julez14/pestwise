"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AddMaterialDialog } from "./add-material-dialog";

interface Material {
  id: string;
  name: string;
  description: string;
  group: string;
  inStock: boolean;
  lastUsed?: string;
  usageCount: number;
}

const mockMaterials: Material[] = [
  {
    id: "1",
    name: "Gel Bait - Cockroach",
    description: "Professional grade gel bait for cockroach control",
    group: "Baits",
    inStock: true,
    lastUsed: "2024-01-20",
    usageCount: 15,
  },
  {
    id: "2",
    name: "Rodent Bait Stations",
    description: "Tamper-resistant bait stations for rodent control",
    group: "Bait Stations",
    inStock: true,
    lastUsed: "2024-01-19",
    usageCount: 8,
  },
  {
    id: "3",
    name: "Residual Spray - Ant Control",
    description: "Long-lasting residual spray for ant treatment",
    group: "Sprays",
    inStock: false,
    lastUsed: "2024-01-15",
    usageCount: 12,
  },
  {
    id: "4",
    name: "Dust Treatment - Crack & Crevice",
    description: "Insecticidal dust for hard-to-reach areas",
    group: "Dusts",
    inStock: true,
    lastUsed: "2024-01-18",
    usageCount: 6,
  },
  {
    id: "5",
    name: "Sticky Traps - Flying Insects",
    description: "Non-toxic sticky traps for monitoring flying insects",
    group: "Traps",
    inStock: true,
    lastUsed: "2024-01-17",
    usageCount: 20,
  },
  {
    id: "6",
    name: "Exclusion Foam",
    description: "Expanding foam for sealing entry points",
    group: "Exclusion Materials",
    inStock: true,
    lastUsed: "2024-01-16",
    usageCount: 4,
  },
  {
    id: "7",
    name: "Sanitizing Solution",
    description: "EPA-approved sanitizer for treatment areas",
    group: "Sanitizers",
    inStock: true,
    lastUsed: "2024-01-20",
    usageCount: 25,
  },
  {
    id: "8",
    name: "Monitoring Devices - Multi-Pest",
    description: "Electronic monitoring devices for various pests",
    group: "Monitoring",
    inStock: false,
    lastUsed: "2024-01-14",
    usageCount: 3,
  },
];

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
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const filteredMaterials = materials.filter((material) => {
    const matchesSearch =
      material.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      material.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGroup =
      selectedGroup === "All Groups" || material.group === selectedGroup;
    return matchesSearch && matchesGroup;
  });

  const inStockCount = materials.filter((m) => m.inStock).length;
  const outOfStockCount = materials.filter((m) => !m.inStock).length;
  const totalUsage = materials.reduce((sum, m) => sum + m.usageCount, 0);

  const handleAddMaterial = (
    newMaterial: Omit<Material, "id" | "usageCount" | "lastUsed">
  ) => {
    const material: Material = {
      ...newMaterial,
      id: Date.now().toString(),
      usageCount: 0,
    };
    setMaterials([...materials, material]);
  };

  const toggleStock = (id: string) => {
    setMaterials(
      materials.map((material) =>
        material.id === id
          ? { ...material, inStock: !material.inStock }
          : material
      )
    );
  };

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
                          {material.group}
                        </Badge>
                        <Badge
                          className={
                            material.inStock
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }
                        >
                          {material.inStock ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {material.description}
                      </p>
                      <div className="flex items-center text-xs text-gray-500">
                        <span>Used {material.usageCount} times</span>
                        {material.lastUsed && (
                          <>
                            <span className="mx-2">•</span>
                            <span>Last used {material.lastUsed}</span>
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
                          material.inStock
                            ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                            : "text-green-600 hover:text-green-700 hover:bg-green-50"
                        }
                      >
                        {material.inStock
                          ? "Mark Out of Stock"
                          : "Mark In Stock"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Material Dialog */}
      <AddMaterialDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddMaterial}
        availableGroups={materialGroups.slice(1)} // Remove "All Groups"
      />
    </div>
  );
}
