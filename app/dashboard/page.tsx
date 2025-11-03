"use client"

import { useState } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { DashboardOverview } from "@/components/admin/dashboard-overview"
import { TemplateManager } from "@/components/admin/template-manager"
import { UserAnalytics } from "@/components/admin/user-analytics"
import { PricingManager } from "@/components/admin/pricing-manager"

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("dashboard")

  return (
    <AdminLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === "dashboard" && <DashboardOverview />}
      {activeTab === "templates" && <TemplateManager />}
      {activeTab === "users" && <UserAnalytics />}
      {activeTab === "pricing" && <PricingManager />}
    </AdminLayout>
  )
}