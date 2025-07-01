import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Package, MoreVertical } from "lucide-react";
import type { Item, Category } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export function RecentItems() {
  const { data: recentItems = [], isLoading } = useQuery<Item[]>({
    queryKey: ["/api/items/recent"],
  });

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const getCategoryName = (categoryId: number | null) => {
    if (!categoryId) return "Uncategorized";
    const category = categories.find(c => c.id === categoryId);
    return category?.name || "Unknown";
  };

  const formatTimeAgo = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return "Recently";
    }
  };

  const formatPrice = (price: string | null) => {
    if (!price) return null;
    const num = parseFloat(price);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  if (isLoading) {
    return (
      <section className="px-4 pb-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Recent Items</h2>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-muted rounded-lg"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-1/4"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Items</h2>
        <Button variant="ghost" className="text-primary text-sm font-medium p-0 h-auto">
          See All
        </Button>
      </div>
      
      {recentItems.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No items yet</h3>
            <p className="text-muted-foreground text-sm">
              Start building your inventory by adding your first item
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {recentItems.map((item) => (
            <Card key={item.id} className="item-card card-shadow">
              <CardContent className="p-4">
                <div className="flex items-center space-x-4">
                  {item.photoUrl ? (
                    <img 
                      src={item.photoUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      <Package className="w-6 h-6 text-muted-foreground" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {getCategoryName(item.categoryId)} • {formatTimeAgo(item.createdAt!)}
                    </p>
                    {item.currentValue && (
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatPrice(item.currentValue)}
                      </p>
                    )}
                  </div>
                  
                  <Button variant="ghost" size="icon" className="text-muted-foreground">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}
