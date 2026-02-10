import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.modules.models import Module

modules = Module.objects.all().order_by('id')
print(f"Total Modules: {modules.count()}")
print("-" * 60)
print(f"{'ID':<5} | {'TITLE'}")
print("-" * 60)
for m in modules:
    print(f"{m.id:<5} | {m.title}")
print("-" * 60)

# Check specifically for 21
if not Module.objects.filter(pk=21).exists():
    print("\n[ALERT] Module 21 does NOT exist.")
else:
    print("\n[OK] Module 21 exists.")
