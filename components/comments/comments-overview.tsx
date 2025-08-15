"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddCommentDialog } from "./add-comment-dialog"

interface Comment {
  id: string
  content: string
  author: string
  createdAt: string
  updatedAt?: string
  category: string
  location?: string
  reportId?: string
  priority: "low" | "medium" | "high"
}

const mockComments: Comment[] = [
  {
    id: "1",
    content:
      "Found evidence of rodent activity in the basement storage area. Recommend immediate treatment and sealing of entry points near the foundation.",
    author: "John Doe",
    createdAt: "2024-01-20T10:30:00Z",
    category: "Observation",
    location: "Building A - Basement",
    reportId: "RPT-001",
    priority: "high",
  },
  {
    id: "2",
    content:
      "Customer reported seeing ants in kitchen area. Applied gel bait treatment around sink and baseboards. Follow-up scheduled in 2 weeks.",
    author: "Sarah Johnson",
    createdAt: "2024-01-19T14:15:00Z",
    category: "Treatment",
    location: "Unit 4B - Kitchen",
    reportId: "RPT-002",
    priority: "medium",
  },
  {
    id: "3",
    content:
      "Quarterly inspection completed. No pest activity detected. All bait stations checked and refilled as needed.",
    author: "Mike Chen",
    createdAt: "2024-01-18T09:45:00Z",
    category: "Inspection",
    location: "Main Building - Cafeteria",
    reportId: "RPT-003",
    priority: "low",
  },
  {
    id: "4",
    content:
      "Emergency response for wasp nest removal. Nest located under eaves on north side of building. Treatment successful, area secured.",
    author: "Emily Davis",
    createdAt: "2024-01-17T16:20:00Z",
    category: "Emergency",
    location: "Building C - Exterior",
    reportId: "RPT-004",
    priority: "high",
  },
  {
    id: "5",
    content:
      "Preventive treatment applied to storage areas. Checked all monitoring devices - no activity detected. Recommend continued monitoring.",
    author: "John Doe",
    createdAt: "2024-01-16T11:00:00Z",
    category: "Prevention",
    location: "Storage Building",
    reportId: "RPT-005",
    priority: "low",
  },
  {
    id: "6",
    content:
      "Customer education provided regarding proper food storage and sanitation practices to prevent future pest issues.",
    author: "Sarah Johnson",
    createdAt: "2024-01-15T13:30:00Z",
    category: "Education",
    location: "Unit 2A",
    priority: "medium",
  },
  {
    id: "7",
    content:
      "Identified potential entry points around HVAC system. Recommended sealing with exclusion materials. Work order submitted to maintenance.",
    author: "Mike Chen",
    createdAt: "2024-01-14T08:15:00Z",
    category: "Recommendation",
    location: "Building B - Roof Access",
    priority: "medium",
  },
  {
    id: "8",
    content:
      "Follow-up inspection after treatment. Significant reduction in pest activity observed. Customer satisfied with results.",
    author: "Emily Davis",
    createdAt: "2024-01-13T15:45:00Z",
    category: "Follow-up",
    location: "Unit 3C",
    reportId: "RPT-006",
    priority: "low",
  },
]

const categories = [
  "All Categories",
  "Observation",
  "Treatment",
  "Inspection",
  "Emergency",
  "Prevention",
  "Education",
  "Recommendation",
  "Follow-up",
]

const priorities = ["All Priorities", "low", "medium", "high"]

export function CommentsOverview() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedPriority, setSelectedPriority] = useState("All Priorities")
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const filteredComments = comments.filter((comment) => {
    const matchesSearch =
      comment.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
      comment.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (comment.location && comment.location.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesCategory = selectedCategory === "All Categories" || comment.category === selectedCategory
    const matchesPriority = selectedPriority === "All Priorities" || comment.priority === selectedPriority
    return matchesSearch && matchesCategory && matchesPriority
  })

  const highPriorityCount = comments.filter((c) => c.priority === "high").length
  const mediumPriorityCount = comments.filter((c) => c.priority === "medium").length
  const lowPriorityCount = comments.filter((c) => c.priority === "low").length

  const handleAddComment = (newComment: Omit<Comment, "id" | "createdAt">) => {
    const comment: Comment = {
      ...newComment,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    }
    setComments([comment, ...comments])
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Emergency":
        return "bg-red-100 text-red-800"
      case "Treatment":
        return "bg-blue-100 text-blue-800"
      case "Observation":
        return "bg-orange-100 text-orange-800"
      case "Inspection":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="hidden lg:block">
          <h1 className="text-2xl font-bold text-gray-900">Comments & Notes</h1>
          <p className="text-gray-600 mt-1">Track observations, treatments, and important notes</p>
        </div>
        <Button className="bg-orange-500 hover:bg-orange-600 text-white" onClick={() => setIsAddDialogOpen(true)}>
          Add New Comment
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Priority</p>
                <p className="text-2xl font-bold text-gray-900">{highPriorityCount}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <p className="text-sm text-gray-600">Medium Priority</p>
                <p className="text-2xl font-bold text-gray-900">{mediumPriorityCount}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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
                <p className="text-sm text-gray-600">Low Priority</p>
                <p className="text-2xl font-bold text-gray-900">{lowPriorityCount}</p>
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
            placeholder="Search comments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority === "All Priorities"
                  ? priority
                  : `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Comments List */}
      <Card>
        <CardHeader>
          <CardTitle>Comments ({filteredComments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {filteredComments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Badge className={getCategoryColor(comment.category)}>{comment.category}</Badge>
                    <Badge className={getPriorityColor(comment.priority)}>
                      {comment.priority.charAt(0).toUpperCase() + comment.priority.slice(1)}
                    </Badge>
                    {comment.reportId && (
                      <Badge variant="outline" className="text-xs">
                        {comment.reportId}
                      </Badge>
                    )}
                  </div>
                </div>

                <p className="text-gray-900 mb-3 leading-relaxed">{comment.content}</p>

                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-4">
                    <span className="font-medium">{comment.author}</span>
                    {comment.location && (
                      <>
                        <span>•</span>
                        <div className="flex items-center">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                          <span>{comment.location}</span>
                        </div>
                      </>
                    )}
                  </div>
                  <span>{formatDate(comment.createdAt)}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Add Comment Dialog */}
      <AddCommentDialog
        isOpen={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        onAdd={handleAddComment}
        availableCategories={categories.slice(1)} // Remove "All Categories"
      />
    </div>
  )
}
