"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface User {
  id: string
  email: string
  name: string
  signIns: number
  joinDate: string
  status: "active" | "inactive"
}

const mockUsers: User[] = [
  { id: "1", email: "john@example.com", name: "John Doe", signIns: 145, joinDate: "2024-01-01", status: "active" },
  { id: "2", email: "jane@example.com", name: "Jane Smith", signIns: 89, joinDate: "2024-01-05", status: "active" },
  { id: "3", email: "bob@example.com", name: "Bob Johnson", signIns: 34, joinDate: "2024-01-10", status: "active" },
  { id: "4", email: "alice@example.com", name: "Alice Brown", signIns: 5, joinDate: "2024-01-15", status: "inactive" },
  {
    id: "5",
    email: "charlie@example.com",
    name: "Charlie Davis",
    signIns: 203,
    joinDate: "2024-01-02",
    status: "active",
  },
]

export function UserAnalytics() {
  const [searchTerm, setSearchTerm] = useState("")

  const filteredUsers = mockUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalUsers = mockUsers.length
  const activeUsers = mockUsers.filter((u) => u.status === "active").length
  const totalSignIns = mockUsers.reduce((sum, u) => sum + u.signIns, 0)

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Total Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-card-foreground">{totalUsers}</div>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">across all regions</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Active Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-card-foreground">{activeUsers}</div>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
              {Math.round((activeUsers / totalUsers) * 100)}% of total
            </p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">Total Sign-ins</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-card-foreground">{totalSignIns}</div>
            <p className="text-xs text-muted-foreground mt-1 sm:mt-2">all time</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div>
        <Input
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground text-sm"
        />
      </div>

      {/* Users Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardHeader className="pb-3 sm:pb-4">
          <CardTitle className="text-base sm:text-lg text-card-foreground">Members List</CardTitle>
          <CardDescription className="text-xs sm:text-sm">{filteredUsers.length} members</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-max">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Sign-ins
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Join Date
                  </th>
                  <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-card-foreground whitespace-nowrap">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="font-medium text-card-foreground text-xs sm:text-sm">{user.name}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs sm:text-sm text-muted-foreground">{user.email}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs sm:text-sm font-medium text-card-foreground">{user.signIns}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <span className="text-xs sm:text-sm text-muted-foreground">{user.joinDate}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <Badge variant={user.status === "active" ? "default" : "secondary"} className="text-xs">
                        {user.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
