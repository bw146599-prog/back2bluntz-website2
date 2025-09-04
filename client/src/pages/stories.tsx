import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { 
  Camera, 
  Instagram, 
  Upload, 
  Send,
  CheckCircle2,
  XCircle
} from "lucide-react";

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

export default function Stories() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [storyContent, setStoryContent] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch social accounts for Instagram and Snapchat only
  const { data: socialAccounts = [], isLoading: accountsLoading } = useQuery({
    queryKey: ['/api/social-accounts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const response = await fetch(`/api/social-accounts/${user.id}`);
      if (!response.ok) throw new Error('Failed to fetch accounts');
      const accounts = await response.json() as SocialAccount[];
      // Filter for only Instagram and Snapchat
      return accounts.filter(account => 
        ['instagram', 'snapchat'].includes(account.platform.toLowerCase())
      );
    },
    enabled: !!user?.id
  });

  // Story posting mutation
  const postStoryMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch('/api/stories/post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          userId: user?.id
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to post story');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Story posted!", 
        description: "Your story has been shared to Instagram and Snapchat." 
      });
      setStoryContent("");
      setSelectedFile(null);
      setPreviewUrl(null);
    },
    onError: (error) => {
      toast({ 
        title: "Failed to post story", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handlePostStory = () => {
    if (!storyContent.trim() && !selectedFile) {
      toast({ 
        title: "Content required", 
        description: "Please add text or upload an image/video", 
        variant: "destructive" 
      });
      return;
    }
    
    postStoryMutation.mutate(storyContent);
  };

  const connectedPlatforms = socialAccounts.filter(account => account.isActive);
  const hasInstagram = connectedPlatforms.some(account => account.platform === 'instagram');
  const hasSnapchat = connectedPlatforms.some(account => account.platform === 'snapchat');

  if (accountsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Camera className="w-10 h-10" />
            ELEVATION Stories
          </h1>
          <p className="text-gray-300">Post to Instagram and Snapchat stories simultaneously</p>
        </div>

        {/* Connection Status */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Connected Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasInstagram ? 'bg-green-600' : 'bg-gray-600'}`}>
                <Instagram className="w-5 h-5 text-white" />
                <span className="text-white text-sm">
                  Instagram {hasInstagram ? '✓' : '✗'}
                </span>
              </div>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${hasSnapchat ? 'bg-green-600' : 'bg-gray-600'}`}>
                <Camera className="w-5 h-5 text-white" />
                <span className="text-white text-sm">
                  Snapchat {hasSnapchat ? '✓' : '✗'}
                </span>
              </div>
            </div>
            
            {(!hasInstagram || !hasSnapchat) && (
              <div className="mt-4 p-3 bg-yellow-600 rounded-lg">
                <p className="text-white text-sm">
                  Some accounts are not connected. <a href="/social-accounts" className="underline">Connect accounts</a> to post stories.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Story Posting Form */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Send className="w-5 h-5" />
              Create Story
            </CardTitle>
            <CardDescription className="text-gray-400">
              Add content to share on your Instagram and Snapchat stories
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div>
              <Label htmlFor="story-file" className="text-white mb-2 block">Upload Image or Video</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                <input
                  id="story-file"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  data-testid="input-story-file"
                />
                
                {previewUrl ? (
                  <div className="space-y-3">
                    {selectedFile?.type.startsWith('image/') ? (
                      <img 
                        src={previewUrl} 
                        alt="Preview" 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                    ) : (
                      <video 
                        src={previewUrl} 
                        controls 
                        className="max-h-64 mx-auto rounded-lg"
                      />
                    )}
                    <Button
                      variant="outline"
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                      data-testid="button-remove-file"
                    >
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                    <div>
                      <Label htmlFor="story-file" className="cursor-pointer">
                        <span className="text-purple-400 hover:text-purple-300">
                          Click to upload
                        </span>
                        <span className="text-gray-400"> or drag and drop</span>
                      </Label>
                      <p className="text-sm text-gray-500 mt-1">
                        PNG, JPG, MP4 up to 50MB
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Text Content */}
            <div>
              <Label htmlFor="story-text" className="text-white mb-2 block">Story Text (Optional)</Label>
              <Textarea
                id="story-text"
                value={storyContent}
                onChange={(e) => setStoryContent(e.target.value)}
                placeholder="Add text to your story..."
                className="bg-gray-700 border-gray-600 text-white resize-none"
                rows={4}
                data-testid="textarea-story-content"
              />
              <p className="text-sm text-gray-500 mt-1">
                {storyContent.length}/500 characters
              </p>
            </div>

            {/* Post Button */}
            <Button
              onClick={handlePostStory}
              disabled={postStoryMutation.isPending || (!hasInstagram && !hasSnapchat)}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3"
              data-testid="button-post-story"
            >
              {postStoryMutation.isPending ? (
                "Posting Story..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post to Stories
                </>
              )}
            </Button>
            
            {(!hasInstagram && !hasSnapchat) && (
              <p className="text-sm text-red-400 text-center">
                Please connect your Instagram and Snapchat accounts to post stories
              </p>
            )}
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <a 
            href="/social-accounts" 
            className="text-purple-400 hover:text-purple-300"
            data-testid="link-manage-accounts"
          >
            Manage Connected Accounts →
          </a>
        </div>
      </div>
    </div>
  );
}