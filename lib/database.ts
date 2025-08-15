// Database connection and query utilities for the pest control management system
// This would be used with a real database connection

export interface DatabaseConfig {
  host: string
  port: number
  database: string
  username: string
  password: string
}

export interface User {
  id: number
  email: string
  name: string
  role: string
  created_at: string
}

export interface Location {
  id: number
  name: string
  address: string
  unit?: string
  status: "active" | "inactive" | "scheduled"
  last_inspection?: string
  areas: string[]
  total_reports: number
  active_issues: number
}

export interface Material {
  id: number
  name: string
  description: string
  material_group: string
  in_stock: boolean
  usage_count: number
  last_used?: string
}

export interface Report {
  id: number
  title: string
  description: string
  location_id: number
  unit?: string
  author_id: number
  status: "draft" | "in-progress" | "completed"
  comments?: string
  created_at: string
  updated_at: string
  pest_findings: PestFinding[]
  materials_used: number[]
}

export interface PestFinding {
  id: number
  report_id: number
  finding_type: "captured" | "sighted" | "evidence"
  target_pest: string
  location_detail: string
  notes?: string
  created_at: string
}

export interface Comment {
  id: number
  content: string
  author_id: number
  category: string
  priority: "low" | "medium" | "high"
  location_detail?: string
  report_id?: number
  created_at: string
}

// Example database service class (would be implemented with actual database driver)
export class DatabaseService {
  private config: DatabaseConfig

  constructor(config: DatabaseConfig) {
    this.config = config
  }

  // User operations
  async getUserByEmail(email: string): Promise<User | null> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  async createUser(userData: Omit<User, "id" | "created_at">): Promise<User> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  // Location operations
  async getLocations(): Promise<Location[]> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  async createLocation(locationData: Omit<Location, "id" | "total_reports" | "active_issues">): Promise<Location> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  // Material operations
  async getMaterials(): Promise<Material[]> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  async createMaterial(materialData: Omit<Material, "id" | "usage_count" | "last_used">): Promise<Material> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  // Report operations
  async getReports(): Promise<Report[]> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  async createReport(reportData: Omit<Report, "id" | "created_at" | "updated_at">): Promise<Report> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  // Comment operations
  async getComments(): Promise<Comment[]> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }

  async createComment(commentData: Omit<Comment, "id" | "created_at">): Promise<Comment> {
    // Implementation would use actual database query
    throw new Error("Database connection not implemented")
  }
}

// Example usage with environment variables
export function createDatabaseService(): DatabaseService {
  const config: DatabaseConfig = {
    host: process.env.DB_HOST || "localhost",
    port: Number.parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "pest_control",
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "",
  }

  return new DatabaseService(config)
}
