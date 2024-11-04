import json
import logging
from src.models import db
from src.models.category import Category
from src.models.preset_habit import PresetHabit
from src import create_app

app = create_app()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def populate_db(data_file):
    """
    Populate the database with categories and preset habits from a JSON file.

    Args:
        data_file (str): The path to the JSON file containing the data.

    Returns:
        None
    """
    try:
        with app.app_context():
            try:
                with open(data_file, 'r') as file:
                    data = json.load(file)
            except FileNotFoundError as e:
                logger.error(f"File not found: {e}")
                return
            except json.JSONDecodeError as e:
                logger.error(f"Error decoding JSON: {e}")
                return

            for category_data in data['categories']:
                category_name = category_data['name']
                category = Category.query.filter_by(name=category_name).first()
                if not category:
                    category = Category(name=category_name)
                    db.session.add(category)
                    logger.info(f"Added category: {category_name}")
                else:
                    logger.info(f"Category already exists: {category_name}")

                for habit_description in category_data['habits']:
                    habits = PresetHabit.query.filter_by(description=habit_description, category_name=category_name).first()
                    if not habits:
                        habits = PresetHabit(description=habit_description, category_name=category_name)
                        db.session.add(habits)
                        logger.info(f"Added preset habit: {habit_description} to category: {category_name}")
                    else:
                        logger.info(f"Preset habit already exists: {habit_description} in category: {category_name}")

            db.session.commit()
            logger.info("Database populated successfully.")
    except Exception as e:
        logger.error(f"An error occurred: {e}")
        with app.app_context():
            db.session.rollback()

if __name__ == '__main__':
    data_file = 'data/categories_habits.json'
    populate_db(data_file)
