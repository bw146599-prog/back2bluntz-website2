import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Music, ExternalLink, Plus, Settings, CheckCircle, XCircle, Camera, Twitter, Facebook, Linkedin } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SocialAccount {
  id: string;
  platform: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

interface AddAccountForm {
  platform: string;
  accountName: string;
  accessToken: string;
}

export default function SocialAccounts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [addForm, setAddForm] = useState<AddAccountForm>({
    platform: "",
    accountName: "",
    accessToken: ""
  });
  
  const [isConnecting, setIsConnecting] = useState(false);

  // Fetch social accounts
  const { data: accounts = [], isLoading } = useQuery({
    queryKey: ['/api/social-accounts', user?.id],
    enabled: !!user?.id,
  });

  // Add account mutation
  const addAccountMutation = useMutation({
    mutationFn: async (formData: AddAccountForm) => {
      const response = await fetch('/api/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          platform: formData.platform,
          accountName: formData.accountName,
          accessToken: formData.accessToken
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add account');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Account added!", description: "Your social media account has been connected." });
      setShowAddDialog(false);
      setAddForm({ platform: "", accountName: "", accessToken: "" });
      queryClient.invalidateQueries({ queryKey: ['/api/social-accounts'] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to add account", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Toggle account status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const response = await fetch(`/api/social-accounts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update account');
      }
      
      return response.json();
    },
    onSuccess: (_, { isActive }) => {
      toast({ 
        title: isActive ? "Account activated" : "Account deactivated",
        description: `Account is now ${isActive ? "active" : "inactive"}.`
      });
      queryClient.invalidateQueries({ queryKey: ['/api/social-accounts'] });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to update account", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'snapchat': return <Camera className="w-5 h-5" />;
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'snapchat': return 'bg-yellow-500';
      case 'youtube': return 'bg-red-600';
      case 'tiktok': return 'bg-black';
      case 'twitter': return 'bg-blue-500';
      case 'facebook': return 'bg-blue-600';
      case 'linkedin': return 'bg-blue-700';
      default: return 'bg-gray-600';
    }
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addForm.platform || !addForm.accountName) {
      toast({ title: "Missing fields", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    addAccountMutation.mutate(addForm);
  };
  
  const handleOAuthConnect = async (platform: string) => {
    try {
      setIsConnecting(true);
      const response = await fetch(`/api/oauth/${platform}/auth`);
      const data = await response.json();
      
      if (data.authUrl) {
        // Open OAuth URL in new window
        window.open(data.authUrl, '_blank', 'width=600,height=700');
        
        // Listen for successful authentication
        const handleMessage = (event: MessageEvent) => {
          if (event.origin !== window.location.origin) return;
          
          if (event.data.type === 'oauth-success') {
            toast({ title: "Account connected!", description: `Your ${platform} account has been successfully connected.` });
            queryClient.invalidateQueries({ queryKey: ['/api/social-accounts'] });
            setShowAddDialog(false);
            window.removeEventListener('message', handleMessage);
          } else if (event.data.type === 'oauth-error') {
            toast({ title: "Connection failed", description: event.data.message || "Failed to connect account", variant: "destructive" });
          }
          
          setIsConnecting(false);
        };
        
        window.addEventListener('message', handleMessage);
        
        // Clean up listener after 5 minutes
        setTimeout(() => {
          window.removeEventListener('message', handleMessage);
          setIsConnecting(false);
        }, 300000);
      } else {
        throw new Error('Failed to get authorization URL');
      }
    } catch (error) {
      toast({ title: "Connection failed", description: "Failed to initialize OAuth flow", variant: "destructive" });
      setIsConnecting(false);
    }
  };
  
  const supportsOAuth = (platform: string) => {
    return ['instagram', 'snapchat', 'facebook'].includes(platform.toLowerCase());
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading accounts...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Social Media Accounts</h1>
          <p className="text-gray-300">Connect your social media accounts to start posting across platforms</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {(accounts as SocialAccount[]).map((account: SocialAccount) => (
            <Card key={account.id} className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${getPlatformColor(account.platform)}`}>
                      {getPlatformIcon(account.platform)}
                    </div>
                    <div>
                      <CardTitle className="text-white capitalize">{account.platform}</CardTitle>
                      <CardDescription className="text-gray-400">@{account.accountName}</CardDescription>
                    </div>
                  </div>
                  <Badge 
                    variant={account.isActive ? "default" : "secondary"}
                    className={account.isActive ? "bg-green-600" : "bg-gray-600"}
                  >
                    {account.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    {account.isActive ? (
                      <><CheckCircle className="w-4 h-4 text-green-500" /> Connected</>
                    ) : (
                      <><XCircle className="w-4 h-4 text-red-500" /> Disconnected</>
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatusMutation.mutate({ 
                      id: account.id, 
                      isActive: !account.isActive 
                    })}
                    disabled={toggleStatusMutation.isPending}
                    data-testid={`button-toggle-${account.platform}`}
                  >
                    {account.isActive ? "Deactivate" : "Activate"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Add Account Card */}
          <Card className="bg-gray-800 border-gray-700 border-dashed">
            <CardContent className="flex items-center justify-center h-full min-h-[200px]">
              <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2" data-testid="button-add-account">
                    <Plus className="w-4 h-4" />
                    Add Account
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add Social Media Account</DialogTitle>
                    <DialogDescription className="text-gray-400">
                      Connect a new social media account to start posting
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-4">Connect with OAuth (Recommended)</h3>
                      <div className="grid gap-3">
                        <Button
                          onClick={() => handleOAuthConnect('instagram')}
                          disabled={isConnecting}
                          className="flex items-center justify-center gap-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                          data-testid="button-connect-instagram"
                        >
                          <Instagram className="w-5 h-5" />
                          {isConnecting ? 'Connecting...' : 'Connect Instagram'}
                        </Button>
                        
                        <Button
                          onClick={() => handleOAuthConnect('snapchat')}
                          disabled={isConnecting}
                          className="flex items-center justify-center gap-3 bg-yellow-500 hover:bg-yellow-600 text-black"
                          data-testid="button-connect-snapchat"
                        >
                          <Camera className="w-5 h-5" />
                          {isConnecting ? 'Connecting...' : 'Connect Snapchat'}
                        </Button>
                        
                        <Button
                          onClick={() => handleOAuthConnect('facebook')}
                          disabled={isConnecting}
                          className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white"
                          data-testid="button-connect-facebook"
                        >
                          <Facebook className="w-5 h-5" />
                          {isConnecting ? 'Connecting...' : 'Connect Facebook'}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-600 pt-6">
                      <h3 className="text-lg font-semibold text-white mb-4">Manual Setup (Advanced)</h3>
                      <form onSubmit={handleAddAccount} className="space-y-4">
                        <div>
                          <Label htmlFor="platform" className="text-white">Platform</Label>
                          <Select 
                            value={addForm.platform} 
                            onValueChange={(value) => setAddForm(prev => ({ ...prev, platform: value }))}
                          >
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Choose a platform" />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="twitter">Twitter</SelectItem>
                              <SelectItem value="linkedin">LinkedIn</SelectItem>
                              <SelectItem value="tiktok">TikTok</SelectItem>
                              <SelectItem value="youtube">YouTube</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="account-name" className="text-white">Account Username</Label>
                          <Input
                            id="account-name"
                            data-testid="input-account-name"
                            type="text"
                            value={addForm.accountName}
                            onChange={(e) => setAddForm(prev => ({ ...prev, accountName: e.target.value }))}
                            placeholder="e.g., b2bluntz"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="access-token" className="text-white">Access Token</Label>
                          <Input
                            id="access-token"
                            data-testid="input-access-token"
                            type="password"
                            value={addForm.accessToken}
                            onChange={(e) => setAddForm(prev => ({ ...prev, accessToken: e.target.value }))}
                            placeholder="Enter API access token"
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            You'll need to obtain this from the platform's developer portal
                          </p>
                        </div>

                        <div className="flex gap-3 pt-4">
                          <Button
                            type="submit"
                            disabled={addAccountMutation.isPending}
                            className="flex-1 bg-purple-600 hover:bg-purple-700"
                            data-testid="button-save-account"
                          >
                            {addAccountMutation.isPending ? 'Adding...' : 'Add Account'}
                          </Button>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setShowAddDialog(false)}
                            data-testid="button-cancel-account"
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <a 
            href="/bot" 
            className="text-purple-400 hover:text-purple-300"
            data-testid="link-back-dashboard"
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}