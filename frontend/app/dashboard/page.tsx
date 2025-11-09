'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { userAPI, healthAPI } from '@/lib/api';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [healthStatus, setHealthStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, isLoading, router]);

  const fetchData = async () => {
    try {
      const [profileData, healthData] = await Promise.all([
        userAPI.getProfile().catch(() => null),
        healthAPI.check().catch(() => null),
      ]);
      setProfile(profileData);
      setHealthStatus(healthData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  if (isLoading || loading) {
    return (
      <div className="container">
        <div style={{ textAlign: 'center', padding: '2rem' }}>Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="container">
      <nav className="navbar" style={{ marginBottom: '2rem' }}>
        <div>
          <Link href="/dashboard" style={{ fontWeight: 'bold' }}>
            Flask SSO Demo
          </Link>
        </div>
        <div className="user-info">
          <span>{user?.username || user?.email}</span>
          <button onClick={handleLogout} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
            Logout
          </button>
        </div>
      </nav>

      <h1 style={{ marginBottom: '2rem' }}>Dashboard</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>User Information</h2>
          {user && (
            <div>
              <p><strong>User ID:</strong> {user.user_id}</p>
              <p><strong>Username:</strong> {user.username}</p>
              <p><strong>Email:</strong> {user.email}</p>
            </div>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Profile API</h2>
          {profile ? (
            <div>
              <p><strong>User ID:</strong> {profile.user_id}</p>
              <p><strong>Username:</strong> {profile.username}</p>
              <p><strong>Email:</strong> {profile.email}</p>
            </div>
          ) : (
            <p className="error">Failed to fetch profile</p>
          )}
        </div>

        <div className="card">
          <h2 style={{ marginBottom: '1rem' }}>Health Status</h2>
          {healthStatus ? (
            <div>
              <p><strong>Status:</strong> {healthStatus.status}</p>
              <p><strong>Service:</strong> {healthStatus.service}</p>
            </div>
          ) : (
            <p className="error">Failed to fetch health status</p>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: '2rem' }}>
        <h2 style={{ marginBottom: '1rem' }}>API Endpoints Tested</h2>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          <li style={{ padding: '0.5rem 0' }}>✓ POST /auth/sso/login</li>
          <li style={{ padding: '0.5rem 0' }}>✓ GET /auth/sso/validate</li>
          <li style={{ padding: '0.5rem 0' }}>✓ GET /api/user/profile</li>
          <li style={{ padding: '0.5rem 0' }}>✓ GET /api/health</li>
        </ul>
      </div>
    </div>
  );
}

