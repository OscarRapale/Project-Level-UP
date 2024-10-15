
import pytest
from datetime import datetime, timedelta, timezone
from src.models.user import User

@pytest.fixture
def user():
    """
    Fixture to create a new user instance for testing.
    """
    return User(email="test@example.com", password="password", username="testuser")

def test_first_login(user, mocker):
    """
    Test the first login scenario.
    """
    datetime_mock = mocker.patch('src.models.user.datetime', wraps=datetime)
    datetime_mock.now.return_value = datetime(2023, 1, 1, tzinfo=timezone.utc)

    user.check_daily_streak()
    assert user.streak == 1
    assert user.total_login_count == 1

def test_consecutive_login(user, mocker):
    """
    Test the consecutive login scenario (exactly one day apart).
    """
    datetime_mock = mocker.patch('src.models.user.datetime', wraps=datetime)
    datetime_mock.now.return_value = datetime(2023, 1, 1, tzinfo=timezone.utc)

    user.check_daily_streak()
    assert user.streak == 1
    assert user.total_login_count == 1

    # Simulate login the next day
    datetime_mock.now.return_value = datetime(2023, 1, 2, tzinfo=timezone.utc)
    user.check_daily_streak()
    assert user.streak == 2
    assert user.total_login_count == 2

def test_broken_streak(user, mocker):
    """
    Test the broken streak scenario (more than one day apart).
    """
    datetime_mock = mocker.patch('src.models.user.datetime', wraps=datetime)
    datetime_mock.now.return_value = datetime(2023, 1, 1, tzinfo=timezone.utc)

    user.check_daily_streak()
    assert user.streak == 1
    assert user.total_login_count == 1

    # Simulate login after two days
    datetime_mock.now.return_value = datetime(2023, 1, 3, tzinfo=timezone.utc)
    user.check_daily_streak()
    assert user.streak == 1  # Streak should reset
    assert user.total_login_count == 2
