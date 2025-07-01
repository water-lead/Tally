import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect } from "react";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "@/components/theme-provider";
import { 
  Moon, 
  Sun, 
  User, 
  Settings as SettingsIcon, 
  Bell, 
  Shield, 
  HelpCircle,
  LogOut,
  Trash2
} from "lucide-react";

export default function Settings() {
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
              <SettingsIcon className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-xl font-semibold text-foreground">Settings</h1>
          </div>
          
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
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-20 p-4 space-y-6">
        {/* Profile */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-4">
              {user?.profileImageUrl ? (
                <img 
                  src={user.profileImageUrl}
                  alt="Profile"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <h3 className="font-semibold text-foreground">
                  {user?.firstName || user?.lastName 
                    ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                    : 'User'
                  }
                </h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {theme === "dark" ? (
                  <Moon className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Sun className="w-5 h-5 text-muted-foreground" />
                )}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                </div>
              </div>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={toggleTheme}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Get alerts for expiring items</p>
                </div>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Support */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Support</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-0 h-auto"
              onClick={() => {
                toast({
                  title: "Help Center",
                  description: "Opening help documentation...",
                });
              }}
            >
              <div className="flex items-center space-x-3 py-3">
                <HelpCircle className="w-5 h-5 text-muted-foreground" />
                <span>Help Center</span>
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start p-0 h-auto"
              onClick={() => {
                toast({
                  title: "Privacy Policy",
                  description: "Opening privacy policy...",
                });
              }}
            >
              <div className="flex items-center space-x-3 py-3">
                <Shield className="w-5 h-5 text-muted-foreground" />
                <span>Privacy Policy</span>
              </div>
            </Button>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg text-destructive">Danger Zone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="ghost" 
              className="w-full justify-start p-0 h-auto text-destructive"
              onClick={() => {
                toast({
                  title: "Clear Data",
                  description: "This feature is not yet implemented.",
                  variant: "destructive",
                });
              }}
            >
              <div className="flex items-center space-x-3 py-3">
                <Trash2 className="w-5 h-5" />
                <span>Clear All Data</span>
              </div>
            </Button>

            <Button 
              variant="ghost" 
              className="w-full justify-start p-0 h-auto text-destructive"
              onClick={handleLogout}
            >
              <div className="flex items-center space-x-3 py-3">
                <LogOut className="w-5 h-5" />
                <span>Sign Out</span>
              </div>
            </Button>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
