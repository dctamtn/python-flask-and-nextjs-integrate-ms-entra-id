"""
SSO Service for handling Single Sign-On authentication with Microsoft Entra ID (Azure AD)
"""
from typing import Dict, Optional, List
import os


class SSOService:
    """Service class for SSO operations with Microsoft Entra ID"""
    
    def __init__(self):
        # Get configuration from Flask app config or environment variables
        # This allows using Config class properties for Azure AD endpoints
        try:
            from flask import current_app
            config = current_app.config
        except RuntimeError:
            # Outside Flask context, use environment variables directly
            config = None
        
        if config:
            # Use Flask config (supports Config class properties)
            tenant_id = config.get('MICROSOFT_TENANT_ID', '') or 'common'
            self.providers = {
                'microsoft': {
                    'type': 'oauth2',
                    'client_id': config.get('MICROSOFT_CLIENT_ID', ''),
                    'client_secret': config.get('MICROSOFT_CLIENT_SECRET', ''),
                    'authorization_url': config.get('MICROSOFT_AUTHORIZATION_URL', f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize'),
                    'token_url': config.get('MICROSOFT_TOKEN_URL', f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'),
                    'userinfo_url': config.get('MICROSOFT_USERINFO_URL', 'https://graph.microsoft.com/v1.0/me'),
                }
            }
        else:
            # Fallback to environment variables (outside Flask context)
            tenant_id = os.getenv('MICROSOFT_TENANT_ID', '') or 'common'
            self.providers = {
                'microsoft': {
                    'type': 'oauth2',
                    'client_id': os.getenv('MICROSOFT_CLIENT_ID', ''),
                    'client_secret': os.getenv('MICROSOFT_CLIENT_SECRET', ''),
                    'authorization_url': os.getenv(
                        'MICROSOFT_AUTHORIZATION_URL',
                        f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/authorize'
                    ),
                    'token_url': os.getenv(
                        'MICROSOFT_TOKEN_URL',
                        f'https://login.microsoftonline.com/{tenant_id}/oauth2/v2.0/token'
                    ),
                    'userinfo_url': os.getenv('MICROSOFT_USERINFO_URL', 'https://graph.microsoft.com/v1.0/me'),
                }
            }
    
    def authenticate(self, username: str, password: str, provider: str = 'microsoft') -> Optional[Dict]:
        """
        Authenticate user with username and password
        Note: For Microsoft Entra ID, authentication is typically done via OAuth2 flow,
        not username/password. This method is kept for compatibility but should use OAuth2.
        """
        # For Microsoft Entra ID, use OAuth2 flow instead of username/password
        # This method is kept for backward compatibility
        # In production, use the OAuth2 authorization code flow via get_authorization_url()
        
        if username and password:
            # Placeholder: In production, this would validate against Azure AD
            # For Microsoft Entra ID, prefer OAuth2 flow
            return {
                'user_id': f'user_{username}',
                'username': username,
                'email': f'{username}@example.com',
                'provider': provider
            }
        
        return None
    
    def validate_token(self, token: str, provider: str = 'microsoft') -> Optional[Dict]:
        """
        Validate an OAuth2/OIDC token and return user information
        """
        # Placeholder implementation - replace with actual token validation
        # In production, this would:
        # 1. Validate token signature
        # 2. Check token expiration
        # 3. Fetch user info from provider's userinfo endpoint
        
        provider_config = self.providers.get(provider, {})
        
        if not provider_config:
            return None
        
        # In production, make actual API call to validate token
        # Example:
        # import requests
        # response = requests.get(
        #     provider_config.get('userinfo_url'),
        #     headers={'Authorization': f'Bearer {token}'}
        # )
        # if response.status_code == 200:
        #     return response.json()
        
        # Placeholder: return mock user info
        # In production, decode and validate JWT or call userinfo endpoint
        return {
            'user_id': 'user_123',
            'username': 'user@example.com',
            'email': 'user@example.com',
            'provider': provider
        }
    
    def exchange_code_for_token(self, code: str, provider: str = 'microsoft', state: Optional[str] = None) -> Optional[Dict]:
        """
        Exchange authorization code for access token (OAuth2 flow)
        """
        provider_config = self.providers.get(provider, {})
        
        if not provider_config:
            return None
        
        # In production, make actual API call to exchange code for token
        # Example:
        # import requests
        # response = requests.post(
        #     provider_config.get('token_url'),
        #     data={
        #         'grant_type': 'authorization_code',
        #         'code': code,
        #         'client_id': provider_config.get('client_id'),
        #         'client_secret': provider_config.get('client_secret'),
        #         'redirect_uri': redirect_uri,
        #     }
        # )
        # if response.status_code == 200:
        #     return response.json()
        
        # Placeholder: return mock token info
        return {
            'access_token': 'mock_access_token',
            'token_type': 'Bearer',
            'expires_in': 3600,
            'refresh_token': 'mock_refresh_token'
        }
    
    def get_authorization_url(self, provider: str = 'microsoft', redirect_uri: str = None, state: Optional[str] = None) -> Optional[str]:
        """
        Generate authorization URL for OAuth2 flow
        """
        provider_config = self.providers.get(provider, {})
        
        if not provider_config:
            return None
        
        auth_url = provider_config.get('authorization_url')
        client_id = provider_config.get('client_id')
        
        if not auth_url or not client_id:
            return None
        
        # Get redirect URI from config or use provided/default
        try:
            from flask import current_app
            default_redirect_uri = current_app.config.get('SSO_REDIRECT_URI', 'http://localhost:5000/auth/sso/callback')
        except RuntimeError:
            default_redirect_uri = os.getenv('SSO_REDIRECT_URI', 'http://localhost:5000/auth/sso/callback')
        
        # Build authorization URL with parameters
        import urllib.parse
        
        # Azure AD requires specific scopes
        if provider == 'microsoft':
            scope = 'openid profile email User.Read offline_access'
        else:
            scope = 'openid profile email'
        
        params = {
            'client_id': client_id,
            'response_type': 'code',
            'redirect_uri': redirect_uri or default_redirect_uri,
            'scope': scope,
        }
        
        if state:
            params['state'] = state
        
        return f"{auth_url}?{urllib.parse.urlencode(params)}"
    
    def get_available_providers(self) -> List[Dict]:
        """
        Get list of available SSO providers
        """
        return [
            {
                'name': name,
                'type': config.get('type'),
                'enabled': bool(config.get('client_id'))
            }
            for name, config in self.providers.items()
        ]

