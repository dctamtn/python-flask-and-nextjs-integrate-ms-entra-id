'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Logout Page (Alternative route: /auth/logout)
 * 
 * Handles logout redirects with post_logout_redirect_uri parameter.
 * 
 * Usage: /auth/logout?post_logout_redirect_uri=/path/to/redirect#hash
 * 
 * This page:
 * 1. Extracts the post_logout_redirect_uri parameter
 * 2. Performs logout (clears session)
 * 3. Redirects to the specified URI (preserving hash fragments)
 */
export default function LogoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { logout } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🔹 LOGOUT PAGE RUNNING');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      
      // Get the redirect URI from query parameters
      const redirectUri = searchParams.get('post_logout_redirect_uri');
      console.log('📍 Redirect URI:', redirectUri || '(none)');
      
      if (redirectUri) {
        try {
          // Decode the redirect URI (it's URL encoded)
          const decodedUri = decodeURIComponent(redirectUri);
          console.log('🔗 Decoded redirect URI:', decodedUri);
          
          // Redirect to login page with the redirect URI as a query parameter
          // This preserves the hash fragment through the login flow
          const loginUrl = `/login?redirect=${encodeURIComponent(decodedUri)}`;
          console.log('⏳ Redirecting to Azure SWA logout, then to login:', loginUrl);
          console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
          
          // Azure Static Web Apps: Perform logout and redirect to login
          // The logout function will redirect to /.auth/logout, which will then redirect back
          // We pass the login URL as the post_logout_redirect_uri
          await logout(loginUrl);
        } catch (error) {
          console.error('❌ Logout error:', error);
          // Even if logout fails, redirect to login with redirect URI
          const decodedUri = decodeURIComponent(redirectUri);
          const loginUrl = `/login?redirect=${encodeURIComponent(decodedUri)}`;
          window.location.href = loginUrl;
        }
      } else {
        console.log('⚠️ No redirect URI provided, redirecting to Azure SWA logout');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        // No redirect URI, just logout and redirect to login
        await logout('/login');
      }
    };

    performLogout();
  }, [searchParams, router, logout]);

  // Show loading state while processing
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column',
      gap: '1rem'
    }}>
      <div>Logging out...</div>
      <div style={{ fontSize: '0.875rem', color: '#666' }}>
        Redirecting...
      </div>
    </div>
  );
}

