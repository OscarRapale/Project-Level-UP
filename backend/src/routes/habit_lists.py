from flask import abort, request, jsonify, Blueprint
from src.models import db
from src.models.habit_list import HabitList
from src.models.user import User
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt
from src import socketio
import json
from datetime import datetime

habit_lists_bp = Blueprint("habit_lists", __name__, url_prefix="/habit_lists")

def default_serializer(obj):
    if isinstance(obj, datetime):
        return obj.isoformat()
    raise TypeError(f"Type {type(obj)} not serializable")

def get_habit_details(habit_list):
    from src.models.preset_habit import PresetHabit
    from src.models.custom_habit import CustomHabit

    habits = []
    for item in habit_list.habits:
        if item.preset_habit_id:
            habit = PresetHabit.get(item.preset_habit_id)
            habits.append({
                "id": item.id,
                "description": habit.description,
                "type": "preset"
            })
        elif item.custom_habit_id:
            habit = CustomHabit.get(item.custom_habit_id)
            habits.append({
                "id": item.id,
                "description": habit.description,
                "type": "custom"
            })
    return habits

@habit_lists_bp.route("/", methods=["GET"])
@jwt_required()
def get_habit_lists():
    """
    Get all habit lists.

    This endpoint retrieves all habit lists. It requires a valid JWT token for authentication
    and administration rights.

    Returns:
        Response: A JSON response with a list of habit lists and status code 200 if successful.
    """
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    
    habit_lists: list[HabitList] = HabitList.get_all()

    return [habit_list.to_dict() for habit_list in habit_lists], 200

@habit_lists_bp.route("/", methods=["POST"])
@jwt_required()
def create_habit_list():
    """
    Create a new habit list.

    This endpoint creates a new habit list. It requires a valid JWT token for authentication.

    Returns:
        Response: A JSON response with the created habit list and status code 201 if successful.
    """
    data = request.get_json()
    current_user_id = get_jwt_identity()

    data["list_owner_id"] = current_user_id

    try:
        habit_list = HabitList.create(data)

    except KeyError as e:
        abort(400, f"Missing field: {e}")

    except ValueError as e:
        abort(404, str(e))

    habit_list_data = habit_list.to_dict()
    habit_list_data_serialized = json.loads(json.dumps(habit_list_data, default=default_serializer))

    socketio.emit("habit_list_created", habit_list_data_serialized)

    return habit_list_data, 201

@habit_lists_bp.route("/<habit_list_id>", methods=["GET"])
@jwt_required()
def get_habit_list_by_id(habit_list_id: str):
    """
    Get a habit list by ID.

    This endpoint retrieves a habit list by its ID.

    Args:
        habit_list_id (str): The ID of the habit list to retrieve.

    Returns:
        Response: A JSON response with the habit list and status code 200 if successful.
    """
    habit_list: HabitList | None = HabitList.get(habit_list_id)

    if not habit_list:
        abort(404, f"Habit list with ID {habit_list_id} not found")

    return habit_list.to_dict(), 200

@habit_lists_bp.route("/user", methods=["GET"])
@jwt_required()
def get_user_habit_lists():
    """
    Get habit lists of the current user.

    This endpoint retrieves the habit lists of the current user. It requires a valid JWT token for authentication.

    Returns:
        Response: A JSON response with a list of habit lists and status code 200 if successful.
    """
    current_user_id = get_jwt_identity()
    habit_lists = HabitList.get_by_user_id(current_user_id)

    return jsonify([habit_list.to_dict() for habit_list in habit_lists]), 200

@habit_lists_bp.route("/<habit_list_id>", methods=["PUT"])
@jwt_required()
def update_habit_list(habit_list_id: str):
    """
    Update a habit list.

    This endpoint updates a habit list.

    Args:
        habit_list_id (str): The ID of the habit list to update.

    Returns:
        Response: A JSON response with the updated habit list and status code 200 if successful.
    """
    data = request.get_json()
    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    habit_list = HabitList.get(habit_list_id)

    if not habit_list:
        abort(404, f"Habit list with ID {habit_list_id} not found")

    if not current_user.is_admin and habit_list.list_owner_id != current_user_id:
        abort(403, "You are not authorized to update this habit list.")

    try:
        habit_list: HabitList | None = HabitList.update(habit_list_id, data)
    except ValueError as e:
        abort(400, str(e))

    return habit_list.to_dict(), 200

@habit_lists_bp.route("/<habit_list_id>", methods=["DELETE"])
@jwt_required()
def delete_habit_list(habit_list_id: str):
    """
    Delete a habit list.

    This endpoint deletes a habit list.

    Args:
        habit_list_id (str): The ID of the habit list to delete.

    Returns:
        Response: An empty response with status code 204 if successful.
    """
    current_user_id = get_jwt_identity()
    current_user = User.get(current_user_id)
    habit_list = HabitList.get(habit_list_id)

    if not habit_list:
        abort(404, f"Habit list with ID {habit_list_id} not found")

    # Check if the current user is admin or the owner of the habit list
    if not current_user.is_admin and habit_list.list_owner_id != current_user_id:
        abort(403, "You are not authorized to delete this habit list.")

    # Delete all HabitListItem instances that reference the HabitList
    for habit in habit_list.habits:
        db.session.delete(habit)

    if not HabitList.delete(habit_list_id):
        abort(404, f"Habit list with ID {habit_list_id} not found")

    return "", 204

@habit_lists_bp.route("/<habit_list_id>/habits", methods=["POST"])
@jwt_required()
def add_habit_to_habit_list(habit_list_id: str):
    """
    Add preset habits to a habit list.

    This endpoint adds preset habits to a habit list. The request body should contain a list of preset habit IDs.
    If the habit list or any of the preset habits are not found, it returns a 404 error.
    If the request body does not contain a list of preset habit IDs, it returns a 400 error.

    :param habit_list_id: The ID of the habit list to add habits to.
    :return: A JSON object with the added preset habits and a 200 status code.
    """
    from src.models.preset_habit import PresetHabit
    from src.models.habit_list import HabitListItem

    data = request.get_json()
    preset_habit_ids = data.get("preset_habit_ids")

    if not isinstance(preset_habit_ids, list):
        abort(400, "Expected a list of habits")

    habit_list = HabitList.get(habit_list_id)

    if not habit_list:
        abort(404, f"Habit list with ID {habit_list_id} not found")

    added_preset_habits = []
    for preset_habit_id in preset_habit_ids:
        preset_habit = PresetHabit.get(preset_habit_id)
        if not preset_habit:
            abort(404, f"Habit with ID {preset_habit_id} not found")

        habit_list_item = HabitListItem.get(habit_list_id, preset_habit_id)

        if habit_list_item:
            continue

        new_habit_list_item = HabitListItem.create({"habit_list_id": habit_list_id, "preset_habit_id": preset_habit_id})
        added_preset_habits.append(new_habit_list_item.to_dict())

    # Serialize habit list data
    habit_list_data = habit_list.to_dict()
    habit_list_data['habits'] = get_habit_details(habit_list)  # Ensure habits are included
    habit_list_data_serialized = json.loads(json.dumps(habit_list_data, default=default_serializer))

    # Emit the habit list data to WebSocket clients
    socketio.emit("habit_list_update", {"habit_list_id": habit_list_id, "habit_list_data": habit_list_data_serialized})

    return {"added_preset_habits": added_preset_habits}, 200

@habit_lists_bp.route("/<habit_list_id>/custom_habits", methods=["POST"])
@jwt_required()
def add_custom_habit_to_habit_list(habit_list_id: str):
    """
    Add custom habits to a habit list.

    This endpoint adds custom habits to a habit list. The request body should contain a list of custom habit IDs.
    If the habit list or any of the custom habits are not found, it returns a 404 error.
    If the request body does not contain a list of custom habit IDs, it returns a 400 error.

    :param habit_list_id: The ID of the habit list to add habits to.
    :return: A JSON object with the added custom habits and a 200 status code.
    """
    from src.models.custom_habit import CustomHabit
    from src.models.habit_list import HabitListItem

    data = request.get_json()
    custom_habit_ids = data.get("custom_habit_ids")

    if not isinstance(custom_habit_ids, list):
        abort(400, "Expected a list of habits")

    habit_list = HabitList.get(habit_list_id)

    if not habit_list:
        abort(404, f"Habit list with ID {habit_list_id} not found")

    added_custom_habits = []
    for custom_habit_id in custom_habit_ids:
        custom_habit = CustomHabit.get(custom_habit_id)
        if not custom_habit:
            abort(404, f"Habit with ID {custom_habit_id} not found")

        habit_list_item = HabitListItem.get(habit_list_id, custom_habit_id)

        if habit_list_item:
            continue

        new_habit_list_item = HabitListItem.create({"habit_list_id": habit_list_id, "custom_habit_id": custom_habit_id})
        added_custom_habits.append(new_habit_list_item.to_dict())

    # Serialize habit list data
    habit_list_data = habit_list.to_dict()
    habit_list_data['habits'] = get_habit_details(habit_list)  # Ensure habits are included
    habit_list_data_serialized = json.loads(json.dumps(habit_list_data, default=default_serializer))

    # Emit the habit list data to WebSocket clients
    socketio.emit("habit_list_update", {"habit_list_id": habit_list_id, "habit_list_data": habit_list_data_serialized})

    return {"added_custom_habits": added_custom_habits}, 200

def get_habits(habit_list_id: str, habit_type: str):
    """
    Get habits of a specific type from a habit list.

    This function fetches habits of a specific type (preset or custom) from a habit list.
    If the habit list is not found, it returns a 404 error.

    :param habit_list_id: The ID of the habit list.
    :param habit_type: The type of habits to fetch ('preset' or 'custom').
    :return: A JSON object with the habits and a 200 status code.
    """
    from src.models.custom_habit import CustomHabit
    from src.models.preset_habit import PresetHabit
    from src.models.habit_list import HabitListItem

    habit_list = HabitList.get(habit_list_id)
    if not habit_list:
        abort(404, f"Habit list with ID {habit_list_id} not found")

    habit_list_items = HabitListItem.query.filter_by(habit_list_id=habit_list_id).all()

    if habit_type == "preset":
        habits = [PresetHabit.get(habit_item.preset_habit_id) for habit_item in habit_list_items if habit_item.preset_habit_id]
    elif habit_type == "custom":
        habits = [CustomHabit.get(habit_item.custom_habit_id) for habit_item in habit_list_items if habit_item.custom_habit_id]
    else:
        abort(400, "Invalid habit type")

    return jsonify([habit.to_dict() for habit in habits if habit]), 200

@habit_lists_bp.route("/<habit_list_id>/habits", methods=["GET"])
@jwt_required()
def get_preset_habits_of_habit_list(habit_list_id: str):
    """
    Get preset habits of a habit list.

    This endpoint returns the preset habits of a habit list. If the habit list is not found, it returns a 404 error.

    :param habit_list_id: The ID of the habit list.
    :return: A JSON object with the preset habits and a 200 status code.
    """
    return get_habits(habit_list_id, "preset")

@habit_lists_bp.route("/<habit_list_id>/custom_habits", methods=["GET"])
@jwt_required()
def get_custom_habits_of_habit_list(habit_list_id: str):
    """
    Get custom habits of a habit list.

    This endpoint returns the custom habits of a habit list. If the habit list is not found, it returns a 404 error.

    :param habit_list_id: The ID of the habit list.
    :return: A JSON object with the custom habits and a 200 status code.
    """
    return get_habits(habit_list_id, "custom")

@habit_lists_bp.route("<habit_list_id>/habits/<habit_id>/complete", methods=["POST"])
@jwt_required()
def complete_preset_habit(habit_list_id: str, habit_id: str):
    """
    Complete a preset habit in the habit list.

    This endpoint marks a preset habit as completed in the specified habit list.

    Args:
        habit_list_id (str): The ID of the habit list.
        habit_id (str): The ID of the preset habit to complete.
    """
    try:
        habit_list = HabitList.query.get(habit_list_id)
        if not habit_list:
            return jsonify({"msg": f"Habit list with ID {habit_list_id} not found"}), 404

        habit_list.complete_preset_habit(habit_id)

        # Get the current user
        current_user_id = get_jwt_identity()
        user = User.get(current_user_id)

        # Serialize user data
        user_data = user.to_dict()
        user_data_serialized = json.loads(json.dumps(user_data, default=default_serializer))

        # Emit the user data to WebSocket clients
        socketio.emit("user_update", {"user_id": current_user_id, "user_data": user_data_serialized})

        return jsonify({"msg": f"Habit with ID {habit_id} completed successfully"}), 200

    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    except Exception as e:
        return jsonify({"msg": "An error occurred while completing the habit"}), 500

@habit_lists_bp.route("<habit_list_id>/custom_habits/<habit_id>/complete", methods=["POST"])
@jwt_required()
def complete_custom_habit(habit_list_id: str, habit_id: str):
    """
    Complete a custom habit in the habit list.

    This endpoint marks a custom habit as completed in the specified habit list.

    Args:
        habit_list_id (str): The ID of the habit list.
        habit_id (str): The ID of the custom habit to complete.
    """
    try:
        habit_list = HabitList.query.get(habit_list_id)
        if not habit_list:
            return jsonify({"msg": f"Habit list with ID {habit_list_id} not found"}), 404

        habit_list.complete_custom_habit(habit_id)

        # Get the current user
        current_user_id = get_jwt_identity()
        user = User.get(current_user_id)

        # Serialize user data
        user_data = user.to_dict()
        user_data_serialized = json.loads(json.dumps(user_data, default=default_serializer))

        # Emit the user data to WebSocket clients
        socketio.emit("user_update", {"user_id": current_user_id, "user_data": user_data_serialized})

        return jsonify({"msg": f"Custom habit with ID {habit_id} completed successfully"}), 200

    except ValueError as e:
        return jsonify({"msg": str(e)}), 400

    except Exception as e:
        return jsonify({"msg": f"An error occurred while completing the custom habit"}), 500
