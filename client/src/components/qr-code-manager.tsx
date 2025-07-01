import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, QrCode, ScanLine, X, Download, Copy, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { QRCodeCanvas } from "qrcode.react";
import { BrowserQRCodeReader, Result, NotFoundException } from "@zxing/library";

interface QRCodeManagerProps {
  onQRDataScanned: (qrData: QRItemData) => void;
  onCancel: () => void;
  itemToGenerate?: {
    name: string;
    category: string;
    description?: string;
    value?: number;
  };
}

interface QRItemData {
  id?: string;
  name: string;
  category: string;
  description?: string;
  value?: number;
  dateAdded?: string;
  location?: string;
  barcode?: string;
  metadata?: Record<string, any>;
}

export function QRCodeManager({ onQRDataScanned, onCancel, itemToGenerate }: QRCodeManagerProps) {
  const [activeTab, setActiveTab] = useState<"scan" | "generate">(itemToGenerate ? "generate" : "scan");
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState<QRItemData | null>(null);
  const [generatedQRData, setGeneratedQRData] = useState<string | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrReader = useRef<BrowserQRCodeReader | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    qrReader.current = new BrowserQRCodeReader();
    
    if (itemToGenerate) {
      generateQRCode(itemToGenerate);
    }
    
    return () => {
      stopScanning();
    };
  }, [itemToGenerate]);

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      if (!qrReader.current || !videoRef.current) return;

      // Get camera stream
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: "environment",
          width: { ideal: 640 },
          height: { ideal: 480 }
        }
      });
      
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;

      // Start scanning
      qrReader.current.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result: Result | null, error?: Error) => {
          if (result) {
            const qrText = result.getText();
            parseQRData(qrText);
            stopScanning();
          }
          if (error && !(error instanceof NotFoundException)) {
            console.error("QR scanning error:", error);
          }
        }
      );
      
    } catch (err) {
      console.error("Error starting QR scanner:", err);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (qrReader.current) {
      qrReader.current.reset();
    }
    
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setIsScanning(false);
  };

  const parseQRData = (qrText: string) => {
    try {
      // Try to parse as JSON (Tally QR codes)
      const data = JSON.parse(qrText) as QRItemData;
      
      // Validate required fields
      if (data.name && data.category) {
        setScannedData(data);
        toast({
          title: "QR Code Scanned",
          description: `Found item: ${data.name}`,
        });
      } else {
        throw new Error("Invalid QR code format");
      }
    } catch (err) {
      // Handle non-JSON QR codes (URLs, text, etc.)
      const fallbackData: QRItemData = {
        name: "QR Code Item",
        category: "General",
        description: qrText.length > 100 ? qrText.substring(0, 100) + "..." : qrText,
        metadata: { originalQRText: qrText }
      };
      
      setScannedData(fallbackData);
      toast({
        title: "QR Code Scanned",
        description: "Scanned general QR code content",
      });
    }
  };

  const generateQRCode = (item: typeof itemToGenerate) => {
    if (!item) return;
    
    const qrData: QRItemData = {
      id: `tally-${Date.now()}`,
      name: item.name,
      category: item.category,
      description: item.description,
      value: item.value,
      dateAdded: new Date().toISOString(),
    };
    
    const qrString = JSON.stringify(qrData);
    setGeneratedQRData(qrString);
  };

  const downloadQRCode = () => {
    const canvas = document.querySelector('#qr-code canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL();
      const link = document.createElement('a');
      link.download = `${itemToGenerate?.name || 'item'}-qr-code.png`;
      link.href = url;
      link.click();
      
      toast({
        title: "Downloaded",
        description: "QR code saved to downloads",
      });
    }
  };

  const copyQRData = async () => {
    if (generatedQRData) {
      await navigator.clipboard.writeText(generatedQRData);
      toast({
        title: "Copied",
        description: "QR code data copied to clipboard",
      });
    }
  };

  const handleUseScannedData = () => {
    if (scannedData) {
      onQRDataScanned(scannedData);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "scan" | "generate")}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scan">Scan QR Code</TabsTrigger>
          <TabsTrigger value="generate">Generate QR Code</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scan" className="space-y-4">
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
                  <div className="w-48 h-48 border-2 border-white rounded-lg"></div>
                  <QrCode className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-8 w-8 text-white animate-pulse" />
                </div>
              </div>
            )}
            
            {!isScanning && !scannedData && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                <div className="text-center text-white">
                  <QrCode className="h-12 w-12 mx-auto mb-3" />
                  <p className="text-sm">Ready to scan QR codes</p>
                </div>
              </div>
            )}
          </div>

          {scannedData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  QR Code Scanned
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <h4 className="font-medium">{scannedData.name}</h4>
                  {scannedData.description && (
                    <p className="text-sm text-muted-foreground mt-1">{scannedData.description}</p>
                  )}
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{scannedData.category}</Badge>
                  {scannedData.value && (
                    <Badge variant="outline">${scannedData.value}</Badge>
                  )}
                </div>
                
                {scannedData.metadata?.originalQRText && (
                  <p className="text-xs text-muted-foreground">
                    Original: {scannedData.metadata.originalQRText}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            {!isScanning && !scannedData ? (
              <Button onClick={startScanning} className="flex-1">
                <ScanLine className="h-4 w-4 mr-2" />
                Start Scanning
              </Button>
            ) : scannedData ? (
              <Button onClick={handleUseScannedData} className="flex-1">
                <CheckCircle className="h-4 w-4 mr-2" />
                Use This Item
              </Button>
            ) : (
              <Button onClick={stopScanning} className="flex-1" variant="outline">
                Stop Scanning
              </Button>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="generate" className="space-y-4">
          {itemToGenerate && generatedQRData ? (
            <Card>
              <CardHeader>
                <CardTitle>Generated QR Code</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div id="qr-code" className="inline-block p-4 bg-white rounded-lg">
                    <QRCodeCanvas
                      value={generatedQRData}
                      size={200}
                      level="M"
                      includeMargin
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium">{itemToGenerate.name}</h4>
                  <Badge variant="secondary">{itemToGenerate.category}</Badge>
                  {itemToGenerate.description && (
                    <p className="text-sm text-muted-foreground">
                      {itemToGenerate.description}
                    </p>
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={downloadQRCode} variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button onClick={copyQRData} variant="outline" className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <QrCode className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Create an item first to generate its QR code
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <div className="flex gap-2">
        <Button onClick={onCancel} variant="outline" className="flex-1">
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}