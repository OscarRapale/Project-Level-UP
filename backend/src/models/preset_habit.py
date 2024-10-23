from . import db
import random
from src.models.category import Category

class PresetHabit(db.Model):
    """
    PresetHabit model class for handling operations related to PresetHabit.
    """

    __tablename__ = "preset_habits"

    description = db.Column(db.String(300), nullable=False)
    category_name = db.Column(db.String(128), db.ForeignKey("categories.name"), nullable=True)
    xp_reward = db.Column(db.Integer, nullable=False, default=50)

    category = db.relationship("Category", back_populates="habits")
    habit_lists = db.relationship("HabitListItem", back_populates="preset_habit")

    def __init__(self, description: str, category_name: str, **kw) -> None:
        """
        Initialize a new PresetHabit instance.
        """
        super().__init__(**kw)
        self.description = description
        self.category_name = category_name
        self.xp_reward = random.randint(75, 100)

    def __repr__(self) -> str:
        """
        Return a string representation of this PresetHabit.
        """
        return f"PresetHabit {self.description}"

    def to_dict(self) -> dict:
        """
        Convert this PresetHabit to a dictionary.
        """
        return {
            "id": self.id,
            "description": self.description,
            "category_name": self.category_name,
            "xp_reward": self.xp_reward,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @staticmethod
    def create(data: dict) -> "PresetHabit":
        """
        Create a new PresetHabit instance and save it to the database.
        """
        from src.persistence import repo

        category = Category.get(data["category_name"])

        if not category:
            raise ValueError("Category not found")
        
        preset_habit = PresetHabit(**data)
        repo.save(preset_habit)

        return preset_habit

    @staticmethod
    def update(habit_id: str, data: dict) -> "PresetHabit":
        """
        Update a PresetHabit instance with new data.
        """
        from src.persistence import repo

        preset_habit = PresetHabit.get(habit_id)

        if not preset_habit:
            raise ValueError("Habit not found")
        
        for key, value in data.items():
            setattr(preset_habit, key, value)

        repo.update(preset_habit)

        return preset_habit

    @staticmethod
    def delete(preset_habit_id: str) -> bool:
        """
        Delete a PresetHabit instance from the database.

        Args:
            preset_habit_id (str): The ID of the preset habit to be deleted.

        Returns:
            bool: True if the preset habit was deleted, False if not found.
        """
        from src.persistence import repo

        preset_habit: PresetHabit | None = PresetHabit.get(preset_habit_id)

        if not preset_habit:
            return False
        
        repo.delete(preset_habit)

        return True
