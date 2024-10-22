from src import create_app, socketio
from src.config import get_config
from src.models import db

app = create_app(get_config())

with app.app_context():
    db.create_all()  # Ensure the database tables are created

if __name__ == "__main__":
    # Run the Flask development server with SocketIO support
    socketio.run(app, debug=app.config['DEBUG'])
