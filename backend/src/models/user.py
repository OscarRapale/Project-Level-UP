from . import db
from flask_bcrypt import generate_password_hash, check_password_hash
from datetime import datetime, timedelta

class User(db.Model):
    """
    User model for storing user related details.
    """
    __tablename__ = "users"

    email = db.Column(db.String(128), unique=True, nullable=False)
    password_hash = db.Column(db.String(128), nullable=False)
    username = db.Column(db.String(128), unique=True, nullable=False)
    is_admin = db.Column(db.Boolean, default=False)
    level = db.Column(db.Integer, default=1)
    current_xp = db.Column(db.Integer, default=0)
    xp_to_next_level = db.Column(db.Integer, default=100)
    habits_completed = db.Column(db.Integer, default=0)
    # User stats
    max_hp = db.Column(db.Integer, default=50)
    hp = db.Column(db.Integer, default=50)
    strenght = db.Column(db.Integer, default=5)
    vitality = db.Column(db.Integer, default=5)
    dexterity = db.Column(db.Integer, default=3)
    intelligence = db.Column(db.Integer, default=3)
    luck = db.Column(db.Integer, default=1)
    # Fields for tracking streaks and login count
    streak = db.Column(db.Integer, default=0)
    last_login = db.Column(db.DateTime)
    total_login_count = db.Column(db.Integer, default=0)

    habit_lists = db.relationship("HabitList", back_populates="list_owner")
    custom_habits = db.relationship("CustomHabit", back_populates="habit_owner")
    
    def __init__(self, email: str, password: str, username: str, is_admin: bool = False, **kw):
        """
        Initialize a new User instance.
        """
        super().__init__(**kw)
        self.email = email
        self.password_hash = generate_password_hash(password)
        self.username = username
        self.is_admin = is_admin
        self.level = 1
        self.current_xp = 0
        self.xp_to_next_level = 100
        self.habits_completed = 0
        # User stats
        self.max_hp = 50
        self.hp = 50
        self.strenght = 5
        self.vitality = 5
        self.dexterity = 3
        self.intelligence = 3
        self.luck = 1
        # Tracking steaks and login count
        self.streak = 0
        self.last_login = datetime.utcnow()
        self.total_login_count = 0

    def __repr__(self) -> str:
        """
        Return a string representation of the User instance.
        """
        return f"<User {self.username}, Level ({self.level})>"
    
    def set_password(self, password):
        """
        Set the password for the User instance.
        """
        self.password_hash = generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        """
        Check if the provided password matches the User's password.
        """
        return check_password_hash(self.password_hash, password)
    
    def gain_xp(self, amount: int) -> None:
        """
        Increase the User's experience points by a certain amount.
        """
        from src.persistence import repo

        self.current_xp += amount
        self.habits_completed += 1
        self.check_level_up()
        repo.save(self)

    def check_level_up(self) -> None:
        """
        Check if the User has enough experience points to level up.
        """
        from src.persistence import repo

        while self.current_xp >= self.xp_to_next_level:
            self.level_up()

        repo.save(self)
    
    def level_up(self) -> None:
        """
        Increase the User's level by 1.
        """
        from src.persistence import repo

        self.current_xp -= self.xp_to_next_level
        self.level += 1
        # User stats will grow as they level up
        self.max_hp += 10
        self.strenght += 5
        self.vitality += 4
        self.dexterity += 3
        self.intelligence += 2
        self.luck += 1
        self.xp_to_next_level = self.calculate_xp_to_next_level() # Calculate and increase xp needed for next level.
        repo.save(self)
    
    def calculate_xp_to_next_level(self) -> int:
        """
        Calculate the experience points needed to reach the next level.
        """
        return 100 + (self.level - 1) * 50
    
    def recover_hp(self, hp_points=15):
        """
        Recover HP after completing habits on time
        """
        from src.persistence import repo

        if self.hp < self.max_hp:
            self.hp += hp_points

        # Ensure HP does not exceed the maximum HP limit
        if self.hp > self.max_hp:
            self.hp = self.max_hp

        repo.save(self)

    def lose_hp(self, hp_points=25):
        """
        Reduce HP by a specific amount if habits are left incomplete.
        """
        from src.persistence import repo

        self.hp -= hp_points
        if self.hp < 0:
            self.hp = 0 # Ensure HP doesn't drop below 0
            
        repo.save(self)

    def lose_xp(self, xp_points=50):
        """
        Reduce the user's XP by the specified amount if HP is 0.
        Ensure that XP does not go below zero.
        """
        from src.persistence import repo

        self.current_xp = max(self.current_xp - xp_points, 0)

        repo.save(self)

    def check_daily_streak(self) -> None:
        """
        Check and update the user's daily streak.

        This method updates the user's streak based on their last login date.
        If the user logged in exactly one day ago, the streak is incremented.
        If the user logged in more than one day ago, the streak is reset to 1.
        The method also updates the last login time to the current time and increments the total login count.
        """
        from src.persistence import repo

        today = datetime.utcnow().date()
        last_reset = today - timedelta(days=1)

        # Check for imcomplete habits
        for habit_list in self.habit_lists:
            habit_list.check_incomplete_habits()

        if self.last_login:
            last_login_date = self.last_login.date()

            # Continue the streak count if user logged in exactly 1 day ago
            if last_login_date == last_reset:
                self.streak += 1

            # Streak is broken if the last login was more than 1 day ago
            elif last_login_date < last_reset:
                self.streak = 1  # Reset streak back to 1
        
        else:
            # First login, streak will start
            self.streak = 1
        
        self.streak = max(self.streak, 1) # Prevent decreasing below 1

        # Update last login to the current time
        self.last_login = datetime.utcnow()
        self.total_login_count += 1 # Increment login count

        repo.save(self)

    def to_dict(self) -> dict:
        """
        Return a dictionary representation of the User instance.
        """
        return {
            "id": self.id,
            "email": self.email,
            "username": self.username,
            "max_hp": self.max_hp,
            "hp": self.hp,
            "level": self.level,
            "current_xp": self.current_xp,
            "xp_to_next_level": self.xp_to_next_level,
            "habits_completed": self.habits_completed,
            "streak": self.streak,
            "strenght": self.strenght,
            "vitality": self.vitality,
            "dexterity": self.dexterity,
            "intelligence": self.intelligence,
            "luck": self.luck,
            "last_login": self.last_login,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
    
    @classmethod
    def get_leaderboard(cls, limit=10):
        """
        Retrieve the top users for the leaderboard.

        This method queries the database to retrieve the top users based on their level and XP.
        It orders the users first by their level in descending order, and then by their current XP
        in descending order. The number of users retrieved is limited by the 'limit' parameter.

        Args:
            limit (int): The maximum number of users to retrieve for the leaderboard. Default is 10.

        Returns:
            list: A list of dictionaries containing the username, level, and current XP of the top users.
        """
        top_users = (
            db.session.query(cls)
            .order_by(cls.level.desc(), cls.current_xp.desc())  # Order by level, then by XP
            .limit(limit)
            .all()
        )

        leaderboard = [
            {"id": user.id, "username": user.username, "level": user.level, "XP": user.current_xp}
            for user in top_users
        ]

        return leaderboard

    @staticmethod
    def create(user: dict) -> "User":
        """
        Create a new User instance and save it to the database.
        """
        from src.persistence import repo

        users: list["User"] = User.get_all()

        for u in users:
            if u.email == user["email"]:
                raise ValueError("User already exists")
            if u.username == user["username"]:
                raise ValueError("Username already taken")
            
        new_user = User(**user)

        repo.save(new_user)

        return new_user
    
    @staticmethod
    def update(user_id: str, data: dict) -> "User | None":
        """
        Update an existing User instance with new data.
        """
        from src.persistence import repo

        user: User | None = User.get(user_id)

        if not user:
            return None
        
        if "email" in data:
            user.email = data["email"]
        if "username" in data:
            user.username = data["username"]
        if "currentPassword" in data and "newPassword" in data:
            if not user.check_password(data["currentPassword"]):
                raise ValueError("Current password is incorrect")
            user.set_password(data["newPassword"])

        repo.update(user)

        return user
