import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Instagram, Youtube, Music, ExternalLink, Plus, Settings, CheckCircle, XCircle } from "lucide-react";
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
      case 'youtube': return <Youtube className="w-5 h-5" />;
      case 'tiktok': return <Music className="w-5 h-5" />;
      default: return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'youtube': return 'bg-red-600';
      case 'tiktok': return 'bg-black';
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
                          <SelectItem value="instagram">Instagram</SelectItem>
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
                      <Label htmlFor="access-token" className="text-white">Access Token (Optional)</Label>
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
                        Leave empty to configure later in settings
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