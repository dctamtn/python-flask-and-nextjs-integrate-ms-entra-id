# Flask SSO Frontend

Next.js frontend application for testing Flask SSO API with Microsoft Entra ID (Azure AD).

## ⚠️ Important: Frontend Does NOT Need Azure AD Credentials

**The frontend only needs the backend API URL!**

- ✅ **Frontend**: Only needs `NEXT_PUBLIC_API_URL` pointing to backend
- ❌ **Frontend**: Does NOT need Azure AD credentials (Client ID, Secret, etc.)
- ✅ **Backend**: Handles all Azure AD communication

**Flow**: Frontend → Backend → Azure AD → Backend → Frontend

## Getting Started

1. Install dependencies:
```powershell
# Windows PowerShell or CMD
npm install
```

2. Set up environment variables:
```powershell
# Windows PowerShell
New-Item -Path .env.local -ItemType File
```

Or using CMD:
```cmd
# Windows CMD
type nul > .env.local
```

3. **Add only the backend API URL** to `.env.local`:
```env
# Frontend only needs the backend API URL
NEXT_PUBLIC_API_URL=http://localhost:5000
```

**Note**: The frontend does NOT need Azure AD credentials. The backend handles all Azure AD communication.

4. Make sure your Flask backend is running on `http://localhost:5000`

5. Run the development server:
```powershell
# Windows PowerShell or CMD
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- **Login Page** (`/login`) - Microsoft Entra ID SSO authentication
- **Dashboard** (`/dashboard`) - Protected page showing user information and API test results
- **Session Management** - Automatic session validation and token handling
- **API Integration** - Full integration with Flask SSO API endpoints
- **No Azure AD Credentials Required** - Frontend only needs backend API URL

## Pages

- `/` - Home page (redirects to login or dashboard)
- `/login` - SSO login page
- `/dashboard` - Protected dashboard with user info and API status

## API Integration

The frontend integrates with the following Flask API endpoints:

- `POST /auth/sso/login` - User authentication
- `GET /auth/sso/validate` - Session validation
- `POST /auth/sso/logout` - User logout
- `GET /api/user/profile` - Get user profile
- `GET /api/health` - Health check

## Project Structure

```
frontend/
├── app/
│   ├── layout.tsx          # Root layout with AuthProvider
│   ├── page.tsx             # Home page
│   ├── login/
│   │   └── page.tsx         # Login page
│   ├── dashboard/
│   │   └── page.tsx         # Dashboard page
│   └── globals.css          # Global styles
├── contexts/
│   └── AuthContext.tsx      # Authentication context
├── lib/
│   └── api.ts               # API client functions
└── package.json
```

## Usage

1. **Configure Backend** (see `../AZURE_AD_SETUP.md`):
   - Register app in Azure Portal
   - Add Azure AD credentials to backend `.env_local`
   - Start Flask backend: `python app.py`

2. **Configure Frontend**:
   - Create `.env.local` in frontend directory
   - Set `NEXT_PUBLIC_API_URL=http://localhost:5000`
   - Start Next.js frontend: `npm run dev`

3. **Test SSO**:
   - Navigate to `http://localhost:3000`
   - Click Login with Microsoft
   - You'll be redirected to Microsoft login page
   - After login, you'll be redirected back to dashboard

## Configuration

### Frontend Configuration (`.env.local`)
```env
# Only this is needed - no Azure AD credentials!
NEXT_PUBLIC_API_URL=http://localhost:5000
```

### Backend Configuration (See `../AZURE_AD_SETUP.md`)
The backend needs Azure AD credentials in `../.env_local`:
- `MICROSOFT_CLIENT_ID`
- `MICROSOFT_CLIENT_SECRET`
- `MICROSOFT_TENANT_ID`
- `SSO_REDIRECT_URI`

## How It Works

1. User clicks "Login" in frontend
2. Frontend calls backend: `POST http://localhost:5000/auth/sso/login`
3. Backend redirects to Azure AD login page
4. User logs in with Microsoft account
5. Azure AD redirects to backend: `http://localhost:5000/auth/sso/callback`
6. Backend exchanges code for token with Azure AD
7. Backend creates session and returns session token to frontend
8. Frontend stores session token and shows dashboard

**Key Point**: Frontend never directly communicates with Azure AD. All Azure AD communication goes through the backend.

