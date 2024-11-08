from flask import jsonify, Blueprint
from flask_jwt_extended import jwt_required, get_jwt

admin_bp = Blueprint("admin", __name__)

@admin_bp.route("/admin/data", methods=["POST", "DELETE"])
@jwt_required()
def admin_data():
    """
    Handle requests to the '/admin/data' route.

    This function requires a valid JWT token with an "is_admin" claim.
    If the JWT token is not provided or the "is_admin" claim is False,
    return a 403 error with a message.
    If the JWT token is valid and the "is_admin" claim is True,
    return a 200 status with a message.

    :return: A JSON object with a message and a status code.
    """
    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403

    return jsonify({"msg": "Admin access granted"}), 200
