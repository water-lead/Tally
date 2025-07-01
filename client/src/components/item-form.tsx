import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { PhotoUpload } from "./photo-upload";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Category } from "@shared/schema";

const itemFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  location: z.string().optional(),
  purchasePrice: z.string().optional(),
  currentValue: z.string().optional(),
  purchaseDate: z.string().optional(),
  expiryDate: z.string().optional(),
  warrantyExpiry: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface ItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function ItemForm({ onSuccess, onCancel }: ItemFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: "",
      description: "",
      categoryId: "",
      location: "",
      purchasePrice: "",
      currentValue: "",
      purchaseDate: "",
      expiryDate: "",
      warrantyExpiry: "",
    },
  });

  const createItemMutation = useMutation({
    mutationFn: async (data: ItemFormData) => {
      const formData = new FormData();
      
      // Append all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value) {
          formData.append(key, value);
        }
      });

      // Append photo if selected
      if (selectedFile) {
        formData.append("photo", selectedFile);
      }

      return await apiRequest("POST", "/api/items", formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/items"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/items/stats"] });
      toast({
        title: "Success",
        description: "Item added successfully!",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to add item. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ItemFormData) => {
    createItemMutation.mutate(data);
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      {/* Photo Upload */}
      <div>
        <Label>Photo</Label>
        <PhotoUpload onFileSelect={setSelectedFile} selectedFile={selectedFile} />
      </div>

      {/* Basic Info */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Item Name *</Label>
          <Input
            id="name"
            {...form.register("name")}
            placeholder="Enter item name"
            className="mt-1"
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive mt-1">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            {...form.register("description")}
            placeholder="Enter description"
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="categoryId">Category</Label>
          <Select onValueChange={(value) => form.setValue("categoryId", value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            {...form.register("location")}
            placeholder="e.g. Kitchen, Living Room"
            className="mt-1"
          />
        </div>
      </div>

      {/* Financial Info */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="purchasePrice">Purchase Price</Label>
            <Input
              id="purchasePrice"
              {...form.register("purchasePrice")}
              placeholder="0.00"
              type="number"
              step="0.01"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="currentValue">Current Value</Label>
            <Input
              id="currentValue"
              {...form.register("currentValue")}
              placeholder="0.00"
              type="number"
              step="0.01"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="purchaseDate">Purchase Date</Label>
          <Input
            id="purchaseDate"
            {...form.register("purchaseDate")}
            type="date"
            className="mt-1"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="expiryDate">Expiry Date</Label>
            <Input
              id="expiryDate"
              {...form.register("expiryDate")}
              type="date"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="warrantyExpiry">Warranty Expiry</Label>
            <Input
              id="warrantyExpiry"
              {...form.register("warrantyExpiry")}
              type="date"
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex space-x-3 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1"
          disabled={createItemMutation.isPending}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 tally-primary"
          disabled={createItemMutation.isPending}
        >
          {createItemMutation.isPending ? "Adding..." : "Add Item"}
        </Button>
      </div>
    </form>
  );
}
