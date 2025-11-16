# Azure Static Web Apps - Next.js Frontend

Next.js frontend application integrated with Azure Static Web Apps authentication.

## Features

- **Azure Static Web Apps Authentication** - Built-in Azure AD authentication via `/.auth/*` endpoints
- **Hash Fragment Preservation** - Preserves URL hash fragments through authentication flow
- **Next.js App Router** - Modern Next.js 13+ app directory structure
- **TypeScript** - Full TypeScript support

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Azure Static Web App created (for production deployment)

### Local Development

#### Option 1: Test Authentication Locally (Recommended)

To test Azure Static Web Apps authentication locally, use the SWA CLI:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run with SWA CLI (includes authentication):**
   ```bash
   npm run dev:swa
   ```

3. **Open browser:**
   - Navigate to `http://localhost:4280` (SWA CLI default port)
   - Authentication endpoints (`/.auth/*`) will work locally
   - To test login, visit: `http://localhost:4280/.auth/login/aad`
   - SWA CLI will show a mock authentication page where you can enter test user details

**Note**: The SWA CLI emulates Azure Static Web Apps authentication locally, allowing you to test the full authentication flow without deploying to Azure.

#### Option 2: Standard Next.js Development (No Authentication)

If you just want to develop the UI without authentication:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Navigate to `http://localhost:3000` (or the port shown in terminal)
   - **Note**: `/.auth/*` endpoints will NOT work - they only work with SWA CLI or in Azure

### Production Deployment

1. **Deploy to Azure Static Web Apps:**
   - Connect your repository to Azure Static Web Apps
   - Azure will automatically build and deploy your Next.js app

2. **Enable Authentication:**
   - In Azure Portal, go to your Static Web App
   - Navigate to "Authentication" settings
   - Click "Add identity provider"
   - Select "Microsoft" (Azure AD)

3. **Configure Route Protection (Optional):**
   - Create `staticwebapp.config.json` in your app root
   - Define protected routes as needed

## Pages

- `/` - Home page (redirects to login or dashboard)
- `/login` - Azure AD login page (auto-redirects to `/.auth/login/aad`)
- `/dashboard` - Protected dashboard with user info
- `/techpack/detail/[id]` - Techpack detail pages with hash fragment support

## Authentication

The application uses Azure Static Web Apps' built-in authentication:

- **Login**: `/.auth/login/aad` - Azure Active Directory
- **Logout**: `/.auth/logout` - Clear session
- **User Info**: `/.auth/me` - Get current user

See [../AZURE_STATIC_WEB_APPS_AUTH.md](../AZURE_STATIC_WEB_APPS_AUTH.md) for detailed authentication documentation.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx            # Home page
│   ├── login/              # Login page
│   │   └── page.tsx
│   ├── dashboard/          # Dashboard page
│   │   └── page.tsx
│   ├── auth/               # Auth routes
│   │   └── logout/         # Logout page
│   │       └── page.tsx
│   └── techpack/           # Techpack pages
│       └── detail/
│           └── [id]/
│               └── page.tsx
├── components/             # React components
│   └── HashConverter.tsx   # Hash fragment converter
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── lib/                    # Utilities
│   └── api.ts              # API client (if needed)
├── middleware.ts           # Next.js middleware
└── next.config.js          # Next.js configuration
```

## Key Features

### Hash Fragment Preservation

The application preserves hash fragments (e.g., `#ai`) through the entire authentication flow:

1. **HashConverter** component converts `#ai` → `?hash=ai`
2. **Middleware** preserves hash in redirect URIs
3. After authentication, hash is restored in the final URL

Example flow:
- User visits: `/techpack/detail/314227#ai`
- After login: `/techpack/detail/314227#ai` (hash preserved)

### Authentication Context

The `AuthContext` provides:
- `user` - Current user information from Azure SWA
- `isAuthenticated` - Authentication status
- `login(redirectUri?)` - Initiate Azure AD login
- `logout(redirectUri?)` - Initiate logout
- `validateSession()` - Check authentication via `/.auth/me`

## Configuration

### Environment Variables

No environment variables are required for Azure Static Web Apps authentication. The authentication is handled entirely by Azure's infrastructure.

### Next.js Configuration

The `next.config.js` file is configured for Azure Static Web Apps deployment. No additional configuration needed.

## Documentation

- [Azure Static Web Apps Authentication Guide](../AZURE_STATIC_WEB_APPS_AUTH.md) - Complete authentication documentation

## License

MIT
