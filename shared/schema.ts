import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const createAdminSchema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  isAdmin: z.boolean().default(true),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Social media accounts table
export const socialAccounts = pgTable("social_accounts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  platform: text("platform").notNull(), // 'twitter', 'facebook', 'instagram', 'linkedin'
  accountName: text("account_name").notNull(),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Posts table
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  platforms: json("platforms").$type<string[]>().notNull(), // array of platform names
  status: text("status").notNull().default('pending'), // 'pending', 'posted', 'failed'
  telegramMessageId: text("telegram_message_id"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  scheduledFor: timestamp("scheduled_for"),
});

// Post results table - tracks individual platform posts
export const postResults = pgTable("post_results", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id),
  platform: text("platform").notNull(),
  platformPostId: text("platform_post_id"),
  status: text("status").notNull(), // 'success', 'failed'
  errorMessage: text("error_message"),
  postedAt: timestamp("posted_at").default(sql`now()`),
});

// Bot settings table
export const botSettings = pgTable("bot_settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  telegramChatId: text("telegram_chat_id").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  defaultPlatforms: json("default_platforms").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertSocialAccountSchema = createInsertSchema(socialAccounts).omit({
  id: true,
  createdAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  status: true,
});

export const insertBotSettingsSchema = createInsertSchema(botSettings).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertSocialAccount = z.infer<typeof insertSocialAccountSchema>;
export type SocialAccount = typeof socialAccounts.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertBotSettings = z.infer<typeof insertBotSettingsSchema>;
export type BotSettings = typeof botSettings.$inferSelect;

export type PostResult = typeof postResults.$inferSelect;
