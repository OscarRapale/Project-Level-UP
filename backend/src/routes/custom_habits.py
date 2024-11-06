from flask import abort, request, jsonify, Blueprint
from src.models import db
from src.models.custom_habit import CustomHabit
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt


custom_habits_bp = Blueprint("custom_habits", __name__, url_prefix="/custom_habits")

@custom_habits_bp.route("/", methods=["GET"])
@jwt_required()
def get_custom_habits():
    """
    Get all custom habits.

    This endpoint retrieves all custom habits. It requires a valid JWT token for authentication
    and administration rights.
    
    Returns:
        Response: A JSON response with a list of custom habits and status code 200
    """
    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"msg": "Administration rights required"}), 403
    
    custom_habits: list[CustomHabit] = CustomHabit.get_all()

    return [custom_habit.to_dict() for custom_habit in custom_habits], 200

@custom_habits_bp.route("/", methods=["POST"])
@jwt_required()
def create_custom_habits():
    """
    Create a new custom habit.

    This endpoint creates a new custom habit. It requires a valid JWT token for authentication.

    Returns:
        Response: A JSON response with the created custom habit
         and status code 201 if successful
    """
    data = request.get_json()
    current_user_id = get_jwt_identity()

    data["habit_owner_id"] = current_user_id

    try:
        custom_habit = CustomHabit.create(data)
       
    except KeyError as e:
        abort(400, f"Missing field: {e}")
    except ValueError as e:
        abort(404, str(e))

    return custom_habit.to_dict(), 201

@custom_habits_bp.route("/<custom_habit_id>", methods=["GET"])
@jwt_required()
def get_custom_habits_by_id(custom_habit_id: str):
    """
    Get a custom habit by ID.

    This endpoint retrieves a custom habit by its ID. It requires a valid JWT token for authentication.

    Args:
        custom_habit_id (str): The ID of the custom habit to retrieve.

    Returns:
        Response: A JSON response with the custom habit
        and status code 200 if successful.
    """
    custom_habit: CustomHabit | None = CustomHabit.get(custom_habit_id)

    if not custom_habit:
        abort(404, f"Habit with ID {custom_habit_id} not found")

    return custom_habit.to_dict(), 200

@custom_habits_bp.route("/<custom_habit_id>", methods=["PUT"])
@jwt_required()
def update_custom_habits(custom_habit_id: str):
    """
    Update a custom habit.

    This endpoint updates a custom habit. It requires a valid JWT token for authentication.

    Args:
        custom_habit_id (str): The ID of the custom habit to update.

    Returns:
        Response: A JSON response with the updated custom habit
        and status code 200 if successful.
    """
    data = request.get_json()
    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    custom_habit = CustomHabit.get(custom_habit_id)

    if not custom_habit:
        abort(404, f"Habit with ID {custom_habit_id} not found")

    if not current_user.is_admin and custom_habit.habit_owner_id != current_user_id:
        abort(403, "You are not authorized to update this habit.")

    try:
        custom_habit: CustomHabit | None = CustomHabit.update(custom_habit_id, data)
    except ValueError as e:
        abort(400, str(e))

    return custom_habit.to_dict(), 200

@custom_habits_bp.route("/user_habits", methods=["GET"])
@jwt_required()
def get_user_custom_habits():
    """
    Get all custom habits for the current user.

    This endpoint retrieves all custom habits created by the current user. It requires a valid JWT token for authentication.

    Returns:
        Response: A JSON response with a list of custom habits and status code 200
    """
    current_user_id = get_jwt_identity()
    custom_habits: list[CustomHabit] = CustomHabit.query.filter_by(habit_owner_id=current_user_id).all()

    return jsonify([custom_habit.to_dict() for custom_habit in custom_habits]), 200


@custom_habits_bp.route("/<custom_habit_id>", methods=["DELETE"])
@jwt_required()
def delete_custom_habits(custom_habit_id: str):
    """
    Delete a custom habit.

    This endpoint deletes a custom habit. It requires a valid JWT token for authentication.

    Args:
        custom_habit_id (str): The ID of the custom habit to delete.

    Returns:
        Response: An empty response with status code 204 if successful.
    """
    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    custom_habit = CustomHabit.get(custom_habit_id)

    if not custom_habit:
        abort(404, f"Habit with ID {custom_habit_id} not found")

    if not current_user.is_admin and custom_habit.habit_owner_id != current_user_id:
        abort(403, "You are not authorized to delete this habit.")

    if not CustomHabit.delete(custom_habit_id):
        abort(404, f"Habit with ID {custom_habit_id} not found")

    return "", 204
