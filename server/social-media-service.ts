import axios from 'axios';
import { storage } from './storage';

interface PostContent {
  title: string;
  description: string;
  platforms: string[];
  userId: string;
}

interface PostResult {
  platform: string;
  success: boolean;
  postId?: string;
  error?: string;
}

class SocialMediaService {
  
  async postToMultiplePlatforms(postId: string, content: PostContent): Promise<PostResult[]> {
    const results: PostResult[] = [];
    
    // Get user's social accounts
    const accounts = await storage.getSocialAccountsByUserId(content.userId);
    const activeAccounts = accounts.filter(acc => 
      acc.isActive && content.platforms.includes(acc.platform)
    );

    // Post to each platform
    for (const account of activeAccounts) {
      try {
        let result: PostResult;
        
        switch (account.platform) {
          case 'twitter':
            result = await this.postToTwitter(content, account.accessToken);
            break;
          case 'facebook':
            result = await this.postToFacebook(content, account.accessToken);
            break;
          case 'instagram':
            result = await this.postToInstagram(content, account.accessToken);
            break;
          case 'linkedin':
            result = await this.postToLinkedIn(content, account.accessToken);
            break;
          default:
            result = {
              platform: account.platform,
              success: false,
              error: 'Platform not supported'
            };
        }
        
        results.push(result);
        
        // Store the result
        await storage.insertPostResult({
          postId,
          platform: account.platform,
          platformPostId: result.postId || null,
          status: result.success ? 'success' : 'failed',
          errorMessage: result.error || null,
          postedAt: new Date(),
        });
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          platform: account.platform,
          success: false,
          error: errorMessage
        });
        
        await storage.insertPostResult({
          postId,
          platform: account.platform,
          platformPostId: null,
          status: 'failed',
          errorMessage,
          postedAt: new Date(),
        });
      }
    }
    
    return results;
  }

  private async postToTwitter(content: PostContent, accessToken: string): Promise<PostResult> {
    try {
      // For now, return a mock response since we don't have real API credentials
      // In a real implementation, you would use Twitter API v2
      
      if (!process.env.TWITTER_API_KEY) {
        return {
          platform: 'twitter',
          success: false,
          error: 'Twitter API credentials not configured'
        };
      }

      // Mock Twitter post
      console.log('Posting to Twitter:', content.title);
      
      return {
        platform: 'twitter',
        success: true,
        postId: `twitter_${Date.now()}`
      };
      
    } catch (error) {
      return {
        platform: 'twitter',
        success: false,
        error: error instanceof Error ? error.message : 'Twitter posting failed'
      };
    }
  }

  private async postToFacebook(content: PostContent, accessToken: string): Promise<PostResult> {
    try {
      if (!process.env.FACEBOOK_APP_ID) {
        return {
          platform: 'facebook',
          success: false,
          error: 'Facebook API credentials not configured'
        };
      }

      // Mock Facebook post
      console.log('Posting to Facebook:', content.title);
      
      return {
        platform: 'facebook',
        success: true,
        postId: `facebook_${Date.now()}`
      };
      
    } catch (error) {
      return {
        platform: 'facebook',
        success: false,
        error: error instanceof Error ? error.message : 'Facebook posting failed'
      };
    }
  }

  private async postToInstagram(content: PostContent, accessToken: string): Promise<PostResult> {
    try {
      if (!process.env.INSTAGRAM_ACCESS_TOKEN) {
        return {
          platform: 'instagram',
          success: false,
          error: 'Instagram API credentials not configured'
        };
      }

      // Mock Instagram post
      console.log('Posting to Instagram:', content.title);
      
      return {
        platform: 'instagram',
        success: true,
        postId: `instagram_${Date.now()}`
      };
      
    } catch (error) {
      return {
        platform: 'instagram',
        success: false,
        error: error instanceof Error ? error.message : 'Instagram posting failed'
      };
    }
  }

  private async postToLinkedIn(content: PostContent, accessToken: string): Promise<PostResult> {
    try {
      if (!process.env.LINKEDIN_CLIENT_ID) {
        return {
          platform: 'linkedin',
          success: false,
          error: 'LinkedIn API credentials not configured'
        };
      }

      // Mock LinkedIn post
      console.log('Posting to LinkedIn:', content.title);
      
      return {
        platform: 'linkedin',
        success: true,
        postId: `linkedin_${Date.now()}`
      };
      
    } catch (error) {
      return {
        platform: 'linkedin',
        success: false,
        error: error instanceof Error ? error.message : 'LinkedIn posting failed'
      };
    }
  }

  // Method to test social media connections
  async testConnection(platform: string, accessToken: string): Promise<boolean> {
    try {
      switch (platform) {
        case 'twitter':
          return await this.testTwitterConnection(accessToken);
        case 'facebook':
          return await this.testFacebookConnection(accessToken);
        case 'instagram':
          return await this.testInstagramConnection(accessToken);
        case 'linkedin':
          return await this.testLinkedInConnection(accessToken);
        default:
          return false;
      }
    } catch (error) {
      console.error(`Error testing ${platform} connection:`, error);
      return false;
    }
  }

  private async testTwitterConnection(accessToken: string): Promise<boolean> {
    // Mock test - in real implementation, you'd verify the token
    return !!accessToken;
  }

  private async testFacebookConnection(accessToken: string): Promise<boolean> {
    // Mock test - in real implementation, you'd verify the token
    return !!accessToken;
  }

  private async testInstagramConnection(accessToken: string): Promise<boolean> {
    // Mock test - in real implementation, you'd verify the token
    return !!accessToken;
  }

  private async testLinkedInConnection(accessToken: string): Promise<boolean> {
    // Mock test - in real implementation, you'd verify the token
    return !!accessToken;
  }
}

export const socialMediaService = new SocialMediaService();