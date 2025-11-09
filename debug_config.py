"""
Debug script to verify .env_local configuration values are loaded correctly
Run this to check if your configuration is set up properly for local development
"""
import os
from pathlib import Path
from config import Config, get_env_value

def print_section(title: str):
    """Print a formatted section header"""
    print("\n" + "=" * 60)
    print(f"  {title}")
    print("=" * 60)

def print_config_value(key: str, value: str, mask: bool = False):
    """Print a configuration value (optionally masked for secrets)"""
    if mask and value:
        # Show first 4 and last 4 characters for secrets
        masked = value[:4] + "*" * (len(value) - 8) + value[-4:] if len(value) > 8 else "****"
        print(f"  {key:30} = {masked}")
    else:
        status = "✅ SET" if value else "❌ NOT SET"
        print(f"  {key:30} = {value or '(empty)'} {status}")

def check_env_file():
    """Check if .env_local file exists"""
    env_file = Path(__file__).parent / '.env_local'
    env_example = Path(__file__).parent / '.env_local.example'
    
    print_section("Environment File Status")
    
    if env_file.exists():
        print("  ✅ .env_local file exists")
        print(f"     Location: {env_file.absolute()}")
    else:
        print("  ❌ .env_local file NOT found")
        print(f"     Expected location: {env_file.absolute()}")
        print("\n  💡 To create it:")
        print("     Copy-Item .env_local.example .env_local")
    
    if env_example.exists():
        print("  ✅ .env_local.example file exists")
    else:
        print("  ❌ .env_local.example file NOT found")

def check_production_mode():
    """Check if running in production mode"""
    print_section("Environment Mode")
    
    flask_env = os.environ.get('FLASK_ENV', 'Not set')
    environment = os.environ.get('ENVIRONMENT', 'Not set')
    
    is_production = flask_env == 'production' or environment == 'production'
    
    print(f"  FLASK_ENV:     {flask_env}")
    print(f"  ENVIRONMENT:   {environment}")
    
    if is_production:
        print("  ⚠️  Running in PRODUCTION mode")
        print("     .env_local file will NOT be loaded")
        print("     Only os.environ values will be used")
    else:
        print("  ✅ Running in DEVELOPMENT mode")
        print("     .env_local file will be loaded if it exists")

def check_dotenv_installed():
    """Check if python-dotenv is installed"""
    print_section("Dependencies")
    
    try:
        import dotenv
        print(f"  ✅ python-dotenv is installed (version: {dotenv.__version__ if hasattr(dotenv, '__version__') else 'unknown'})")
        return True
    except ImportError:
        print("  ❌ python-dotenv is NOT installed")
        print("     Install it with: pip install python-dotenv")
        return False

def show_raw_env_values():
    """Show raw environment variable values"""
    print_section("Raw Environment Variables (os.environ)")
    
    keys = [
        'SECRET_KEY',
        'MICROSOFT_CLIENT_ID',
        'MICROSOFT_CLIENT_SECRET',
        'MICROSOFT_TENANT_ID',
        'MICROSOFT_AUTHORIZATION_URL',
        'MICROSOFT_TOKEN_URL',
        'MICROSOFT_USERINFO_URL',
        'SSO_REDIRECT_URI',
    ]
    
    for key in keys:
        value = os.environ.get(key, '')
        if key in ['MICROSOFT_CLIENT_SECRET', 'SECRET_KEY']:
            print_config_value(key, value, mask=True)
        else:
            print_config_value(key, value)

def show_config_class_values():
    """Show values from Config class"""
    print_section("Config Class Values")
    
    config = Config()
    
    print_config_value('SECRET_KEY', config.SECRET_KEY, mask=True)
    print()
    print_config_value('MICROSOFT_CLIENT_ID', config.MICROSOFT_CLIENT_ID)
    print_config_value('MICROSOFT_CLIENT_SECRET', config.MICROSOFT_CLIENT_SECRET, mask=True)
    print_config_value('MICROSOFT_TENANT_ID', config.MICROSOFT_TENANT_ID)
    print()
    print_config_value('MICROSOFT_AUTHORIZATION_URL', config.MICROSOFT_AUTHORIZATION_URL)
    print_config_value('MICROSOFT_TOKEN_URL', config.MICROSOFT_TOKEN_URL)
    print_config_value('MICROSOFT_USERINFO_URL', config.MICROSOFT_USERINFO_URL)
    print()
    print_config_value('SSO_REDIRECT_URI', config.SSO_REDIRECT_URI)

def verify_azure_config():
    """Verify Azure AD configuration is complete"""
    print_section("Azure AD Configuration Verification")
    
    config = Config()
    
    required = {
        'MICROSOFT_CLIENT_ID': config.MICROSOFT_CLIENT_ID,
        'MICROSOFT_CLIENT_SECRET': config.MICROSOFT_CLIENT_SECRET,
        'MICROSOFT_TENANT_ID': config.MICROSOFT_TENANT_ID,
    }
    
    all_set = True
    for key, value in required.items():
        if value:
            print(f"  ✅ {key} is set")
        else:
            print(f"  ❌ {key} is NOT set")
            all_set = False
    
    if all_set:
        print("\n  ✅ All required Azure AD credentials are configured!")
        print("     You're ready to test SSO authentication.")
    else:
        print("\n  ⚠️  Some Azure AD credentials are missing.")
        print("     See AZURE_AD_SETUP.md for instructions on how to get them.")
        print("     Add them to .env_local file in the backend project root.")

def show_sso_service_config():
    """Show SSO service provider configuration"""
    print_section("SSO Service Provider Configuration")
    
    try:
        from app.auth.sso_service import SSOService
        sso_service = SSOService()
        
        providers = sso_service.get_available_providers()
        
        for provider in providers:
            name = provider.get('name', 'unknown')
            enabled = provider.get('enabled', False)
            provider_type = provider.get('type', 'unknown')
            
            status = "✅ ENABLED" if enabled else "❌ DISABLED (missing credentials)"
            print(f"  Provider: {name:15} Type: {provider_type:10} Status: {status}")
        
        # Show Microsoft provider details
        microsoft_config = sso_service.providers.get('microsoft', {})
        if microsoft_config:
            print("\n  Microsoft Provider Details:")
            print(f"    Client ID:     {microsoft_config.get('client_id', 'Not set')[:20]}..." if microsoft_config.get('client_id') else "    Client ID:     Not set")
            print(f"    Client Secret: {'*' * 20}..." if microsoft_config.get('client_secret') else "    Client Secret: Not set")
            print(f"    Tenant ID:     {microsoft_config.get('client_id', 'Not set')[:20]}..." if microsoft_config.get('client_id') else "    Tenant ID:     Not set")
            print(f"    Auth URL:      {microsoft_config.get('authorization_url', 'Not set')}")
            print(f"    Token URL:     {microsoft_config.get('token_url', 'Not set')}")
            print(f"    UserInfo URL:  {microsoft_config.get('userinfo_url', 'Not set')}")
    
    except Exception as e:
        print(f"  ⚠️  Could not load SSO service: {e}")

def main():
    """Main debug function"""
    print("\n" + "=" * 60)
    print("  Flask SSO Configuration Debug Tool")
    print("  Microsoft Entra ID (Azure AD) Configuration Checker")
    print("=" * 60)
    
    # Check environment file
    check_env_file()
    
    # Check production mode
    check_production_mode()
    
    # Check dependencies
    dotenv_installed = check_dotenv_installed()
    
    # Show raw environment values
    show_raw_env_values()
    
    # Show Config class values
    show_config_class_values()
    
    # Verify Azure configuration
    verify_azure_config()
    
    # Show SSO service configuration
    show_sso_service_config()
    
    # Final summary
    print_section("Summary")
    print("  To debug configuration:")
    print("  1. Make sure .env_local file exists in project root")
    print("  2. Verify all required values are set in .env_local")
    print("  3. Check that FLASK_ENV is NOT set to 'production'")
    print("  4. Restart the Flask application after changing .env_local")
    print("\n  For detailed setup instructions, see:")
    print("    - AZURE_AD_SETUP.md")
    print("    - ENV_VALUES_GUIDE.md")
    print("    - .env_local.example")
    print("\n" + "=" * 60 + "\n")

if __name__ == '__main__':
    main()

