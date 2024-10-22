import pytest
from src import create_app
from src.models.user import User
from src.persistence.db import db

@pytest.fixture
def client():
    app = create_app()
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'  # Use in-memory SQLite for testing
    app.config['JWT_SECRET_KEY'] = 'test_secret_key'

    with app.test_client() as client:
        with app.app_context():
            db.create_all()  # Create all tables in test DB
        yield client

@pytest.fixture
def new_user():
    # Create a test user object with necessary fields
    return {
        "email": "test@example.com",
        "password": "Test1234",
        "is_admin": False
    }

def test_user_creation(client, new_user):
    """Test user creation via POST /users/"""
    response = client.post('/users/', json=new_user)
    assert response.status_code == 201
    data = response.get_json()
    assert data['email'] == new_user['email']

def test_login(client, new_user):
    """Test user login via POST /login"""
    # Create the user first
    client.post('/users/', json=new_user)

    # Now test login
    login_data = {"email": new_user['email'], "password": new_user['password']}
    response = client.post('/login', json=login_data)
    assert response.status_code == 200
    data = response.get_json()
    assert 'access_token' in data

def test_user_creation(client, new_user):
    """Test user creation with password hashing"""
    response = client.post('/users/', json=new_user)
    assert response.status_code == 201
    data = response.get_json()
    assert data['email'] == new_user['email']

    # Ensure the password is not returned in the response
    assert 'password' not in data
    assert 'password_hash' not in data  # You shouldn't expose this in the API response
