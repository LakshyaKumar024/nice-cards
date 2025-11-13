"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, DollarSign } from "lucide-react"

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
    icon: DollarSign,
    color: "text-purple-500",
  },
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
