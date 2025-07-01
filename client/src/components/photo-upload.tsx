import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, X } from "lucide-react";

interface PhotoUploadProps {
  onFileSelect: (file: File | null) => void;
  selectedFile: File | null;
}

export function PhotoUpload({ onFileSelect, selectedFile }: PhotoUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const handleFileSelect = (file: File | null) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      onFileSelect(file);
    } else {
      setPreview(null);
      onFileSelect(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    handleFileSelect(file);
  };

  const removePhoto = () => {
    handleFileSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="mt-1">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleInputChange}
        className="hidden"
        id="photo-upload"
      />

      {preview ? (
        <div className="relative">
          <img 
            src={preview} 
            alt="Preview" 
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <Button
            type="button"
            variant="destructive"
            size="icon"
            onClick={removePhoto}
            className="absolute top-2 right-2 w-8 h-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Camera className="w-8 h-8 text-muted-foreground mx-auto mb-4" />
          <p className="text-sm text-muted-foreground mb-4">
            Add a photo of your item
          </p>
          <div className="space-y-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Choose Photo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
