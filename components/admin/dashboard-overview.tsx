"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clerkClient } from "@clerk/nextjs/server";
import { Users, FileText, TrendingUp, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

export function DashboardOverview() {
  const [dashboardStats, setDashboardStats] = useState([
    {
      title: "Total Members",
      value: "0",
      description: "+0",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Templates",
      value: "0",
      description: "0",
      icon: FileText,
      color: "text-orange-500",
    },
    {
      title: "Total Sign-ins",
      value: "0",
      description: "0",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Revenue",
      value: "0",
      description: "+15% from last month",
      icon: DollarSign,
      color: "text-purple-500",
    },
  ]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const response = await fetch("/api/dashboard/stats/dash");
      const data = await response.json();
setDashboardStats([
  {
      title: "Total Members",
      value: data.totalMembers,
      description: "+ new members",
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Total Templates",
      value: data.totalTemplates,
      description: "Active templates",
      icon: FileText,
      color: "text-orange-500",
    },
    {
      title: "Total Sign-ins",
      value: data.newUsers,
      description: "In last 30 days",
      icon: TrendingUp,
      color: "text-green-500",
    },
    {
      title: "Revenue",
      value: `₹ ${data.totlaRevenue}`,
      description: "+% from last month",
      icon: DollarSign,
      color: "text-purple-500",
    },
    ])      

    };
    fetchDashboardStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
        {dashboardStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="bg-card border-border">
              <CardHeader className="pb-2 sm:pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xs sm:text-sm font-medium text-card-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`w-4 sm:w-5 h-4 sm:h-5 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-xl sm:text-2xl font-bold text-card-foreground">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground mt-1 sm:mt-2">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6"></div>
    </div>
  );
}
