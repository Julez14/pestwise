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

interface Material {
  name: string;
  description: string;
  group: string;
  inStock: boolean;
}

interface AddMaterialDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (material: Material) => void;
  availableGroups: string[];
}

export function AddMaterialDialog({
  isOpen,
  onClose,
  onAdd,
  availableGroups,
}: AddMaterialDialogProps) {
  const [formData, setFormData] = useState<Material>({
    name: "",
    description: "",
    group: availableGroups[0] || "",
    inStock: true,
  });

  const [customGroup, setCustomGroup] = useState("");
  const [isCustomGroup, setIsCustomGroup] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const materialToAdd = {
      ...formData,
      group: isCustomGroup ? customGroup : formData.group,
    };

    if (materialToAdd.name && materialToAdd.group) {
      onAdd(materialToAdd);
      // Reset form
      setFormData({
        name: "",
        description: "",
        group: availableGroups[0] || "",
        inStock: true,
      });
      setCustomGroup("");
      setIsCustomGroup(false);
      onClose();
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setFormData({
      name: "",
      description: "",
      group: availableGroups[0] || "",
      inStock: true,
    });
    setCustomGroup("");
    setIsCustomGroup(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Material</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Material Name</Label>
            <Input
              id="name"
              placeholder="e.g., Gel Bait - Cockroach"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Brief description of the material and its use"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Material Group</Label>
            <div className="space-y-2">
              <select
                value={isCustomGroup ? "custom" : formData.group}
                onChange={(e) => {
                  if (e.target.value === "custom") {
                    setIsCustomGroup(true);
                  } else {
                    setIsCustomGroup(false);
                    setFormData({ ...formData, group: e.target.value });
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {availableGroups.map((group) => (
                  <option key={group} value={group}>
                    {group}
                  </option>
                ))}
                <option value="custom">+ Add New Group</option>
              </select>

              {isCustomGroup && (
                <Input
                  placeholder="Enter new group name"
                  value={customGroup}
                  onChange={(e) => setCustomGroup(e.target.value)}
                  required
                />
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="inStock"
              checked={formData.inStock}
              onChange={(e) =>
                setFormData({ ...formData, inStock: e.target.checked })
              }
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <Label htmlFor="inStock" className="text-sm">
              Currently in stock
            </Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600">
              Add Material
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
