'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [provider, setProvider] = useState('default');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const { login, isAuthenticated, validateSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Check for OAuth callback parameters
  useEffect(() => {
    const success = searchParams.get('success');
    const sessionToken = searchParams.get('session_token');
    const errorParam = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (success === 'true' && sessionToken) {
      // Store session token and validate session
      if (typeof window !== 'undefined') {
        localStorage.setItem('session_token', sessionToken);
        validateSession().then(() => {
          router.push('/dashboard');
        });
      }
    } else if (errorParam) {
      setError(errorDescription || 'Authentication failed. Please try again.');
    }
  }, [searchParams, router, validateSession]);

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(username, password, provider);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicrosoftLogin = async () => {
    setError('');
    setIsMicrosoftLoading(true);

    try {
      await authAPI.loginWithMicrosoft();
      // User will be redirected to Microsoft login page
    } catch (err: any) {
      setError(err.message || 'Failed to initiate Microsoft login. Please try again.');
      setIsMicrosoftLoading(false);
    }
  };

  return (
    <div className="container">
      <div style={{ maxWidth: '400px', margin: '4rem auto' }}>
        <div className="card">
          <h1 style={{ marginBottom: '2rem', textAlign: 'center' }}>SSO Login</h1>
          
          {/* Microsoft OAuth Login Button */}
          <div style={{ marginBottom: '2rem' }}>
            <button
              type="button"
              onClick={handleMicrosoftLogin}
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
                cursor: isMicrosoftLoading ? 'not-allowed' : 'pointer',
                opacity: isMicrosoftLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
              disabled={isMicrosoftLoading}
            >
              {isMicrosoftLoading ? (
                <>Loading...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0" y="0" width="11" height="11" fill="#F25022"/>
                    <rect x="12" y="0" width="11" height="11" fill="#7FBA00"/>
                    <rect x="0" y="12" width="11" height="11" fill="#00A4EF"/>
                    <rect x="12" y="12" width="11" height="11" fill="#FFB900"/>
                  </svg>
                  Login with Microsoft
                </>
              )}
            </button>
          </div>

          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            marginBottom: '1.5rem',
            gap: '1rem'
          }}>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
            <span style={{ color: '#666', fontSize: '0.9rem' }}>OR</span>
            <div style={{ flex: 1, height: '1px', backgroundColor: '#ccc' }}></div>
          </div>

          {/* Username/Password Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="provider">Provider</label>
              <select
                id="provider"
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '1rem',
                }}
              >
                <option value="default">Default</option>
                <option value="microsoft">Microsoft (Demo)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="Enter your username"
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
              />
            </div>

            {error && <div className="error">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '1rem' }}
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.9rem', color: '#666' }}>
            <p>Demo: Use any username/password for testing</p>
          </div>
        </div>
      </div>
    </div>
  );
}

