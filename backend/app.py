from src import create_app, socketio
from src.models import db

app = create_app()

# Ensure the database tables are created
with app.app_context():
    db.create_all()

if __name__ == "__main__":
    # Run the Flask development server with SocketIO support
    socketio.run(app, host='0.0.0.0', port=5000)
