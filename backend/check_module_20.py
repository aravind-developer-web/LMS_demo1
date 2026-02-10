import os
import django
import sys

sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.modules.models import Module

try:
    mod = Module.objects.get(pk=20)
    print(f"Module 20 Found: {mod.title}")
except Module.DoesNotExist:
    print("Module 20 does NOT exist.")
    print(f"Available IDs: {list(Module.objects.values_list('pk', flat=True))}")
