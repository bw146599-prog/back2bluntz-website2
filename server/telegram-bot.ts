import TelegramBot from 'node-telegram-bot-api';
import { storage } from './storage';
import { socialMediaService } from './social-media-service';

class TelegramBotService {
  private bot: TelegramBot | null = null;
  private isInitialized = false;

  async initialize() {
    const botToken = process.env.TELEGRAM_BOT_TOKEN;
    
    if (!botToken) {
      console.log('Telegram bot token not found. Bot will not be available.');
      return;
    }

    try {
      this.bot = new TelegramBot(botToken, { polling: true });
      this.setupCommands();
      this.isInitialized = true;
      console.log('Telegram bot initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Telegram bot:', error);
    }
  }

  private setupCommands() {
    if (!this.bot) return;

    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const welcomeMessage = `
🤖 Welcome to Social Media Cross-Poster Bot!

Commands:
/post - Create a new post for multiple platforms
/accounts - Manage your social media accounts
/history - View your posting history
/settings - Configure bot settings
/help - Show this help message
      `;
      
      await this.bot?.sendMessage(chatId, welcomeMessage);
    });

    // Post command
    this.bot.onText(/\/post/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || '';

      try {
        // Check if user has connected accounts
        const accounts = await storage.getSocialAccountsByUserId(userId);
        
        if (accounts.length === 0) {
          await this.bot?.sendMessage(chatId, 
            '❌ You need to connect at least one social media account first. Use /accounts to get started.'
          );
          return;
        }

        // Start the posting flow
        await this.startPostingFlow(chatId, userId);
      } catch (error) {
        console.error('Error in post command:', error);
        await this.bot?.sendMessage(chatId, '❌ Something went wrong. Please try again.');
      }
    });

    // Accounts command
    this.bot.onText(/\/accounts/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || '';

      try {
        const accounts = await storage.getSocialAccountsByUserId(userId);
        
        let message = '📱 Your Connected Accounts:\n\n';
        
        if (accounts.length === 0) {
          message = '📱 No accounts connected yet.\n\nTo connect accounts, please use the web interface at your app URL.';
        } else {
          accounts.forEach((account, index) => {
            const status = account.isActive ? '✅' : '❌';
            message += `${index + 1}. ${status} ${account.platform.toUpperCase()} - @${account.accountName}\n`;
          });
        }
        
        await this.bot?.sendMessage(chatId, message);
      } catch (error) {
        console.error('Error in accounts command:', error);
        await this.bot?.sendMessage(chatId, '❌ Something went wrong. Please try again.');
      }
    });

    // History command
    this.bot.onText(/\/history/, async (msg) => {
      const chatId = msg.chat.id;
      const userId = msg.from?.id.toString() || '';

      try {
        const posts = await storage.getPostsByUserId(userId, 10);
        
        if (posts.length === 0) {
          await this.bot?.sendMessage(chatId, '📝 No posts found. Use /post to create your first post!');
          return;
        }

        let message = '📝 Your Recent Posts:\n\n';
        
        posts.forEach((post, index) => {
          const status = post.status === 'posted' ? '✅' : post.status === 'failed' ? '❌' : '⏳';
          const date = new Date(post.createdAt).toLocaleDateString();
          message += `${index + 1}. ${status} ${post.title}\n`;
          message += `   📅 ${date} | 📱 ${post.platforms.join(', ')}\n\n`;
        });
        
        await this.bot?.sendMessage(chatId, message);
      } catch (error) {
        console.error('Error in history command:', error);
        await this.bot?.sendMessage(chatId, '❌ Something went wrong. Please try again.');
      }
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
🤖 Social Media Cross-Poster Bot Help

📝 /post - Create a new post
   Start the interactive flow to create a post that will be shared across your connected social media platforms.

📱 /accounts - View connected accounts
   See all your connected social media accounts and their status.

📊 /history - View posting history
   See your recent posts and their status across platforms.

⚙️ /settings - Bot settings
   Configure your default platforms and other preferences.

❓ /help - Show this help message

💡 Tip: Make sure to connect your social media accounts through the web interface first!
      `;
      
      await this.bot?.sendMessage(chatId, helpMessage);
    });
  }

  private async startPostingFlow(chatId: number, userId: string) {
    if (!this.bot) return;

    // Get user's connected accounts
    const accounts = await storage.getSocialAccountsByUserId(userId);
    const platformOptions = accounts
      .filter(acc => acc.isActive)
      .map(acc => acc.platform)
      .join(', ');

    const message = `
📝 Let's create a new post!

Please send me your post details in this format:

Title: Your post title here
Description: Your post description here
Platforms: ${platformOptions}

Example:
Title: Check out our new product launch!
Description: We're excited to announce our latest innovation. Join us on this journey! #newproduct #innovation
Platforms: twitter, facebook, linkedin

Available platforms: ${platformOptions}
    `;

    await this.bot.sendMessage(chatId, message);

    // Listen for the next message from this user
    this.bot.once('message', async (msg) => {
      if (msg.chat.id === chatId && msg.text) {
        await this.processPostInput(chatId, userId, msg.text);
      }
    });
  }

  private async processPostInput(chatId: number, userId: string, input: string) {
    if (!this.bot) return;

    try {
      // Parse the input
      const titleMatch = input.match(/Title:\s*(.+)/i);
      const descriptionMatch = input.match(/Description:\s*(.+)/i);
      const platformsMatch = input.match(/Platforms:\s*(.+)/i);

      if (!titleMatch || !descriptionMatch || !platformsMatch) {
        await this.bot.sendMessage(chatId, 
          '❌ Invalid format. Please use the format:\n\nTitle: Your title\nDescription: Your description\nPlatforms: platform1, platform2'
        );
        return;
      }

      const title = titleMatch[1].trim();
      const description = descriptionMatch[1].trim();
      const platforms = platformsMatch[1].split(',').map(p => p.trim().toLowerCase());

      // Validate platforms
      const userAccounts = await storage.getSocialAccountsByUserId(userId);
      const availablePlatforms = userAccounts
        .filter(acc => acc.isActive)
        .map(acc => acc.platform);

      const invalidPlatforms = platforms.filter(p => !availablePlatforms.includes(p));
      
      if (invalidPlatforms.length > 0) {
        await this.bot.sendMessage(chatId, 
          `❌ Invalid platforms: ${invalidPlatforms.join(', ')}\n\nAvailable platforms: ${availablePlatforms.join(', ')}`
        );
        return;
      }

      // Create the post
      const post = await storage.insertPost({
        userId,
        title,
        description,
        platforms,
        telegramMessageId: chatId.toString(),
      });

      await this.bot.sendMessage(chatId, '⏳ Creating your post...');

      // Post to social media platforms
      const results = await socialMediaService.postToMultiplePlatforms(post.id, {
        title,
        description,
        platforms,
        userId
      });

      // Update post status and send results
      const successCount = results.filter(r => r.success).length;
      const failureCount = results.filter(r => !r.success).length;

      await storage.updatePostStatus(post.id, successCount > 0 ? 'posted' : 'failed');

      let resultMessage = `📊 Posting Results:\n\n`;
      resultMessage += `✅ Successful: ${successCount}\n`;
      resultMessage += `❌ Failed: ${failureCount}\n\n`;

      results.forEach(result => {
        const status = result.success ? '✅' : '❌';
        resultMessage += `${status} ${result.platform.toUpperCase()}`;
        if (result.error) {
          resultMessage += ` - ${result.error}`;
        }
        resultMessage += '\n';
      });

      await this.bot.sendMessage(chatId, resultMessage);

    } catch (error) {
      console.error('Error processing post input:', error);
      await this.bot?.sendMessage(chatId, '❌ Something went wrong while creating your post. Please try again.');
    }
  }

  async sendMessage(chatId: string, message: string) {
    if (!this.bot || !this.isInitialized) {
      console.log('Bot not initialized');
      return;
    }

    try {
      await this.bot.sendMessage(parseInt(chatId), message);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }

  isReady() {
    return this.isInitialized && this.bot !== null;
  }
}

export const telegramBotService = new TelegramBotService();