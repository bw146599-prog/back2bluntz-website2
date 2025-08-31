import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { socialMediaService } from "./social-media-service";
import { telegramBotService } from "./telegram-bot";
import { postScheduler } from "./scheduler";
import { requireAdmin } from "./auth";
import { insertSocialAccountSchema, insertPostSchema, insertBotSettingsSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Social Media Accounts API (protected)
  app.get('/api/social-accounts/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const accounts = await storage.getSocialAccountsByUserId(userId);
      res.json(accounts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch social accounts' });
    }
  });

  app.post('/api/social-accounts', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertSocialAccountSchema.parse(req.body);
      const account = await storage.insertSocialAccount(validatedData);
      res.status(201).json(account);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create social account' });
      }
    }
  });

  app.patch('/api/social-accounts/:id/status', requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { isActive } = req.body;
      await storage.updateSocialAccountStatus(id, isActive);
      res.json({ message: 'Status updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update account status' });
    }
  });

  // Posts API (protected)
  app.get('/api/posts/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const limit = parseInt(req.query.limit as string) || 50;
      const posts = await storage.getPostsByUserId(userId, limit);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch posts' });
    }
  });

  app.post('/api/posts', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertPostSchema.parse(req.body);
      const post = await storage.insertPost(validatedData);
      
      // Check if this is a scheduled post
      if (post.scheduledFor && new Date(post.scheduledFor) > new Date()) {
        // Schedule the post for later
        await postScheduler.schedulePost(post.id, new Date(post.scheduledFor));
        res.status(201).json({ post, message: 'Post scheduled successfully' });
      } else {
        // Post immediately
        const results = await socialMediaService.postToMultiplePlatforms(post.id, {
          title: post.title,
          description: post.description,
          platforms: post.platforms,
          userId: post.userId
        });
        
        // Update post status
        const successCount = results.filter(r => r.success).length;
        await storage.updatePostStatus(post.id, successCount > 0 ? 'posted' : 'failed');
        
        res.status(201).json({ post, results });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create post' });
      }
    }
  });

  // Bot Settings API (protected)
  app.get('/api/bot-settings/:userId', requireAdmin, async (req, res) => {
    try {
      const { userId } = req.params;
      const settings = await storage.getBotSettingsByUserId(userId);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch bot settings' });
    }
  });

  app.post('/api/bot-settings', requireAdmin, async (req, res) => {
    try {
      const validatedData = insertBotSettingsSchema.parse(req.body);
      const settings = await storage.insertBotSettings(validatedData);
      res.status(201).json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: 'Invalid data', errors: error.errors });
      } else {
        res.status(500).json({ message: 'Failed to create bot settings' });
      }
    }
  });

  // Test social media connection (protected)
  app.post('/api/test-connection', requireAdmin, async (req, res) => {
    try {
      const { platform, accessToken } = req.body;
      const isValid = await socialMediaService.testConnection(platform, accessToken);
      res.json({ valid: isValid });
    } catch (error) {
      res.status(500).json({ message: 'Failed to test connection' });
    }
  });

  // Send Telegram message (protected)
  app.post('/api/telegram/send', requireAdmin, async (req, res) => {
    try {
      const { chatId, message } = req.body;
      
      if (!telegramBotService.isReady()) {
        res.status(503).json({ message: 'Telegram bot is not ready' });
        return;
      }
      
      await telegramBotService.sendMessage(chatId, message);
      res.json({ message: 'Message sent successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to send message' });
    }
  });

  // Scheduler endpoints (protected)
  app.get('/api/scheduler/status', requireAdmin, async (req, res) => {
    try {
      const scheduledCount = postScheduler.getScheduledPostsCount();
      const scheduledPosts = postScheduler.getScheduledPosts();
      res.json({ scheduledCount, scheduledPosts });
    } catch (error) {
      res.status(500).json({ message: 'Failed to get scheduler status' });
    }
  });

  app.delete('/api/scheduler/cancel/:postId', requireAdmin, async (req, res) => {
    try {
      const { postId } = req.params;
      const cancelled = postScheduler.cancelScheduledPost(postId);
      
      if (cancelled) {
        await storage.updatePostStatus(postId, 'cancelled');
        res.json({ message: 'Post cancelled successfully' });
      } else {
        res.status(404).json({ message: 'Scheduled post not found' });
      }
    } catch (error) {
      res.status(500).json({ message: 'Failed to cancel post' });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
