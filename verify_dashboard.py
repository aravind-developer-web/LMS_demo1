import requests
import json

BASE_URL = "http://localhost:8000"
USERNAME = "manager1"
PASSWORD = "password123"

def verify():
    # 1. Login
    print(f"Logging in as {USERNAME}...")
    try:
        response = requests.post(f"{BASE_URL}/api/auth/login/", data={"username": USERNAME, "password": PASSWORD})
        if response.status_code != 200:
            print(f"Login failed: {response.text}")
            return
        
        tokens = response.json()
        access_token = tokens.get('access')
        print("Login successful.")

        # 2. Basic Stats
        headers = {"Authorization": f"Bearer {access_token}"}
        
        # 3. Check Learners for Leaderboard fields
        print("\nChecking Learners Endpoint for Leaderboard Data...")
        resp = requests.get(f"{BASE_URL}/api/auth/learners/", headers=headers)
        if resp.status_code == 200:
            learners = resp.json()
            if isinstance(learners, list) and len(learners) > 0:
                l = learners[0]
                print("First Learner Data Keys:", l.keys())
                if 'avg_score' in l and 'completions' in l:
                     print(f"✅ SUCCESS: 'avg_score' ({l['avg_score']}) and 'completions' ({l['completions']}) found.")
                else:
                     print("❌ FAILURE: 'avg_score' or 'completions' missing.")
            else:
                print("⚠️  No learners found to verify structure.")
        else:
             print(f"Failed to fetch learners: {resp.status_code} - {resp.text}")

        # 4. Check Stuck Learners
        print("\nChecking Stuck Learners Endpoint...")
        resp = requests.get(f"{BASE_URL}/api/analytics/stuck-learners/", headers=headers)
        if resp.status_code == 200:
            print("✅ Stuck Learners Endpoint reachable.")
        else:
            print(f"❌ Stuck Learners Endpoint failed: {resp.status_code}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    verify()
