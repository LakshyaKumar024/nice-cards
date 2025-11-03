"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Edit, Save, X } from "lucide-react"

interface TemplatePricing {
  id: string
  name: string
  category: string
  price: number
  discount?: number
  status: "active" | "inactive"
  lastUpdated: string
}

const mockTemplates: TemplatePricing[] = [
  { id: "1", name: "Blog Starter", category: "Blog", price: 29, status: "active", lastUpdated: "2024-01-15" },
  { id: "2", name: "Portfolio Pro", category: "Portfolio", price: 49, status: "active", lastUpdated: "2024-01-10" },
  {
    id: "3",
    name: "SaaS Landings",
    category: "SaaS",
    price: 79,
    discount: 10,
    status: "active",
    lastUpdated: "2024-01-08",
  },
  { id: "4", name: "Ecommerce Store", category: "Ecommerce", price: 99, status: "inactive", lastUpdated: "2024-01-05" },
]

export function PricingManager() {
  const [templates, setTemplates] = useState<TemplatePricing[]>(mockTemplates)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState<{ price: number; discount?: number }>({
    price: 0,
  })
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const startEdit = (template: TemplatePricing) => {
    setEditingId(template.id)
    setEditValues({ price: template.price, discount: template.discount || 0 })
  }

  const saveEdit = (id: string) => {
    setTemplates(
      templates.map((t) =>
        t.id === id
          ? {
              ...t,
              price: editValues.price,
              discount: editValues.discount,
              lastUpdated: new Date().toISOString().split("T")[0],
            }
          : t,
      ),
    )
    setEditingId(null)
  }

  const cancelEdit = () => {
    setEditingId(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-foreground">Template Pricing</h3>
        <p className="text-sm text-muted-foreground">Set and manage prices for individual templates</p>
      </div>

      {/* Search Bar */}
      <div>
        <Input
          placeholder="Search templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-input border-border text-foreground placeholder:text-muted-foreground"
        />
      </div>

      {/* Pricing Table */}
      <Card className="bg-card border-border overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Template Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Discount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Final Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="border-b border-border hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <span className="font-medium text-card-foreground">{template.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{template.category}</span>
                    </td>

                    <td className="px-6 py-4">
                      {editingId === template.id ? (
                        <Input
                          type="number"
                          value={editValues.price}
                          onChange={(e) => setEditValues({ ...editValues, price: Number.parseFloat(e.target.value) })}
                          className="w-24 bg-input border-border text-foreground h-8"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">${template.price}</span>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      {editingId === template.id ? (
                        <Input
                          type="number"
                          min="0"
                          max="100"
                          value={editValues.discount || 0}
                          onChange={(e) =>
                            setEditValues({ ...editValues, discount: Number.parseFloat(e.target.value) })
                          }
                          className="w-20 bg-input border-border text-foreground h-8"
                          placeholder="%"
                        />
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {template.discount ? `${template.discount}%` : "-"}
                        </span>
                      )}
                    </td>

                    {/* Calculate final price */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-foreground">
                        $
                        {editingId === template.id
                          ? (editValues.price - (editValues.price * (editValues.discount || 0)) / 100).toFixed(2)
                          : (template.price - (template.price * (template.discount || 0)) / 100).toFixed(2)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <Badge variant={template.status === "active" ? "default" : "secondary"}>{template.status}</Badge>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {editingId === template.id ? (
                          <>
                            <Button
                              size="sm"
                              className="bg-primary text-primary-foreground hover:bg-primary/90 h-8"
                              onClick={() => saveEdit(template.id)}
                            >
                              <Save className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-border text-muted-foreground hover:bg-muted/20 h-8 bg-transparent"
                              onClick={cancelEdit}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:bg-primary/10"
                            onClick={() => startEdit(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Average Price</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              ${(templates.reduce((sum, t) => sum + t.price, 0) / templates.length).toFixed(2)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Active Templates</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">
              {templates.filter((t) => t.status === "active").length}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">With Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-foreground">{templates.filter((t) => t.discount).length}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
