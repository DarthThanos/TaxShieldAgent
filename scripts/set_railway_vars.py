"""
Reads .env and uploads all variables to Railway via CLI.
Called automatically by railway_deploy.bat — do not run directly.
"""
import os
import subprocess
import sys
from pathlib import Path

# Find railway executable — check known install path first
_known = Path.home() / ".railway" / "bin" / "railway.exe"
RAILWAY_EXE = str(_known) if _known.exists() else "railway"

env_path = Path(__file__).resolve().parents[1] / ".env"

# Values to skip
SKIP_VALUES = {"", "whsec_", "your_key_here"}
# Force-override these regardless of .env
OVERRIDES = {
    "DB_PATH": "/data/shield.db",
    "APP_ENV": "production",
    "ALLOWED_ORIGINS": "https://taxshieldagent.com",
}

vars_to_set = {}

# Parse .env
with open(env_path, encoding="utf-8") as f:
    for line in f:
        line = line.strip()
        if not line or line.startswith("#"):
            continue
        if "=" not in line:
            continue
        key, _, value = line.partition("=")
        key = key.strip()
        value = value.strip()
        if value in SKIP_VALUES:
            continue
        vars_to_set[key] = value

# Apply overrides
vars_to_set.update(OVERRIDES)

print(f"  Setting {len(vars_to_set)} variables...")

failed = []
for key, value in vars_to_set.items():
    result = subprocess.run(
        [RAILWAY_EXE, "variables", "set", f"{key}={value}"],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        failed.append(key)
        print(f"  [WARN] Failed to set {key}: {result.stderr.strip()}")
    else:
        print(f"  [OK] {key}")

if failed:
    print(f"\n  {len(failed)} variable(s) failed: {', '.join(failed)}")
    print("  You can set these manually in Railway dashboard → Variables tab")
    sys.exit(1)
else:
    print(f"\n  All {len(vars_to_set)} variables uploaded successfully.")
