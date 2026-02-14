"""
Test if API returns video_url
"""
import requests

try:
    # Test the modules API endpoint
    response = requests.get('http://localhost:8000/api/modules/1/')
    print("Status Code:", response.status_code)
    
    if response.status_code == 200:
        data = response.json()
        print("\nModule Data:")
        print(f"  ID: {data.get('id')}")
        print(f"  Title: {data.get('title')}")
        print(f"  video_url: {data.get('video_url')}")
        print(f"\nAll fields: {list(data.keys())}")
    else:
        print("Error:", response.text)
except Exception as e:
    print(f"Error: {e}")
    print("\nNote: You need to be logged in to access this endpoint.")
