import { db } from './db';
import { 
  users, 
  socialAccounts, 
  posts, 
  postResults, 
  botSettings,
  type User, 
  type InsertUser, 
  type SocialAccount, 
  type InsertSocialAccount, 
  type Post, 
  type InsertPost, 
  type PostResult, 
  type BotSettings, 
  type InsertBotSettings 
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";
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

  // Social Accounts
  async getSocialAccountsByUserId(userId: string): Promise<SocialAccount[]> {
    return await db
      .select()
      .from(socialAccounts)
      .where(eq(socialAccounts.userId, userId))
      .orderBy(desc(socialAccounts.createdAt));
  }

  async insertSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const [account] = await db
      .insert(socialAccounts)
      .values(insertAccount)
      .returning();
    return account;
  }

  async updateSocialAccountStatus(id: string, isActive: boolean): Promise<void> {
    await db
      .update(socialAccounts)
      .set({ isActive })
      .where(eq(socialAccounts.id, id));
  }

  // Posts
  async getPostsByUserId(userId: string, limit: number = 50): Promise<Post[]> {
    if (!userId) {
      // Get all posts if no userId specified (for scheduler)
      return await db
        .select()
        .from(posts)
        .orderBy(desc(posts.createdAt))
        .limit(limit);
    }
    
    return await db
      .select()
      .from(posts)
      .where(eq(posts.userId, userId))
      .orderBy(desc(posts.createdAt))
      .limit(limit);
  }

  async insertPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values({
        ...insertPost,
        platforms: insertPost.platforms as string[],
        telegramMessageId: insertPost.telegramMessageId || null,
        scheduledFor: insertPost.scheduledFor || null,
      })
      .returning();
    return post;
  }

  async updatePostStatus(id: string, status: string): Promise<void> {
    await db
      .update(posts)
      .set({ status })
      .where(eq(posts.id, id));
  }

  // Post Results
  async insertPostResult(insertResult: Omit<PostResult, 'id'>): Promise<PostResult> {
    const [result] = await db
      .insert(postResults)
      .values(insertResult)
      .returning();
    return result;
  }

  // Bot Settings
  async getBotSettingsByUserId(userId: string): Promise<BotSettings | undefined> {
    const [settings] = await db
      .select()
      .from(botSettings)
      .where(eq(botSettings.userId, userId));
    return settings;
  }

  async insertBotSettings(insertSettings: InsertBotSettings): Promise<BotSettings> {
    const [settings] = await db
      .insert(botSettings)
      .values({
        ...insertSettings,
        defaultPlatforms: (insertSettings.defaultPlatforms as string[]) || [],
        isActive: insertSettings.isActive ?? true,
      })
      .returning();
    return settings;
  }
}