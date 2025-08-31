import { storage } from './storage';
import { socialMediaService } from './social-media-service';
import { telegramBotService } from './telegram-bot';

class PostScheduler {
  private scheduledPosts: Map<string, NodeJS.Timeout> = new Map();

  async schedulePost(postId: string, scheduledFor: Date) {
    const now = new Date();
    const delay = scheduledFor.getTime() - now.getTime();

    if (delay <= 0) {
      // Post immediately if scheduled time has passed
      await this.executePost(postId);
      return;
    }

    // Schedule the post
    const timeout = setTimeout(async () => {
      await this.executePost(postId);
      this.scheduledPosts.delete(postId);
    }, delay);

    this.scheduledPosts.set(postId, timeout);
    console.log(`Post ${postId} scheduled for ${scheduledFor.toISOString()}`);
  }

  async executePost(postId: string) {
    try {
      console.log(`Executing scheduled post: ${postId}`);
      
      // Get post details from storage
      const posts = await storage.getPostsByUserId('', 1000); // Get all posts to find this one
      const post = posts.find(p => p.id === postId);
      
      if (!post) {
        console.error(`Post ${postId} not found`);
        return;
      }

      // Execute the post across platforms
      const results = await socialMediaService.postToMultiplePlatforms(postId, {
        title: post.title,
        description: post.description,
        platforms: post.platforms,
        userId: post.userId
      });

      // Update post status
      const successCount = results.filter(r => r.success).length;
      const newStatus = successCount > 0 ? 'posted' : 'failed';
      await storage.updatePostStatus(postId, newStatus);

      // Send notification to Telegram if available
      if (post.telegramMessageId && telegramBotService.isReady()) {
        const message = `📊 Scheduled Post Results:\n\n` +
                       `📝 "${post.title}"\n` +
                       `✅ Successful: ${successCount}\n` +
                       `❌ Failed: ${results.length - successCount}\n\n` +
                       results.map(r => `${r.success ? '✅' : '❌'} ${r.platform.toUpperCase()}`).join('\n');
        
        await telegramBotService.sendMessage(post.telegramMessageId, message);
      }

      console.log(`Post ${postId} executed successfully`);
    } catch (error) {
      console.error(`Error executing scheduled post ${postId}:`, error);
      await storage.updatePostStatus(postId, 'failed');
    }
  }

  cancelScheduledPost(postId: string) {
    const timeout = this.scheduledPosts.get(postId);
    if (timeout) {
      clearTimeout(timeout);
      this.scheduledPosts.delete(postId);
      console.log(`Cancelled scheduled post: ${postId}`);
      return true;
    }
    return false;
  }

  async initializeScheduler() {
    console.log('Initializing post scheduler...');
    
    // Load any existing scheduled posts from storage
    try {
      const posts = await storage.getPostsByUserId('', 1000); // Get all posts
      const scheduledPosts = posts.filter(p => 
        p.status === 'pending' && 
        p.scheduledFor && 
        new Date(p.scheduledFor) > new Date()
      );

      for (const post of scheduledPosts) {
        if (post.scheduledFor) {
          await this.schedulePost(post.id, new Date(post.scheduledFor));
        }
      }

      console.log(`Loaded ${scheduledPosts.length} scheduled posts`);
    } catch (error) {
      console.error('Error initializing scheduler:', error);
    }
  }

  getScheduledPostsCount(): number {
    return this.scheduledPosts.size;
  }

  getScheduledPosts(): string[] {
    return Array.from(this.scheduledPosts.keys());
  }
}

export const postScheduler = new PostScheduler();