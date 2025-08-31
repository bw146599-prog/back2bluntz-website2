import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Shield, Bot, Eye, EyeOff } from "lucide-react";
import { useLocation } from "wouter";

interface LoginForm {
  username: string;
  password: string;
}

interface SetupForm extends LoginForm {
  confirmPassword: string;
}

export default function Login() {
  const [, setLocation] = useLocation();
  const [loginForm, setLoginForm] = useState<LoginForm>({ username: "", password: "" });
  const [setupForm, setSetupForm] = useState<SetupForm>({ username: "", password: "", confirmPassword: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSetupMode, setIsSetupMode] = useState(false);
  const { toast } = useToast();

  // Check if setup is needed
  const checkSetupMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'test', password: 'test' })
      });
      return response;
    },
    onSuccess: (response) => {
      if (response.status === 403) {
        setIsSetupMode(false); // Admin already exists
      } else {
        setIsSetupMode(true); // No admin exists yet
      }
    },
    onError: () => {
      setIsSetupMode(false);
    }
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (formData: LoginForm) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Login failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ title: "Login successful!", description: "Welcome to the dashboard." });
      setLocation('/bot');
    },
    onError: (error) => {
      toast({ 
        title: "Login failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  // Setup mutation
  const setupMutation = useMutation({
    mutationFn: async (formData: SetupForm) => {
      if (formData.password !== formData.confirmPassword) {
        throw new Error('Passwords do not match');
      }
      
      const response = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Setup failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({ 
        title: "Admin created successfully!", 
        description: "You can now log in with your credentials." 
      });
      setIsSetupMode(false);
      setSetupForm({ username: "", password: "", confirmPassword: "" });
    },
    onError: (error) => {
      toast({ 
        title: "Setup failed", 
        description: error.message, 
        variant: "destructive" 
      });
    }
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginForm.username || !loginForm.password) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    loginMutation.mutate(loginForm);
  };

  const handleSetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!setupForm.username || !setupForm.password || !setupForm.confirmPassword) {
      toast({ title: "Missing fields", description: "Please fill in all fields", variant: "destructive" });
      return;
    }
    setupMutation.mutate(setupForm);
  };

  // Check setup status on component mount
  useState(() => {
    checkSetupMutation.mutate();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Bot className="w-8 h-8 text-purple-400" />
            <h1 className="text-3xl font-bold text-white">Social Media Bot</h1>
          </div>
          <p className="text-gray-300">
            {isSetupMode ? "Set up your admin account" : "Admin Login Required"}
          </p>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              {isSetupMode ? "Admin Setup" : "Admin Login"}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {isSetupMode 
                ? "Create your admin account to secure the dashboard" 
                : "Enter your admin credentials to access the dashboard"
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSetupMode ? (
              <form onSubmit={handleSetup} className="space-y-4">
                <div>
                  <Label htmlFor="setup-username" className="text-white">Username</Label>
                  <Input
                    id="setup-username"
                    data-testid="input-setup-username"
                    type="text"
                    value={setupForm.username}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Choose an admin username"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="setup-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="setup-password"
                      data-testid="input-setup-password"
                      type={showPassword ? "text" : "password"}
                      value={setupForm.password}
                      onChange={(e) => setSetupForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Choose a strong password (min 6 chars)"
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="setup-confirm-password" className="text-white">Confirm Password</Label>
                  <Input
                    id="setup-confirm-password"
                    data-testid="input-setup-confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={setupForm.confirmPassword}
                    onChange={(e) => setSetupForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm your password"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={setupMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-setup-admin"
                >
                  {setupMutation.isPending ? 'Creating Admin...' : 'Create Admin Account'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <Label htmlFor="login-username" className="text-white">Username</Label>
                  <Input
                    id="login-username"
                    data-testid="input-login-username"
                    type="text"
                    value={loginForm.username}
                    onChange={(e) => setLoginForm(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter your username"
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label htmlFor="login-password" className="text-white">Password</Label>
                  <div className="relative">
                    <Input
                      id="login-password"
                      data-testid="input-login-password"
                      type={showPassword ? "text" : "password"}
                      value={loginForm.password}
                      onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Enter your password"
                      className="bg-gray-700 border-gray-600 text-white pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loginMutation.isPending}
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  data-testid="button-login"
                >
                  {loginMutation.isPending ? 'Logging in...' : 'Login'}
                </Button>
              </form>
            )}

            {!isSetupMode && (
              <div className="mt-4 text-center">
                <Button
                  variant="link"
                  onClick={() => setIsSetupMode(true)}
                  className="text-purple-400 hover:text-purple-300"
                  data-testid="button-switch-to-setup"
                >
                  First time? Set up admin account
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <a 
            href="/" 
            className="text-purple-400 hover:text-purple-300 text-sm"
            data-testid="link-back-home"
          >
            ← Back to Home
          </a>
        </div>
      </div>
    </div>
  );
}