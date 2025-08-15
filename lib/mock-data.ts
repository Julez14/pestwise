// Mock data that matches the database schema
// This can be used for development and testing

import type { User, Location, Material, Report, Comment, PestFinding } from "./database"

export const mockUsers: User[] = [
  {
    id: 1,
    email: "john.doe@pestcontrol.com",
    name: "John Doe",
    role: "technician",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 2,
    email: "sarah.johnson@pestcontrol.com",
    name: "Sarah Johnson",
    role: "supervisor",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 3,
    email: "mike.chen@pestcontrol.com",
    name: "Mike Chen",
    role: "technician",
    created_at: "2024-01-01T00:00:00Z",
  },
  {
    id: 4,
    email: "emily.davis@pestcontrol.com",
    name: "Emily Davis",
    role: "manager",
    created_at: "2024-01-01T00:00:00Z",
  },
]

export const mockLocations: Location[] = [
  {
    id: 1,
    name: "Riverside Apartments",
    address: "123 River Street, Downtown",
    unit: "Building A",
    status: "active",
    last_inspection: "2024-01-20",
    areas: ["Kitchen", "Bathroom", "Living Room", "Bedroom", "Balcony", "Storage"],
    total_reports: 8,
    active_issues: 1,
  },
  {
    id: 2,
    name: "Metro Office Complex",
    address: "456 Business Ave, Financial District",
    unit: "Floor 12",
    status: "active",
    last_inspection: "2024-01-18",
    areas: ["Reception", "Conference Room", "Kitchen", "Restrooms", "Storage Room", "Server Room"],
    total_reports: 12,
    active_issues: 0,
  },
]

export const mockMaterials: Material[] = [
  {
    id: 1,
    name: "Gel Bait - Cockroach",
    description: "Professional grade gel bait for cockroach control",
    material_group: "Baits",
    in_stock: true,
    usage_count: 15,
    last_used: "2024-01-20",
  },
  {
    id: 2,
    name: "Rodent Bait Stations",
    description: "Tamper-resistant bait stations for rodent control",
    material_group: "Bait Stations",
    in_stock: true,
    usage_count: 8,
    last_used: "2024-01-19",
  },
]

export const mockPestFindings: PestFinding[] = [
  {
    id: 1,
    report_id: 1,
    finding_type: "sighted",
    target_pest: "Ants",
    location_detail: "Under kitchen sink",
    notes: "Small trail observed near water source",
    created_at: "2024-01-20T10:30:00Z",
  },
  {
    id: 2,
    report_id: 1,
    finding_type: "evidence",
    target_pest: "Cockroaches",
    location_detail: "Behind refrigerator",
    notes: "Droppings found during inspection",
    created_at: "2024-01-20T10:35:00Z",
  },
]

export const mockReports: Report[] = [
  {
    id: 1,
    title: "Kitchen Inspection - Unit 4B",
    description: "Routine pest inspection in kitchen area",
    location_id: 1,
    unit: "Unit 4B",
    author_id: 1,
    status: "completed",
    comments: "All areas checked, minor ant activity detected",
    created_at: "2024-01-20T10:00:00Z",
    updated_at: "2024-01-20T11:00:00Z",
    pest_findings: mockPestFindings.filter((pf) => pf.report_id === 1),
    materials_used: [1, 5],
  },
]

export const mockComments: Comment[] = [
  {
    id: 1,
    content:
      "Found evidence of rodent activity in the basement storage area. Recommend immediate treatment and sealing of entry points near the foundation.",
    author_id: 1,
    category: "Observation",
    priority: "high",
    location_detail: "Building A - Basement",
    report_id: 1,
    created_at: "2024-01-20T10:30:00Z",
  },
]
