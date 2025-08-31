import { useQuery } from "@tanstack/react-query";

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

export function useAuth() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me');
      if (!response.ok) {
        if (response.status === 401) {
          return null; // Not authenticated
        }
        throw new Error('Failed to check authentication');
      }
      const data = await response.json();
      return data.user as User;
    },
    retry: false,
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    error
  };
}