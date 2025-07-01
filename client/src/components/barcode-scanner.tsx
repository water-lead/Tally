import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ScanLine, X, CheckCircle, AlertCircle } from "lucide-react";
import { BrowserMultiFormatReader, Result, NotFoundException } from "@zxing/library";

interface BarcodeScannerProps {
  onBarcodeDetected: (productData: ProductData) => void;
  onCancel: () => void;
}

interface ProductData {
  barcode: string;
  name: string;
  brand?: string;
  description?: string;
  category?: string;
  price?: string;
  imageUrl?: string;
}

export function BarcodeScanner({ onBarcodeDetected, onCancel }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [productData, setProductData] = useState<ProductData | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    
    return () => {
      stopScanning();
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      if (!codeReader.current || !videoRef.current) return;

      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment", // Use back camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      // Start scanning
      codeReader.current.decodeFromVideoDevice(
        null, // Use default camera
        videoRef.current,
        (result: Result | null, error?: Error) => {
          if (result) {
            const barcode = result.getText();
            setScannedCode(barcode);
            lookupProduct(barcode);
            stopScanning();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error("Barcode scanning error:", error);
          }
        }
      );
      
    } catch (err) {
      console.error("Error starting barcode scanner:", err);
      setError("Unable to access camera. Please check permissions.");
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsScanning(false);
  };

  const lookupProduct = async (barcode: string) => {
    setIsLoading(true);
    
    try {
      // Try UPCItemDB API (free tier available)
      const response = await fetch(`https://api.upcitemdb.com/prod/trial/lookup?upc=${barcode}`);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.items && data.items.length > 0) {
          const item = data.items[0];
          const product: ProductData = {
            barcode,
            name: item.title || "Unknown Product",
            brand: item.brand,
            description: item.description,
            category: categorizeProduct(item.category || item.title || ""),
            imageUrl: item.images?.[0]
          };
          
          setProductData(product);
          return;
        }
      }
      
      // Fallback: Create basic product data
      const fallbackProduct: ProductData = {
        barcode,
        name: "Scanned Product",
        description: `Product with barcode: ${barcode}`,
        category: "General"
      };
      
      setProductData(fallbackProduct);
      
    } catch (err) {
      console.error("Error looking up product:", err);
      
      // Create basic product data on error
      const basicProduct: ProductData = {
        barcode,
        name: "Scanned Product",
        description: `Product with barcode: ${barcode}`,
        category: "General"
      };
      
      setProductData(basicProduct);
    } finally {
      setIsLoading(false);
    }
  };

  const categorizeProduct = (categoryOrTitle: string): string => {
    const text = categoryOrTitle.toLowerCase();
    
    if (text.includes("food") || text.includes("grocery") || text.includes("snack")) {
      return "Food & Beverages";
    }
    if (text.includes("electronic") || text.includes("computer") || text.includes("phone")) {
      return "Electronics";
    }
    if (text.includes("book") || text.includes("media")) {
      return "Books & Media";
    }
    if (text.includes("kitchen") || text.includes("dining") || text.includes("cookware")) {
      return "Kitchen & Dining";
    }
    if (text.includes("health") || text.includes("beauty") || text.includes("personal")) {
      return "Personal Care";
    }
    if (text.includes("clothing") || text.includes("fashion") || text.includes("apparel")) {
      return "Fashion & Accessories";
    }
    if (text.includes("home") || text.includes("garden") || text.includes("decor")) {
      return "Home & Garden";
    }
    if (text.includes("tool") || text.includes("hardware")) {
      return "Tools & Hardware";
    }
    if (text.includes("sport") || text.includes("outdoor") || text.includes("recreation")) {
      return "Sports & Recreation";
    }
    
    return "General";
  };

  const handleUseProduct = () => {
    if (productData) {
      onBarcodeDetected(productData);
    }
  };

  const handleRetry = () => {
    setScannedCode(null);
    setProductData(null);
    setError(null);
    startScanning();
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <video
          ref={videoRef}
          className="w-full h-64 bg-black rounded-lg object-cover"
          autoPlay
          playsInline
          muted
        />
        
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              <div className="w-48 h-32 border-2 border-white rounded-lg"></div>
              <ScanLine className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white animate-pulse" />
            </div>
          </div>
        )}
        
        {!isScanning && !scannedCode && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
            <div className="text-center text-white">
              <ScanLine className="h-12 w-12 mx-auto mb-3" />
              <p className="text-sm">Ready to scan barcodes</p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-5 w-5" />
              <p className="text-sm">{error}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              <p className="text-sm">Looking up product information...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {productData && (
        <Card>
          <CardContent className="p-4">
            <h3 className="font-semibold mb-3">Product Found</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium">{productData.name}</h4>
                {productData.brand && (
                  <p className="text-sm text-muted-foreground">Brand: {productData.brand}</p>
                )}
                {productData.description && (
                  <p className="text-sm text-muted-foreground mt-1">{productData.description}</p>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {productData.category}
                </Badge>
                <Badge variant="outline">
                  {productData.barcode}
                </Badge>
              </div>
              
              {productData.imageUrl && (
                <img
                  src={productData.imageUrl}
                  alt={productData.name}
                  className="w-16 h-16 object-cover rounded border"
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2">
        {!isScanning && !scannedCode ? (
          <Button onClick={startScanning} className="flex-1">
            <ScanLine className="h-4 w-4 mr-2" />
            Start Scanning
          </Button>
        ) : !productData && !isLoading ? (
          <Button onClick={handleRetry} className="flex-1" variant="outline">
            Retry Scan
          </Button>
        ) : productData ? (
          <Button onClick={handleUseProduct} className="flex-1">
            <CheckCircle className="h-4 w-4 mr-2" />
            Use This Product
          </Button>
        ) : null}
        
        <Button onClick={onCancel} variant="outline">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}