
import os
import django
import random
import string
from django.test import RequestFactory
from django.utils import timezone
from datetime import timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modules.models import Module
from apps.analytics.models import VideoProgress, LearningSession
from apps.analytics.views import ManagerLearnerProgressView, ManagerLearnerDetailsView

User = get_user_model()

def generate_random_string(length=6):
    return ''.join(random.choices(string.ascii_lowercase + string.digits, k=length))

def run_e2e_test():
    print("Starting End-to-End Integration Test...\n")

    # 1. Create New Learner
    username = f"test_learner_{generate_random_string()}"
    email = f"{username}@example.com"
    password = "password123"
    
    print(f"1. Creating new learner: {username}")
    learner = User.objects.create_user(username=username, email=email, password=password, role='learner')
    print(f"   - User created (ID: {learner.id})")

    # 2. Simulate Activity
    print(f"\n2. Simulating Activity...")
    modules = Module.objects.all()[:3]
    if not modules:
        print("   - No modules found! Cannot simulate.")
        return

    # A. Video Progress
    module = modules[0]
    print(f"   - Watching '{module.title}' (Video)")
    VideoProgress.objects.create(
        user=learner,
        module=module,
        video_id=f"vid_{module.id}",
        watched_seconds=300,
        total_seconds=600,
        completion_percent=50.0
    )
    
    # B. Active Session (Heartbeat 1 minute ago)
    print(f"   - Creating Active Session for '{module.title}'")
    LearningSession.objects.create(
        user=learner,
        module=module,
        total_seconds=450, # 7.5 mins
        status='active' 
        # last_ping_at will be auto_now=True (now)
    )

    # 3. Verify Manager Dashboard (Aggregation API)
    print(f"\n3. Verifying Aggregation API...")
    factory = RequestFactory()
    
    # Create a manager to make the request
    try:
        manager = User.objects.get(role='manager')
    except:
        manager = User.objects.create_user(username='manager_e2e', role='manager', password='p')

    request = factory.get('/api/analytics/manager/learner-progress/')
    request.user = manager
    
    view = ManagerLearnerProgressView.as_view()
    response = view(request)
    
    if response.status_code != 200:
        print(f"   - API Failed: {response.status_code}")
        return

    data = response.data
    # Find our new learner
    target = next((item for item in data if item['id'] == learner.id), None)
    
    if target:
        print(f"   - User found in Manager Dashboard!")
        print(f"      - Status: {target['status']} (Expected: active)")
        print(f"      - Health: {target['health']}")
        print(f"      - Video Score: {target['video_score']}% (Expected: ~16.7% if 3 modules total, or 50% if avg)")
        
        if target['status'] == 'active':
            print("   - POSITIVE: Active Status (Green Dot) confirmed.")
        else:
            print(f"   - FAILURE: Status is '{target['status']}', expected 'active'.")
            
    else:
        print("   - User NOT found in aggregation API response.")
        return

    # 4. Verify Drill-Down API
    print(f"\n4. Verifying Drill-Down API (Details)...")
    request_details = factory.get(f'/api/analytics/manager/{learner.id}/learner_details/')
    request_details.user = manager
    
    view_details = ManagerLearnerDetailsView.as_view()
    response_details = view_details(request_details, user_id=learner.id)
    
    if response_details.status_code == 200:
        det = response_details.data
        print(f"   - Drill-Down Data Received.")
        print(f"      - Weekly Mastery: {len(det['weekly_mastery'])} weeks")
        print(f"      - Recent Activity: {len(det['recent_activity'])} items")
        print(f"      - Module Breakdown: {len(det['module_breakdown'])} modules")
        
        # Check specific module
        mod_entry = next((m for m in det['module_breakdown'] if m['id'] == module.id), None)
        if mod_entry and mod_entry['video_progress'] == 50.0:
            print("   - POSITIVE: Module specific data matches simulation.")
        else:
            print("   - FAILURE: Module data mismatch.")
    else:
        print(f"   - Drill-Down API Failed: {response_details.status_code}")

    print("\nE2E TEST COMPLETE.")

if __name__ == '__main__':
    run_e2e_test()
