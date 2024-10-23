from flask import request, jsonify, Blueprint
from flask_jwt_extended import create_access_token
from src.models.user import User
from flask_bcrypt import Bcrypt
from datetime import timedelta

bcrypt = Bcrypt()

auth_bp = Blueprint("auth", __name__)
@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Authenticate a user and return an access token.

    The user provides their email and password in the body of the POST request.
    If the email and password are valid, return a JSON object with an access token.
    If the email and password are not valid, return a 401 error with a message.

    :return: A JSON object with an access token if the email and password are valid,
             or a 401 error with a message if they are not.
    """
    email = request.json.get("email", None)
    password = request.json.get("password", None)
    user = User.query.filter_by(email=email).first()

    if user and bcrypt.check_password_hash(user.password_hash, password):
        additional_claims = {"is_admin": user.is_admin}
        expires = timedelta(hours=1)

        access_token = create_access_token(identity=user.id, additional_claims=additional_claims, 
                                           expires_delta=expires)
        user.check_daily_streak()  # Update user streak and login count
        return jsonify(access_token=access_token, user_id=user.id ), 200
    
    return jsonify({"msg": "Bad email or password"}), 401
