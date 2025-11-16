'use client';

import { useEffect } from 'react';

/**
 * Hash Converter Component
 * 
 * Converts hash fragments (#ai) to query parameters (?hash=ai)
 * so that middleware can access them on the server side.
 * 
 * This component runs immediately on mount to catch hash fragments
 * before Next.js routing completes.
 */
export default function HashConverter() {
  useEffect(() => {
    const pathname = window.location.pathname;
    
    // Only run on techpack detail pages, skip auth/logout pages
    if (!pathname.startsWith('/techpack/detail/')) {
      console.log('ℹ️ HashConverter: Skipping - not a techpack detail page');
      return;
    }
    
    // Skip if already on auth/logout pages
    if (pathname.startsWith('/.auth/') || pathname.startsWith('/auth/')) {
      console.log('ℹ️ HashConverter: Skipping - on auth page');
      return;
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔹 HASH CONVERSION COMPONENT RUNNING');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📍 Current URL:', window.location.href);
    console.log('📍 Pathname:', pathname);
    console.log('🔍 Hash:', window.location.hash || '(none)');
    console.log('🔍 Search:', window.location.search || '(none)');
    
    // Create a unique key for this path to avoid conflicts
    const storageKey = `hashConverted_${pathname}`;
    
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.substring(1); // Remove the #
      console.log('✅ Hash fragment found:', hash);
      
      // Only convert if hash exists and not already converted
      if (hash && !window.location.search.includes('hash=') && !sessionStorage.getItem(storageKey)) {
        console.log('🔄 Converting hash to query parameter...');
        const url = new URL(window.location.href);
        url.searchParams.set('hash', hash);
        url.hash = ''; // Remove hash fragment
        sessionStorage.setItem(storageKey, 'true');
        console.log('🔗 New URL:', url.toString());
        console.log('⏳ Redirecting to new URL...');
        // Redirect to new URL so middleware can see the query parameter
        window.location.replace(url.toString());
      } else {
        if (window.location.search.includes('hash=')) {
          console.log('ℹ️ Hash already in query parameter, skipping conversion');
          // Clear the flag since conversion is complete
          sessionStorage.removeItem(storageKey);
        }
        if (sessionStorage.getItem(storageKey)) {
          console.log('ℹ️ Hash already converted for this path, skipping');
        }
      }
    } else {
      console.log('ℹ️ No hash fragment found');
      // Clear the flag when there's no hash
      sessionStorage.removeItem(storageKey);
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  }, []);

  // This component doesn't render anything
  return null;
}

