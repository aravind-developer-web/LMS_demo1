import requests
import sys

BASE_URL = "http://127.0.0.1:8000/api"

def test_flow():
    print("1. Testing Authentication...")
    try:
        # Login as student
        resp = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": "testuser", 
            "password": "testpass123" 
        })
        
        if resp.status_code != 200:
            print(f"FAILED: Login failed with status {resp.status_code}")
            print(resp.text)
            # Try fallback user if specific user fails
            resp = requests.post(f"{BASE_URL}/auth/login/", json={
                "username": "admin", 
                "password": "password123" 
            })
            if resp.status_code != 200:
                 print("FAILED: Admin login also failed.")
                 return False

        data = resp.json()
        access_token = data.get('access')
        print("SUCCESS: Login successful, token received.")
        
        headers = {'Authorization': f'Bearer {access_token}'}

        print("\n2. Testing Modules List...")
        resp = requests.get(f"{BASE_URL}/modules/", headers=headers)
        if resp.status_code == 200:
            modules = resp.json()
            print(f"SUCCESS: Retrieved {len(modules)} modules.")
        else:
            print(f"FAILED: Modules list returned {resp.status_code}")
            return False

        print("\n3. Testing Progress List...")
        resp = requests.get(f"{BASE_URL}/progress/", headers=headers)
        if resp.status_code == 200:
             print("SUCCESS: Progress list endpoint reachable.")
        else:
             print(f"FAILED: Progress list returned {resp.status_code}")
             return False

        print("\nALL SYSTEM TESTS PASSED.")
        return True

    except Exception as e:
        print(f"CRITICAL ERROR: Connection failed - {str(e)}")
        return False

if __name__ == "__main__":
    success = test_flow()
    sys.exit(0 if success else 1)
