import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  Utensils, 
  Monitor, 
  Sofa, 
  MoreHorizontal,
  Shirt,
  Car,
  Book,
  Dumbbell
} from "lucide-react";
import type { Category } from "@shared/schema";

const categoryIcons = {
  kitchen: Utensils,
  electronics: Monitor,
  furniture: Sofa,
  clothing: Shirt,
  automotive: Car,
  books: Book,
  fitness: Dumbbell,
  other: MoreHorizontal,
};

const defaultCategories = [
  { id: 1, name: "Kitchen", icon: "kitchen", color: "blue", count: 0 },
  { id: 2, name: "Electronics", icon: "electronics", color: "green", count: 0 },
  { id: 3, name: "Furniture", icon: "furniture", color: "purple", count: 0 },
  { id: 4, name: "More", icon: "other", color: "orange", count: 0 },
];

export function CategoryGrid() {
  const { data: categories = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // For now, show default categories since we need to implement category management
  const displayCategories = categories.length > 0 ? categories.slice(0, 4) : defaultCategories;

  const getIconComponent = (iconName: string) => {
    const Icon = categoryIcons[iconName as keyof typeof categoryIcons] || MoreHorizontal;
    return Icon;
  };

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400",
      green: "bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400",
      purple: "bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400",
      orange: "bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <section className="px-4 pb-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Categories</h2>
        <Button variant="ghost" className="text-primary text-sm font-medium p-0 h-auto">
          View All
        </Button>
      </div>
      
      <div className="grid grid-cols-4 gap-3">
        {displayCategories.map((category) => {
          const Icon = getIconComponent(category.icon);
          return (
            <Button
              key={category.id}
              variant="ghost"
              className="bg-card hover:bg-accent rounded-xl p-3 text-center card-shadow h-auto flex-col space-y-2"
            >
              <div className={`w-8 h-8 rounded-lg mx-auto flex items-center justify-center ${getColorClasses(category.color)}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-foreground">{category.name}</p>
                <p className="text-xs text-muted-foreground">{category.count || 0}</p>
              </div>
            </Button>
          );
        })}
      </div>
    </section>
  );
}
