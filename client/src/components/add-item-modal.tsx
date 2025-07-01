import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Barcode, QrCode, Mic, Keyboard, X } from "lucide-react";
import { ItemForm } from "./item-form";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddMethod = "photo" | "barcode" | "qr" | "voice" | "manual" | null;

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<AddMethod>(null);

  const handleMethodSelect = (method: AddMethod) => {
    setSelectedMethod(method);
  };

  const handleBack = () => {
    setSelectedMethod(null);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    onClose();
  };

  const addMethods = [
    {
      id: "photo" as const,
      label: "Photo Scan",
      icon: Camera,
      description: "Take a photo to identify items",
      primary: true,
    },
    {
      id: "barcode" as const,
      label: "Barcode",
      icon: Barcode,
      description: "Scan product barcode",
      primary: false,
    },
    {
      id: "qr" as const,
      label: "QR Code",
      icon: QrCode,
      description: "Scan QR code",
      primary: false,
    },
    {
      id: "voice" as const,
      label: "Voice",
      icon: Mic,
      description: "Speak to add items",
      primary: false,
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="mobile-container max-w-md mx-auto p-0 h-auto max-h-[90vh] overflow-hidden">
        {selectedMethod ? (
          <div className="p-6">
            <DialogHeader className="flex flex-row items-center justify-between space-y-0 mb-6">
              <DialogTitle className="text-xl">
                {selectedMethod === "manual" ? "Add Item" : "Add Item - Coming Soon"}
              </DialogTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            
            {selectedMethod === "manual" ? (
              <ItemForm onSuccess={handleClose} onCancel={handleBack} />
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  {selectedMethod === "photo" && <Camera className="w-8 h-8 text-muted-foreground" />}
                  {selectedMethod === "barcode" && <Barcode className="w-8 h-8 text-muted-foreground" />}
                  {selectedMethod === "qr" && <QrCode className="w-8 h-8 text-muted-foreground" />}
                  {selectedMethod === "voice" && <Mic className="w-8 h-8 text-muted-foreground" />}
                </div>
                <h3 className="text-lg font-semibold mb-2">Coming Soon</h3>
                <p className="text-muted-foreground mb-6">
                  This feature is currently under development. For now, please use manual entry.
                </p>
                <Button onClick={() => setSelectedMethod("manual")} className="tally-primary">
                  Use Manual Entry
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Item</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-2 gap-4">
              {addMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <Button
                    key={method.id}
                    variant="ghost"
                    onClick={() => handleMethodSelect(method.id)}
                    className={`h-auto p-4 flex-col space-y-3 ${
                      method.primary 
                        ? "tally-primary text-white hover:bg-primary/90" 
                        : "bg-muted hover:bg-accent"
                    }`}
                  >
                    <Icon className="w-6 h-6" />
                    <div className="text-center">
                      <p className="text-sm font-medium">{method.label}</p>
                    </div>
                  </Button>
                );
              })}
            </div>
            
            <div className="border-t pt-4">
              <Button
                variant="ghost"
                onClick={() => handleMethodSelect("manual")}
                className="w-full bg-muted hover:bg-accent h-12 justify-start space-x-3"
              >
                <Keyboard className="w-5 h-5" />
                <span className="font-medium">Manual Entry</span>
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
