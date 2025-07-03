import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertCategorySchema, insertItemSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";

// Configure multer for file uploads
const uploadsDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const upload = multer({
  dest: uploadsDir,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Initialize default categories for new users
  const initializeUserCategories = async (userId: string) => {
    const existingCategories = await storage.getCategories(userId);
    if (existingCategories.length === 0) {
      const defaultCategories = [
        { name: "Kitchen & Dining", icon: "utensils", color: "#f97316", userId },
        { name: "Electronics", icon: "laptop", color: "#3b82f6", userId },
        { name: "Personal Care", icon: "heart", color: "#ec4899", userId },
        { name: "Household Items", icon: "home", color: "#10b981", userId },
        { name: "Perishables", icon: "apple", color: "#ef4444", userId },
        { name: "Furniture", icon: "armchair", color: "#8b5cf6", userId },
        { name: "Clothing & Accessories", icon: "shirt", color: "#f59e0b", userId },
        { name: "Tools & Hardware", icon: "wrench", color: "#6b7280", userId },
        { name: "Books & Media", icon: "book", color: "#06b6d4", userId },
        { name: "Sports & Recreation", icon: "dumbbell", color: "#84cc16", userId },
        { name: "Automotive", icon: "car", color: "#dc2626", userId },
        { name: "Health & Medical", icon: "pill", color: "#059669", userId },
        { name: "Office Supplies", icon: "briefcase", color: "#4f46e5", userId },
        { name: "Garden & Outdoor", icon: "flower", color: "#65a30d", userId },
        { name: "Collectibles", icon: "gem", color: "#9333ea", userId },
      ];
      
      for (const category of defaultCategories) {
        await storage.createCategory(category);
      }
    }
  };

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      // Initialize default categories for new users
      await initializeUserCategories(userId);
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Category routes
  app.get('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categories = await storage.getCategories(userId);
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post('/api/categories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId,
      });
      const category = await storage.createCategory(categoryData);
      res.json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(400).json({ message: "Failed to create category" });
    }
  });

  // Item routes
  app.get('/api/items', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const items = await storage.getItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching items:", error);
      res.status(500).json({ message: "Failed to fetch items" });
    }
  });

  app.get('/api/items/recent', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const limit = parseInt(req.query.limit as string) || 10;
      const items = await storage.getRecentItems(userId, limit);
      res.json(items);
    } catch (error) {
      console.error("Error fetching recent items:", error);
      res.status(500).json({ message: "Failed to fetch recent items" });
    }
  });

  app.get('/api/items/stats', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getItemStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching stats:", error);
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  app.get('/api/items/expiring', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const days = parseInt(req.query.days as string) || 7;
      const items = await storage.getExpiringItems(userId, days);
      res.json(items);
    } catch (error) {
      console.error("Error fetching expiring items:", error);
      res.status(500).json({ message: "Failed to fetch expiring items" });
    }
  });

  app.post('/api/items', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemData = {
        ...req.body,
        userId,
        photoUrl: req.file ? `/uploads/${req.file.filename}` : null,
        purchasePrice: req.body.purchasePrice ? parseFloat(req.body.purchasePrice) : null,
        currentValue: req.body.currentValue ? parseFloat(req.body.currentValue) : null,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : null,
      };
      
      const validatedData = insertItemSchema.parse(itemData);
      const item = await storage.createItem(validatedData);
      res.json(item);
    } catch (error) {
      console.error("Error creating item:", error);
      res.status(400).json({ message: "Failed to create item" });
    }
  });

  app.put('/api/items/:id', isAuthenticated, upload.single('photo'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      
      const updateData = {
        ...req.body,
        purchasePrice: req.body.purchasePrice ? parseFloat(req.body.purchasePrice) : undefined,
        currentValue: req.body.currentValue ? parseFloat(req.body.currentValue) : undefined,
        categoryId: req.body.categoryId ? parseInt(req.body.categoryId) : undefined,
      };

      if (req.file) {
        updateData.photoUrl = `/uploads/${req.file.filename}`;
      }

      const item = await storage.updateItem(itemId, updateData, userId);
      res.json(item);
    } catch (error) {
      console.error("Error updating item:", error);
      res.status(400).json({ message: "Failed to update item" });
    }
  });

  app.delete('/api/items/:id', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const itemId = parseInt(req.params.id);
      await storage.deleteItem(itemId, userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(400).json({ message: "Failed to delete item" });
    }
  });

  // Serve uploaded files
  app.use('/uploads', express.static(uploadsDir));

  const httpServer = createServer(app);
  return httpServer;
}
