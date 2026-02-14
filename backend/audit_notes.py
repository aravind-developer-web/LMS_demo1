import os
import django
import sys
import time

# Setup Django Environment
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.modules.models import Module
from apps.notes.models import Note

User = get_user_model()

def run_notes_audit():
    print("\nSTARTING NOTES SYSTEM AUDIT")
    print("="*60)

    # 1. Create User & Module
    username = f"perfect_notetaker_{int(time.time())}"
    user = User.objects.create_user(username=username, password="password123", role='learner')
    module = Module.objects.first()
    
    if not module:
        print("CRITICAL: No modules found.")
        return

    print(f"User: {username}")
    print(f"Module: {module.title}")

    # 2. Simulate Saving a Note
    # The view does: Note.objects.update_or_create(user=request.user, module=module, defaults={'content': content})
    TEST_CONTENT = "This is a critical executive summary of the neural architecture."
    
    note, created = Note.objects.update_or_create(
        user=user,
        module=module,
        defaults={'content': TEST_CONTENT}
    )
    
    print(f"Note Created? {created}")
    print(f"Saved Content: '{note.content}'")

    # 3. Verify Retrieval
    fetched_note = Note.objects.get(user=user, module=module)
    if fetched_note.content == TEST_CONTENT:
        print("VERIFICATION PASS: Content matches exactly.")
    else:
        print("VERIFICATION FAIL: Content mismatch.")

    # 4. Simulate Update (Edit)
    UPDATED_CONTENT = "Updated analysis: functionality confirmed."
    note, created = Note.objects.update_or_create(
        user=user,
        module=module,
        defaults={'content': UPDATED_CONTENT}
    )
    print(f"Note Updated? {not created}") # Should be True (not created)
    print(f"New Content: '{note.content}'")
    
    if note.content == UPDATED_CONTENT:
         print("UPDATE PASS: Note updated successfully.")
    else:
         print("UPDATE FAIL: Note did not update.")

if __name__ == "__main__":
    run_notes_audit()
