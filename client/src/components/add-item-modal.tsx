import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Camera, Barcode, QrCode, Mic, Keyboard, X, ArrowLeft } from "lucide-react";
import { ItemForm } from "./item-form";
import { PhotoScanner } from "./photo-scanner";
import { BarcodeScanner } from "./barcode-scanner";
import { QRCodeManager } from "./qr-code-manager";
import { VoiceInput } from "./voice-input";

interface AddItemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AddMethod = "photo" | "barcode" | "qr" | "voice" | "manual" | null;

interface PrefilledData {
  name?: string;
  category?: string;
  description?: string;
  value?: number;
  barcode?: string;
}

export function AddItemModal({ isOpen, onClose }: AddItemModalProps) {
  const [selectedMethod, setSelectedMethod] = useState<AddMethod>(null);
  const [prefilledData, setPrefilledData] = useState<PrefilledData | null>(null);

  const handleMethodSelect = (method: AddMethod) => {
    setSelectedMethod(method);
  };

  const handleBack = () => {
    setSelectedMethod(null);
    setPrefilledData(null);
  };

  const handleClose = () => {
    setSelectedMethod(null);
    setPrefilledData(null);
    onClose();
  };

  const handlePhotoDetection = (predictions: any[]) => {
    if (predictions.length > 0) {
      const prediction = predictions[0];
      setPrefilledData({
        name: prediction.className,
        category: prediction.suggestedCategory,
        description: `Detected via photo scan with ${Math.round(prediction.probability * 100)}% confidence`
      });
      setSelectedMethod("manual");
    }
  };

  const handleBarcodeScanned = (productData: any) => {
    setPrefilledData({
      name: productData.name,
      category: productData.category,
      description: productData.description,
      barcode: productData.barcode,
      value: productData.price ? parseFloat(productData.price.replace('$', '')) : undefined
    });
    setSelectedMethod("manual");
  };

  const handleQRScanned = (qrData: any) => {
    setPrefilledData({
      name: qrData.name,
      category: qrData.category,
      description: qrData.description,
      value: qrData.value
    });
    setSelectedMethod("manual");
  };

  const handleVoiceResult = (voiceData: any) => {
    setPrefilledData({
      name: voiceData.suggestedName,
      category: voiceData.suggestedCategory,
      description: voiceData.suggestedDescription || voiceData.transcript
    });
    setSelectedMethod("manual");
  };

  const addMethods = [
    {
      id: "photo" as const,
      label: "Photo Scan",
      icon: Camera,
      description: "AI-powered object detection",
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
      description: "Scan or generate QR codes",
      primary: false,
    },
    {
      id: "voice" as const,
      label: "Voice",
      icon: Mic,
      description: "Voice-to-text input",
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
                {selectedMethod === "manual" && "Add Item"}
                {selectedMethod === "photo" && "Photo Scanner"}
                {selectedMethod === "barcode" && "Barcode Scanner"}
                {selectedMethod === "qr" && "QR Code Manager"}
                {selectedMethod === "voice" && "Voice Input"}
              </DialogTitle>
              <div className="flex space-x-2">
                <Button variant="ghost" size="icon" onClick={handleBack}>
                  <ArrowLeft className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </DialogHeader>
            
            {selectedMethod === "manual" && (
              <ItemForm 
                onSuccess={handleClose} 
                onCancel={handleBack}
                prefilledData={prefilledData}
              />
            )}
            
            {selectedMethod === "photo" && (
              <PhotoScanner 
                onObjectDetected={handlePhotoDetection}
                onCancel={handleBack}
              />
            )}
            
            {selectedMethod === "barcode" && (
              <BarcodeScanner 
                onBarcodeDetected={handleBarcodeScanned}
                onCancel={handleBack}
              />
            )}
            
            {selectedMethod === "qr" && (
              <QRCodeManager 
                onQRDataScanned={handleQRScanned}
                onCancel={handleBack}
              />
            )}
            
            {selectedMethod === "voice" && (
              <VoiceInput 
                onVoiceResult={handleVoiceResult}
                onCancel={handleBack}
              />
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
                      <p className="text-xs opacity-80">{method.description}</p>
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
