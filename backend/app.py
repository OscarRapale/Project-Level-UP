from src import create_app
from src.config import get_config
from flask_migrate import Migrate # works better with Docker
from src.models import db

app = create_app(get_config())
migrate=Migrate(app,db) # Initialize Flask-Migrate

if __name__ == "__main__":
    # Run the Flask development server
    app.run(debug=app.config['DEBUG'])
