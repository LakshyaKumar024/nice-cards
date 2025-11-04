"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, TrendingUp, DollarSign } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

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
    value: "$24,590",
    description: "+15% from last month",
    icon: DollarSign,
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Sign-in Activity Chart */}
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-card-foreground">Sign-in Activity</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Weekly sign-in trends</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={signInData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="date" stroke="#999" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#999" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="signIns"
                    stroke="hsl(var(--color-primary))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--color-primary))", r: 3 }}
                    isAnimationActive={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="newUsers"
                    stroke="hsl(var(--color-accent))"
                    strokeWidth={2}
                    dot={{ fill: "hsl(var(--color-accent))", r: 3 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Template Usage */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3 sm:pb-4">
            <CardTitle className="text-base sm:text-lg text-card-foreground">Template Usage</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Most used templates</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-64 sm:h-72 lg:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={templateUsageData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                  <XAxis dataKey="name" stroke="#999" angle={-45} height={60} tick={{ fontSize: 12 }} />
                  <YAxis stroke="#999" tick={{ fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #333" }}
                    labelStyle={{ color: "#fff" }}
                    wrapperStyle={{ outline: "none" }}
                  />
                  <Bar
                    dataKey="usage"
                    fill="hsl(var(--color-secondary))"
                    radius={[8, 8, 0, 0]}
                    isAnimationActive={false}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
