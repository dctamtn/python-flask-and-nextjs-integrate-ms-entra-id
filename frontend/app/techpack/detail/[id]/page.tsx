'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

/**
 * Techpack Detail Page
 * 
 * Displays details for a specific techpack item.
 * 
 * Route: /techpack/detail/[id]
 * Example: /techpack/detail/314227
 * 
 * Supports hash fragments (e.g., /techpack/detail/314227#ai)
 */
export default function TechpackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [techpackId, setTechpackId] = useState<string | null>(null);
  const [hashFragment, setHashFragment] = useState<string>('');

  useEffect(() => {
    // Get the ID from URL params
    const id = params?.id as string;
    if (id) {
      setTechpackId(id);
      console.log('🔹 Techpack Detail Page - ID:', id);
    }

    // Get hash fragment from URL
    if (typeof window !== 'undefined') {
      const hash = window.location.hash;
      if (hash) {
        setHashFragment(hash);
        console.log('🔖 Hash fragment:', hash);
      }
    }
  }, [params]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const currentUrl = window.location.pathname + window.location.search + window.location.hash;
      router.push(`/login?redirect=${encodeURIComponent(currentUrl)}`);
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '1rem' }}>Techpack Detail</h1>
        
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem' }}>Techpack Information</h2>
          <div>
            <p><strong>Techpack ID:</strong> {techpackId || 'Loading...'}</p>
            {hashFragment && (
              <p><strong>Hash Fragment:</strong> <code>{hashFragment}</code></p>
            )}
            <p><strong>Full URL:</strong> <code>{typeof window !== 'undefined' ? window.location.href : ''}</code></p>
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Page Content</h2>
          <p>This is a placeholder page for techpack detail view.</p>
          <p>Techpack ID: <strong>{techpackId}</strong></p>
          
          {hashFragment === '#ai' && (
            <div style={{ 
              marginTop: '2rem', 
              padding: '1rem', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '4px' 
            }}>
              <h3>AI Section</h3>
              <p>This section is visible because the hash fragment is <code>#ai</code></p>
              <p>You can use this to show different content based on the hash fragment.</p>
            </div>
          )}

          <div style={{ marginTop: '2rem' }}>
            <h3>Test Hash Fragments</h3>
            <p>Try these URLs to test different hash fragments:</p>
            <ul>
              <li><a href={`/techpack/detail/${techpackId}#ai`}>With #ai</a></li>
              <li><a href={`/techpack/detail/${techpackId}#section1`}>With #section1</a></li>
              <li><a href={`/techpack/detail/${techpackId}`}>Without hash</a></li>
            </ul>
          </div>
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button 
            onClick={() => router.push('/dashboard')}
            className="btn btn-secondary"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

