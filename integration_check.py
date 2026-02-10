import requests
import json
import sys

BASE_URL = "http://localhost:8000/api"
AUTH_URL = f"{BASE_URL}/auth/login/"
MODULES_URL = f"{BASE_URL}/modules/"
BROADCASTS_URL = f"{BASE_URL}/management/broadcasts/"

USERNAME = "aravind"
PASSWORD = "aravind123"

def log(msg, status="INFO"):
    print(f"[{status}] {msg}")

def run_integration_test():
    log("Starting E2E Integration Check...")

    # 1. Authentication
    try:
        log(f"Attempting login for user: {USERNAME}")
        auth_resp = requests.post(AUTH_URL, json={"username": USERNAME, "password": PASSWORD})
        if auth_resp.status_code != 200:
            log(f"Login Failed: {auth_resp.text}", "ERROR")
            return False
        
        token = auth_resp.json().get("access")
        if not token:
            log("No access token returned.", "ERROR")
            return False
        
        headers = {"Authorization": f"Bearer {token}"}
        log("Authentication Successful. Token acquired.", "SUCCESS")
    except Exception as e:
        log(f"Auth Exception: {e}", "CRITICAL")
        return False

    # 2. Fetch Dashboard Data (Modules)
    try:
        log("Fetching Learner Modules...")
        modules_resp = requests.get(MODULES_URL, headers=headers)
        if modules_resp.status_code == 200:
            modules = modules_resp.json()
            log(f"Successfully fetched {len(modules)} modules.", "SUCCESS")
            
            if modules:
                m = modules[0]
                log(f"Inspecting Module: {m.get('title')}", "INFO")
                resources = m.get('resources', [])
                if resources:
                    for r in resources:
                        log(f"Resource: {r.get('title')} | Type: {r.get('type')} | URL: {r.get('url')}", "INFO")
                else:
                    log("No resources found in this module.", "WARNING")

        else:
            log(f"Failed to fetch modules: {modules_resp.status_code}", "ERROR")
    except Exception as e:
        log(f"Module Fetch Exception: {e}", "ERROR")

    # 3. Verify Broadcast Integration
    try:
        log("Checking Broadcast System...")
        bc_resp = requests.get(BROADCASTS_URL, headers=headers)
        if bc_resp.status_code == 200:
            log("Broadcast Service Online.", "SUCCESS")
        else:
            log(f"Broadcast Service Issue: {bc_resp.status_code}", "WARNING")
    except Exception as e:
        log(f"Broadcast Check Exception: {e}", "WARNING")

    log("E2E Integration Check Complete.")
    return True

if __name__ == "__main__":
    success = run_integration_test()
    if not success:
        sys.exit(1)
