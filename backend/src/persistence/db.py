from src.models.base import Base
from src.models import db
from src.models.category import Category
from src.persistence.repository import Repository
from sqlalchemy.exc import SQLAlchemyError

class DBRepository(Repository):
    """
    A repository for interacting with the database using SQLAlchemy.
    """

    def __init__(self) -> None:
        """
        Initialize a new DBRepository.
        """
        self.__session = db.session
        self.reload()

    def get_all(self, model_name: str) -> list:
        """
        Get all instances of a model.

        :param model_name: The name of the model.
        :return: A list of all instances of the model.
        """
        try:
            return self.__session.query(model_name).all()

        except SQLAlchemyError:
            self.__session.rollback()
            return []

    def get(self, model_name: str, obj_id: str) -> Base | None:
        """
        Get an instance of a model by its ID.

        :param model_name: The name of the model.
        :param obj_id: The ID of the instance.
        :return: The instance if found, otherwise None.
        """
        try:
            return self.__session.query(model_name).get(obj_id)
        
        except SQLAlchemyError:
            self.__session.rollback()
            return None
        
    def get_for_category(self, name: str) -> Base | None:
        """
        Get a Category instance by its name.

        :param name: The name of the Category.
        :return: The Category instance if found, otherwise None.
        """
        try:
            return self.__session.query(Category).filter_by(name=name).first()
        
        except SQLAlchemyError:
            self.__session.rollback()
            return None
    
    def reload(self) -> None:
        """
        Reload the database session.
        """
        self.__session = db.session

    def save(self, obj: Base) -> Base:
        """
        Save an instance to the database.

        :param obj: The instance to save.
        :return: The saved instance.
        """
        try:
            self.__session.add(obj)
            self.__session.commit()

        except SQLAlchemyError:
            self.__session.rollback()
            print(f"Error saving object: {SQLAlchemyError}")

    def update(self, obj: Base) -> None:
        """
        Update an instance in the database.

        :param obj: The instance to update.
        """
        try:
            self.__session.commit()

        except SQLAlchemyError:
            self.__session.rollback()

    def delete(self, obj: Base) -> bool:
        """
        Delete an instance from the database.

        :param obj: The instance to delete.
        :return: True if the instance was deleted, otherwise False.
        """
        try:
            self.__session.delete(obj)
            self.__session.commit()

        except SQLAlchemyError:
            self.__session.rollback()
            return False
        
    def _get_model_class(self, model_name: str):
        """
        Get the class for a model by its name.

        :param model_name: The name of the model.
        :return: The class for the model.
        """
        from src.models.user import User
        from src.models.category import Category
        from src.models.preset_habit import PresetHabit
        from src.models.custom_habit import CustomHabit
        from src.models.habit_list import HabitList

        models = {
            "user": User,
            "category": Category,
            "preset_habit": PresetHabit,
            "custom_habit": CustomHabit,
            "habit_list": HabitList
        }

        return models[model_name.lower()]
