import { db } from './db';
import { 
  users, 
  type User, 
  type InsertUser
} from "@shared/schema";
import { eq } from "drizzle-orm";
import type { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        isAdmin: false,
      })
      .returning();
    return user;
  }

}