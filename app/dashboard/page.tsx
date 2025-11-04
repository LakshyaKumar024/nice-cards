"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { TemplateManager } from "@/components/admin/template-manager"
import { UserAnalytics } from "@/components/admin/user-analytics"
import { PricingManager } from "@/components/admin/pricing-manager"

export default function Page() {
  const [activeTab, setActiveTab] = useState("dashboard")

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardOverview />
      case "templates":
        return <TemplateManager />
      case "users":
        return <UserAnalytics />
      case "pricing":
        return <PricingManager />
      default:
        return <DashboardOverview />
    }
  }

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </AdminLayout>
  )
}
