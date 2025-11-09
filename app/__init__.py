from flask import Flask
from flask_cors import CORS
from config import Config


def create_app(config_class=Config):
    """Application factory pattern"""
    app = Flask(__name__)
    app.config.from_object(config_class)
    
    # Enable CORS for frontend
    CORS(app, resources={
        r"/api/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]},
        r"/auth/*": {"origins": ["http://localhost:3000", "http://localhost:3001"]}
    }, supports_credentials=True)
    
    # Register blueprints
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix='/api')
    
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp, url_prefix='/auth')
    
    # Register main routes
    from app.main import bp as main_bp
    app.register_blueprint(main_bp)
    
    return app

