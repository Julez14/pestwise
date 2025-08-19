"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { AddLocationDialog } from "./add-location-dialog";
import { supabase } from "@/lib/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

interface Location {
  id: number;
  name: string;
  address: string;
  unit: string | null;
  status: string;
  last_inspection: string | null;
  area_count: number;
  total_reports: number;
  reports_with_findings: number;
}

interface LocationArea {
  id: number;
  location_id: number;
  area_name: string;
}

export function LocationsOverview() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [expandedLocations, setExpandedLocations] = useState<Set<number>>(
    new Set()
  );

  const {
    data: locations = [],
    isLoading: isLoadingLocations,
    error: locationsError,
    refetch: refetchLocations,
  } = useQuery<Location[]>({
    queryKey: ["locations", "summary"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_summary")
        .select("*")
        .order("name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const {
    data: locationAreas = [],
    isLoading: isLoadingAreas,
    error: areasError,
    refetch: refetchAreas,
  } = useQuery<LocationArea[]>({
    queryKey: ["locations", "areas"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("location_areas")
        .select("*")
        .order("area_name", { ascending: true });
      if (error) throw error;
      return data || [];
    },
  });

  const filteredLocations = locations.filter((location) => {
    const matchesSearch =
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (location.unit &&
        location.unit.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus =
      statusFilter === "all" || location.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const activeCount = locations.filter((l) => l.status === "active").length;
  const scheduledCount = locations.filter(
    (l) => l.status === "scheduled"
  ).length;
  const totalIssues = locations.reduce(
    (sum, l) => sum + l.reports_with_findings,
    0
  );

  // Helper function to get areas for a location
  const getLocationAreas = (locationId: number) => {
    return locationAreas
      .filter((area) => area.location_id === locationId)
      .map((area) => area.area_name);
  };

  type DialogLocation = {
    name: string;
    address: string;
    unit?: string;
    areas: string[];
    lastInspection?: string;
    status: "active" | "inactive" | "scheduled";
  };

  const handleAddLocation = async (dialogLocation: DialogLocation) => {
    try {
      const { data: insertedLocation, error: insertLocationError } =
        await supabase
          .from("locations")
          .insert([
            {
              name: dialogLocation.name,
              address: dialogLocation.address,
              unit: dialogLocation.unit || null,
              status: dialogLocation.status,
              last_inspection: dialogLocation.lastInspection || null,
            },
          ])
          .select()
          .single();

      if (insertLocationError) throw insertLocationError;

      if (insertedLocation && dialogLocation.areas.length > 0) {
        const areasToInsert = dialogLocation.areas.map((areaName) => ({
          location_id: insertedLocation.id,
          area_name: areaName,
        }));
        const { error: insertAreasError } = await supabase
          .from("location_areas")
          .insert(areasToInsert);
        if (insertAreasError) throw insertAreasError;
      }

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["locations", "summary"] }),
        queryClient.invalidateQueries({ queryKey: ["locations", "areas"] }),
      ]);
    } catch (err) {
      console.error("Error adding location:", err);
    }
  };

  const toggleLocationExpansion = (locationId: number) => {
    const newExpanded = new Set(expandedLocations);
    if (newExpanded.has(locationId)) {
      newExpanded.delete(locationId);
    } else {
      newExpanded.add(locationId);
    }
    setExpandedLocations(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "scheduled":
        return "bg-blue-100 text-blue-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Active";
      case "scheduled":
        return "Scheduled";
      case "inactive":
        return "Inactive";
      default:
        return status;
    }
  };

  if (isLoadingLocations || isLoadingAreas) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading locations...</p>
          </div>
        </div>
      </div>
    );
  }

  if (locationsError || areasError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <p className="text-red-600 mb-4">Failed to load locations</p>
            <Button
              onClick={() => {
                refetchLocations();
                refetchAreas();
              }}
              variant="outline"
            >
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
            Locations Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage service locations and their specific areas
          </p>
        </div>
        <Button
          className="bg-orange-500 hover:bg-orange-600 text-white"
          onClick={() => setIsAddDialogOpen(true)}
        >
          Add New Location
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Locations</p>
                <p className="text-2xl font-bold text-gray-900">
                  {activeCount}
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
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
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
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-gray-900">
                  {scheduledCount}
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
                    d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h8m-8 0H6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-2-2h-2"
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
                <p className="text-sm text-gray-600">Active Issues</p>
                <p className="text-2xl font-bold text-gray-900">
                  {totalIssues}
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
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search locations..."
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
          <option value="active">Active</option>
          <option value="scheduled">Scheduled</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Locations List */}
      <Card>
        <CardHeader>
          <CardTitle>Locations ({filteredLocations.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredLocations.map((location) => (
              <Collapsible key={location.id}>
                <div className="border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <CollapsibleTrigger
                    className="w-full p-4 text-left"
                    onClick={() => toggleLocationExpansion(location.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-gray-900">
                            {location.name}
                          </h3>
                          <Badge className={getStatusColor(location.status)}>
                            {getStatusLabel(location.status)}
                          </Badge>
                          {location.reports_with_findings > 0 && (
                            <Badge className="bg-red-100 text-red-800">
                              {location.reports_with_findings} finding
                              {location.reports_with_findings > 1 ? "s" : ""}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center text-sm text-gray-600 mb-2">
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
                          <span>{location.address}</span>
                          {location.unit && (
                            <span className="ml-2">• {location.unit}</span>
                          )}
                        </div>
                        <div className="flex items-center text-xs text-gray-500">
                          <span>{location.area_count} areas</span>
                          <span className="mx-2">•</span>
                          <span>{location.total_reports} reports</span>
                          {location.last_inspection && (
                            <>
                              <span className="mx-2">•</span>
                              <span>
                                Last inspection:{" "}
                                {new Date(
                                  location.last_inspection
                                ).toLocaleDateString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center ml-4">
                        <svg
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedLocations.has(location.id)
                              ? "rotate-180"
                              : ""
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="px-4 pb-4 border-t border-gray-100">
                      <div className="pt-4">
                        {(() => {
                          const areas = getLocationAreas(location.id);
                          return (
                            <>
                              <h4 className="text-sm font-medium text-gray-900 mb-3">
                                Areas ({areas.length})
                              </h4>
                              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                                {areas.map((area, index) => (
                                  <div
                                    key={index}
                                    className="px-3 py-2 bg-gray-50 rounded-md text-sm text-gray-700 border border-gray-200"
                                  >
                                    {area}
                                  </div>
                                ))}
                              </div>
                            </>
                          );
                        })()}
                        <div className="flex justify-end mt-4 space-x-2">
                          <Button variant="outline" size="sm">
                            View Reports
                          </Button>
                          <Button variant="outline" size="sm">
                            Schedule Inspection
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Location Dialog */}
      <AddLocationDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddLocation}
      />
    </div>
  );
}
