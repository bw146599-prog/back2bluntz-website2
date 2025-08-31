import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Bot, 
  Send, 
  Twitter, 
  Facebook, 
  Instagram, 
  Linkedin,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  Users,
  BarChart3
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

interface Post {
  id: string;
  title: string;
  description: string;
  platforms: string[];
  status: string;
  createdAt: string;
  telegramMessageId?: string;
}

interface PostForm {
  title: string;
  description: string;
  platforms: string[];
  userId: string;
}

const DEMO_USER_ID = "demo-user";

const platformIcons = {
  twitter: Twitter,
  facebook: Facebook,
  instagram: Instagram,
  linkedin: Linkedin,
};

export default function BotDashboard() {
  const [newPost, setNewPost] = useState<PostForm>({
    title: "",
    description: "",
    platforms: [],
    userId: DEMO_USER_ID
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch social accounts
  const { data: socialAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/social-accounts', DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/social-accounts/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      return response.json() as Promise<SocialAccount[]>;
    }
  });

  // Fetch posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['/api/posts', DEMO_USER_ID],
    queryFn: async () => {
      const response = await fetch(`/api/posts/${DEMO_USER_ID}`);
      if (!response.ok) throw new Error('Failed to fetch posts');
      return response.json() as Promise<Post[]>;
    }
  });

  // Create post mutation
  const createPostMutation = useMutation({
    mutationFn: async (postData: PostForm) => {
      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData)
      });
      if (!response.ok) throw new Error('Failed to create post');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/posts', DEMO_USER_ID] });
      setNewPost({ title: "", description: "", platforms: [], userId: DEMO_USER_ID });
      toast({ title: "Post created successfully!", description: "Your post has been shared across selected platforms." });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to create post", variant: "destructive" });
    }
  });

  // Add demo social accounts if none exist
  useEffect(() => {
    if (socialAccounts.length === 0 && !accountsLoading) {
      // Add demo accounts
      const demoAccounts = [
        { userId: DEMO_USER_ID, platform: "twitter", accountName: "demo_twitter", accessToken: "demo_token", isActive: true },
        { userId: DEMO_USER_ID, platform: "facebook", accountName: "demo_facebook", accessToken: "demo_token", isActive: true },
        { userId: DEMO_USER_ID, platform: "linkedin", accountName: "demo_linkedin", accessToken: "demo_token", isActive: true }
      ];

      demoAccounts.forEach(async (account) => {
        await fetch('/api/social-accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(account)
        });
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/social-accounts', DEMO_USER_ID] });
    }
  }, [socialAccounts.length, accountsLoading, queryClient]);

  const handleSubmitPost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.description || newPost.platforms.length === 0) {
      toast({ title: "Missing information", description: "Please fill in all fields and select at least one platform", variant: "destructive" });
      return;
    }
    createPostMutation.mutate(newPost);
  };

  const togglePlatform = (platform: string) => {
    setNewPost(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }));
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
        return <Badge className="bg-green-500"><CheckCircle2 className="w-3 h-3 mr-1" />Posted</Badge>;
      case 'failed':
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Failed</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getPlatformIcon = (platform: string) => {
    const Icon = platformIcons[platform as keyof typeof platformIcons];
    return Icon ? <Icon className="w-4 h-4" /> : null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-8 h-8 text-purple-400" />
            <h1 className="text-4xl font-bold text-white">Social Media Bot Dashboard</h1>
          </div>
          <p className="text-gray-300 text-lg">Manage your cross-platform social media posting bot</p>
        </div>

        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800 border-gray-700">
            <TabsTrigger value="create" className="data-[state=active]:bg-purple-600">
              <Send className="w-4 h-4 mr-2" />
              Create Post
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-purple-600">
              <BarChart3 className="w-4 h-4 mr-2" />
              Post History
            </TabsTrigger>
            <TabsTrigger value="accounts" className="data-[state=active]:bg-purple-600">
              <Users className="w-4 h-4 mr-2" />
              Accounts
            </TabsTrigger>
            <TabsTrigger value="telegram" className="data-[state=active]:bg-purple-600">
              <MessageSquare className="w-4 h-4 mr-2" />
              Telegram Bot
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Create New Post</CardTitle>
                <CardDescription className="text-gray-400">
                  Create a post that will be shared across your connected social media platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitPost} className="space-y-6">
                  <div>
                    <Label htmlFor="title" className="text-white">Post Title</Label>
                    <Input
                      id="title"
                      data-testid="input-post-title"
                      value={newPost.title}
                      onChange={(e) => setNewPost(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Enter your post title"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description" className="text-white">Description</Label>
                    <Textarea
                      id="description"
                      data-testid="input-post-description"
                      value={newPost.description}
                      onChange={(e) => setNewPost(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Enter your post description"
                      rows={4}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-white mb-3 block">Select Platforms</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {socialAccounts.map((account) => (
                        <div
                          key={account.id}
                          className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                            newPost.platforms.includes(account.platform)
                              ? 'bg-purple-600 border-purple-500'
                              : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                          }`}
                          onClick={() => togglePlatform(account.platform)}
                          data-testid={`platform-${account.platform}`}
                        >
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(account.platform)}
                            <span className="text-white capitalize">{account.platform}</span>
                          </div>
                          <div className="text-sm text-gray-400 mt-1">@{account.accountName}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    disabled={createPostMutation.isPending}
                    className="w-full bg-purple-600 hover:bg-purple-700"
                    data-testid="button-create-post"
                  >
                    {createPostMutation.isPending ? 'Creating Post...' : 'Create & Publish Post'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Post History</CardTitle>
                <CardDescription className="text-gray-400">
                  View your recent posts and their status across platforms
                </CardDescription>
              </CardHeader>
              <CardContent>
                {postsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading posts...</div>
                ) : posts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    No posts yet. Create your first post!
                  </div>
                ) : (
                  <div className="space-y-4">
                    {posts.map((post) => (
                      <div
                        key={post.id}
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                        data-testid={`post-${post.id}`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-white font-semibold">{post.title}</h3>
                          {getStatusBadge(post.status)}
                        </div>
                        <p className="text-gray-300 mb-3">{post.description}</p>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm text-gray-400">Platforms:</span>
                          {post.platforms.map((platform) => (
                            <div key={platform} className="flex items-center gap-1">
                              {getPlatformIcon(platform)}
                              <span className="text-sm text-gray-300 capitalize">{platform}</span>
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-gray-400">
                          Created: {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounts">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Connected Accounts</CardTitle>
                <CardDescription className="text-gray-400">
                  Manage your connected social media accounts
                </CardDescription>
              </CardHeader>
              <CardContent>
                {accountsLoading ? (
                  <div className="text-center py-8 text-gray-400">Loading accounts...</div>
                ) : (
                  <div className="grid gap-4 md:grid-cols-2">
                    {socialAccounts.map((account) => (
                      <div
                        key={account.id}
                        className="p-4 bg-gray-700 rounded-lg border border-gray-600"
                        data-testid={`account-${account.platform}`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {getPlatformIcon(account.platform)}
                            <span className="text-white font-semibold capitalize">{account.platform}</span>
                          </div>
                          <Switch checked={account.isActive} />
                        </div>
                        <div className="text-gray-300">@{account.accountName}</div>
                        <div className="text-sm text-gray-400 mt-1">
                          Connected: {new Date(account.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="telegram">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Telegram Bot Instructions</CardTitle>
                <CardDescription className="text-gray-400">
                  How to use your Telegram bot for cross-platform posting
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">🤖 Bot Commands</h3>
                  <div className="space-y-2 text-gray-300">
                    <div><code className="bg-gray-600 px-2 py-1 rounded">/start</code> - Initialize the bot</div>
                    <div><code className="bg-gray-600 px-2 py-1 rounded">/post</code> - Create a new post</div>
                    <div><code className="bg-gray-600 px-2 py-1 rounded">/accounts</code> - View connected accounts</div>
                    <div><code className="bg-gray-600 px-2 py-1 rounded">/history</code> - View posting history</div>
                    <div><code className="bg-gray-600 px-2 py-1 rounded">/help</code> - Show help message</div>
                  </div>
                </div>

                <div className="bg-gray-700 p-4 rounded-lg">
                  <h3 className="text-white font-semibold mb-2">📝 Post Format</h3>
                  <div className="text-gray-300">
                    <p className="mb-2">When using /post, format your message like this:</p>
                    <pre className="bg-gray-600 p-3 rounded text-sm overflow-x-auto">
{`Title: Your amazing post title
Description: Your detailed post description with hashtags #example #social
Platforms: twitter, facebook, linkedin`}
                    </pre>
                  </div>
                </div>

                <div className="bg-green-900 border border-green-700 p-4 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 className="w-5 h-5 text-green-400" />
                    <span className="text-green-400 font-semibold">Bot Status: Active</span>
                  </div>
                  <p className="text-green-300">Your Telegram bot is running and ready to receive commands!</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}