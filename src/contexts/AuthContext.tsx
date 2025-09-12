'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { signIn, signOut, useSession } from 'next-auth/react';

interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  googleAuth: () => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

const STORAGE_KEY = 'health_tracker_auth';

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { data: session, status } = useSession();

  // Handle NextAuth session changes
  useEffect(() => {
    if (status === 'loading') {
      return;
    }

    if (session?.user) {
      // Convert NextAuth session to our User format
      const userData: User = {
        id: session.user.email || 'google_user',
        email: session.user.email || '',
        name: session.user.name || 'Google User',
        createdAt: new Date().toISOString()
      };
      setUser(userData);
      saveUser(userData);
      setIsLoading(false);
    } else {
      // No NextAuth session, check localStorage for regular login
      const loadUser = () => {
        try {
          const stored = localStorage.getItem(STORAGE_KEY);
          if (stored) {
            const userData = JSON.parse(stored);
            setUser(userData);
          } else {
            setUser(null);
          }
        } catch (error) {
          console.error('Error loading user data:', error);
          localStorage.removeItem(STORAGE_KEY);
          setUser(null);
        } finally {
          setIsLoading(false);
        }
      };

      // Add demo user if it doesn't exist
      const initializeDemoUser = () => {
        try {
          const storedUsers = localStorage.getItem('health_tracker_users');
          const users = storedUsers ? JSON.parse(storedUsers) : [];
          
          const demoExists = users.find((u: any) => u.email === 'demo@healthtracker.com');
          if (!demoExists) {
            const demoUser = {
              id: 'demo_user_123',
              name: 'Demo User',
              email: 'demo@healthtracker.com',
              password: 'demo123',
              createdAt: '2024-01-01T00:00:00.000Z'
            };
            users.push(demoUser);
            localStorage.setItem('health_tracker_users', JSON.stringify(users));
          }
        } catch (error) {
          console.error('Error initializing demo user:', error);
        }
      };

      initializeDemoUser();
      loadUser();
    }
  }, [session, status]);

  const saveUser = (userData: User) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = localStorage.getItem('health_tracker_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Find user with matching email and password
      const foundUser = users.find((u: any) => u.email === email && u.password === password);
      
      if (foundUser) {
        const userData: User = {
          id: foundUser.id,
          email: foundUser.email,
          name: foundUser.name,
          createdAt: foundUser.createdAt
        };
        
        saveUser(userData);
        setIsLoading(false);
        return { success: true };
      } else {
        setIsLoading(false);
        return { success: false, error: 'Invalid email or password' };
      }
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Login failed. Please try again.' };
    }
  };

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get stored users
      const storedUsers = localStorage.getItem('health_tracker_users');
      const users = storedUsers ? JSON.parse(storedUsers) : [];
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        setIsLoading(false);
        return { success: false, error: 'User with this email already exists' };
      }
      
      // Create new user
      const newUser = {
        id: `user_${Date.now()}`,
        name,
        email,
        password, // In a real app, this would be hashed
        createdAt: new Date().toISOString()
      };
      
      // Save to users list
      users.push(newUser);
      localStorage.setItem('health_tracker_users', JSON.stringify(users));
      
      // Save current user session and set as logged in
      const userData: User = {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        createdAt: newUser.createdAt
      };
      
      setUser(userData);
      saveUser(userData);
      setIsLoading(false);
      return { success: true };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Signup failed. Please try again.' };
    }
  };

  const googleAuth = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const result = await signIn('google', { redirect: false });
      if (result?.error) {
        return { success: false, error: result.error };
      }
      return { success: true };
    } catch (error) {
      return { success: false, error: 'Google authentication failed. Please try again.' };
    }
  };

  const logout = async () => {
    if (session) {
      await signOut({ redirect: false });
    }
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    login,
    signup,
    googleAuth,
    logout,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
