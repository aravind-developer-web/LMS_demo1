import os
import django
import sys
import requests
from rest_framework.test import APIClient

# Setup Django
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modules.models import Module

User = get_user_model()
USERNAME = "test_learner_v2"
PASSWORD = "password123"

def verify():
    print("--- VERIFYING LEARNER ACCESS TO MODULE 21 ---")
    
    # 1. Create Learner
    user, created = User.objects.get_or_create(username=USERNAME)
    user.set_password(PASSWORD)
    user.role = 'learner'
    user.save()
    print(f"Learner {USERNAME} ready.")

    # 2. Login via API to get token
    base_url = "http://localhost:8000/api"
    resp = requests.post(f"{base_url}/auth/login/", json={"username": USERNAME, "password": PASSWORD})
    if resp.status_code != 200:
        print(f"Login Failed: {resp.status_code} {resp.text}")
        return
        
    token = resp.json()['access']
    headers = {"Authorization": f"Bearer {token}"}
    
    # 3. Access Module 21
    url = f"{base_url}/modules/21/"
    print(f"Requesting {url} as Learner...")
    resp = requests.get(url, headers=headers)
    
    print(f"Status: {resp.status_code}")
    if resp.status_code == 200:
        print("SUCCESS: Learner can see Module 21.")
    else:
        print(f"FAIL: {resp.status_code}")
        print(f"Body: {resp.text[:500]}")

if __name__ == "__main__":
    verify()
