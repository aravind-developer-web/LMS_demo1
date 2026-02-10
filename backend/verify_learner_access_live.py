import os
import django
import sys
import requests

# Setup Django just for models (to create user)
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
User = get_user_model()

USERNAME = "test_learner_v3"
PASSWORD = "password123"

def verify():
    print("--- VERIFYING LEARNER ACCESS TO MODULE 21 (LIVE) ---")
    
    # 1. Create Learner
    try:
        user = User.objects.get(username=USERNAME)
        print(f"User {USERNAME} exists.")
    except User.DoesNotExist:
        user = User.objects.create_user(username=USERNAME, password=PASSWORD)
        user.role = 'learner'
        user.save()
        print(f"User {USERNAME} created.")

    # 2. Login via API to get token
    base_url = "http://localhost:8000/api"
    resp = requests.post(f"{base_url}/auth/login/", json={"username": USERNAME, "password": PASSWORD})
    
    if resp.status_code != 200:
        print(f"Login Failed: {resp.status_code} {resp.text}")
        return
        
    token = resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    print(f"Login Successful. Token: {token[:10]}...")
    
    # 3. Access Module 23
    url = f"{base_url}/modules/23/"
    print(f"Requesting {url} as Learner...")
    resp = requests.get(url, headers=headers)
    
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print("SUCCESS: Learner can see Module 21.")
    else:
        print(f"FAIL: {resp.status_code}")
        print(f"Body: {resp.text[:500]}")

    # 4. Access Module 21 Progress
    url_prog = f"{base_url}/modules/21/progress/"
    print(f"Requesting {url_prog} as Learner...")
    resp_prog = requests.get(url_prog, headers=headers)
    print(f"Progress Status: {resp_prog.status_code}")
    if resp_prog.status_code != 200:
        print(f"PROGRESS FAIL: {resp_prog.text[:500]}")

if __name__ == "__main__":
    verify()
