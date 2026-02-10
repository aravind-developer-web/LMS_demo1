import requests
import json

BASE_URL = "http://localhost:8000/api"
USERNAME = "aravind"
PASSWORD = "aravind123"

def check_api():
    print("--- API CHECK MODULE 20 ---")
    
    # 1. Login
    try:
        resp = requests.post(f"{BASE_URL}/auth/login/", json={"username": USERNAME, "password": PASSWORD})
        if resp.status_code != 200:
            print("[FAIL] Login Failed")
            return
        token = resp.json().get("access")
        headers = {"Authorization": f"Bearer {token}"}
        print("[PASS] Login Successful")
    except Exception as e:
        print(f"[FAIL] Login Exception: {e}")
        return

    # 2. Get Module 20
    url = f"{BASE_URL}/modules/20/"
    print(f"Requesting: {url}")
    
    resp = requests.get(url, headers=headers)
    print(f"Status: {resp.status_code}")
    print(f"Response: {resp.text[:500]}")
    
    if resp.status_code == 404:
        print("VERDICT: 404 Not Found.")
    elif resp.status_code == 200:
        print("VERDICT: 200 OK.")

if __name__ == "__main__":
    check_api()
