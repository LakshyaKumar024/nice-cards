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

export function TemplateManager() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
const [isUpdating, setIsUpdating] = useState(false);
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

  const handleSave = async (updatedTemplate: Template) => {
    setIsUpdating(true)
    console.log("handleSave", updatedTemplate);
    const updateToast = toast.loading("Updating template...");
    try {
      const updatedTemplates = await fetch(
        `/api/dashboard/design/${updatedTemplate.uuid}/edit`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedTemplate),
        }
      );
      if (!updatedTemplates.ok) {
        toast.error("Error updating template", { id: updateToast });
        throw new Error("Failed to update template");
      }
      setTemplates((prev) =>
        prev.map((t) => (t.uuid === updatedTemplate.uuid ? updatedTemplate : t))
    );
    toast.success("Template updated successfully", { id: updateToast });
  } catch (error) {
    console.error("Error updating template:", error);
    toast.error("Error updating template", { id: updateToast });
  } finally {
    setIsUpdating(false)
    toast.dismiss(updateToast);
    }
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
        isUpdating={isUpdating}
        onSave={handleSave}
      />
    </div>
  );
}
