import os
from datetime import timedelta
from pathlib import Path

# Load .env_local file in local/development mode only
# In production, only use os.environ (don't load .env_local)
_is_production = os.environ.get('FLASK_ENV') == 'production' or os.environ.get('ENVIRONMENT') == 'production'

if not _is_production:
    # Load .env_local file for local development
    env_file = Path(__file__).parent / '.env_local'
    if env_file.exists():
        try:
            from dotenv import load_dotenv
            load_dotenv(env_file)
        except ImportError:
            # python-dotenv not installed, skip loading .env_local
            pass


def get_env_value(key: str, default: str = '') -> str:
    """
    Get environment variable value.
    In local/development: Uses values from .env_local (loaded above) or os.environ
    In production: Only uses os.environ (don't load .env_local)
    """
    return os.environ.get(key, default)


class Config:
    """Application configuration for Microsoft Entra ID (Azure AD) SSO"""
    SECRET_KEY = get_env_value('SECRET_KEY', 'dev-secret-key-change-in-production')
    
    # Session configuration
    SESSION_COOKIE_NAME = 'flask_session'
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'
    PERMANENT_SESSION_LIFETIME = timedelta(hours=24)
    
    # Azure AD (Microsoft Entra ID) SSO Configuration
    # Get these values from Azure Portal - see AZURE_AD_SETUP.md for step-by-step instructions
    # See .env_local.example for configuration template
    MICROSOFT_CLIENT_ID = get_env_value('MICROSOFT_CLIENT_ID', '')
    MICROSOFT_CLIENT_SECRET = get_env_value('MICROSOFT_CLIENT_SECRET', '')
    MICROSOFT_TENANT_ID = get_env_value('MICROSOFT_TENANT_ID', '')
    
    # Azure AD Endpoints
    # For single tenant: use {TENANT_ID} in the URL
    # For multi-tenant: use 'common' instead of {TENANT_ID}
    # If MICROSOFT_TENANT_ID is not set, defaults to 'common' (multi-tenant)
    @property
    def MICROSOFT_AUTHORIZATION_URL(self):
        """Azure AD Authorization URL - auto-generated from TENANT_ID"""
        tenant = self.MICROSOFT_TENANT_ID or 'common'
        return get_env_value(
            'MICROSOFT_AUTHORIZATION_URL',
            f'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/authorize'
        )
    
    @property
    def MICROSOFT_TOKEN_URL(self):
        """Azure AD Token URL - auto-generated from TENANT_ID"""
        tenant = self.MICROSOFT_TENANT_ID or 'common'
        return get_env_value(
            'MICROSOFT_TOKEN_URL',
            f'https://login.microsoftonline.com/{tenant}/oauth2/v2.0/token'
        )
    
    # Microsoft Graph API endpoint (always the same)
    MICROSOFT_USERINFO_URL = get_env_value(
        'MICROSOFT_USERINFO_URL',
        'https://graph.microsoft.com/v1.0/me'
    )
    
    # Redirect URI for OAuth callbacks
    # Must match exactly what you configured in Azure AD App Registration
    SSO_REDIRECT_URI = get_env_value(
        'SSO_REDIRECT_URI',
        'http://localhost:5000/auth/sso/callback'
    )
