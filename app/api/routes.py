from flask import request, jsonify, session
from app.api import bp
from functools import wraps
import os


def require_auth(f):
    """Decorator to require authentication for API endpoints"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        session_token = request.headers.get('X-Session-Token') or request.args.get('session_token')
        
        if not session_token:
            return jsonify({'error': 'Authentication required'}), 401
        
        if session.get('session_token') != session_token or not session.get('authenticated'):
            return jsonify({'error': 'Invalid or expired session'}), 401
        
        return f(*args, **kwargs)
    return decorated_function


@bp.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Flask API'
    }), 200


@bp.route('/debug/config', methods=['GET'])
def debug_config():
    """
    Debug endpoint to check configuration values from .env_local
    Shows configuration status without exposing sensitive secrets
    """
    from config import Config
    from app.auth.sso_service import SSOService
    
    config = Config()
    sso_service = SSOService()
    
    # Check if Azure AD is configured
    azure_configured = bool(
        config.MICROSOFT_CLIENT_ID and 
        config.MICROSOFT_CLIENT_SECRET and 
        config.MICROSOFT_TENANT_ID
    )
    
    # Get provider status
    providers = sso_service.get_available_providers()
    microsoft_provider = next((p for p in providers if p['name'] == 'microsoft'), None)
    
    from pathlib import Path
    env_file = Path(__file__).parent.parent / '.env_local'
    
    return jsonify({
        'environment': {
            'mode': 'production' if os.environ.get('FLASK_ENV') == 'production' or os.environ.get('ENVIRONMENT') == 'production' else 'development',
            'env_file_exists': env_file.exists(),
            'env_file_path': str(env_file.absolute()),
        },
        'azure_ad': {
            'configured': azure_configured,
            'client_id_set': bool(config.MICROSOFT_CLIENT_ID),
            'client_secret_set': bool(config.MICROSOFT_CLIENT_SECRET),
            'tenant_id_set': bool(config.MICROSOFT_TENANT_ID),
            'tenant_id': config.MICROSOFT_TENANT_ID or '(not set - will use "common")',
            'authorization_url': config.MICROSOFT_AUTHORIZATION_URL,
            'token_url': config.MICROSOFT_TOKEN_URL,
            'userinfo_url': config.MICROSOFT_USERINFO_URL,
            'redirect_uri': config.SSO_REDIRECT_URI,
        },
        'providers': providers,
        'microsoft_provider': {
            'enabled': microsoft_provider['enabled'] if microsoft_provider else False,
            'type': microsoft_provider['type'] if microsoft_provider else None,
        },
        'status': 'ready' if azure_configured else 'configuration_incomplete'
    }), 200


@bp.route('/debug/session', methods=['GET'])
def debug_session():
    """
    Debug endpoint to check session cookie status
    Shows when and how the flask_session cookie is set
    """
    from flask import request
    from config import Config
    
    config = Config()
    
    # Check if session exists
    session_exists = bool(session)
    session_modified = session.modified if session_exists else False
    
    # Get session data (without sensitive info)
    session_data = {}
    if session_exists:
        session_data = {
            'user_id': session.get('user_id'),
            'username': session.get('username'),
            'email': session.get('email'),
            'authenticated': session.get('authenticated', False),
            'has_session_token': bool(session.get('session_token')),
        }
    
    # Check if cookie is in request
    cookie_name = config.SESSION_COOKIE_NAME
    cookie_in_request = cookie_name in request.cookies
    
    return jsonify({
        'session': {
            'exists': session_exists,
            'modified': session_modified,
            'data': session_data,
        },
        'cookie': {
            'name': cookie_name,
            'configured': True,
            'in_request': cookie_in_request,
            'value_present': bool(request.cookies.get(cookie_name)) if cookie_in_request else False,
            'settings': {
                'http_only': config.SESSION_COOKIE_HTTPONLY,
                'same_site': config.SESSION_COOKIE_SAMESITE,
                'lifetime_hours': config.PERMANENT_SESSION_LIFETIME.total_seconds() / 3600,
            }
        },
        'when_cookie_set': {
            'description': 'Cookie is set when session data is modified (e.g., after login)',
            'triggers': [
                'POST /auth/sso/login - After successful authentication',
                'POST /auth/sso/callback - After OAuth callback',
                'Any endpoint that modifies session["key"] = value'
            ]
        }
    }), 200


@bp.route('/user/profile', methods=['GET'])
@require_auth
def get_user_profile():
    """Get current user profile (requires authentication)"""
    return jsonify({
        'user_id': session.get('user_id'),
        'username': session.get('username'),
        'email': session.get('email')
    }), 200


@bp.route('/protected', methods=['GET'])
@require_auth
def protected_endpoint():
    """Example protected endpoint"""
    return jsonify({
        'message': 'This is a protected endpoint',
        'user': session.get('username')
    }), 200

