from flask import request, jsonify, session, redirect, url_for
from app.auth import bp
from app.auth.sso_service import SSOService
import secrets


@bp.route('/sso/login', methods=['POST'])
def sso_login():
    """
    SSO Login endpoint
    Accepts provider and credentials, returns authentication token
    """
    data = request.get_json()
    
    if not data:
        return jsonify({'error': 'No data provided'}), 400
    
    provider = data.get('provider', 'default')
    username = data.get('username')
    password = data.get('password')
    token = data.get('token')  # For token-based SSO
    
    if not username and not token:
        return jsonify({'error': 'Username or token required'}), 400
    
    sso_service = SSOService()
    
    # Handle token-based SSO (OAuth2/OIDC)
    if token:
        user_info = sso_service.validate_token(token, provider)
        if user_info:
            session['user_id'] = user_info.get('user_id')
            session['username'] = user_info.get('username')
            session['email'] = user_info.get('email')
            session['authenticated'] = True
            
            # Generate session token
            session_token = secrets.token_urlsafe(32)
            session['session_token'] = session_token
            
            return jsonify({
                'success': True,
                'message': 'Authentication successful',
                'session_token': session_token,
                'user': {
                    'user_id': user_info.get('user_id'),
                    'username': user_info.get('username'),
                    'email': user_info.get('email')
                }
            }), 200
    
    # Handle username/password SSO
    if username and password:
        user_info = sso_service.authenticate(username, password, provider)
        if user_info:
            session['user_id'] = user_info.get('user_id')
            session['username'] = user_info.get('username')
            session['email'] = user_info.get('email')
            session['authenticated'] = True
            
            session_token = secrets.token_urlsafe(32)
            session['session_token'] = session_token
            
            return jsonify({
                'success': True,
                'message': 'Authentication successful',
                'session_token': session_token,
                'user': {
                    'user_id': user_info.get('user_id'),
                    'username': user_info.get('username'),
                    'email': user_info.get('email')
                }
            }), 200
    
    return jsonify({'error': 'Invalid credentials'}), 401


@bp.route('/sso/logout', methods=['POST'])
def sso_logout():
    """
    SSO Logout endpoint
    Clears session and invalidates tokens
    """
    session_token = request.headers.get('X-Session-Token') or request.get_json().get('session_token') if request.is_json else None
    
    if session_token and session.get('session_token') == session_token:
        session.clear()
        return jsonify({'success': True, 'message': 'Logged out successfully'}), 200
    
    # Fallback: clear current session
    session.clear()
    return jsonify({'success': True, 'message': 'Logged out successfully'}), 200


@bp.route('/sso/validate', methods=['GET', 'POST'])
def validate_session():
    """
    Validate SSO session token
    """
    session_token = request.headers.get('X-Session-Token') or request.args.get('session_token')
    
    if not session_token:
        return jsonify({'authenticated': False, 'error': 'No session token provided'}), 400
    
    if session.get('session_token') == session_token and session.get('authenticated'):
        return jsonify({
            'authenticated': True,
            'user': {
                'user_id': session.get('user_id'),
                'username': session.get('username'),
                'email': session.get('email')
            }
        }), 200
    
    return jsonify({'authenticated': False, 'error': 'Invalid or expired session'}), 401


@bp.route('/sso/callback', methods=['GET', 'POST'])
def sso_callback():
    """
    SSO OAuth callback endpoint
    Handles OAuth2/OIDC callbacks from identity providers (Microsoft)
    After successful authentication, redirects to frontend with session token
    """
    code = request.args.get('code')
    state = request.args.get('state')
    error = request.args.get('error')
    error_description = request.args.get('error_description')
    provider = request.args.get('provider', 'microsoft')
    
    # Handle OAuth errors
    if error:
        # Redirect to frontend with error
        frontend_url = request.args.get('frontend_redirect_uri', 'http://localhost:3000/login')
        return redirect(f"{frontend_url}?error={error}&error_description={error_description or 'Authentication failed'}")
    
    if not code:
        frontend_url = request.args.get('frontend_redirect_uri', 'http://localhost:3000/login')
        return redirect(f"{frontend_url}?error=no_code&error_description=Authorization code not provided")
    
    # Validate state (CSRF protection)
    if state and session.get('oauth_state') != state:
        frontend_url = request.args.get('frontend_redirect_uri', 'http://localhost:3000/login')
        return redirect(f"{frontend_url}?error=invalid_state&error_description=Invalid state parameter")
    
    sso_service = SSOService()
    token_info = sso_service.exchange_code_for_token(code, provider, state)
    
    if token_info and token_info.get('access_token'):
        user_info = sso_service.validate_token(token_info.get('access_token'), provider)
        
        if user_info:
            session['user_id'] = user_info.get('user_id')
            session['username'] = user_info.get('username')
            session['email'] = user_info.get('email')
            session['authenticated'] = True
            session_token = secrets.token_urlsafe(32)
            session['session_token'] = session_token
            
            # Clear OAuth state
            session.pop('oauth_state', None)
            
            # Redirect to frontend with success and session token
            frontend_url = request.args.get('frontend_redirect_uri', 'http://localhost:3000/dashboard')
            return redirect(f"{frontend_url}?success=true&session_token={session_token}")
    
    # If we get here, authentication failed
    frontend_url = request.args.get('frontend_redirect_uri', 'http://localhost:3000/login')
    return redirect(f"{frontend_url}?error=callback_failed&error_description=SSO callback failed")


@bp.route('/sso/authorize', methods=['GET'])
def sso_authorize():
    """
    Get OAuth2 authorization URL for Microsoft login
    Returns the Microsoft login URL to redirect user to
    """
    provider = request.args.get('provider', 'microsoft')
    redirect_uri = request.args.get('redirect_uri')
    
    # Generate state for CSRF protection
    import secrets
    state = secrets.token_urlsafe(32)
    session['oauth_state'] = state
    
    sso_service = SSOService()
    auth_url = sso_service.get_authorization_url(provider, redirect_uri, state)
    
    if not auth_url:
        return jsonify({'error': 'Failed to generate authorization URL. Check Azure AD configuration.'}), 500
    
    return jsonify({
        'authorization_url': auth_url,
        'state': state
    }), 200


@bp.route('/sso/providers', methods=['GET'])
def get_providers():
    """
    Get available SSO providers
    """
    sso_service = SSOService()
    providers = sso_service.get_available_providers()
    
    return jsonify({
        'providers': providers
    }), 200

