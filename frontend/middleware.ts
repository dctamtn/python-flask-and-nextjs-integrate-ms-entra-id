import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware
 * 
 * This middleware runs on every request before the page is rendered.
 * It's useful for:
 * - Logging requests
 * - Authentication checks
 * - Redirects
 * - Adding headers
 * - Request/response manipulation
 * 
 * To test this middleware:
 * 1. Start the Next.js dev server: npm run dev
 * 2. Open browser console or terminal
 * 3. Navigate to any page - you'll see middleware logs
 * 
 * Middleware runs on:
 * - All routes (unless excluded in config.matcher)
 * - Before page rendering
 * - On both server and client (edge runtime)
 */

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Define protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/techpack'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // Skip authentication check for public routes
  const publicRoutes = ['/login', '/auth/logout', '/', '/.auth'];
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Skip authentication check for public routes
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Check Azure Static Web Apps authentication
  // Azure SWA sets x-ms-client-principal header with user information (base64 encoded JSON)
  const clientPrincipalHeader = request.headers.get('x-ms-client-principal');
  
  let isAuthenticated = false;
  
  if (clientPrincipalHeader) {
    try {
      // Decode base64 header (Edge Runtime compatible)
      // In Edge Runtime, we can use atob() for base64 decoding
      const decoded = atob(clientPrincipalHeader);
      const principal = JSON.parse(decoded);
      
      // Check if user has 'authenticated' role
      isAuthenticated = principal.userRoles?.includes('authenticated') || false;
      
      console.log('🔐 Azure SWA Authentication Check:', {
        path: pathname,
        authenticated: isAuthenticated,
        userId: principal.userId,
        userDetails: principal.userDetails,
      });
    } catch (error) {
      console.error('❌ Error parsing client principal:', error);
      isAuthenticated = false;
    }
  } else {
    // No client principal header - user is not authenticated
    // This is expected when not running in Azure SWA or SWA CLI
    console.log('ℹ️ No x-ms-client-principal header found (may be running locally without SWA CLI)');
  }
  
  // Redirect to login if accessing protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname + request.nextUrl.search);
    
    console.log('🚫 Unauthenticated access to protected route, redirecting to login');
    console.log(`📍 Protected route: ${pathname}`);
    console.log(`🔄 Redirect to: ${loginUrl.toString()}`);
    
    return NextResponse.redirect(loginUrl);
  }
  
  // Default: continue with request
  return NextResponse.next();
}

/**
 * Middleware Configuration
 * 
 * matcher: Controls which paths the middleware runs on
 * - Use specific paths: ['/dashboard', '/api/:path*']
 * - Use regex patterns for more control
 * - Exclude static files and API routes if needed
 */
export const config = {
  // Run middleware on all paths except:
  // - Static files (_next/static)
  // - Image optimization files (_next/image)
  // - Favicon and other static assets
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)',
  ],
  
  // Alternative: Run on specific paths only
  // matcher: ['/dashboard/:path*', '/login/:path*'],
  
  // Alternative: Exclude specific paths
  // matcher: ['/((?!login|api).*)'],
};

