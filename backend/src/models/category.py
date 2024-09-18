from . import db

class Category(db.Model):
    """
    Category model class for handling operations related to Category.
    """

    __tablename__ = "categories"

    name = db.Column(db.String(128), primary_key=True, nullable=False)
    habits = db.relationship("PresetHabit", back_populates="category")

    def __init__(self, name: str, **kw) -> None:
        """
        Initialize a new Category instance.
        """
        super().__init__(**kw)
        self.name = name

    def __repr__(self) -> str:
        """
        Return a string representation of this Category.
        """
        return f"<Category {self.name}"

    def to_dict(self) -> dict:
        """
        Convert this Category to a dictionary.
        """
        return {
            "name": self.name
        }
    
    @staticmethod
    def get_all() -> list["Category"]:
        """
        Get all Category instances from the database.
        """
        from src.persistence import repo

        categories: list["Category"] = repo.get_all(Category)

        return categories
    
    @staticmethod
    def get(name: str) -> "Category | None":
        """
        Get a Category instance by its name.
        """
        from src.persistence import repo

        category: "Category" = repo.get_for_category(name)

        return category
    
    @staticmethod
    def create(name: str) -> "Category":
        """
        Create a new Category instance and save it to the database.
        """
        from src.persistence import repo

        category = Category(name)
        repo.save(category)
        
        return category
    
    @staticmethod
    def delete(name: str) -> bool:
        """
        Delete a Category instance by its name.
        """
        from src.persistence import repo

        category = Category.get(name)
        if category is None:
            return False
        
        repo.delete(category)
        return True
