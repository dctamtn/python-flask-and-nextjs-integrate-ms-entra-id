from flask import render_template
from app.main import bp


@bp.route("/")
def index():
    return "Hello, Flask! SSO API is ready."

