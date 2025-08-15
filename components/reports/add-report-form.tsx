"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"

interface PestFinding {
  id: string
  type: "captured" | "sighted" | "evidence"
  target: string
  notes: string
  location: string
}

export function AddReportForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    unit: "",
    description: "",
    materials: [] as string[],
    comments: "",
    status: "draft" as "draft" | "completed",
  })

  const [pestFindings, setPestFindings] = useState<PestFinding[]>([])
  const [newPestFinding, setNewPestFinding] = useState<Omit<PestFinding, "id">>({
    type: "sighted",
    target: "",
    notes: "",
    location: "",
  })

  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([])
  const [newMaterial, setNewMaterial] = useState("")

  const availableMaterials = [
    "Bait Stations",
    "Gel Bait",
    "Spray Treatment",
    "Dust Treatment",
    "Traps",
    "Monitoring Devices",
    "Exclusion Materials",
    "Sanitizer",
  ]

  const pestTypes = ["Ants", "Cockroaches", "Rodents", "Flies", "Spiders", "Beetles", "Moths", "Wasps", "Other"]

  const addMaterial = (material: string) => {
    if (material && !selectedMaterials.includes(material)) {
      setSelectedMaterials([...selectedMaterials, material])
    }
  }

  const removeMaterial = (material: string) => {
    setSelectedMaterials(selectedMaterials.filter((m) => m !== material))
  }

  const addPestFinding = () => {
    if (newPestFinding.target && newPestFinding.location) {
      const finding: PestFinding = {
        ...newPestFinding,
        id: Date.now().toString(),
      }
      setPestFindings([...pestFindings, finding])
      setNewPestFinding({
        type: "sighted",
        target: "",
        notes: "",
        location: "",
      })
    }
  }

  const removePestFinding = (id: string) => {
    setPestFindings(pestFindings.filter((f) => f.id !== id))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Here you would typically save to a database
    console.log("Report Data:", { ...formData, materials: selectedMaterials, pestFindings })
    router.push("/reports")
  }

  const getPestTypeColor = (type: string) => {
    switch (type) {
      case "captured":
        return "bg-red-100 text-red-800"
      case "sighted":
        return "bg-yellow-100 text-yellow-800"
      case "evidence":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Add New Report</h1>
          <p className="text-gray-600 mt-1">Create a detailed pest control inspection report</p>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="e.g., Building A"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit/Area</Label>
              <Input
                id="unit"
                placeholder="e.g., Unit 4B, Kitchen, Basement"
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of the inspection or treatment"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
              {availableMaterials.map((material) => (
                <Button
                  key={material}
                  type="button"
                  variant={selectedMaterials.includes(material) ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    selectedMaterials.includes(material) ? removeMaterial(material) : addMaterial(material)
                  }
                  className={selectedMaterials.includes(material) ? "bg-blue-600 hover:bg-blue-700" : ""}
                >
                  {material}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom material"
                value={newMaterial}
                onChange={(e) => setNewMaterial(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addMaterial(newMaterial)
                    setNewMaterial("")
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  addMaterial(newMaterial)
                  setNewMaterial("")
                }}
              >
                Add
              </Button>
            </div>
            {selectedMaterials.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Materials:</Label>
                <div className="flex flex-wrap gap-2">
                  {selectedMaterials.map((material) => (
                    <Badge key={material} variant="secondary" className="flex items-center gap-1">
                      {material}
                      <button
                        type="button"
                        onClick={() => removeMaterial(material)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
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
                <TabsTrigger value="list">Current Findings ({pestFindings.length})</TabsTrigger>
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
                          type: e.target.value as "captured" | "sighted" | "evidence",
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
                      onChange={(e) => setNewPestFinding({ ...newPestFinding, target: e.target.value })}
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
                      onChange={(e) => setNewPestFinding({ ...newPestFinding, location: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Notes</Label>
                  <Textarea
                    placeholder="Additional details about the finding"
                    value={newPestFinding.notes}
                    onChange={(e) => setNewPestFinding({ ...newPestFinding, notes: e.target.value })}
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
                  <p className="text-gray-500 text-center py-4">No pest findings added yet</p>
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
                              {finding.type.charAt(0).toUpperCase() + finding.type.slice(1)}
                            </Badge>
                            <span className="font-medium">{finding.target}</span>
                            <span className="text-sm text-gray-500">at {finding.location}</span>
                          </div>
                          {finding.notes && <p className="text-sm text-gray-600">{finding.notes}</p>}
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

        {/* Comments */}
        <Card>
          <CardHeader>
            <CardTitle>Additional Comments</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any additional observations, recommendations, or follow-up actions needed"
              value={formData.comments}
              onChange={(e) => setFormData({ ...formData, comments: e.target.value })}
              rows={4}
            />
          </CardContent>
        </Card>

        {/* Submit Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData({ ...formData, status: "draft" })
              handleSubmit(new Event("submit") as any)
            }}
          >
            Save as Draft
          </Button>
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600"
            onClick={() => setFormData({ ...formData, status: "completed" })}
          >
            Complete Report
          </Button>
        </div>
      </form>
    </div>
  )
}
