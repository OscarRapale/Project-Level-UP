from flask import abort, request, jsonify, Blueprint
from src.models.preset_habit import PresetHabit
from src.models.category import Category
from flask_jwt_extended import jwt_required, get_jwt_identity, get_jwt

categories_bp = Blueprint("categories", __name__, url_prefix="/categories")

@categories_bp.route("/", methods=["GET"])
def get_categories():
    """
    Get all categories.

    This endpoint returns a list of all categories.

    :return: A list of all categories.
    """
    categories: list[Category] = Category.get_all()

    return [category.to_dict() for category in categories]

@categories_bp.route("/<name>", methods=["GET"])
def get_categories_by_name(name: str):
    """
    Get a category by name.

    This endpoint returns a category with the given name. If the category is not found, it aborts with a 404 status code.

    :param name: The name of the category to get.
    :return: The category.
    """
    category: Category | None = Category.get(name)

    if not category:
        abort(404, f"Category with name '{name}' not found")

    return category.to_dict()

@categories_bp.route("/<name>/preset_habits", methods=["GET"])
def get_categories_habits(name: str):
    """
    Get the preset habits of a category.

    This endpoint returns the preset habits of a category with the given name. If the category is not found, it aborts with a 404 status code.

    :param name: The name of the category to get the preset habits of.
    :return: The preset habits of the category.
    """
    category: Category | None = Category.get(name)

    if not category:
        abort(404, f"Category with name '{name}' not found")

    preset_habits: list[PresetHabit] = PresetHabit.get_all()

    category_items = [
        preset_habit.to_dict() for preset_habit in preset_habits if preset_habit.category_name == category.name
    ]

    return category_items

@categories_bp.route("/", methods=["POST"])
@jwt_required()
def create_category():
    """
    Create a new category.

    This endpoint creates a new category with the data in the request body. If the request body is missing the "name" field, it aborts with a 400 status code. If the current user is not an admin, it returns a 403 status code.

    :return: The created category and a 201 status code.
    """

    if get_jwt_identity() is None:
        return jsonify({"msg": "Please login first to access this page"})

    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403
    data = request.get_json()

    try:
        name = data["name"]
        category = Category.create(name)

    except KeyError as e:
        abort(400, f"Missing field: {e}")
    except ValueError as e:
        abort(400, str(e))

    return category.to_dict(), 201

@categories_bp.route("/<name>", methods=["DELETE"])
@jwt_required()
def delete_category(name: str):
    """
    Delete a category.

    This endpoint deletes a category with the given name. If the category is not found, it aborts with a 404 status code. If the current user is not an admin, it returns a 403 status code.

    :param name: The name of the category to delete.
    :return: A 204 status code.
    """

    claims = get_jwt()
    if not claims.get("is_admin"):
        return jsonify({"msg": "Administration rights required"}), 403

    if not Category.delete(name):
        abort(404, f"Category with name '{name}' not found")

    return "", 204
