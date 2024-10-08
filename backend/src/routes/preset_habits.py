from flask import request, abort, jsonify, Blueprint
from src.models.preset_habits import PresetHabits
from flask_jwt_extended import jwt_required, get_jwt, get_jwt_identity


preset_habits_bp = Blueprint("preset_habits", __name__, url_prefix="/preset_habits")

@items_bp.route("/", methods=["GET"])
@jwt_required()
def get_preset_habits():

    preset_habits: list[PresetHabits] = PresetHabits.get_all()

    return [preset_habits.to_dict() for preset_habits in preset_habits]


@preset_habits_bp.route("/", methods=["POST"])
@jwt_required()
def create_preset_habits():

    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    
    data = request.get_json()

    try:
        preset_habits = PresetHabits.create(data)
    except KeyError as e:
        abort(400, f"Missing field: {e}")
    except ValueError as e:
        abort(400, str(e))

    return preset_habits.to_dict(), 201


@preset_habits_bp.route("/<preset_habits_id>", methods=["GET"])
@jwt_required()
def get_preset_habits_by_id(preset_habits_id: str):

    preset_habits: PresetHabits | None = PresetHabits.get(preset_habits_id)

    if not preset_habits:
        abort(404, f"Preset habits with ID {preset_habits_id} not found")

    return preset_habits.to_dict()


@preset_habits_bp.route("/<preset_habits_id>", methods=["PUT"])
@jwt_required()
def update_preset_habits(preset_habits_id: str):

    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    
    data = request.get_json()

    try:
        preset_habits: PresetHabits | None = PresetHabits.update(preset_habits_id, data)
    except ValueError as e:
        abort(400, str(e))

    if not preset_habits:
        abort(404, f"Preset habits with ID {preset_habits_id} not found")

    return preset_habits.to_dict()


@preset_habits_bp.route("/<preset_habits_id>", methods=["DELETE"])
@jwt_required()
def delete_preset_habits(preset_habits_id: str):

    claims = get_jwt()
    if not claims.get('is_admin'):
        return jsonify({"msg": "Administration rights required"}), 403
    
    if not PresetHabits.delete(preset_habits_id):
        abort(404, f"Preset habits with ID {preset_habits_id} not found")

    return "", 204