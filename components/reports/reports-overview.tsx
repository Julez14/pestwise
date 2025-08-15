"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

const mockReports = [
  {
    id: 1,
    title: "Kitchen Inspection - Unit 4B",
    description: "Routine pest inspection in kitchen area",
    location: "Building A, Unit 4B",
    author: "John Doe",
    updatedAt: "2024-01-20",
    status: "completed",
    pestFindings: 2,
  },
  {
    id: 2,
    title: "Basement Treatment - Building C",
    description: "Follow-up treatment for rodent activity",
    location: "Building C, Basement",
    author: "Sarah Johnson",
    updatedAt: "2024-01-19",
    status: "in-progress",
    pestFindings: 1,
  },
  {
    id: 3,
    title: "Quarterly Inspection - Cafeteria",
    description: "Scheduled quarterly pest control inspection",
    location: "Main Building, Cafeteria",
    author: "Mike Chen",
    updatedAt: "2024-01-18",
    status: "draft",
    pestFindings: 0,
  },
  {
    id: 4,
    title: "Emergency Response - Unit 2A",
    description: "Emergency pest control response call",
    location: "Building B, Unit 2A",
    author: "Emily Davis",
    updatedAt: "2024-01-17",
    status: "completed",
    pestFindings: 3,
  },
  {
    id: 5,
    title: "Preventive Treatment - Storage",
    description: "Preventive pest control treatment",
    location: "Storage Building",
    author: "John Doe",
    updatedAt: "2024-01-16",
    status: "in-progress",
    pestFindings: 1,
  },
]

export function ReportsOverview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const router = useRouter()

  const filteredReports = mockReports.filter((report) => {
    const matchesSearch =
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "all" || report.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "draft":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "draft":
        return "Draft"
      default:
        return status
    }
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Report Management</h1>
          <p className="text-gray-600 mt-1">Manage and track all your reports in one place</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push("/reports/add")}>
          Add Report
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">5</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
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
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">1</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
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
                <p className="text-sm text-gray-600">Reports</p>
                <p className="text-2xl font-bold text-gray-900">0</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
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
            placeholder="Search reports..."
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
          <option value="draft">Draft</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Reports ({filteredReports.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{report.description}</p>
                      <div className="flex items-center mt-2 text-xs text-gray-500">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                        <span>{report.location}</span>
                        <span className="mx-2">•</span>
                        <span>{report.author}</span>
                        <span className="mx-2">•</span>
                        <span>Updated {report.updatedAt}</span>
                        {report.pestFindings > 0 && (
                          <>
                            <span className="mx-2">•</span>
                            <span className="text-red-600 font-medium">
                              {report.pestFindings} pest finding{report.pestFindings > 1 ? "s" : ""}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <Badge className={getStatusColor(report.status)}>{getStatusLabel(report.status)}</Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
