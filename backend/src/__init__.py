"""Initialize Flask app."""
from flask_jwt_extended import JWTManager
from flask_bcrypt import Bcrypt
from flask import Flask
from flask_cors import CORS
from flask_socketio import SocketIO
from dotenv import load_dotenv

cors = CORS()

jwt = JWTManager()
bcrypt = Bcrypt()
socketio = SocketIO()

# Import all models here to ensure they are registered with SQLAlchemy
from src.models.user import User
from src.models.category import Category
from src.models.preset_habit import PresetHabit
from src.models.custom_habit import CustomHabit
from src.models.habit_list import HabitList

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
    socketio.init_app(app, cors_allowed_origins="*")

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
    from src.routes.users import users_bp
    from src.routes.categories import categories_bp
    from src.routes.preset_habits import preset_habit_bp
    from src.routes.custom_habits import custom_habits_bp
    from src.routes.habit_lists import habit_lists_bp
    from src.routes.admin import admin_bp
    from src.routes.auth import auth_bp

    # Register the blueprints in the app
    app.register_blueprint(users_bp)
    app.register_blueprint(categories_bp)
    app.register_blueprint(preset_habit_bp)
    app.register_blueprint(custom_habits_bp)
    app.register_blueprint(habit_lists_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(auth_bp)

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


