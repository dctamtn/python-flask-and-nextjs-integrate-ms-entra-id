# Azure Static Web Apps Authentication Integration

This document explains how Azure Static Web Apps authentication is integrated into the application.

## Overview

The application now uses Azure Static Web Apps' built-in authentication system instead of custom backend authentication. Azure SWA provides authentication endpoints that handle the entire OAuth flow with Azure Active Directory.

## Authentication Endpoints

Azure Static Web Apps provides the following authentication endpoints:

- `/.auth/login/aad` - Login with Azure Active Directory
- `/.auth/logout` - Logout and clear session
- `/.auth/me` - Get current user information

## Implementation Details

### 1. AuthContext (`frontend/contexts/AuthContext.tsx`)

The `AuthContext` has been updated to:

- **`validateSession()`**: Calls `/.auth/me` to check if user is authenticated
- **`login(redirectUri?)`**: Redirects to `/.auth/login/aad?post_login_redirect_uri=<uri>`
- **`logout(redirectUri?)`**: Redirects to `/.auth/logout?post_logout_redirect_uri=<uri>`

The user object structure from Azure SWA:
```typescript
{
  clientPrincipal: {
    identityProvider: "aad",
    userId: "user-id",
    userDetails: "user@example.com",
    userRoles: ["anonymous", "authenticated"]
  }
}
```

### 2. Login Page (`frontend/app/login/page.tsx`)

- Automatically redirects to Azure AD login if not authenticated
- Preserves redirect URI through the authentication flow
- Shows a simple UI with "Login with Azure AD" button

### 3. Logout Page (`frontend/app/auth/logout/page.tsx`)

- Handles logout redirects from middleware
- Redirects to Azure SWA logout endpoint
- Preserves the original redirect URI through the logout → login flow

### 4. Middleware (`frontend/middleware.ts`)

- Redirects techpack detail pages to `/.auth/logout` (which is rewritten to `/auth/logout`)
- Preserves hash fragments in the redirect URI

## Authentication Flow

### Login Flow

1. User visits protected page: `/techpack/detail/314227#ai`
2. If not authenticated, redirects to `/login?redirect=/techpack/detail/314227#ai`
3. Login page redirects to: `/.auth/login/aad?post_login_redirect_uri=/techpack/detail/314227#ai`
4. Azure SWA handles OAuth flow with Azure AD
5. After successful login, redirects back to: `/techpack/detail/314227#ai`

### Logout Flow

1. User visits protected page: `/techpack/detail/314227#ai`
2. Middleware redirects to: `/.auth/logout?post_logout_redirect_uri=/techpack/detail/314227#ai`
3. Logout page redirects to: `/.auth/logout?post_logout_redirect_uri=/login?redirect=/techpack/detail/314227#ai`
4. Azure SWA logs out and redirects to: `/login?redirect=/techpack/detail/314227#ai`
5. Login page redirects to Azure AD login
6. After login, redirects back to: `/techpack/detail/314227#ai`

## Configuration

### Azure Static Web App Setup

1. **Enable Authentication**:
   - In Azure Portal, go to your Static Web App
   - Navigate to "Authentication" settings
   - Click "Add identity provider"
   - Select "Microsoft" (Azure AD)

2. **Configure Azure AD**:
   - The app registration is automatically created
   - Or use an existing app registration
   - Configure redirect URIs if needed

3. **Route Protection** (Optional):
   - Create `staticwebapp.config.json` in your app root
   - Define protected routes:
   ```json
   {
     "routes": [
       {
         "route": "/techpack/*",
         "allowedRoles": ["authenticated"]
       }
     ]
   }
   ```

### Environment Variables

No additional environment variables are needed for Azure SWA authentication. The authentication is handled entirely by Azure's infrastructure.

## Testing

### Local Development

To test Azure Static Web Apps authentication locally, use the Azure Static Web Apps CLI:

1. **Install SWA CLI:**
   ```bash
   npm install
   ```
   (SWA CLI is included in devDependencies)

2. **Run with SWA CLI:**
   ```bash
   npm run dev:swa
   ```
   This will:
   - Start Next.js dev server on `http://localhost:3000`
   - Start SWA CLI on `http://localhost:4280`
   - Enable `/.auth/*` endpoints locally

3. **Test Authentication:**
   - Navigate to `http://localhost:4280` (SWA CLI port)
   - Visit `http://localhost:4280/.auth/login/aad` to test login
   - SWA CLI will show a mock authentication page
   - Enter test user details (username, roles, etc.)
   - After "login", check `http://localhost:4280/.auth/me` for user info

4. **Mock User Details:**
   - The SWA CLI allows you to enter any username and roles
   - Use this to test different user scenarios
   - Example: Enter username "test@example.com" and role "authenticated"

### Production

When deployed to Azure Static Web Apps:
- Authentication endpoints are automatically available
- No additional configuration needed
- User sessions are managed by Azure

## Hash Fragment Preservation

The implementation preserves hash fragments (e.g., `#ai`) through the entire authentication flow:

1. Hash fragments are converted to query parameters by `HashConverter` component
2. Middleware includes hash in redirect URIs
3. Login/logout pages preserve hash in redirect parameters
4. After authentication, hash is restored in the final URL

## Troubleshooting

### Authentication Not Working

1. **Check Azure Portal**:
   - Verify authentication is enabled in Static Web App settings
   - Check identity provider configuration

2. **Check Browser Console**:
   - Look for errors when calling `/.auth/me`
   - Verify redirects are working correctly

3. **Check Network Tab**:
   - Verify requests to `/.auth/*` endpoints
   - Check for CORS or other network errors

### User Not Authenticated After Login

1. **Check `/.auth/me` response**:
   - Should return `clientPrincipal` with `userRoles` containing `"authenticated"`
   - Verify the response structure matches expected format

2. **Check Polling**:
   - AuthContext polls `/.auth/me` every 2 seconds
   - This should detect authentication changes after redirect

## References

- [Azure Static Web Apps Authentication](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-authorization)
- [Azure Static Web Apps Authentication Custom](https://learn.microsoft.com/en-us/azure/static-web-apps/authentication-custom)

