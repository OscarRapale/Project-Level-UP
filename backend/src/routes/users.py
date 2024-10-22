from flask import Blueprint
from flask import abort, request
from src.models.user import User
from sqlalchemy.exc import SQLAlchemyError
from src.persistence import repo
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from flask_bcrypt import Bcrypt
from flask import jsonify
from src import db

users_bp = Blueprint("users", __name__, url_prefix="/users")
bcrypt = Bcrypt()

@users_bp.route("/", methods=["GET"])
def get_users():
    """
    Get all users.

    This endpoint returns a list of all users. If there's a database error, it aborts with a 500 status code.

    :return: A list of all users.
    """

    try:
        users = User.get_all()

    except SQLAlchemyError as e:
        abort(500, f"Database error: {e}")

    return [user.to_dict() for user in users]

@users_bp.route("/", methods=["POST"])
def create_user():
    """
    Create a new user.

    This endpoint creates a new user with the data in the request body. If there's a database error, it aborts with a 500 status code. If the request body is missing the "password" field, it aborts with a 400 status code.

    :return: The created user and a 201 status code.
    """

    data = request.get_json()

    if "username" not in data or "password" not in data:
        abort(400, "Missing username or password field")

    email = data.get("email")
    password = data["password"]
    username = data["username"]
    is_admin = data.get("is_admin",False)

    # Hash the password
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

    # Update the data with hashed password before creating the user
    data["password_hash"] = hashed_password

    try:
        # Create a new User object, passing plain text password
        new_user = User(
            email=email,  # Assuming email is also part of the data
            username=username,
            password=password
            # Include any additional fields needed for user creation
            )
        # Add and commit new user to the database
        db.session.add(new_user)
        db.session.commit()

    except KeyError as e:
        abort(400, f"Missing field: {e}")

    except ValueError as e:
        abort(400, str(e))

    except SQLAlchemyError as e:
        abort(500, f"Database error: {e}")

    return jsonify (new_user.to_dict()), 201

@users_bp.route("/<user_id>", methods=["GET"])
@jwt_required()
def get_user_by_id(user_id: str):
    """
    Get a user by ID.

    This endpoint returns a user with the given ID. If there's a database error, it aborts with a 500 status code. If the user is not found, it aborts with a 400 status code.

    :param user_id: The ID of the user to get.
    :return: The user and a 200 status code.
    """

    try:
        user = User.get(user_id)

    except SQLAlchemyError as e:
        abort(500, f"Database error: {e}")

    if not user:
        abort(400, f"User with ID {user_id} not found")

    return user.to_dict(), 200

@users_bp.route("/<user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id: str):
    """
    Update a user.

    This endpoint updates a user with the given ID and the data in the request body. If there's a database error, it aborts with a 500 status code. If the user is not found, it aborts with a 404 status code. If the current user is not authorized to update the user, it aborts with a 403 status code.

    :param user_id: The ID of the user to update.
    :return: The updated user and a 200 status code.
    """

    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)

    # Check if user is admin or the user in session
    if not current_user.is_admin and current_user.id != user_id:
        abort(403, "You are not authorized to update this user")

    data = request.get_json()

    try:
        user = User.update(user_id, data)
    except ValueError as e:
        abort(400, str(e))
    except SQLAlchemyError as e:
        abort(500, f"Database error: {e}")

    if user is None:
        abort(404, f"User with ID {user_id} not found")

    return user.to_dict(), 200

@users_bp.route("/<user_id>", methods=["DELETE"])
@jwt_required()
def delete_user(user_id: str):
    """Deletes a user by ID"""

    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)

    # Check if the current user is admin
    if not current_user.is_admin:
        abort(403, "You are not authorized to delete users.")

    user = User.query.get(user_id)
    if not user:
        abort(404, f"User with ID {user_id} not found")

    try:
        db.session.delete(user)
        db.session.commit()
        return jsonify({"msg":f"User with ID{user_id}deleted successfully"}), 200
    except SQLAlchemyError as e:
        db.session.rollback()
        abort(500, f"Database error: {e}")
