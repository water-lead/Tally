import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { DashboardStats } from "@/components/dashboard-stats";
import { CategoryGrid } from "@/components/category-grid";
import { RecentItems } from "@/components/recent-items";
import { AddItemModal } from "@/components/add-item-modal";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/theme-provider";
import { Plus, Moon, Sun, User } from "lucide-react";
import { Package } from "lucide-react";
import { useState } from "react";
import { isUnauthorizedError } from "@/lib/authUtils";

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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

  return (
    <div className="mobile-container">
      {/* Header */}
      <header className="mobile-header">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 tally-gradient rounded-lg flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Tally</h1>
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
      <main className="pb-20">
        <DashboardStats />
        <CategoryGrid />
        <RecentItems />
      </main>

      {/* Floating Action Button */}
      <Button
        onClick={() => setIsAddModalOpen(true)}
        className="fixed bottom-24 right-4 w-14 h-14 tally-primary rounded-full floating-action p-0"
      >
        <Plus className="w-6 h-6" />
      </Button>

      {/* Bottom Navigation */}
      <BottomNavigation />

      {/* Add Item Modal */}
      <AddItemModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />
    </div>
  );
}
