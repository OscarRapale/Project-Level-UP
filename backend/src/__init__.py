"""Initialize Flask app."""
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

cors = CORS()

jwt = JWTManager()
bcrypt = Bcrypt()

# Import all models here to ensure they are registered with SQLAlchemy




def create_app(config_class="src.config.DevelopmentConfig") -> Flask:
    """
    Create a Flask app with the given configuration class.
    The default configuration class is DevelopmentConfig.
    """

    load_dotenv()

    app = Flask(__name__)
    app.url_map.strict_slashes = False
    app.config.from_object(config_class)

    from src.models import db
    db.init_app(app)
    jwt.init_app(app)
    bcrypt.init_app(app)

    register_extensions(app)
    register_routes(app)
    register_handlers(app)

    create_db_tables(app)

    return app

def create_db_tables(app: Flask) -> None:
    from src.models import db
    with app.app_context():
        db.create_all()

def register_extensions(app: Flask) -> None:
    """Register the extensions for the Flask app"""
    cors.init_app(app, resources={r"/*": {"origins": "*"}})

def register_routes(app: Flask) -> None:
    """Import and register the routes for the Flask app"""

    #Importing the routes





    # Register the blueprints in the app




def register_handlers(app: Flask) -> None:
    """Register the error handlers for the Flask app."""
    app.errorhandler(404)(lambda e: (
        {"error": "Not found", "message": str(e)}, 404
    )
    )
    app.errorhandler(400)(
        lambda e: (
            {"error": "Bad request", "message": str(e)}, 400
        )
    )


