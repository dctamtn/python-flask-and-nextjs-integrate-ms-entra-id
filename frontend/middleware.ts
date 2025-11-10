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
  // Get request information
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const url = request.url;
  const headers = Object.fromEntries(request.headers.entries());
  
  // Log request information (for testing/debugging)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔹 MIDDLEWARE RUNNING');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📍 Path: ${pathname}`);
  console.log(`🔧 Method: ${method}`);
  console.log(`🌐 Full URL: ${url}`);
  console.log(`🔍 Search Params: ${search || '(none)'}`);
  console.log(`📦 Headers:`, {
    'user-agent': headers['user-agent']?.substring(0, 50) + '...',
    'referer': headers['referer'] || '(none)',
    'accept': headers['accept']?.substring(0, 50) + '...',
  });
  console.log(`⏰ Timestamp: ${new Date().toISOString()}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  // Example: Check for session token in cookies
  const sessionToken = request.cookies.get('session_token')?.value;
  const flaskSession = request.cookies.get('flask_session')?.value;
  
  if (sessionToken || flaskSession) {
    console.log('✅ Session token found in cookies');
  } else {
    console.log('❌ No session token in cookies');
  }

  // Example: Add custom headers to response
  const response = NextResponse.next();
  
  // Add custom header to track middleware execution
  response.headers.set('X-Middleware-Executed', 'true');
  response.headers.set('X-Middleware-Timestamp', new Date().toISOString());
  response.headers.set('X-Request-Path', pathname);

  // Example: Redirect logic (uncomment to use)
  // if (pathname.startsWith('/dashboard') && !sessionToken) {
  //   console.log('🔄 Redirecting to login (no session token)');
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // Example: Block specific paths (uncomment to use)
  // if (pathname.startsWith('/admin')) {
  //   console.log('🚫 Blocking admin access');
  //   return NextResponse.redirect(new URL('/login', request.url));
  // }

  // Example: Rewrite URL (uncomment to use)
  // if (pathname.startsWith('/api-proxy')) {
  //   const rewriteUrl = new URL(pathname.replace('/api-proxy', ''), request.url);
  //   console.log('🔄 Rewriting URL:', rewriteUrl.toString());
  //   return NextResponse.rewrite(rewriteUrl);
  // }

  // Example: Modify request headers (uncomment to use)
  // const requestHeaders = new Headers(request.headers);
  // requestHeaders.set('X-Custom-Header', 'middleware-value');
  // return NextResponse.next({
  //   request: {
  //     headers: requestHeaders,
  //   },
  // });

  console.log('✅ Middleware completed - request proceeding');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

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

