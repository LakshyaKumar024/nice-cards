"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Trash2, Edit, Plus, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { TemplateManagerDialogbox } from "./template-manager-dialogbox";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


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
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

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
    setIsUpdating(true);
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
      setIsUpdating(false);
      toast.dismiss(updateToast);
    }
  };

  const filteredTemplates = templates.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const removeTemplate = async (id: string) => {
    const deletingToaster = toast.loading("Deleting...");

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

    toast.success("Template deleted successfully", { id: deletingToaster });
    setTemplates((prev) => prev.filter((t) => t.uuid !== id));
  };

  // Get the template object for the delete dialog
  const getTemplateToDelete = () => {
    return templates.find((t) => t.uuid === templateToDelete);
  };

  const templateForDeletion = getTemplateToDelete();

  return (
    <>
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
                            onClick={() => setTemplateToDelete(template.uuid)}
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
      <AlertDialog
        open={!!templateToDelete}
        onOpenChange={() => setTemplateToDelete(null)}
      >
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                <AlertTriangle className="h-6 w-6 text-destructive" />
              </div>
              <AlertDialogTitle className="text-xl">Delete Template?</AlertDialogTitle>
            </div>
            <AlertDialogDescription className="text-base space-y-3">
              <p>
                This action cannot be undone. This will permanently delete the template from the server.
              </p>
              
              {templateForDeletion && (
                <div className="mt-4 rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Template Name:</span>
                    <span className="text-sm font-semibold text-foreground text-right ml-2">
                      {templateForDeletion.name}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Category:</span>
                    <span className="text-sm text-foreground">
                      {templateForDeletion.catogery}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Price:</span>
                    <span className="text-sm font-semibold text-foreground">
                      ₹ {templateForDeletion.price}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Status:</span>
                    <Badge
                      variant={templateForDeletion.status ? "default" : "secondary"}
                      className="text-xs"
                    >
                      {templateForDeletion.status ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Total Uses:</span>
                    <span className="text-sm font-semibold text-foreground">
                      {templateForDeletion._count.savedTemplates}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Created:</span>
                    <span className="text-sm text-foreground">
                      {templateForDeletion.createdAt.split("T")[0]}
                    </span>
                  </div>
                </div>
              )}
              
              {templateForDeletion && templateForDeletion._count.savedTemplates > 0 && (
                <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-500/10 p-3 border border-amber-500/20">
                  <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    <strong>Warning:</strong> This template has been used {templateForDeletion._count.savedTemplates} time{templateForDeletion._count.savedTemplates !== 1 ? 's' : ''}. 
                    Users who saved this template may be affected.
                  </p>
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setTemplateToDelete(null)}>
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (templateToDelete) {
                  await removeTemplate(templateToDelete);
                  setTemplateToDelete(null);
                }
              }}
            >
              Yes, Delete Template
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}