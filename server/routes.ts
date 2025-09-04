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

  // Post story to Instagram and Snapchat (protected)
  app.post('/api/stories/post', requireAdmin, async (req, res) => {
    try {
      const { content, image, userId } = req.body;
      
      if (!content || !userId) {
        res.status(400).json({ message: 'Content and userId are required' });
        return;
      }
      
      // Get active Instagram and Snapchat accounts for this user
      const accounts = await storage.getSocialAccountsByUserId(userId);
      const storyPlatforms = accounts.filter(account => 
        (account.platform.toLowerCase() === 'instagram' || 
         account.platform.toLowerCase() === 'snapchat') && 
        account.isActive
      );
      
      if (storyPlatforms.length === 0) {
        res.status(400).json({ message: 'No active Instagram or Snapchat accounts found' });
        return;
      }
      
      const results = await socialMediaService.postStoryToMultiplePlatforms({
        content,
        image,
        platforms: storyPlatforms.map(acc => acc.platform),
        userId
      });
      
      res.json({ 
        message: 'Story posting completed',
        results,
        platforms: storyPlatforms.map(acc => acc.platform)
      });
    } catch (error) {
      console.error('Story posting error:', error);
      res.status(500).json({ message: 'Failed to post story' });
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

  // OAuth endpoints for social media authentication
  app.get('/api/oauth/:platform/auth', requireAdmin, async (req, res) => {
    try {
      const { platform } = req.params;
      const authUrl = socialMediaService.getOAuthUrl(platform, req.session.userId!);
      
      if (!authUrl) {
        return res.status(400).json({ message: 'Platform not supported for OAuth' });
      }
      
      res.json({ authUrl });
    } catch (error) {
      console.error('OAuth auth error:', error);
      res.status(500).json({ message: 'Failed to generate OAuth URL' });
    }
  });

  app.get('/api/oauth/:platform/callback', async (req, res) => {
    try {
      const { platform } = req.params;
      const { code, state } = req.query;
      
      if (!code || !state) {
        return res.status(400).json({ message: 'Missing authorization code or state' });
      }
      
      // Verify state parameter and get user ID
      const userId = state as string; // In production, verify this is a valid signed state
      
      const tokenData = await socialMediaService.exchangeCodeForToken(platform, code as string);
      
      if (!tokenData) {
        return res.status(400).json({ message: 'Failed to exchange code for token' });
      }
      
      // Get user profile to get account name
      const profile = await socialMediaService.getUserProfile(platform, tokenData.access_token);
      
      // Save the account to database
      const account = await storage.insertSocialAccount({
        userId,
        platform,
        accountName: profile.username || profile.name || 'Unknown',
        accessToken: tokenData.access_token,
        refreshToken: tokenData.refresh_token || null,
        isActive: true
      });
      
      // Redirect to success page
      res.redirect(`/social-accounts?success=true&platform=${platform}`);
    } catch (error) {
      console.error('OAuth callback error:', error);
      res.redirect(`/social-accounts?error=oauth_failed`);
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
