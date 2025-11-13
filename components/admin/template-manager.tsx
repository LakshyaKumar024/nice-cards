"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus } from "lucide-react";
import Link from "next/link";
import { TemplateManagerDialogbox } from "./template-manager-dialogbox";
import { toast } from "sonner";

interface Template {
  uuid: string;
  name: string;
  catogery: string;
  status: boolean;
  paid: boolean;
  price: number;
  _count: { savedTemplates: number };
  createdAt: string;
  description?: string;
}

// const mockTemplates: Template[] = [
//   {
//     id: "1",
//     name: "Blog Starter",
//     category: "Blog",
//     status: "active",
//     price: 29,
//     uses: 324,
//     createdDate: "2024-01-15",
//     description: "A clean starter for blogs.",
//   },
//   {
//     id: "2",
//     name: "Portfolio Pro",
//     category: "Portfolio",
//     status: "active",
//     price: 49,
//     uses: 287,
//     createdDate: "2024-01-10",
//     description: "Perfect for personal portfolios.",
//   },
//   {
//     id: "3",
//     name: "SaaS Landings",
//     category: "SaaS",
//     status: "active",
//     price: 79,
//     uses: 256,
//     createdDate: "2024-01-08",
//     description: "Landing pages for SaaS startups.",
//   },
//   {
//     id: "4",
//     name: "Ecommerce Store",
//     category: "Ecommerce",
//     status: "inactive",
//     price: 99,
//     uses: 189,
//     createdDate: "2024-01-05",
//     description: "Modern e-commerce storefront.",
//   },
// ];

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Dialog states
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fetchTemplates = async () => {
      const response = await fetch("/api/dashboard/stats/templates");
      const data = await response.json();
      setTemplates(data);
      console.log(data);
    };
    fetchTemplates();
  }, []);

  const handleEdit = (template: Template) => {
    setSelectedTemplate(template);
    setOpen(true);
  };

  const handleSave = (updatedTemplate: Template) => {
    console.log("handleSave", updatedTemplate);
    setTemplates((prev) =>
      prev.map((t) => (t.uuid === updatedTemplate.uuid ? updatedTemplate : t))
    );
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeTemplate = async (id: string) => {
    const deletingToaster = toast.loading("deleting...");

    const removeRequest = await fetch(`/api/dashboard/design/${id}/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!removeRequest.ok) {
      toast.error("Error deleting template", {
        id: deletingToaster,
        description: "Failed to delete template",
        duration: 5000,
      });
      throw new Error("Failed to delete template");
    }

    toast.success("template deleted successfully", { id: deletingToaster });
    setTemplates(templates.filter((t) => t.uuid !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Templates</h3>
          <p className="text-sm text-muted-foreground">
            Manage all templates and their settings
          </p>
        </div>
        <Link href="/dashboard/create">
          <Button className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="w-4 h-4" />
            Add Template
          </Button>
        </Link>
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
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Name
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Uses
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-card-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredTemplates.map((template) => (
                  <tr
                    key={template.uuid}
                    className="border-b border-border hover:bg-muted/20 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-medium text-card-foreground">
                        {template.name}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {template.catogery.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-foreground">
                        ₹ {template.price}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          template.status === true ? "default" : "secondary"
                        }
                      >
                        {template.status === true ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {template._count.savedTemplates}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-muted-foreground">
                        {template.createdAt.split("T")[0]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Action buttons */}
                      <div className="flex items-center gap-1">
                        {/* Edit Button */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-primary hover:bg-primary/10"
                          title="Edit template"
                          onClick={() => handleEdit(template)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>

                        {/* Trash Button (moved closer) */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:bg-destructive/10"
                          onClick={() => removeTemplate(template.uuid)}
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

      {/* Dialog Box */}
      <TemplateManagerDialogbox
        open={open}
        setOpen={setOpen}
        template={selectedTemplate}
        onSave={handleSave}
      />
    </div>
  );
}
