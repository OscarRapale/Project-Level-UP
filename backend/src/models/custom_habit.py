from . import db
import random
from src.models.user import User

class CustomHabit(db.Model):
    """
    CustomHabit model class for handling operations related to CustomHabit.
    """

    __tablename__ = "custom_habits"

    description = db.Column(db.String(200), nullable=False)
    habit_owner_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    xp_reward = db.Column(db.Integer, nullable=False, default=50)

    habit_owner = db.relationship("User", back_populates="custom_habits", lazy=True)
    habit_lists = db.relationship("HabitListItem", back_populates="custom_habit")

    def __init__(self, description: str, habit_owner_id: str, **kw) -> None:
        """
        Initialize a new CustomHabit instance.
        """
        super().__init__(**kw)
        self.description = description
        self.habit_owner_id = habit_owner_id
        self.xp_reward = random.randint(75, 100)

    def __repr__(self) -> str:
        """
        Return a string representation of this CustomHabit.
        """
        return f"CustomHabit {self.description}"

    def to_dict(self) -> dict:
        """
        Convert this CustomHabit to a dictionary.
        """
        return {
            "id": self.id,
            "description": self.description,
            "habit_owner_id": self.habit_owner_id,
            "xp_reward": self.xp_reward,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @staticmethod
    def create(data: dict) -> "CustomHabit":
        """
        Create a new CustomHabit instance and save it to the database.
        """
        from src.persistence import repo

        user: User | None = User.get(data["habit_owner_id"])

        if not user:
            raise ValueError(f"User with ID {data['habit_owner_id']} not found")
        
        new_custom_habit = CustomHabit(description=data["description"], habit_owner_id=data["habit_owner_id"])

        db.session.add(new_custom_habit)
        db.session.commit()

        return new_custom_habit
    
    @staticmethod
    def update(custom_habit_id: str, data: dict) -> "CustomHabit | None":
        """
        Update a CustomHabit instance with new data.
        """
        from src.persistence import repo

        custom_habit: CustomHabit | None = CustomHabit.get(custom_habit_id)

        if not custom_habit:
            return None
        
        for key, value in data.items():
            setattr(custom_habit, key, value)

        repo.update(custom_habit)

        return custom_habit

    @staticmethod
    def delete(custom_habit_id: str) -> bool:
        """
        Delete a CustomHabit instance from the database.

        Args:
            custom_habit_id (str): The ID of the custom habit to be deleted.

        Returns:
            bool: True if the custom habit was deleted, False if not found.
        """
        from src.persistence import repo

        custom_habit: CustomHabit | None = CustomHabit.get(custom_habit_id)

        if not custom_habit:
            return False
            
        repo.delete(custom_habit)

        return True
