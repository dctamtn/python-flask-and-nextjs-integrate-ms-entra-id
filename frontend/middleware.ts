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
  
  // TEST: Redirect logic for techpack detail pages
  // Note: In production with Azure SWA, route protection should be handled via staticwebapp.config.json
  // This middleware redirect is for testing the logout flow
  if (pathname.startsWith('/techpack/detail/')) {
    console.log('🧪 TESTING REDIRECT LOGIC');
    console.log(`📍 Original pathname: ${pathname}`);
    
    // Build redirect path with search params
    let redirectPath = `${pathname}${request.nextUrl.search}`;
    
    // Check for hash parameter (converted from hash fragment by HashConverter)
    const hashParam = request.nextUrl.searchParams.get('hash');
    if (hashParam) {
      // Remove hash from query params and add to path as fragment
      const searchParams = new URLSearchParams(request.nextUrl.search);
      searchParams.delete('hash');
      redirectPath = `${pathname}${searchParams.toString() ? '?' + searchParams.toString() : ''}#${hashParam}`;
      console.log(`🔖 Hash fragment preserved: #${hashParam}`);
    }
    
    console.log(`🔄 Redirect path: ${redirectPath}`);
    
    const redirectUrl = new URL(
      `/auth/logout?post_logout_redirect_uri=${encodeURIComponent(redirectPath)}`,
      request.url,
    );
    
    console.log(`🔗 Redirect URL: ${redirectUrl.toString()}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    
    // Only redirect if hash param exists (meaning HashConverter already converted it)
    if (hashParam) {
      return NextResponse.redirect(redirectUrl);
    } else {
      // Hash not yet converted - let page load so HashConverter can convert it
      console.log('⏳ Waiting for hash conversion - allowing page to load');
    }
  }

  // Default: continue with request
  const response = NextResponse.next();
  return response;
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

