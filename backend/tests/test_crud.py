def test_update_user(client, new_user):
    """Test user update via PUT /users/<user_id>"""
    # Create the user first
    response = client.post('/users/', json=new_user)
    user_id = response.get_json()['id']

    update_data = {"email": "updated@example.com"}
    response = client.put(f'/users/{user_id}', json=update_data)
    assert response.status_code == 200
    data = response.get_json()
    assert data['email'] == "updated@example.com"

def test_delete_user(client, new_user):
    """Test user deletion via DELETE /users/<user_id>"""
    # Create the user first
    response = client.post('/users/', json=new_user)
    user_id = response.get_json()['id']

    response = client.delete(f'/users/{user_id}')
    assert response.status_code == 204
