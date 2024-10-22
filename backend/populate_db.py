# from src.models import db, User, Category  # Import your models
# from src import create_app
# from flask import Flask

# app = create_app()  # Create a Flask app instance

# def populate_db():
#     """Populate the database with initial data."""
#     with app.app_context():  # Ensure the app context is available
#         # Create tables (optional, if not already done)
#         db.create_all()

#         # Example: Add a user
#         if not User.query.first():  # Check if there's at least one user
#             new_user = User(username='example_user', email='user@example.com')
#             db.session.add(new_user)
#             db.session.commit()

#         # Example: Add a category
#         if not Category.query.first():  # Check if there's at least one category
#             new_category = Category(name='Health')
#             db.session.add(new_category)
#             db.session.commit()

# if __name__ == '__main__':
#     populate_db()
