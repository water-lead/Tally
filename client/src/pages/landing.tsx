import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, Shield, Smartphone, Zap } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="mobile-container">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted p-4 flex flex-col">
        {/* Header */}
        <div className="text-center pt-16 pb-8">
          <div className="w-20 h-20 tally-gradient rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground mb-4">Tally</h1>
          <p className="text-xl text-muted-foreground max-w-sm mx-auto">
            Your personal home inventory manager
          </p>
        </div>

        {/* Features */}
        <div className="flex-1 space-y-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Smartphone className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Smart Scanning</h3>
                  <p className="text-sm text-muted-foreground">
                    Add items with photos, barcodes, or voice input
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Secure Storage</h3>
                  <p className="text-sm text-muted-foreground">
                    Your data is encrypted and safely stored
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Smart Alerts</h3>
                  <p className="text-sm text-muted-foreground">
                    Get notified about expiring items and warranties
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="space-y-4">
          <Button 
            onClick={handleLogin}
            className="w-full tally-primary h-12 text-lg font-semibold"
          >
            Get Started
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            Sign in to access your inventory
          </p>
        </div>
      </div>
    </div>
  );
}
