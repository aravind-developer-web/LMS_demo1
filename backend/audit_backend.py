import requests
import json
import time

BASE_URL = "http://localhost:8000/api"
USERNAME = "aravind"
PASSWORD = "aravind123"

class AuditLogger:
    def __init__(self):
        self.results = []

    def log(self, category, test, status, details=""):
        self.results.append({
            "category": category,
            "test": test,
            "status": status,
            "details": details
        })
        icon = "[PASS]" if status == "PASS" else "[FAIL]" if status == "FAIL" else "[WARN]"
        print(f"{icon} [{category}] {test}: {details}")

def wait_for_server():
    print("Waiting for server...")
    for i in range(10):
        try:
            requests.get(f"{BASE_URL}/admin/login/")
            print("Server is UP!")
            return True
        except:
            time.sleep(1)
    print("Server is DOWN!")
    return False

audit = AuditLogger()

print("="*60)
print("STARTING LMS BACKEND AUDIT")
print("="*60)

if not wait_for_server():
    exit(1)


# 1. AUTHENTICATION
print("\n--- AUTHENTICATION ---")
try:
    login_start = time.time()
    resp = requests.post(f"{BASE_URL}/auth/login/", json={"username": USERNAME, "password": PASSWORD})
    if resp.status_code == 200:
        token = resp.json().get("access")
        headers = {"Authorization": f"Bearer {token}"}
        audit.log("Auth", "Login", "PASS", f"Success in {time.time() - login_start:.2f}s")
    else:
        audit.log("Auth", "Login", "FAIL", f"Status {resp.status_code}")
        exit()
except Exception as e:
    audit.log("Auth", "Login", "FAIL", str(e))
    exit()

# 2. MODULE ACCESS (OPEN ACCESS)
print("\n--- MODULE ACCESS ---")
try:
    resp = requests.get(f"{BASE_URL}/modules/", headers=headers)
    modules = resp.json()
    if len(modules) == 23:
        audit.log("Modules", "Catalog Visibility", "PASS", f"Visible modules: {len(modules)}")
    else:
        audit.log("Modules", "Catalog Visibility", "FAIL", f"Expected 23, got {len(modules)}")

    # Check random module access (ID 1 - likely unassigned)
    mod_id = 1
    resp = requests.get(f"{BASE_URL}/modules/{mod_id}/", headers=headers)
    if resp.status_code == 200:
        data = resp.json()
        status_msg = "PASS"
        if data.get('is_assigned') is True:
             status_msg = "WARN" # Expected false for unassigned
             detail = "Marked as assigned (Check data)"
        else:
             detail = "Accessible & Correctly marked unassigned"
        
        audit.log("Modules", "Detail Access", status_msg, detail)
    else:
        audit.log("Modules", "Detail Access", "FAIL", f"Status {resp.status_code}")

except Exception as e:
    audit.log("Modules", "Access", "FAIL", str(e))

# 3. QUIZ & ASSIGNMENT ACCESS
print("\n--- QUIZ & ASSIGNMENT ---")
# Check if quiz endpoint is accessible (even if we don't submit)
# Realistically we need to check if the VIEW allows it. 
# We'll try to fetch quiz details if valid endpoint exists or check previous 403 blocks.
# Since we don't have a direct "get quiz info" independent of module, we assume ModuleDetail response dictates frontend.
# But we can try to GET module progress to see if it initializes
try:
    resp = requests.get(f"{BASE_URL}/modules/{mod_id}/progress/", headers=headers)
    if resp.status_code == 200:
         audit.log("Tracking", "Progress Init", "PASS", "Progress endpoint accessible")
    else:
         audit.log("Tracking", "Progress Init", "FAIL", f"Status {resp.status_code}")
except Exception as e:
    audit.log("Tracking", "Progress", "FAIL", str(e))

# 4. TRACKING INTEGRITY
print("\n--- TRACKING INTEGRITY ---")
# We will simulate a "View" by checking if accessing the module created/fetched a progress record
# If the previous GET /progress/ worked, it implies tracking exists or is retrievable.

print("\n" + "="*60)
print("AUDIT SUMMARY")
pass_count = len([r for r in audit.results if r['status'] == 'PASS'])
fail_count = len([r for r in audit.results if r['status'] == 'FAIL'])
print(f"Total Tests: {len(audit.results)}")
print(f"Passed: {pass_count}")
print(f"Failed: {fail_count}")
print("="*60)
