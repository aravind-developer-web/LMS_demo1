# -*- coding: utf-8 -*-
import os
import sys
import django

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from apps.authapp.models import User
from apps.modules.models import Module, ModuleProgress
from apps.assignments.models import Assignment
from apps.quiz.models import Quiz

# Test Results Storage
results = {
    "passed": [],
    "failed": [],
    "warnings": []
}

def test_endpoint(view_class, name, endpoint, user_role='manager'):
    """Test a view endpoint"""
    print(f"\n[TEST] {name} ({endpoint})")
    factory = APIRequestFactory()
    try:
        user = User.objects.filter(role=user_role).first()
        if not user:
            results["failed"].append(f"{name}: No {user_role} user found")
            print(f"[FAIL] No {user_role} user in database")
            return
            
        view = view_class.as_view()
        request = factory.get('/')
        force_authenticate(request, user=user)
        response = view(request)
        
        if response.status_code == 200:
            results["passed"].append(f"{name}: {response.status_code}")
            print(f"[PASS] Status: {response.status_code}")
            return True
        else:
            results["warnings"].append(f"{name}: Status {response.status_code}")
            print(f"[WARN] Status: {response.status_code}")
            return False
    except Exception as e:
        results["failed"].append(f"{name}: {str(e)}")
        print(f"[FAIL] Error: {str(e)}")
        return False

print("=" * 70)
print(">>> COMPREHENSIVE LMS API AUDIT")
print("=" * 70)

# Test Analytics Endpoints
print("\n[ANALYTICS ENDPOINTS]")
from apps.analytics.views import TeamStatsView, StuckLearnersView, ModuleStatsView, TeamVelocityView, RecentActivityView

test_endpoint(TeamStatsView, "Team Stats", "/api/analytics/team-stats/")
test_endpoint(StuckLearnersView, "Stuck Learners", "/api/analytics/stuck-learners/")
test_endpoint(ModuleStatsView, "Module Stats", "/api/analytics/module-stats/")
test_endpoint(TeamVelocityView, "Team Velocity", "/api/analytics/team-velocity/")
test_endpoint(RecentActivityView, "Recent Activity", "/api/analytics/recent-activity/")

# Test Module Endpoints
print("\n[MODULE ENDPOINTS]")
from apps.modules.views import ModuleListCreateView

test_endpoint(ModuleListCreateView, "Module List", "/api/modules/", user_role='learner')

# Check Module Data
print("\n[DATABASE CHECKS]")
module_count = Module.objects.count()
user_count = User.objects.count()
assignment_count = Assignment.objects.count()
quiz_count = Quiz.objects.count()
progress_count = ModuleProgress.objects.count()

print(f"  Modules: {module_count}")
print(f"  Users: {user_count}")
print(f"  Assignments: {assignment_count}")
print(f"  Quizzes: {quiz_count}")
print(f"  Progress Records: {progress_count}")

if module_count == 0:
    results["warnings"].append("No modules in database")
if user_count == 0:
    results["failed"].append("No users in database!")

# Test Assignment Flow
print("\n[ASSIGNMENT SYSTEM]")
has_assignments = Assignment.objects.exists()
if has_assignments:
    print(f"[PASS] {Assignment.objects.count()} assignments configured")
    results["passed"].append("Assignments: Data exists")
else:
    print("[WARN] No assignments in database")
    results["warnings"].append("Assignments: No data")

# Test Notes Endpoints  
print("\n[NOTES ENDPOINTS]")
from apps.notes.views import NoteListView
test_endpoint(NoteListView, "Notes List", "/api/notes/", user_role='learner')

# Final Report
print("\n" + "=" * 70)
print(">>> TEST SUMMARY")
print("=" * 70)
print(f"\n[PASSED] ({len(results['passed'])})")
for item in results["passed"]:
    print(f"  + {item}")

if results["warnings"]:
    print(f"\n[WARNINGS] ({len(results['warnings'])})")
    for item in results["warnings"]:
        print(f"  ! {item}")

if results["failed"]:
    print(f"\n[FAILED] ({len(results['failed'])})")
    for item in results["failed"]:
        print(f"  - {item}")
else:
    print("\n[SUCCESS] ALL CRITICAL TESTS PASSED!")

print("\n" + "=" * 70)
