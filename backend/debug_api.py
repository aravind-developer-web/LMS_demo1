
import os
import django
import json
from rest_framework.test import APIRequestFactory

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.analytics.views import ManagerLearnerProgressView
from django.contrib.auth import get_user_model

User = get_user_model()

def check_api():
    factory = APIRequestFactory()
    request = factory.get('/api/analytics/manager/learner-progress/')
    
    # Force auth as manager
    try:
        manager = User.objects.get(role='manager')
    except:
        manager = User.objects.create_user(username='manager_test', role='manager', password='p')
        
    request.user = manager
    
    view = ManagerLearnerProgressView.as_view()
    response = view(request)
    
    print("\nAPI Response Code:", response.status_code)
    
    data = response.data
    # Find naveen
    naveen = next((item for item in data if item['name'] == 'naveen'), None)
    
    if naveen:
        print("\nNaveen Data:")
        print(json.dumps(naveen, indent=2))
        
        # Check if values match simulation
        # Expected: video_score ~37.5 (avg of 50 and 25)
        # progress ~15
    else:
        print("\nNaveen not found in response!")

if __name__ == '__main__':
    check_api()
