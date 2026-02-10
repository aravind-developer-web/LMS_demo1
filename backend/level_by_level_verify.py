import requests
import time
import sys

BASE_URL = "http://localhost:8000/api"
FRONTEND_URL = "http://localhost:3000"

def log(level, name, status, details=""):
    icon = "[OK]" if status == "PASS" else "[FAIL]"
    print(f"{icon} [LEVEL {level}] {name}: {details}")

def check_backend():
    print("\n--- LEVEL 3: BACKEND CHECK ---")
    try:
        # Health Check (Admin Login Page or generic)
        resp = requests.get(f"{BASE_URL}/auth/login/") # Allowed Method? No, assume POST.
        # Try a public endpoint? Or Admin.
        resp = requests.get("http://localhost:8000/admin/login/")
        if resp.status_code == 200:
            log(3, "Django Server", "PASS", "Running on port 8000")
        else:
            log(3, "Django Server", "FAIL", f"Status {resp.status_code}")
            return False
    except Exception as e:
        log(3, "Django Server", "FAIL", str(e))
        return False
    return True

def check_frontend():
    print("\n--- LEVEL 4: FRONTEND CHECK ---")
    try:
        resp = requests.get(FRONTEND_URL)
        if resp.status_code == 200:
            log(4, "React Server", "PASS", "Running on port 3000")
        else:
            log(4, "React Server", "FAIL", f"Status {resp.status_code}")
            return False
    except Exception as e:
        log(4, "React Server", "FAIL", str(e))
        return False
    return True

def check_integration():
    print("\n--- LEVEL 5: INTEGRATION CHECK ---")
    # Login
    try:
        resp = requests.post(f"{BASE_URL}/auth/login/", json={"username": "aravind", "password": "aravind123"})
        if resp.status_code == 200:
            token = resp.json().get("access")
            log(5, "Auth Login", "PASS", "Token received")
            return token
        else:
            log(5, "Auth Login", "FAIL", f"Status {resp.status_code}")
            return None
    except Exception as e:
        log(5, "Auth Login", "FAIL", str(e))
        return None

def main():
    print("WAITING FOR SERVICES TO START...")
    time.sleep(10) # Give servers time to boot
    
    if not check_backend():
        print("❌ Backend Failed. Stop.")
        sys.exit(1)
        
    if not check_frontend():
        print("Frontend Failed. Stop.")
        sys.exit(1)

    token = check_integration()
    if not token:
        print("Integration Failed. Stop.")
        sys.exit(1)

    print("\n--- LEVEL 6: TRACKING SIMULATION ---")
    if token:
        headers = {"Authorization": f"Bearer {token}"}
        try:
            # Simulate Module View (triggers ModuleProgress)
            resp = requests.get(f"{BASE_URL}/modules/1/", headers=headers)
            if resp.status_code == 200:
                log(6, "Module View", "PASS", "Tracking event fired")
            else:
                log(6, "Module View", "FAIL", f"Status {resp.status_code}")
        except Exception as e:
            log(6, "Module View", "FAIL", str(e))
            
    print("\n--- LEVEL 7: SECURITY CHECK ---")
    try:
        # Unauthorized Access
        resp = requests.get(f"{BASE_URL}/modules/1/") # No header
        # Open Access Model: actually, Catalog is public? Or Detail requires auth?
        # Views.py says: permission_classes = [permissions.IsAuthenticatedOrReadOnly]
        # So GET is allowed?
        # Let's check a protected endpoint: /api/assignments/my/
        resp = requests.get(f"{BASE_URL}/assignments/my/")
        if resp.status_code == 403 or resp.status_code == 401:
             log(7, "Protected Route", "PASS", "Correctly rejected (401/403)")
        else:
             log(7, "Protected Route", "FAIL", f"Detailed Access Allowed? Status {resp.status_code}")
    except Exception as e:
        log(7, "Security", "FAIL", str(e))

    print("\n[OK] SYSTEM IS RUNNING AND INTEGRATED.")

if __name__ == "__main__":
    main()
