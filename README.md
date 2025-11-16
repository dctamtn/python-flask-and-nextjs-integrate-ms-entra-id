# Azure Static Web Apps - Next.js Frontend

A Next.js application integrated with Azure Static Web Apps authentication.

## Features

- **Azure Static Web Apps Authentication** - Built-in Azure AD authentication
- **Hash Fragment Preservation** - Preserves URL hash fragments through authentication flow
- **Next.js App Router** - Modern Next.js 13+ app directory structure
- **TypeScript** - Full TypeScript support

## Quick Start

### Prerequisites

- Node.js 18+ installed
- Azure Static Web App created (for production)

### Local Development

1. **Install dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Run development server:**
   ```bash
   npm run dev
   ```

3. **Open browser:**
   - Navigate to `http://localhost:3000` (or the port shown in terminal)

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

## Authentication Flow

The application uses Azure Static Web Apps' built-in authentication:

- **Login**: Redirects to `/.auth/login/aad` (Azure AD)
- **Logout**: Redirects to `/.auth/logout`
- **User Info**: Fetches from `/.auth/me`

See [AZURE_STATIC_WEB_APPS_AUTH.md](./AZURE_STATIC_WEB_APPS_AUTH.md) for detailed authentication documentation.

## Project Structure

```
frontend/
├── app/                    # Next.js app directory
│   ├── layout.tsx          # Root layout
│   ├── login/              # Login page
│   ├── dashboard/          # Dashboard page
│   └── techpack/           # Techpack pages
├── components/             # React components
│   └── HashConverter.tsx   # Hash fragment converter
├── contexts/               # React contexts
│   └── AuthContext.tsx     # Authentication context
├── lib/                    # Utilities
│   └── api.ts              # API client (if needed)
└── middleware.ts           # Next.js middleware
```

## Key Features

### Hash Fragment Preservation

The application preserves hash fragments (e.g., `#ai`) through the entire authentication flow:

1. HashConverter component converts `#ai` → `?hash=ai`
2. Middleware preserves hash in redirect URIs
3. After authentication, hash is restored in the final URL

### Authentication Context

The `AuthContext` provides:
- `user` - Current user information
- `isAuthenticated` - Authentication status
- `login(redirectUri?)` - Initiate login
- `logout(redirectUri?)` - Initiate logout
- `validateSession()` - Check authentication status

## Documentation

- [Azure Static Web Apps Authentication Guide](./AZURE_STATIC_WEB_APPS_AUTH.md) - Complete authentication documentation

## License

MIT
