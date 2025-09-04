import axios from 'axios';
import { storage } from './storage';

interface PostContent {
  title: string;
  description: string;
  platforms: string[];
  userId: string;
}

interface StoryContent {
  content: string;
  image?: string;
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
            result = await this.postToTwitter(content, account.accessToken || '');
            break;
          case 'facebook':
            result = await this.postToFacebook(content, account.accessToken || '');
            break;
          case 'instagram':
            result = await this.postToInstagram(content, account.accessToken || '');
            break;
          case 'linkedin':
            result = await this.postToLinkedIn(content, account.accessToken || '');
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

  async postStoryToMultiplePlatforms(storyContent: StoryContent): Promise<PostResult[]> {
    const results: PostResult[] = [];
    
    // Get user's social accounts
    const accounts = await storage.getSocialAccountsByUserId(storyContent.userId);
    const activeAccounts = accounts.filter(acc => 
      acc.isActive && 
      storyContent.platforms.includes(acc.platform) &&
      (acc.platform.toLowerCase() === 'instagram' || acc.platform.toLowerCase() === 'snapchat')
    );

    // Post story to each platform
    for (const account of activeAccounts) {
      try {
        let result: PostResult;
        
        switch (account.platform.toLowerCase()) {
          case 'instagram':
            result = await this.postInstagramStory(storyContent, account.accessToken);
            break;
          case 'snapchat':
            result = await this.postSnapchatStory(storyContent, account.accessToken);
            break;
          default:
            result = {
              platform: account.platform,
              success: false,
              error: 'Story posting not supported for this platform'
            };
        }
        
        results.push(result);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        results.push({
          platform: account.platform,
          success: false,
          error: errorMessage
        });
      }
    }
    
    return results;
  }

  private async postInstagramStory(content: StoryContent, accessToken: string | null): Promise<PostResult> {
    try {
      if (!accessToken) {
        return {
          platform: 'instagram',
          success: false,
          error: 'Instagram access token not configured'
        };
      }

      // Mock Instagram story post - in real implementation, use Instagram Basic Display API
      console.log('Posting Instagram story:', content.content);
      
      return {
        platform: 'instagram',
        success: true,
        postId: `instagram_story_${Date.now()}`
      };
      
    } catch (error) {
      return {
        platform: 'instagram',
        success: false,
        error: error instanceof Error ? error.message : 'Instagram story posting failed'
      };
    }
  }

  private async postSnapchatStory(content: StoryContent, accessToken: string | null): Promise<PostResult> {
    try {
      if (!accessToken) {
        return {
          platform: 'snapchat',
          success: false,
          error: 'Snapchat access token not configured'
        };
      }

      // Mock Snapchat story post - in real implementation, use Snapchat Snap Kit
      console.log('Posting Snapchat story:', content.content);
      
      return {
        platform: 'snapchat',
        success: true,
        postId: `snapchat_story_${Date.now()}`
      };
      
    } catch (error) {
      return {
        platform: 'snapchat',
        success: false,
        error: error instanceof Error ? error.message : 'Snapchat story posting failed'
      };
    }
  }

  private async postToTwitter(content: PostContent, accessToken: string): Promise<PostResult> {
    try {
      // For now, return a mock response since we don't have real API credentials
      // In a real implementation, you would use Twitter API v2
      
      if (!accessToken || !process.env.TWITTER_API_KEY) {
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
      if (!accessToken || !process.env.FACEBOOK_APP_ID) {
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
      if (!accessToken || !process.env.INSTAGRAM_ACCESS_TOKEN) {
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
      if (!accessToken || !process.env.LINKEDIN_CLIENT_ID) {
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

  // OAuth Methods
  getOAuthUrl(platform: string, userId: string): string | null {
    const baseUrl = process.env.REPLIT_URL || 'http://localhost:5000';
    const state = userId; // In production, use signed/encrypted state
    
    switch (platform.toLowerCase()) {
      case 'instagram':
        const instagramClientId = process.env.INSTAGRAM_CLIENT_ID;
        if (!instagramClientId) return null;
        
        return `https://api.instagram.com/oauth/authorize?` +
          `client_id=${instagramClientId}&` +
          `redirect_uri=${encodeURIComponent(baseUrl + '/api/oauth/instagram/callback')}&` +
          `scope=user_profile,user_media&` +
          `response_type=code&` +
          `state=${state}`;
          
      case 'snapchat':
        const snapchatClientId = process.env.SNAPCHAT_CLIENT_ID;
        if (!snapchatClientId) return null;
        
        return `https://accounts.snapchat.com/accounts/oauth2/auth?` +
          `client_id=${snapchatClientId}&` +
          `redirect_uri=${encodeURIComponent(baseUrl + '/api/oauth/snapchat/callback')}&` +
          `response_type=code&` +
          `scope=https://auth.snapchat.com/oauth2/api/user.external_id https://auth.snapchat.com/oauth2/api/user.display_name&` +
          `state=${state}`;
          
      case 'facebook':
        const facebookClientId = process.env.FACEBOOK_APP_ID;
        if (!facebookClientId) return null;
        
        return `https://www.facebook.com/v18.0/dialog/oauth?` +
          `client_id=${facebookClientId}&` +
          `redirect_uri=${encodeURIComponent(baseUrl + '/api/oauth/facebook/callback')}&` +
          `scope=pages_manage_posts,pages_read_engagement&` +
          `response_type=code&` +
          `state=${state}`;
          
      default:
        return null;
    }
  }

  async exchangeCodeForToken(platform: string, code: string): Promise<any> {
    try {
      const baseUrl = process.env.REPLIT_URL || 'http://localhost:5000';
      
      switch (platform.toLowerCase()) {
        case 'instagram':
          const instagramResponse = await axios.post('https://api.instagram.com/oauth/access_token', {
            client_id: process.env.INSTAGRAM_CLIENT_ID,
            client_secret: process.env.INSTAGRAM_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: baseUrl + '/api/oauth/instagram/callback',
            code
          });
          return instagramResponse.data;
          
        case 'snapchat':
          const snapchatResponse = await axios.post('https://accounts.snapchat.com/accounts/oauth2/token', {
            client_id: process.env.SNAPCHAT_CLIENT_ID,
            client_secret: process.env.SNAPCHAT_CLIENT_SECRET,
            grant_type: 'authorization_code',
            redirect_uri: baseUrl + '/api/oauth/snapchat/callback',
            code
          });
          return snapchatResponse.data;
          
        case 'facebook':
          const facebookResponse = await axios.get('https://graph.facebook.com/v18.0/oauth/access_token', {
            params: {
              client_id: process.env.FACEBOOK_APP_ID,
              client_secret: process.env.FACEBOOK_APP_SECRET,
              redirect_uri: baseUrl + '/api/oauth/facebook/callback',
              code
            }
          });
          return facebookResponse.data;
          
        default:
          return null;
      }
    } catch (error) {
      console.error(`Token exchange error for ${platform}:`, error);
      return null;
    }
  }

  async getUserProfile(platform: string, accessToken: string): Promise<any> {
    try {
      switch (platform.toLowerCase()) {
        case 'instagram':
          const instagramProfile = await axios.get('https://graph.instagram.com/me', {
            params: {
              fields: 'id,username',
              access_token: accessToken
            }
          });
          return instagramProfile.data;
          
        case 'snapchat':
          const snapchatProfile = await axios.get('https://kit.snapchat.com/v1/me', {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });
          return snapchatProfile.data.data;
          
        case 'facebook':
          const facebookProfile = await axios.get('https://graph.facebook.com/me', {
            params: {
              fields: 'id,name',
              access_token: accessToken
            }
          });
          return facebookProfile.data;
          
        default:
          return { username: 'unknown', name: 'Unknown User' };
      }
    } catch (error) {
      console.error(`Profile fetch error for ${platform}:`, error);
      return { username: 'unknown', name: 'Unknown User' };
    }
  }
}

export const socialMediaService = new SocialMediaService();