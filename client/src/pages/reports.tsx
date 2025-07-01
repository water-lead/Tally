import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTheme } from "@/components/theme-provider";
import { Moon, Sun, User, FileText, TrendingUp, Package, DollarSign } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function Reports() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/items/stats"],
    enabled: isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="mobile-container">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num || 0);
  };

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 tally-gradient rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Reports</h1>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="h-9 w-9"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="h-9 w-9"
            >
              <User className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 p-4 space-y-6">
        {/* Overview Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Items</p>
                  <p className="text-xl font-bold text-foreground">
                    {statsLoading ? "..." : stats?.totalItems || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                  <p className="text-xl font-bold text-foreground">
                    {statsLoading ? "..." : formatCurrency(stats?.totalValue || 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Export Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                toast({
                  title: "Export Started",
                  description: "Your inventory export will be ready shortly.",
                });
              }}
            >
              <FileText className="w-4 h-4 mr-2" />
              Export for Insurance
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                toast({
                  title: "Export Started",
                  description: "Your CSV export will be ready shortly.",
                });
              }}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Export as CSV
            </Button>
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Most Valuable Category</span>
              <span className="font-medium">Electronics</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Items Added This Month</span>
              <span className="font-medium">12</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Upcoming Expiries</span>
              <span className="font-medium text-orange-600">3 items</span>
            </div>
          </CardContent>
        </Card>

        {/* Coming Soon */}
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Advanced Analytics Coming Soon
            </h3>
            <p className="text-muted-foreground text-sm">
              Detailed charts and insights about your inventory trends, depreciation tracking, and more.
            </p>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
