import os
import django
import sys
from django.db import models

# Setup Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modules.models import Module, ModuleProgress, Resource, ResourceProgress
from apps.assignments.models import Assignment, Submission
from apps.quiz.models import QuizAttempt

User = get_user_model()

def check_integrity():
    print("="*60)
    print("DATABASE INTEGRITY AUDIT")
    print("="*60)

    # 1. Orphaned Progress Records
    print("\n[Check 1] Orphaned Module Progress...")
    orphaned_mp = ModuleProgress.objects.filter(module__isnull=True)
    if orphaned_mp.exists():
         print(f"[FAIL] Found {orphaned_mp.count()} orphaned ModuleProgress records.")
    else:
         print("[PASS] No orphaned ModuleProgress records.")

    print("\n[Check 2] Duplicate Module Progress...")
    # Check for duplicates (user, module) combinations manually if unique_together failed?
    # Django unique_together prevents this usually, but let's check.
    # We can count distinct vs total.
    count = ModuleProgress.objects.count()
    distinct = ModuleProgress.objects.values('user', 'module').distinct().count()
    if count != distinct:
        print(f"[FAIL] Duplicates found! Total: {count}, Distinct: {distinct}")
    else:
        print(f"[PASS] Uniqueness constraints hold ({count} records).")

    # 3. Assignment Status Consistency
    print("\n[Check 3] Assignment vs Submission Consistency...")
    # If submission exists, assignment should be 'completed' or 'in_progress'?
    # Actually, if submission exists, assignment status might be 'completed' or 'submitted'.
    # Let's check for "Completed" assignments without submissions.
    completed_assignments = Assignment.objects.filter(status='completed')
    for asm in completed_assignments:
        if not asm.submissions.exists():
            print(f"[WARN] Assignment {asm.id} is 'completed' but has NO submissions.")
    print("[INFO] Consistency check complete.")

    # 4. Open Access Impact
    print("\n[Check 4] Open Access Impact...")
    # Check how many 'self-assigned' assignments exist
    self_assigned = Assignment.objects.filter(user=models.F('assigned_by'))
    print(f"[INFO] Self-enrolled assignments (Open Access): {self_assigned.count()}")

    print("\n[Check 5] User Role Consistency...")
    users_without_role = User.objects.filter(role__isnull=True)
    if users_without_role.exists():
         print(f"[WARN] Found {users_without_role.count()} users with no role.")
    else:
         print("[PASS] All users have roles.")

if __name__ == "__main__":
    check_integrity()
