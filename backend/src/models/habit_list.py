import pytz
from . import db
from src.models.user import User
import uuid
from datetime import datetime, time, timedelta
from flask import jsonify

class HabitList(db.Model):
    """
    HabitList model class for handling operations related to HabitList.
    """

    __tablename__ = "habit_lists"

    name = db.Column(db.String(200), nullable=True)
    list_owner_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    completed_habits = db.Column(db.Integer, default=0)

    list_owner = db.relationship("User", back_populates="habit_lists", lazy=True)
    habits = db.relationship("HabitListItem", back_populates="habit_list", lazy="dynamic")

    def __init__(self, name: str, list_owner_id: str, **kw) -> None:
        """
        Initialize a new HabitList instance.
        """
        super().__init__(**kw)
        self.name = name
        self.list_owner_id = list_owner_id
        self.completed_habits = 0

    def __repr__(self) -> str:
        """
        Return a string representation of this HabitList.
        """
        return f"HabitList {self.name}"

    def to_dict(self) -> dict:
        """
        Convert this HabitList to a dictionary.
        """
        return {
            "id": self.id,
            "name": self.name,
            "list_owner_id": self.list_owner_id,
            "completed_habits": self.completed_habits,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    def check_deadline_and_complete_habit(self, habit_list_item, xp_reward):
        """
        Check if the habit is completed before the daily deadline and update the habit status.

        This method checks if the habit is completed before the end of the day. If the habit is completed
        on time, the user gains full XP and recovers HP. If the habit is completed late, the user loses HP
        and gains reduced XP.

        Args:
            habit_list_item (HabitListItem): The habit list item to be checked and updated.
            xp_reward (int): The amount of XP to be rewarded for completing the habit.
        """
        from src.persistence import repo
        est = pytz.timezone('US/Eastern')
        now_utc = datetime.utcnow().replace(tzinfo=pytz.utc)
        now_est = now_utc.astimezone(est) # Change timezone to EST

        # Set the daily deadline to 12am
        deadline_est = datetime.combine(now_est.date(), time(0, 0)).replace(tzinfo=est)

        # Check if habit was added before the deadline
        if habit_list_item.created_at.astimezone(est) < deadline_est:

            # Check if current time is past the deadline and habits is not completed
            if now_est > deadline_est and not habit_list_item.habit_is_completed:
               habit_list_item.is_late = True # Set is_late to True

            if habit_list_item.is_late:

                # If habit is completed late
                habit_list_item.habit_is_completed = True
                self.completed_habits +=1

                reduced_xp = int(xp_reward * 0.5) # Reduce XP reward by half
                self.list_owner.gain_xp(reduced_xp) # User gains reduced XP

            else:
                # User completed the habits in time
                habit_list_item.habit_is_completed = True
                self.completed_habits += 1

                self.list_owner.gain_xp(xp_reward) # Gain full XP reward
                self.list_owner.recover_hp(hp_points=15) # Recover HP if User lost HP

        else:
            # Habit was added after deadline
            habit_list_item.habit_is_completed = True
            self.completed_habits += 1

            self.list_owner.gain_xp(xp_reward)
            self.list_owner.recover_hp(hp_points=15)

        repo.save(self)
        repo.save(habit_list_item)

    def check_incomplete_habits(self):
        """
        Check for incomplete habits and apply penalties.

        This method checks if there are any incomplete habits for the current day.
        If the current time is past the daily deadline (midnight EST), it iterates
        through the habits and applies an HP penalty to the user for each incomplete habit.
        """
        from src.persistence import repo

        now_utc = datetime.utcnow().replace(tzinfo=pytz.utc)
        est = pytz.timezone('US/Eastern')
        now_est = now_utc.astimezone(est)  # Change timezone to EST

        # Set the daily deadline to midnight EST
        deadline_est = datetime.combine(now_est.date(), time(0, 0)).replace(tzinfo=est)

        # Check if the current time is past the deadline
        if now_est > deadline_est:
            # Check if penalties have already been applied today
            if self.list_owner.last_login and self.list_owner.last_login.date() >= now_est.date():
                return

            # Flag to check if HP dropped to 0
            hp_is_zero = False

            # Iterate through habits to check for incompletion
            for habit_list_item in self.habits:
                if not habit_list_item.habit_is_completed:
                    # Habit was left incomplete
                    self.list_owner.lose_hp(hp_points=25)  # HP penalty for user

                    # Check if HP dropped to 0
                    if self.list_owner.hp == 0:
                        hp_is_zero = True

            # Apply XP penalty
            if hp_is_zero:
                self.list_owner.lose_xp(xp_points=50)

            # Update the last login date to indicate penalties have been applied
            self.list_owner.last_login = now_est

        repo.save(self.list_owner)
        repo.save(self)

    def complete_preset_habit(self, habit_id):
        """
        Complete a preset habit in the habit list.

        :param habit_id: The ID of the preset habit to complete.
        :raises ValueError: If the habit is not found or is already completed.
        """
        from src.persistence import repo

        habit_list_item = HabitListItem.query.filter_by(habit_list_id=self.id, preset_habit_id=habit_id).first()

        if not habit_list_item:
            raise ValueError(f"Habit with ID {habit_id} not found in Habit List")

        if habit_list_item.habit_is_completed:
            raise ValueError(f"Habit with ID {habit_id} is already completed")

        # Handle deadline and completion
        self.check_deadline_and_complete_habit(habit_list_item,
                                                habit_list_item.preset_habit.xp_reward)

    def complete_custom_habit(self, habit_id):
        """
        Complete a custom habit in the habit list.

        :param habit_id: The ID of the custom habit to complete.
        :raises ValueError: If the habit is not found or is already completed.
        """
        from src.persistence import repo

        habit_list_item = HabitListItem.query.filter_by(habit_list_id=self.id, custom_habit_id=habit_id).first()

        if not habit_list_item:
            raise ValueError(f"Habit with ID {habit_id} not found in Habit List")

        if habit_list_item.habit_is_completed:
            raise ValueError(f"Habit with ID {habit_id} is already completed")

        # Handle deadline and completion
        self.check_deadline_and_complete_habit(habit_list_item,
                                                habit_list_item.custom_habit.xp_reward)

    @staticmethod
    def create(data: dict) -> "HabitList":
        """
        Create a new HabitList instance and save it to the database.
        """
        from src.persistence import repo

        user: User | None = User.get(data["list_owner_id"])

        if not user:
            raise ValueError(f"User with ID {data['list_owner_id']} not found")

        new_habit_list = HabitList(name=data["name"], list_owner_id=data["list_owner_id"])

        db.session.add(new_habit_list)
        db.session.commit()

        return new_habit_list

    @staticmethod
    def update(habit_list_id: str, data: dict) -> "HabitList | None":
        """
        Update a HabitList instance with new data.
        """
        from src.persistence import repo

        habit_list: HabitList | None = HabitList.get(habit_list_id)

        if not habit_list:
            return None

        for key, value in data.items():
            setattr(habit_list, key, value)

        repo.update(habit_list)

        return habit_list
    
    @staticmethod
    def delete(habit_list_id: str) -> bool:
        """
        Delete a HabitList instance from the database.

        Args:
            habit_list_id (str): The ID of the habit list to be deleted.

        Returns:
            bool: True if the habit list was deleted, False if not found.
        """
        from src.persistence import repo

        habit_list: HabitList | None = HabitList.get(habit_list_id)

        if not habit_list:
            return False
        
        repo.delete(habit_list)

        return True

    @staticmethod
    def delete(habit_list_id: str) -> bool:
        """
        Delete a HabitList instance from the database.

        Args:
            habit_list_id (str): The ID of the habit list to be deleted.

        Returns:
            bool: True if the habit list was deleted, False if not found.
        """
        from src.persistence import repo

        habit_list: HabitList | None = HabitList.get(habit_list_id)

        if not habit_list:
            return False

        repo.delete(habit_list)

        return True

    @classmethod
    def get_by_user_id(cls, user_id: str):
        return cls.query.filter_by(list_owner_id=user_id).all()

class HabitListItem(db.Model):
    """
    The HabitListItem model represents an item in a habit list.
    Each item can be associated with either a preset habit or a custom habit.
    """
    __tablename__ = "habit_list_items"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    habit_list_id = db.Column(db.String(36), db.ForeignKey("habit_lists.id"), nullable=False)
    preset_habit_id = db.Column(db.String(36), db.ForeignKey("preset_habits.id"), nullable=True)
    custom_habit_id = db.Column(db.String(36), db.ForeignKey("custom_habits.id"), nullable=True)
    habit_is_completed = db.Column(db.Boolean, default=False)
    is_late = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=db.func.current_timestamp())
    updated_at = db.Column(db.DateTime, onupdate=db.func.current_timestamp())

    habit_list = db.relationship("HabitList", back_populates="habits")
    preset_habit = db.relationship("PresetHabit", back_populates="habit_lists")
    custom_habit = db.relationship("CustomHabit", back_populates="habit_lists")

    def __init__(self, habit_list_id: str, habit_is_completed: bool = False, preset_habit_id: str = None,
                 custom_habit_id: str = None, is_late: bool = False, **kw) -> None:
        """
        Initialize a new HabitListItem.

        :param habit_list_id: The ID of the habit list this item belongs to.
        :param habit_completed: Whether the habit is completed.
        :param preset_habit_id: The ID of the preset habit associated with this item. This is optional.
        :param custom_habit_id: The ID of the custom habit associated with this item. This is optional.
        """
        super().__init__(**kw)
        self.habit_list_id = habit_list_id
        self.preset_habit_id = preset_habit_id
        self.custom_habit_id = custom_habit_id
        self.habit_is_completed = habit_is_completed
        self.is_late = is_late

    def to_dict(self) -> dict:
        """
        Convert this HabitListItem to a dictionary.

        :return: A dictionary representation of this HabitListItem.
        """
        return {
            "id": self.id,
            "habit_list_id": self.habit_list_id,
            "preset_habit_id": self.preset_habit_id,
            "custom_habit_id": self.custom_habit_id,
            "habit_is_completed": self.habit_is_completed,
            "is_late": self.is_late,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }

    @staticmethod
    def get(habit_list_id: str, preset_habit_id: str = None, custom_habit_id: str = None) -> "HabitListItem | None":
        """
        Get a HabitListItem by its habit list ID and optional preset/custom habit IDs.

        :param habit_list_id: The ID of the habit list.
        :param preset_habit_id: The ID of the preset habit. This is optional.
        :param custom_habit_id: The ID of the custom habit. This is optional.
        :return: The HabitListItem if found, else None.
        """
        from src.persistence import repo

        habit_list_items: list[HabitListItem] = repo.get_all("habit_list_item")

        for habit_list_item in habit_list_items:
            if (
                habit_list_item.habit_list_id == habit_list_id
                and (preset_habit_id is None or habit_list_item.preset_habit_id == preset_habit_id)
                and (custom_habit_id is None or habit_list_item.custom_habit_id == custom_habit_id)
            ):
                return habit_list_item

        return None

    @staticmethod
    def create(data: dict) -> "HabitListItem":
        """
        Create a new HabitListItem.

        :param data: A dictionary containing the data for the new HabitListItem.
        :return: The new HabitListItem.
        """
        from src.persistence import repo

        new_habit_list_item = HabitListItem(**data)

        repo.save(new_habit_list_item)

        return new_habit_list_item

    @staticmethod
    def delete(habit_list_id: str, preset_habit_id: str = None, custom_habit_id: str = None) -> bool:
        """
        Delete a HabitListItem by its habit list ID and optional preset/custom habit IDs.

        :param habit_list_id: The ID of the habit list.
        :param preset_habit_id: The ID of the preset habit. This is optional.
        :param custom_habit_id: The ID of the custom habit. This is optional.
        :return: True if the HabitListItem was deleted, else False.
        """
        from src.persistence import repo

        habit_list_item = HabitListItem.get(habit_list_id, preset_habit_id, custom_habit_id)

        if not habit_list_item:
            return False

        repo.delete(habit_list_item)

        return True

    @staticmethod
    def update(entity_id: str, data: dict):
        """Not implemented for now"""
        raise NotImplementedError(
            "This method is defined only because of the Base class"
        )