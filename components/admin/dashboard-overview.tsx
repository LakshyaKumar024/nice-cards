"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, DollarSign, IndianRupee } from "lucide-react"


const dashboardStats = [
  {
    title: "Total Members",
    value: "2,543",
    description: "+320 this month",
    icon: Users,
    color: "text-blue-500",
  },
  {
    title: "Total Templates",
    value: "127",
    description: "+12 this week",
    icon: FileText,
    color: "text-orange-500",
  },
  {
    title: "Total Sign-ins",
    value: "15,843",
    description: "+2,450 this week",
    icon: TrendingUp,
    color: "text-green-500",
  },
  {
    title: "Revenue",
    value: "₹24,590",
    description: "+15% from last month",
    icon: IndianRupee,
    color: "text-purple-500",
  },
]

const signInData = [
  { date: "Mon", signIns: 400, newUsers: 120 },
  { date: "Tue", signIns: 520, newUsers: 180 },
  { date: "Wed", signIns: 380, newUsers: 90 },
  { date: "Thu", signIns: 650, newUsers: 240 },
  { date: "Fri", signIns: 890, newUsers: 380 },
  { date: "Sat", signIns: 720, newUsers: 290 },
  { date: "Sun", signIns: 580, newUsers: 160 },
]

const templateUsageData = [
  { name: "Blog", usage: 324 },
  { name: "Portfolio", usage: 287 },
  { name: "Landing", usage: 412 },
  { name: "SaaS", usage: 256 },
  { name: "Ecommerce", usage: 189 },
]

export function DashboardOverview() {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">{stat.title}</CardTitle>
                  <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">{stat.description}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
      </div>
    </div>
  )
}
