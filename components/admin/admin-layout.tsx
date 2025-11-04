"use client"

import type React from "react"
import { LayoutGrid, Users, FileText, DollarSign, LogOut, Settings, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { useState } from "react"
import { Button } from "@/components/ui/button"

interface AdminLayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
}

const navItems = [
  { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "users", label: "Users & Analytics", icon: Users },
  { id: "pricing", label: "Pricing", icon: DollarSign },
]

export function AdminLayout({ activeTab, onTabChange, children }: AdminLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleNavClick = (tabId: string) => {
    onTabChange(tabId)
    setMobileMenuOpen(false)
  }

  return (
    <div className="flex h-screen bg-background flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:w-64 border-r border-border bg-sidebar flex-col">
        <div className="p-6 border-b border-sidebar-border">
          <h1 className="text-xl font-bold text-sidebar-foreground">Admin Panel</h1>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left",
                  activeTab === item.id
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                )}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </nav>

        <div className="p-4 space-y-2 border-t border-sidebar-border">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left">
            <Settings className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left">
            <LogOut className="w-5 h-5 flex-shrink-0" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile/Tablet Header */}
        <div className="lg:hidden border-b border-border bg-card px-4 py-3 flex items-center justify-between">
          <h1 className="font-bold text-base sm:text-lg">Admin Panel</h1>
          <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden">
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Navigation Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-sidebar border-b border-border">
            <nav className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-left text-sm sm:text-base",
                      activeTab === item.id
                        ? "bg-sidebar-primary text-sidebar-primary-foreground"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
            <div className="p-4 space-y-2 border-t border-sidebar-border">
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left text-sm">
                <Settings className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Settings</span>
              </button>
              <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sidebar-foreground hover:bg-sidebar-accent transition-colors text-left text-sm">
                <LogOut className="w-5 h-5 flex-shrink-0" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Desktop Header */}
        <div className="hidden lg:flex border-b border-border bg-card px-8 py-4 justify-between items-center">
          <h2 className="text-2xl font-bold text-card-foreground">
            {navItems.find((item) => item.id === activeTab)?.label}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">Admin User</span>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-sm font-bold text-primary">A</span>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Header Title */}
        <div className="lg:hidden border-b border-border bg-card px-4 py-3 flex justify-between items-center">
          <h2 className="text-lg sm:text-xl font-bold text-card-foreground">
            {navItems.find((item) => item.id === activeTab)?.label}
          </h2>
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs sm:text-sm font-bold text-primary">A</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </div>
    </div>
  )
}
