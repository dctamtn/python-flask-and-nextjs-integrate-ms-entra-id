# Flask SSO API Sample - Microsoft Entra ID (Azure AD)

A Flask application with blueprint structure and Microsoft Entra ID (Azure AD) Single Sign-On (SSO) API support.

## Features

- **Microsoft Entra ID (Azure AD) SSO** - Login with Microsoft accounts
- **Blueprint-based architecture** - Clean, modular code structure
- **Session management** - Secure session tokens
- **Protected API endpoints** - Authentication required endpoints
- **Next.js frontend** - Ready-to-use frontend for testing

## Project Structure

```
python-flask-sample/
├── app/
│   ├── __init__.py          # Application factory
│   ├── api/                 # API blueprint
│   │   ├── __init__.py
│   │   └── routes.py        # API endpoints
│   ├── auth/                # SSO authentication blueprint
│   │   ├── __init__.py
│   │   ├── routes.py        # SSO routes
│   │   └── sso_service.py   # SSO service logic
│   └── main/                # Main routes blueprint
│       ├── __init__.py
│       └── routes.py
├── app.py                   # Application entry point
├── config.py               # Configuration
└── requirements.txt        # Dependencies
```

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Azure AD

1. Register your application in Azure Portal (see `AZURE_AD_SETUP.md`)
2. Get your Azure AD credentials:
   - Application (Client) ID
   - Client Secret
   - Directory (Tenant) ID

### 3. Set Up Environment Variables

**For Local Development:**
```bash
# Copy the example file
copy .env_local.example .env_local

# Edit .env_local and add your Azure AD credentials
```

**For Production (Windows PowerShell):**
```powershell
$env:MICROSOFT_CLIENT_ID="your-client-id"
$env:MICROSOFT_CLIENT_SECRET="your-client-secret"
$env:MICROSOFT_TENANT_ID="your-tenant-id"
$env:SECRET_KEY="your-secret-key"
```

**For Production (Windows CMD):**
```cmd
set MICROSOFT_CLIENT_ID=your-client-id
set MICROSOFT_CLIENT_SECRET=your-client-secret
set MICROSOFT_TENANT_ID=your-tenant-id
set SECRET_KEY=your-secret-key
```

### 4. Run the Application

```bash
python app.py
```

The Flask API will be available at `http://localhost:5000`

## Configuration

### Local Development

Create a `.env_local` file in the project root:

```env
SECRET_KEY=your-secret-key
MICROSOFT_CLIENT_ID=your-azure-client-id
MICROSOFT_CLIENT_SECRET=your-azure-client-secret
MICROSOFT_TENANT_ID=your-azure-tenant-id
SSO_REDIRECT_URI=http://localhost:5000/auth/sso/callback
```

### Production

Set environment variables in your deployment platform (Azure App Service, Heroku, Docker, etc.)

## SSO API Endpoints

### Authentication Endpoints

#### POST `/auth/sso/login`
Login with Microsoft SSO.

**Request Body:**
```json
{
  "provider": "microsoft",
  "token": "oauth2_access_token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Authentication successful",
  "session_token": "generated_session_token",
  "user": {
    "user_id": "user_123",
    "username": "user@example.com",
    "email": "user@example.com"
  }
}
```

#### POST `/auth/sso/logout`
Logout and invalidate session.

**Headers:**
```
X-Session-Token: your_session_token
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### GET/POST `/auth/sso/validate`
Validate a session token.

**Query Parameters or Headers:**
- `session_token`: Your session token
- Or use header: `X-Session-Token: your_session_token`

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "user_id": "user_123",
    "username": "user@example.com",
    "email": "user@example.com"
  }
}
```

#### GET/POST `/auth/sso/callback`
OAuth2/OIDC callback endpoint for Microsoft Entra ID.

**Query Parameters:**
- `code`: Authorization code from Microsoft
- `state`: State parameter (optional)
- `provider`: "microsoft"

**Response:**
```json
{
  "success": true,
  "message": "SSO callback successful",
  "session_token": "generated_session_token",
  "user": {
    "user_id": "user_123",
    "username": "user@example.com",
    "email": "user@example.com"
  }
}
```

#### GET `/auth/sso/providers`
Get list of available SSO providers.

**Response:**
```json
{
  "providers": [
    {
      "name": "microsoft",
      "type": "oauth2",
      "enabled": true
    }
  ]
}
```

## API Endpoints

### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "Flask API"
}
```

### GET `/api/user/profile`
Get current user profile (requires authentication).

**Headers:**
```
X-Session-Token: your_session_token
```

**Response:**
```json
{
  "user_id": "user_123",
  "username": "user@example.com",
  "email": "user@example.com"
}
```

### GET `/api/protected`
Example protected endpoint (requires authentication).

**Headers:**
```
X-Session-Token: your_session_token
```

**Response:**
```json
{
  "message": "This is a protected endpoint",
  "user": "user@example.com"
}
```

## Usage Examples

### Login with Microsoft SSO

```bash
curl -X POST http://localhost:5000/auth/sso/login \
  -H "Content-Type: application/json" \
  -d '{
    "provider": "microsoft",
    "token": "oauth2_access_token"
  }'
```

### Validate Session

```bash
curl -X GET "http://localhost:5000/auth/sso/validate?session_token=YOUR_TOKEN"
```

### Access Protected Endpoint

```bash
curl -X GET http://localhost:5000/api/user/profile \
  -H "X-Session-Token: YOUR_SESSION_TOKEN"
```

## Documentation

- **`AZURE_AD_SETUP.md`** - Complete step-by-step guide for Azure AD setup
- **`ENV_VALUES_GUIDE.md`** - Guide for getting all configuration values
- **`ENV_SETUP.md`** - Environment configuration (local vs production)
- **`STEP_BY_STEP_GUIDE.md`** - Complete setup and testing guide
- **`QUICK_START.md`** - Quick reference guide

## Configuration Files

- **`config.py`** - Application configuration
- **`.env_local.example`** - Template for local environment variables
- **`requirements.txt`** - Python dependencies

## Notes

- The SSO service uses Microsoft Entra ID (Azure AD) for authentication
- Session tokens are generated using `secrets.token_urlsafe()` for security
- All protected endpoints require the `X-Session-Token` header
- For local development, use `.env_local` file
- For production, use system environment variables

## Next Steps

1. Follow `AZURE_AD_SETUP.md` to register your app in Azure Portal
2. Create `.env_local` file with your Azure AD credentials
3. Test the SSO flow with the Next.js frontend
4. Deploy to production with environment variables

## License

MIT
