"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Location {
  name: string
  address: string
  unit?: string
  areas: string[]
  lastInspection?: string
  status: "active" | "inactive" | "scheduled"
}

interface AddLocationDialogProps {
  isOpen: boolean
  onClose: () => void
  onAdd: (location: Location) => void
}

const commonAreas = [
  "Kitchen",
  "Bathroom",
  "Living Room",
  "Bedroom",
  "Storage",
  "Balcony",
  "Reception",
  "Conference Room",
  "Restrooms",
  "Dining Area",
  "Prep Area",
  "Outdoor Seating",
  "Cafeteria",
  "Gymnasium",
  "Library",
  "Classrooms",
  "Loading Dock",
  "Office",
  "Break Room",
  "Server Room",
  "Pharmacy",
  "Patient Rooms",
]

export function AddLocationDialog({ isOpen, onClose, onAdd }: AddLocationDialogProps) {
  const [formData, setFormData] = useState<Location>({
    name: "",
    address: "",
    unit: "",
    areas: [],
    status: "active",
  })

  const [newArea, setNewArea] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.name && formData.address && formData.areas.length > 0) {
      const locationToAdd = {
        ...formData,
        unit: formData.unit || undefined,
      }

      onAdd(locationToAdd)

      // Reset form
      setFormData({
        name: "",
        address: "",
        unit: "",
        areas: [],
        status: "active",
      })
      setNewArea("")
      onClose()
    }
  }

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      address: "",
      unit: "",
      areas: [],
      status: "active",
    })
    setNewArea("")
    onClose()
  }

  const addArea = (area: string) => {
    if (area && !formData.areas.includes(area)) {
      setFormData({ ...formData, areas: [...formData.areas, area] })
    }
  }

  const removeArea = (area: string) => {
    setFormData({ ...formData, areas: formData.areas.filter((a) => a !== area) })
  }

  const addCustomArea = () => {
    if (newArea.trim()) {
      addArea(newArea.trim())
      setNewArea("")
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Location Name</Label>
              <Input
                id="name"
                placeholder="e.g., Riverside Apartments"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <select
                id="status"
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "scheduled" })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="active">Active</option>
                <option value="scheduled">Scheduled</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              placeholder="e.g., 123 River Street, Downtown"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="unit">Unit/Building (Optional)</Label>
            <Input
              id="unit"
              placeholder="e.g., Building A, Floor 12, Unit 4B"
              value={formData.unit}
              onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <Label>Areas</Label>

            {/* Common Areas */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Select common areas:</p>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border border-gray-200 rounded-md">
                {commonAreas.map((area) => (
                  <Button
                    key={area}
                    type="button"
                    variant={formData.areas.includes(area) ? "default" : "outline"}
                    size="sm"
                    onClick={() => (formData.areas.includes(area) ? removeArea(area) : addArea(area))}
                    className={formData.areas.includes(area) ? "bg-blue-600 hover:bg-blue-700" : ""}
                  >
                    {area}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Area Input */}
            <div className="space-y-2">
              <p className="text-sm text-gray-600">Add custom area:</p>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter custom area name"
                  value={newArea}
                  onChange={(e) => setNewArea(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addCustomArea()
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addCustomArea}>
                  Add
                </Button>
              </div>
            </div>

            {/* Selected Areas */}
            {formData.areas.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm text-gray-600">Selected areas ({formData.areas.length}):</p>
                <div className="flex flex-wrap gap-2 p-2 bg-gray-50 rounded-md max-h-24 overflow-y-auto">
                  {formData.areas.map((area) => (
                    <Badge key={area} variant="secondary" className="flex items-center gap-1">
                      {area}
                      <button
                        type="button"
                        onClick={() => removeArea(area)}
                        className="ml-1 text-gray-500 hover:text-gray-700"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.areas.length === 0 && <p className="text-sm text-red-600">Please select at least one area.</p>}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={formData.areas.length === 0}>
              Add Location
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
