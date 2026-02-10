import requests
import json

BASE_URL = "http://localhost:8000/api"
USERNAME = "aravind" 
PASSWORD = "aravind123"

def check():
    print("--- CHECKING MODULE 21 API ACCESS ---")
    
    # Login
    try:
        resp = requests.post(f"{BASE_URL}/auth/login/", json={"username": USERNAME, "password": PASSWORD})
        token = resp.json().get("access")
        headers = {"Authorization": f"Bearer {token}"}
    except:
        print("Login failed")
        return

    # Check 21
    url = f"{BASE_URL}/modules/21/"
    print(f"GET {url}")
    resp = requests.get(url, headers=headers)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:500]}")

if __name__ == "__main__":
    check()
