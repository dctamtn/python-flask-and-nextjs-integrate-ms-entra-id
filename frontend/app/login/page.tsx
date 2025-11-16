'use client';

import { useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const searchParams = useSearchParams();

  // Get redirect URI from query parameters
  const redirectUri = searchParams.get('redirect');

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const redirect = redirectUri ? decodeURIComponent(redirectUri) : '/dashboard';
      console.log('🔄 Already authenticated, redirecting to:', redirect);
      window.location.href = redirect;
    }
  }, [isAuthenticated, isLoading, redirectUri]);

  // Auto-redirect to Azure Static Web Apps login
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const redirect = redirectUri || (typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/');
      console.log('🔐 Azure Static Web Apps: Redirecting to login');
      login(redirect);
    }
  }, [isLoading, isAuthenticated, login, redirectUri]);

  if (isAuthenticated) {
    return null;
  }

  const handleLogin = () => {
    const redirect = redirectUri || (typeof window !== 'undefined' ? window.location.pathname + window.location.search + window.location.hash : '/');
    login(redirect);
  };

  return (
    <div className="container">
      <div style={{ 
        maxWidth: '400px', 
        margin: '4rem auto',
        textAlign: 'center'
      }}>
        <div className="card">
          <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>Azure Static Web Apps Login</h1>
          
          <div style={{ marginBottom: '2rem' }}>
            <p style={{ color: '#666', marginBottom: '2rem' }}>
              Redirecting to Azure Active Directory login...
            </p>
            
            <button
              type="button"
              onClick={handleLogin}
              className="btn btn-primary"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#0078d4',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
                <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
                <rect x="0" y="12" width="11" height="11" fill="#00A4EF"/>
                <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
              </svg>
              Login with Azure AD
            </button>
          </div>

          {isLoading && (
            <div style={{ marginTop: '1rem', color: '#666', fontSize: '0.9rem' }}>
              <p>Checking authentication status...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

