"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

interface Template {
  id: string;
  name: string;
  category: string;
  status: "active" | "inactive";
  price: number;
  uses: number;
  createdDate: string;
  description?: string;
}

interface TemplateManagerDialogboxProps {
  open: boolean;
  setOpen: (value: boolean) => void;
  template: Template | null;
  onSave: (updatedTemplate: Template) => void;
}

export function TemplateManagerDialogbox({
  open,
  setOpen,
  template,
  onSave,
}: TemplateManagerDialogboxProps) {
  const [formData, setFormData] = useState<Template | null>(template);

  useEffect(() => {
    setFormData(template);
  }, [template]);

  const categoryOptions = [
    "WEDDING",
  "BIRTHDAY",
  "ANNIVERSARY",
  "GRADUATION",
  "BABYSHOWER",
  "FESTIVAL",
  "INVITATION",
  "CORPORATE",
  ];

  if (!formData) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edit Template</DialogTitle>
            <DialogDescription>
              Modify the template details below.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 mt-4">
            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData?.name ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category">Category</Label>
              <select
                id="category"
                value={formData?.category ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="border border-input bg-background rounded-md p-2 text-sm"
              >
                <option value="">Select category</option>
                {categoryOptions.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div className="grid gap-2">
              <Label htmlFor="price">Price (₹)</Label>
              <Input
                id="price"
                type="number"
                value={formData?.price ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={formData?.description ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
