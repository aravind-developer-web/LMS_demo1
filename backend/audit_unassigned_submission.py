import requests
import json
import time

BASE_URL = "http://localhost:8000/api"
USERNAME = "aravind"
PASSWORD = "aravind123"

def test_unassigned_submission():
    print("="*60)
    print("TESTING UNASSIGNED ASSIGNMENT SUBMISSION")
    print("="*60)

    # 1. Login
    resp = requests.post(f"{BASE_URL}/auth/login/", json={"username": USERNAME, "password": PASSWORD})
    if resp.status_code != 200:
        print("[FAIL] Login Failed")
        return
    token = resp.json().get("access")
    headers = {"Authorization": f"Bearer {token}"}
    print("[PASS] Login Successful")

    # 2. Find an Unassigned Module
    module_id = 1
    
    # Step 1.5: Probe Routing
    print("\n[Step 1.5] Probing Assignments Routing...")
    
    # Check root assignments URL
    test_url_root = f"{BASE_URL}/assignments/"
    resp_root = requests.get(test_url_root, headers=headers)
    print(f"   Root Status: {resp_root.status_code}")
    
    # Check Submission URL with GET (Expect 405 Method Not Allowed)
    # The correct URL is .../assignments/modules/{id}/submit/
    test_url_submit = f"{BASE_URL}/assignments/modules/{module_id}/submit/"
    print(f"   Getting {test_url_submit} (Expect 405)...")
    resp_submit = requests.get(test_url_submit, headers=headers)
    print(f"   Submit GET Status: {resp_submit.status_code}")

    # 3. Attempt Submission
    print(f"\n[Step 2] Attempting Assignment Submission for Module {module_id}...")
    submission_data = {
        "content": "http://example.com/project.pdf", 
        "notes": "Open access submission test"
    }
    
    # FORCE CORRECT URL
    url = f"{BASE_URL}/assignments/modules/{module_id}/submit/"
    print(f"   Target URL: {url}")
    
    resp = requests.post(url, headers=headers, json=submission_data)
    
    print(f"   Response Status: {resp.status_code}")
    print(f"   Response Body Check: {resp.text[:100]}")
    
    if resp.status_code == 404:
        print("\n[FAIL] VERDICT: CONFIRMED BUG - Cannot submit to unassigned module (404 Not Found)")
    elif resp.status_code == 201:
        print("\n[PASS] VERDICT: SUCCESS - Submission accepted!")
    else:
        print(f"\n[WARN] VERDICT: INCONCLUSIVE (Status {resp.status_code})")

if __name__ == "__main__":
    test_unassigned_submission()
