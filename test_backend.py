import requests

BASE_URL = "http://localhost:8000/api"

def test_endpoints():
    print("Testing backend endpoints...\n")
    
    # Test 1: Module list (public)
    try:
        resp = requests.get(f"{BASE_URL}/modules/")
        print(f"[OK] GET /modules/ - Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"  Found {len(data)} modules")
    except Exception as e:
        print(f"✗ GET /modules/ - Error: {e}")
    
    # Test 2: Specific module (public)
    try:
        resp = requests.get(f"{BASE_URL}/modules/24/")
        print(f"\n✓ GET /modules/24/ - Status: {resp.status_code}")
        if resp.status_code == 200:
            data = resp.json()
            print(f"  Module: {data.get('title')}")
            print(f"  Resources: {len(data.get('resources', []))}")
    except Exception as e:
        print(f"\n✗ GET /modules/24/ - Error: {e}")
    
    # Test 3: With authentication
    try:
        auth_resp = requests.post(f"{BASE_URL}/auth/login/", json={
            "username": "aravind",
            "password": "aravind123"
        })
        if auth_resp.status_code == 200:
            token = auth_resp.json().get("access")
            headers = {"Authorization": f"Bearer {token}"}
            
            resp = requests.get(f"{BASE_URL}/modules/24/", headers=headers)
            print(f"\n✓ GET /modules/24/ (Authenticated) - Status: {resp.status_code}")
            if resp.status_code == 200:
                data = resp.json()
                print(f"  Module: {data.get('title')}")
        else:
            print(f"\n✗ Authentication failed: {auth_resp.status_code}")
    except Exception as e:
        print(f"\n✗ Authenticated request - Error: {e}")

if __name__ == "__main__":
    test_endpoints()
