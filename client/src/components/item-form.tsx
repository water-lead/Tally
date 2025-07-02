import { useState, useEffect } from "react";
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
  barcode: z.string().optional(),
});

type ItemFormData = z.infer<typeof itemFormSchema>;

interface PrefilledData {
  name?: string;
  category?: string;
  description?: string;
  value?: number;
  barcode?: string;
}

interface ItemFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  prefilledData?: PrefilledData | null;
}

export function ItemForm({ onSuccess, onCancel, prefilledData }: ItemFormProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Find matching category ID from prefilled data
  const getMatchingCategoryId = (categoryName?: string) => {
    if (!categoryName || !categories.length) return "";
    const matchingCategory = categories.find(cat => 
      cat.name.toLowerCase() === categoryName.toLowerCase()
    );
    return matchingCategory?.id.toString() || "";
  };

  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemFormSchema),
    defaultValues: {
      name: prefilledData?.name || "",
      description: prefilledData?.description || "",
      categoryId: getMatchingCategoryId(prefilledData?.category),
      location: "",
      purchasePrice: "",
      currentValue: prefilledData?.value ? prefilledData.value.toString() : "",
      purchaseDate: "",
      expiryDate: "",
      warrantyExpiry: "",
      barcode: prefilledData?.barcode || "",
    },
  });

  // Update form when prefilled data changes
  useEffect(() => {
    if (prefilledData) {
      form.reset({
        name: prefilledData.name || "",
        description: prefilledData.description || "",
        categoryId: getMatchingCategoryId(prefilledData.category),
        location: "",
        purchasePrice: "",
        currentValue: prefilledData.value ? prefilledData.value.toString() : "",
        purchaseDate: "",
        expiryDate: "",
        warrantyExpiry: "",
        barcode: prefilledData.barcode || "",
      });
    }
  }, [prefilledData, categories, form]);

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
          <Select 
            onValueChange={(value) => form.setValue("categoryId", value)} 
            value={form.watch("categoryId")}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Choose category..." />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id.toString()}>
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: category.color }}
                    />
                    <span>{category.name}</span>
                  </div>
                </SelectItem>
              ))}
              {categories.length === 0 && (
                <SelectItem value="loading" disabled>
                  Loading categories...
                </SelectItem>
              )}
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
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="purchasePrice"
                {...form.register("purchasePrice")}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                className="pl-8"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="currentValue">Current Value / Estimated Worth</Label>
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="currentValue"
                {...form.register("currentValue")}
                placeholder="0.00"
                type="number"
                step="0.01"
                min="0"
                className="pl-8"
              />
            </div>
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

        {/* Barcode field */}
        {prefilledData?.barcode && (
          <div>
            <Label htmlFor="barcode">Barcode</Label>
            <Input
              id="barcode"
              {...form.register("barcode")}
              placeholder="Product barcode"
              className="mt-1"
              readOnly
            />
          </div>
        )}

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
          className="flex-1 tally-primary text-lg font-semibold py-3"
          disabled={createItemMutation.isPending}
        >
          {createItemMutation.isPending ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Saving Item...
            </>
          ) : (
            "💾 Save Entry"
          )}
        </Button>
      </div>
    </form>
  );
}
