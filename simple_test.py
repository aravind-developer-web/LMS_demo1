import requests
import sys

BASE_URL = "http://localhost:8000/api"

print("Testing Module 24 endpoint...")
try:
    resp = requests.get(f"{BASE_URL}/modules/24/")
    print(f"Status Code: {resp.status_code}")
    if resp.status_code == 200:
        data = resp.json()
        print(f"Title: {data.get('title')}")
        print(f"Resources: {len(data.get('resources', []))}")
        for r in data.get('resources', []):
            print(f"  - {r.get('title')}: {r.get('url')}")
    else:
        print(f"Error: {resp.text}")
except Exception as e:
    print(f"Connection Error: {e}")
    sys.exit(1)
