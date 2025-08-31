import { type User, type InsertUser, type SocialAccount, type InsertSocialAccount, type Post, type InsertPost, type PostResult, type BotSettings, type InsertBotSettings } from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Social Accounts
  getSocialAccountsByUserId(userId: string): Promise<SocialAccount[]>;
  insertSocialAccount(account: InsertSocialAccount): Promise<SocialAccount>;
  updateSocialAccountStatus(id: string, isActive: boolean): Promise<void>;
  
  // Posts
  getPostsByUserId(userId: string, limit?: number): Promise<Post[]>;
  insertPost(post: InsertPost): Promise<Post>;
  updatePostStatus(id: string, status: string): Promise<void>;
  
  // Post Results
  insertPostResult(result: Omit<PostResult, 'id'>): Promise<PostResult>;
  
  // Bot Settings
  getBotSettingsByUserId(userId: string): Promise<BotSettings | undefined>;
  insertBotSettings(settings: InsertBotSettings): Promise<BotSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private socialAccounts: Map<string, SocialAccount>;
  private posts: Map<string, Post>;
  private postResults: Map<string, PostResult>;
  private botSettings: Map<string, BotSettings>;

  constructor() {
    this.users = new Map();
    this.socialAccounts = new Map();
    this.posts = new Map();
    this.postResults = new Map();
    this.botSettings = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      isAdmin: false,
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Social Accounts
  async getSocialAccountsByUserId(userId: string): Promise<SocialAccount[]> {
    return Array.from(this.socialAccounts.values()).filter(
      account => account.userId === userId
    );
  }

  async insertSocialAccount(insertAccount: InsertSocialAccount): Promise<SocialAccount> {
    const id = randomUUID();
    const account: SocialAccount = {
      ...insertAccount,
      id,
      refreshToken: insertAccount.refreshToken || null,
      isActive: insertAccount.isActive ?? true,
      createdAt: new Date()
    };
    this.socialAccounts.set(id, account);
    return account;
  }

  async updateSocialAccountStatus(id: string, isActive: boolean): Promise<void> {
    const account = this.socialAccounts.get(id);
    if (account) {
      account.isActive = isActive;
      this.socialAccounts.set(id, account);
    }
  }

  // Posts
  async getPostsByUserId(userId: string, limit: number = 50): Promise<Post[]> {
    const userPosts = Array.from(this.posts.values())
      .filter(post => post.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);
    return userPosts;
  }

  async insertPost(insertPost: InsertPost): Promise<Post> {
    const id = randomUUID();
    const post: Post = {
      ...insertPost,
      id,
      status: 'pending',
      platforms: insertPost.platforms as string[],
      telegramMessageId: insertPost.telegramMessageId || null,
      scheduledFor: insertPost.scheduledFor || null,
      createdAt: new Date()
    };
    this.posts.set(id, post);
    return post;
  }

  async updatePostStatus(id: string, status: string): Promise<void> {
    const post = this.posts.get(id);
    if (post) {
      post.status = status;
      this.posts.set(id, post);
    }
  }

  // Post Results
  async insertPostResult(insertResult: Omit<PostResult, 'id'>): Promise<PostResult> {
    const id = randomUUID();
    const result: PostResult = {
      ...insertResult,
      id,
      postedAt: new Date()
    };
    this.postResults.set(id, result);
    return result;
  }

  // Bot Settings
  async getBotSettingsByUserId(userId: string): Promise<BotSettings | undefined> {
    return Array.from(this.botSettings.values()).find(
      settings => settings.userId === userId
    );
  }

  async insertBotSettings(insertSettings: InsertBotSettings): Promise<BotSettings> {
    const id = randomUUID();
    const settings: BotSettings = {
      ...insertSettings,
      id,
      isActive: insertSettings.isActive ?? true,
      defaultPlatforms: (insertSettings.defaultPlatforms as string[]) || [],
      createdAt: new Date()
    };
    this.botSettings.set(id, settings);
    return settings;
  }
}

import { DatabaseStorage } from "./database-storage";

export const storage = new DatabaseStorage();
