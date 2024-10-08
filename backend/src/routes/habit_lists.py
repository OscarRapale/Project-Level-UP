from flask import abort, request, jsonify, Blueprint
from src.models import db
from src.models.habit_list import HabitsList
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt


habits_lists_bp = Blueprint("habits_lists", __name__, url_prefix="/habits_lists")

@habits_lists_bp.route("/", methods=["GET"])
@jwt_required()
def get_habits_lists():

    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"msg": "Administration rights required"}), 403
    
    habits_lists: list[HabitsList] = HabitsList.get_all()

    return [habits_list.to_dict() for habits_list in habits_lists], 200


@habits_lists_bp.route("/", methods=["POST"])
@jwt_required()
def create_habits_list():

    data = request.get_json()
    current_user_id = get_jwt_identity()

    data["owner_id"] = current_user_id

    try:
        habits_list = HabitsList.create(data)
    except KeyError as e:
        abort(400, f"Missing field: {e}")
    except ValueError as e:
        abort(404, str(e))

    return habits_list.to_dict(), 201

@habits_lists_bp.route("/<habits_list_id>", methods=["GET"])
@jwt_required()
def get_habits_list_by_id(habits_list_id: str):
    """Returns a habits list by ID"""
    habits_list: HabitsList | None = HabitsList.get(habits_list_id)

    if not habits_list:
        abort(404, f"Habits List with ID {habits_list_id} not found")

    return habits_list.to_dict(), 200

@habits_lists_bp.route("/<habits_list_id>", methods=["PUT"])
@jwt_required()
def update_habits_list(habits_list_id: str):

    data = request.get_json()
    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    habits_list = HabitsList.get(habits_list_id)

    if not habits_list:
        abort(404, f"Habits list with ID {habits_list_id} not found")

    if not current_user.is_admin and habits_list.owner_id != current_user_id:
        abort(403, "You are not authorized to update this habits list.")

    try:
        habits_list: HabitsList | None = HabitsList.update(habits_list_id, data)
    except ValueError as e:
        abort(400, str(e))

    return habits_list.to_dict(), 200


@habits_lists_bp.route("/<habits_list_id>", methods=["DELETE"])
@jwt_required()
def delete_habits_list(habits_list_id: str):

    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    habits_list = HabitsList.get(habits_list_id)

    if not habits_list:
        abort(404, f"Habits list with ID {habits_list_id} not found")

    # Check if the current user is admin or the owner of the Habits List
    if not current_user.is_admin and habits_list.owner_id != current_user_id:
        abort(403, "You are not authorized to delete this habits list.")

    # Delete all HabitsListItem instances that reference the HabitsList
    for item in habits_list.items:
        db.session.delete(item)

    if not habitsList.delete(habits_list_id):
        abort(404, f"Habits list with ID {habits_list_id} not found")

    return "", 204
