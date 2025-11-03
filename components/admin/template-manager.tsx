"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Plus, DollarSign } from "lucide-react"

interface Template {
  id: string
  name: string
  category: string
  status: "active" | "inactive"
  price: number
  uses: number
  createdDate: string
}

const mockTemplates: Template[] = [
  {
    id: "1",
    name: "Blog Starter",
    category: "Blog",
    status: "active",
    price: 29,
    uses: 324,
    createdDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Portfolio Pro",
    category: "Portfolio",
    status: "active",
    price: 49,
    uses: 287,
    createdDate: "2024-01-10",
  },
  {
    id: "3",
    name: "SaaS Landings",
    category: "SaaS",
    status: "active",
    price: 79,
    uses: 256,
    createdDate: "2024-01-08",
  },
  {
    id: "4",
    name: "Ecommerce Store",
    category: "Ecommerce",
    status: "inactive",
    price: 99,
    uses: 189,
    createdDate: "2024-01-05",
  },
]

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>(mockTemplates)
  const [searchTerm, setSearchTerm] = useState("")

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const removeTemplate = (id: string) => {
    setTemplates(templates.filter((t) => t.id !== id))
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Templates</h3>
          <p className="text-sm text-muted-foreground">Manage all templates and their settings</p>
        </div>
        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
          <Plus className="w-4 h-4" />
          Add Template
        </Button>
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

      {/* Templates Table */}
      <Card className="bg-card border-border">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-border bg-muted/30">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Price</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Uses</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">Created</th>
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
                      <span className="text-sm font-semibold text-foreground">${template.price}</span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant={template.status === "active" ? "default" : "secondary"}>{template.status}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{template.uses}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">{template.createdDate}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10"
                          title="Edit template"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-blue-500 hover:bg-blue-500/10"
                          title="Adjust price"
                        >
                          <DollarSign className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeTemplate(template.id)}
                          title="Delete template"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
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
