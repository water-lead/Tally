import {
  users,
  categories,
  items,
  type User,
  type UpsertUser,
  type Category,
  type InsertCategory,
  type Item,
  type InsertItem,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, count, sum } from "drizzle-orm";

// Interface for storage operations
export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Category operations
  getCategories(userId: string): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category>;
  deleteCategory(id: number, userId: string): Promise<void>;
  
  // Item operations
  getItems(userId: string): Promise<Item[]>;
  getItem(id: number, userId: string): Promise<Item | undefined>;
  createItem(item: InsertItem): Promise<Item>;
  updateItem(id: number, item: Partial<InsertItem>, userId: string): Promise<Item>;
  deleteItem(id: number, userId: string): Promise<void>;
  getRecentItems(userId: string, limit?: number): Promise<Item[]>;
  getItemStats(userId: string): Promise<{
    totalItems: number;
    totalValue: string;
  }>;
  getExpiringItems(userId: string, days?: number): Promise<Item[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Category operations
  async getCategories(userId: string): Promise<Category[]> {
    return await db
      .select()
      .from(categories)
      .where(eq(categories.userId, userId));
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category> {
    const [updatedCategory] = await db
      .update(categories)
      .set(category)
      .where(eq(categories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteCategory(id: number, userId: string): Promise<void> {
    await db
      .delete(categories)
      .where(and(eq(categories.id, id), eq(categories.userId, userId)));
  }

  // Item operations
  async getItems(userId: string): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(eq(items.userId, userId))
      .orderBy(desc(items.createdAt));
  }

  async getItem(id: number, userId: string): Promise<Item | undefined> {
    const [item] = await db
      .select()
      .from(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)));
    return item;
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [newItem] = await db
      .insert(items)
      .values(item)
      .returning();
    return newItem;
  }

  async updateItem(id: number, item: Partial<InsertItem>, userId: string): Promise<Item> {
    const [updatedItem] = await db
      .update(items)
      .set({ ...item, updatedAt: new Date() })
      .where(and(eq(items.id, id), eq(items.userId, userId)))
      .returning();
    return updatedItem;
  }

  async deleteItem(id: number, userId: string): Promise<void> {
    await db
      .delete(items)
      .where(and(eq(items.id, id), eq(items.userId, userId)));
  }

  async getRecentItems(userId: string, limit: number = 10): Promise<Item[]> {
    return await db
      .select()
      .from(items)
      .where(eq(items.userId, userId))
      .orderBy(desc(items.createdAt))
      .limit(limit);
  }

  async getItemStats(userId: string): Promise<{
    totalItems: number;
    totalValue: string;
  }> {
    const [stats] = await db
      .select({
        totalItems: count(items.id),
        totalValue: sum(items.currentValue),
      })
      .from(items)
      .where(eq(items.userId, userId));

    return {
      totalItems: stats.totalItems || 0,
      totalValue: stats.totalValue || "0",
    };
  }

  async getExpiringItems(userId: string, days: number = 7): Promise<Item[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return await db
      .select()
      .from(items)
      .where(
        and(
          eq(items.userId, userId),
          // Items that have expiry dates and expire within the specified days
        )
      )
      .orderBy(items.expiryDate);
  }
}

export const storage = new DatabaseStorage();
