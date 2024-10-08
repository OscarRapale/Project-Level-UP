from flask import abort, request, jsonify, Blueprint
from src.models import db
from src.models.custom_habits import CustomHabit
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt


custom_habits_bp = Blueprint("custom_habits", __name__, url_prefix="/custom_habits")

@custom_habits_bp.route("/", methods=["GET"])
@jwt_required()
def get_custom_habits():

    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"msg": "Administration rights required"}), 403
    
    custom_habits: list[CustomHabits] = CustomHabits.get_all()

    return [Custom_habits.to_dict() for custom_habits in custom_habits], 200


@custom_habits_bp.route("/", methods=["POST"])
@jwt_required()
def create_shopping_list():

    data = request.get_json()
    current_user_id = get_jwt_identity()

    data["owner_id"] = current_user_id

    try:
        custom_habits = CustomHabits.create(data)
    except KeyError as e:
        abort(400, f"Missing field: {e}")
    except ValueError as e:
        abort(404, str(e))

    return custom_habits.to_dict(), 201

@custom_habits_bp.route("/<custom_habits_id>", methods=["GET"])
@jwt_required()
def get_custom_habits_by_id(custom_habits_id: str):
    """Returns a shopping list by ID"""
    custom_habits: CustomHabits | None = CustomHabits.get(custom_habits_id)

    if not custom_habits:
        abort(404, f"Custom Habits with ID {custom_habits_id} not found")

    return custom_habits.to_dict(), 200

@custom_habits_bp.route("/<custom_habits_id>", methods=["PUT"])
@jwt_required()
def update_custom_habits(custom_habits_id: str):

    data = request.get_json()
    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    custom_habits = CustomHabits.get(custom_habits_id)

    if not custom_habits:
        abort(404, f"Custom Habits with ID {custom_habits_id} not found")

    if not current_user.is_admin and custom_habits.owner_id != current_user_id:
        abort(403, "You are not authorized to update this Custom Habits.")

    try:
        custom_habits: CustomHabits | None = CustomHabits.update(custom_habits_id, data)
    except ValueError as e:
        abort(400, str(e))

    return custom_habits.to_dict(), 200


@custom_habits_bp.route("/<custom_habits_id>", methods=["DELETE"])
@jwt_required()
def delete_custom_habits(custom_habits_id: str):

    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    custom_habits = CustomHabits.get(custom_habits_id)

    if not custom_habits:
        abort(404, f"Custom Habits with ID {custom_habits_id} not found")

    # Check if the current user is admin or the owner of the Custom Habits
    if not current_user.is_admin and custom_habits.owner_id != current_user_id:
        abort(403, "You are not authorized to delete this Custom Habits.")

    if not CustomHabits.delete(custom_habits_id):
        abort(404, f"Custom Habits with ID {custom_habits_id} not found")

    return "", 204
