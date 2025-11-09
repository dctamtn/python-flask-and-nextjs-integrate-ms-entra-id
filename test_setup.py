#!/usr/bin/env python3
"""
Quick setup verification script
Run this to check if everything is set up correctly
"""

import sys
import subprocess
import os

def check_python_version():
    """Check Python version"""
    version = sys.version_info
    if version.major >= 3 and version.minor >= 8:
        print(f"✅ Python {version.major}.{version.minor}.{version.micro}")
        return True
    else:
        print(f"❌ Python {version.major}.{version.minor}.{version.micro} (Need 3.8+)")
        return False

def check_flask_installed():
    """Check if Flask is installed"""
    try:
        import flask
        print(f"✅ Flask {flask.__version__} installed")
        return True
    except ImportError:
        print("❌ Flask not installed. Run: pip install -r requirements.txt")
        return False

def check_flask_cors():
    """Check if flask-cors is installed"""
    try:
        import flask_cors
        print("✅ flask-cors installed")
        return True
    except ImportError:
        print("❌ flask-cors not installed. Run: pip install -r requirements.txt")
        return False

def check_files():
    """Check if required files exist"""
    required_files = [
        'app.py',
        'config.py',
        'requirements.txt',
        'app/__init__.py',
        'app/auth/routes.py',
        'app/api/routes.py',
        'frontend/package.json',
        'frontend/app/layout.tsx',
    ]
    
    all_exist = True
    for file in required_files:
        if os.path.exists(file):
            print(f"✅ {file}")
        else:
            print(f"❌ {file} missing")
            all_exist = False
    
    return all_exist

def main():
    print("=" * 50)
    print("Flask SSO Setup Verification")
    print("=" * 50)
    print()
    
    checks = [
        ("Python Version", check_python_version),
        ("Flask Installation", check_flask_installed),
        ("Flask-CORS Installation", check_flask_cors),
        ("Required Files", check_files),
    ]
    
    results = []
    for name, check_func in checks:
        print(f"\n{name}:")
        result = check_func()
        results.append(result)
    
    print("\n" + "=" * 50)
    if all(results):
        print("✅ All checks passed! You're ready to run the project.")
        print("\nNext steps:")
        print("1. Start Flask backend: python app.py")
        print("2. Start Next.js frontend: cd frontend && npm run dev")
    else:
        print("❌ Some checks failed. Please fix the issues above.")
    print("=" * 50)

if __name__ == "__main__":
    main()

