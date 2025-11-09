"""
Simple test script to verify configuration values from .env_local
Run: python test_config.py
"""
from config import Config

def main():
    print("=" * 60)
    print("Configuration Values from .env_local")
    print("=" * 60)
    
    config = Config()
    
    print("\n1. SECRET_KEY:")
    print(f"   {config.SECRET_KEY[:20]}..." if len(config.SECRET_KEY) > 20 else f"   {config.SECRET_KEY}")
    
    print("\n2. Azure AD Configuration:")
    print(f"   MICROSOFT_CLIENT_ID:     {config.MICROSOFT_CLIENT_ID or '(NOT SET)'}")
    print(f"   MICROSOFT_CLIENT_SECRET: {'*' * 20 if config.MICROSOFT_CLIENT_SECRET else '(NOT SET)'}")
    print(f"   MICROSOFT_TENANT_ID:     {config.MICROSOFT_TENANT_ID or '(NOT SET)'}")
    
    print("\n3. Azure AD Endpoints (Auto-generated):")
    print(f"   Authorization URL: {config.MICROSOFT_AUTHORIZATION_URL}")
    print(f"   Token URL:         {config.MICROSOFT_TOKEN_URL}")
    print(f"   UserInfo URL:      {config.MICROSOFT_USERINFO_URL}")
    
    print("\n4. Redirect URI:")
    print(f"   SSO_REDIRECT_URI: {config.SSO_REDIRECT_URI}")
    
    print("\n" + "=" * 60)
    
    # Check if Azure AD is configured
    if config.MICROSOFT_CLIENT_ID and config.MICROSOFT_CLIENT_SECRET:
        print("✅ Azure AD configuration is complete!")
    else:
        print("❌ Azure AD configuration is incomplete.")
        print("   Please add values to .env_local file")

if __name__ == '__main__':
    main()

