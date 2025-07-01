import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Package, DollarSign, AlertTriangle } from "lucide-react";
import type { Item } from "@shared/schema";

export function DashboardStats() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/items/stats"],
  });

  const { data: expiringItems = [], isLoading: expiringLoading } = useQuery<Item[]>({
    queryKey: ["/api/items/expiring"],
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  const getTimeUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Expires today";
    if (diffDays === 1) return "Expires tomorrow";
    return `Expires in ${diffDays} days`;
  };

  return (
    <section className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Card className="tally-gradient text-white">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Total Items</p>
                <p className="text-2xl font-bold">
                  {statsLoading ? "..." : stats?.totalItems || 0}
                </p>
              </div>
              <Package className="text-purple-200 text-xl" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-muted-foreground text-sm font-medium">Total Value</p>
                <p className="text-2xl font-bold text-foreground">
                  {statsLoading ? "..." : formatCurrency(stats?.totalValue || 0)}
                </p>
              </div>
              <DollarSign className="text-green-500 text-xl" />
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Expiring Items Alert */}
      {!expiringLoading && expiringItems.length > 0 && (
        <Card className="card-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-foreground">Upcoming Expiries</h3>
              <span className="bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300 px-2 py-1 rounded-full text-xs font-medium">
                {expiringItems.length}
              </span>
            </div>
            <div className="space-y-2">
              {expiringItems.slice(0, 3).map((item) => (
                <div key={item.id} className="flex items-center space-x-3 py-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {item.expiryDate && getTimeUntilExpiry(item.expiryDate)}
                    </p>
                  </div>
                </div>
              ))}
              {expiringItems.length > 3 && (
                <p className="text-xs text-muted-foreground text-center pt-2">
                  +{expiringItems.length - 3} more expiring soon
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </section>
  );
}
