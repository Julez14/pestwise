"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

export function DashboardOverview() {
  const router = useRouter()

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="hidden lg:block">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Manage and track all your reports in one place</p>
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

      {/* Recent Reports Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Reports</CardTitle>
          <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push("/reports/add")}>
            Add Report
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Kitchen Inspection - Unit 4B</h3>
                <p className="text-sm text-gray-600 mt-1">Routine pest inspection in kitchen area</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>John Doe</span>
                  <span className="mx-2">•</span>
                  <span>Updated 1/20/2024</span>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">Completed</span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Basement Treatment - Building C</h3>
                <p className="text-sm text-gray-600 mt-1">Follow-up treatment for rodent activity</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>Sarah Johnson</span>
                  <span className="mx-2">•</span>
                  <span>Updated 1/18/2024</span>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded-full">Draft</span>
            </div>

            <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">Quarterly Inspection - Cafeteria</h3>
                <p className="text-sm text-gray-600 mt-1">Scheduled quarterly pest control inspection</p>
                <div className="flex items-center mt-2 text-xs text-gray-500">
                  <span>Mike Chen</span>
                  <span className="mx-2">•</span>
                  <span>Updated 1/19/2024</span>
                </div>
              </div>
              <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">In Progress</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
