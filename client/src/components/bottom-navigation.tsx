import { Button } from "@/components/ui/button";
import { Home, Search, BarChart3, Settings } from "lucide-react";
import { useLocation } from "wouter";

export function BottomNavigation() {
  const [location, setLocation] = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/search", label: "Search", icon: Search },
    { path: "/reports", label: "Reports", icon: BarChart3 },
    { path: "/settings", label: "Settings", icon: Settings },
  ];

  return (
    <nav className="bottom-nav safe-area-bottom">
      <div className="grid grid-cols-4 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.path;
          
          return (
            <Button
              key={item.path}
              variant="ghost"
              onClick={() => setLocation(item.path)}
              className={`flex flex-col items-center py-2 px-3 h-auto space-y-1 ${
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          );
        })}
      </div>
    </nav>
  );
}
