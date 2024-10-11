from flask import abort, request, jsonify, Blueprint
from src.models.preset_habit import PresetHabit
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

preset_habit_bp = Blueprint("preset_habits", __name__, url_prefix="/preset_habits")

@preset_habit_bp.route("/", methods=["GET"])
def get_preset_habits():
    """
    Get all preset habits.

    This endpoint returns a list of all preset habits.

    :return: A list of all preset habits.
    """
    preset_habits: list[PresetHabit] = PresetHabit.get_all()

    return [preset_habit.to_dict() for preset_habit in preset_habits]

@preset_habit_bp.route("/", methods=["POST"])
@jwt_required()
def create_preset_habit():
    """
    Create a new preset habit.

    This endpoint creates a new preset habit with the data in the request body. If the request body is missing a required field, it aborts with a 400 status code. If the current user is not an admin, it returns a 403 status code.

    :return: The created preset habit and a 201 status code.
    """
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    
    data = request.get_json()

    try:
        preset_habit = PresetHabit.create(data)

    except KeyError as e:
        abort(400, f"Missing field: {e}")

    except ValueError as e:
        abort(400, str(e))

    return preset_habit.to_dict(), 201

@preset_habit_bp.route("/<preset_habit_id>", methods=["GET"])
@jwt_required()
def get_preset_habits_by_id(preset_habit_id: str):
    """
    Get a preset habit by ID.

    This endpoint returns a preset habit with the given ID. If the preset habit is not found, it aborts with a 404 status code.

    :param preset_habit_id: The ID of the preset habit to get.
    :return: The preset habit.
    """

    preset_habit: PresetHabit | None = PresetHabit.get(preset_habit_id)

    if not preset_habit:
        abort(404, f"Habit with ID '{preset_habit_id}' not found")

    return preset_habit.to_dict()

@preset_habit_bp.route("/<preset_habit_id>", methods=["PUT"])
@jwt_required()
def update_preset_habit(preset_habit_id: str):
    """
    Update a preset habit.

    This endpoint updates a preset habit with the given ID and the data in the request body. If the preset habit is not found, it aborts with a 404 status code. If the current user is not an admin, it returns a 403 status code.

    :param preset_habit_id: The ID of the preset habit to update.
    :return: The updated preset habit.
    """
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    
    data = request.get_json()

    try:
        preset_habit: PresetHabit | None = PresetHabit.update(preset_habit_id, data)

    except ValueError as e:
        abort(400, str(e))

    if not preset_habit:
        abort(404, f"Habit with ID '{preset_habit_id}' not found")

    return preset_habit.to_dict()
    
@preset_habit_bp.route("/<preset_habit_id>", methods=["DELETE"])
@jwt_required()
def delete_preset_habit(preset_habit_id: str):
    """
    Delete a preset habit.

    This endpoint deletes a preset habit with the given ID. If the preset habit is not found, it aborts with a 404 status code. If the current user is not an admin, it returns a 403 status code.

    :param preset_habit_id: The ID of the preset habit to delete.
    :return: A 204 status code.
    """

    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    
    if not PresetHabit.delete(preset_habit_id):
        abort(404, f"Habit with ID '{preset_habit_id}' not found")

    return "", 204