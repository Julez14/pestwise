"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate authentication
    setTimeout(() => {
      setIsLoading(false)
      // Store auth state in localStorage for demo
      localStorage.setItem("isAuthenticated", "true")
      localStorage.setItem(
        "user",
        JSON.stringify({
          name: "John Doe",
          email: email,
          role: "Technician",
        }),
      )
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader className="space-y-1 pb-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">Welcome back</h2>
          <p className="text-sm text-muted-foreground">Enter your credentials to access your account</p>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="h-11"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-11 bg-orange-500 hover:bg-orange-600 text-white font-medium"
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </Button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">Demo credentials: any email/password combination</p>
        </div>
      </CardContent>
    </Card>
  )
}
