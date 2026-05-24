"""
Downloads and installs the Stripe CLI on Windows directly from GitHub.
Run with: python scripts\install_stripe_cli.py
"""
import json
import os
import sys
import urllib.request
import zipfile
from pathlib import Path

INSTALL_DIR = Path.home() / ".stripe" / "bin"
EXE_PATH = INSTALL_DIR / "stripe.exe"

def main():
    print()
    print("=" * 50)
    print("  Installing Stripe CLI from GitHub...")
    print("=" * 50)
    print()

    INSTALL_DIR.mkdir(parents=True, exist_ok=True)

    # Get latest release
    print("[1/3] Fetching latest release info...")
    req = urllib.request.Request(
        "https://api.github.com/repos/stripe/stripe-cli/releases/latest",
        headers={"User-Agent": "taxshieldagent-installer"}
    )
    with urllib.request.urlopen(req) as r:
        data = json.load(r)

    asset = next(
        (a for a in data["assets"]
         if "windows" in a["name"].lower() and a["name"].endswith(".zip")),
        None
    )
    if not asset:
        print("[ERROR] Could not find Windows zip in release assets.")
        print("Assets found:")
        for a in data["assets"]:
            print(f"  {a['name']}")
        sys.exit(1)

    print(f"[OK] Found: {asset['name']}")

    # Download zip
    zip_path = INSTALL_DIR / "stripe_cli.zip"
    print()
    print("[2/3] Downloading Stripe CLI...")
    urllib.request.urlretrieve(asset["browser_download_url"], zip_path)
    print(f"[OK] Downloaded ({round(zip_path.stat().st_size / 1024 / 1024, 1)} MB)")

    # Extract
    print()
    print("[3/3] Extracting...")
    with zipfile.ZipFile(zip_path, "r") as z:
        names = z.namelist()
        print(f"      Contents: {names}")
        exe_name = next((n for n in names if n.endswith(".exe")), None)
        if exe_name:
            z.extract(exe_name, INSTALL_DIR)
            extracted = INSTALL_DIR / exe_name
            if extracted != EXE_PATH:
                EXE_PATH.unlink(missing_ok=True)
                extracted.rename(EXE_PATH)

    zip_path.unlink(missing_ok=True)

    if not EXE_PATH.exists():
        print("[ERROR] stripe.exe not found after extraction.")
        sys.exit(1)

    # Add to PATH permanently
    current_path = os.environ.get("PATH", "")
    install_str = str(INSTALL_DIR)
    if install_str not in current_path:
        import winreg
        try:
            key = winreg.OpenKey(
                winreg.HKEY_CURRENT_USER,
                r"Environment",
                0, winreg.KEY_ALL_ACCESS
            )
            existing, _ = winreg.QueryValueEx(key, "PATH")
            winreg.SetValueEx(key, "PATH", 0, winreg.REG_EXPAND_SZ,
                              f"{install_str};{existing}")
            winreg.CloseKey(key)
            print(f"[OK] Added {install_str} to user PATH permanently.")
        except Exception as e:
            print(f"[WARN] Could not update PATH automatically: {e}")
            print(f"       Manually add this to your PATH: {install_str}")

    # Test
    version = os.popen(f'"{EXE_PATH}" --version').read().strip()
    print()
    print("=" * 50)
    print(f"  Stripe CLI installed: {version}")
    print(f"  Location: {EXE_PATH}")
    print("=" * 50)
    print()
    print("  Now run the submission script:")
    print("  scripts\\stripe_submit.bat")
    print()

if __name__ == "__main__":
    main()
