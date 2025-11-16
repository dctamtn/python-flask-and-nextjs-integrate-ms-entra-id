'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Azure Static Web Apps user interface
interface AzureUser {
  clientPrincipal: {
    identityProvider: string;
    userId: string;
    userDetails: string;
    userRoles: string[];
  } | null;
}

interface User {
  user_id: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (redirectUri?: string) => Promise<void>;
  logout: (redirectUri?: string) => Promise<void>;
  validateSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const validateSession = async () => {
    // Azure Static Web Apps: Check authentication via /.auth/me
    try {
      const response = await fetch('/.auth/me');
      
      if (response.ok) {
        const azureUser: AzureUser = await response.json();
        
        if (azureUser.clientPrincipal) {
          const principal = azureUser.clientPrincipal;
          const isAuth = principal.userRoles.includes('authenticated');
          
          if (isAuth) {
            // Extract email from userDetails (usually email or UPN)
            const userDetails = principal.userDetails;
            const email = userDetails.includes('@') ? userDetails : `${userDetails}@example.com`;
            
            const user: User = {
              user_id: principal.userId,
              username: principal.userDetails,
              email: email,
            };
            
            setUser(user);
            setIsAuthenticated(true);
            console.log('✅ Azure Static Web Apps: User authenticated', user);
          } else {
            setUser(null);
            setIsAuthenticated(false);
          }
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Azure Static Web Apps: Session validation error:', error);
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    validateSession();
    
    // Poll for authentication changes (Azure SWA redirects back after login)
    const interval = setInterval(() => {
      validateSession();
    }, 2000); // Check every 2 seconds
    
    return () => clearInterval(interval);
  }, []);

  const login = async (redirectUri?: string) => {
    // Azure Static Web Apps: Redirect to /.auth/login/aad
    const currentPath = redirectUri || (typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/');
    const loginUrl = `/.auth/login/aad?post_login_redirect_uri=${encodeURIComponent(currentPath)}`;
    console.log('🔐 Azure Static Web Apps: Redirecting to login:', loginUrl);
    
    if (typeof window !== 'undefined') {
      window.location.href = loginUrl;
    }
  };

  const logout = async (redirectUri?: string) => {
    // Azure Static Web Apps: Redirect to /.auth/logout
    const currentPath = redirectUri || (typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/');
    const logoutUrl = `/.auth/logout?post_logout_redirect_uri=${encodeURIComponent(currentPath)}`;
    console.log('🔐 Azure Static Web Apps: Redirecting to logout:', logoutUrl);
    
    if (typeof window !== 'undefined') {
      window.location.href = logoutUrl;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        validateSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

