import requests
import json

BASE_URL = "http://localhost:8000/api"

def test_login():
    print("Testing Login...")
    url = f"{BASE_URL}/auth/login/"
    payload = {"username": "aravind", "password": "aravind123"}
    headers = {"Content-Type": "application/json"}
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        print("[SUCCESS] Login successful")
        return response.json()
    else:
        print(f"[FAIL] Login failed: {response.status_code}")
        print(response.text)
        return None

def test_modules():
    print("Testing Modules List...")
    url = f"{BASE_URL}/modules/"
    response = requests.get(url)
    if response.status_code == 200:
        modules = response.json()
        print(f"[SUCCESS] Found {len(modules)} modules")
        return modules
    else:
        print(f"[FAIL] Failed to fetch modules: {response.status_code}")
        return []

def test_telemetry(tokens, module_id, resource_id):
    print("Testing Telemetry Pulse...")
    url = f"{BASE_URL}/modules/{module_id}/resources/{resource_id}/complete/"
    headers = {
        "Authorization": f"Bearer {tokens['access']}",
        "Content-Type": "application/json"
    }
    payload = {
        "duration_delta": 15,
        "watch_time": 30,
        "completed": False
    }
    
    response = requests.post(url, json=payload, headers=headers)
    if response.status_code == 200:
        print("[SUCCESS] Telemetry pulse synced")
        print(response.json())
    else:
        print(f"[FAIL] Telemetry failed: {response.status_code}")
        print(response.text)

if __name__ == "__main__":
    tokens = test_login()
    if tokens:
        modules = test_modules()
        if modules:
            # Pick the first resource of the first module
            module_id = modules[0]['id']
            if modules[0]['resources']:
                resource_id = modules[0]['resources'][0]['id']
                test_telemetry(tokens, module_id, resource_id)
            else:
                print("[WARN] No resources found in the first module")
    
    # Check Frontend static access (just the index)
    print("Testing Frontend availability...")
    try:
        fe_res = requests.get("http://localhost:3000", timeout=5)
        if fe_res.status_code == 200:
            print("[SUCCESS] Frontend is serving at http://localhost:3000")
        else:
            print(f"[WARN] Frontend returned {fe_res.status_code}")
    except Exception as e:
        print(f"[FAIL] Frontend unreachable: {e}")
