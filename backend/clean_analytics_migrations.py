"""
Force reset analytics migrations
"""
import os
import glob

migration_path = os.path.join('apps', 'analytics', 'migrations')
print(f"Cleaning migrations in: {migration_path}")

# Remove all migration files except __init__.py
files = glob.glob(os.path.join(migration_path, "*.py"))
for f in files:
    if "__init__" not in f:
        try:
            os.remove(f)
            print(f"  [DELETED] {f}")
        except Exception as e:
            print(f"  [ERROR] {e}")

print("Done cleaning migrations.")
