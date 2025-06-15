import requests

# Replace with your actual client ID and secret
client_id = 'ZFE8AmVlIhWmzCXXW5OBtVLPuXXmNllA0Ydy2qBT'
client_secret = 'eXivM3IrYlfYVW7tVQ9AUQ5FXEt4a333cxyWvLXwstXROhlo7b2nSaOU6kZ64xZl3tF1UewmSJJ2AoNB6qHTWB5nva1TNcy0ezPu1pXlogoAH9YNM2S4vaLRQVAYLCRz'

# Token endpoint
token_url = 'http://127.0.0.1:8000/o/token/'

# Data for token request
data = {
    'grant_type': 'client_credentials',
    'client_id': client_id,
    'client_secret': client_secret,
}

# Request the token
response = requests.post(token_url, data=data)
token = response.json().get('access_token')

# Use the token to access the protected API
headers = {'Authorization': f'Bearer {token}'}
api_url = 'http://127.0.0.1:8000/api/organizations'  # Replace with your actual API endpoint
api_response = requests.get(api_url, headers=headers)

print(api_response.text)
