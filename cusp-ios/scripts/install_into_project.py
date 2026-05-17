"""Install Cusp scaffold sources into an Xcode project.

Usage (after creating the Cusp Xcode project):
  python3 cusp-ios/scripts/install_into_project.py

Expects the Xcode project at: cusp-ios/Cusp/Cusp.xcodeproj
Source files are copied into: cusp-ios/Cusp/Cusp/
"""
import shutil
from pathlib import Path
from pbxproj import XcodeProject

ROOT = Path(__file__).resolve().parent.parent
PROJECT_DIR = ROOT / "Cusp"
TARGET_SOURCE_DIR = PROJECT_DIR / "Cusp"
PBXPROJ = PROJECT_DIR / "Cusp.xcodeproj" / "project.pbxproj"
TARGET_NAME = "Cusp"

SOURCES = [
    (ROOT / "Cusp" / "CuspApp.swift",                       "CuspApp.swift"),
    (ROOT / "Cusp" / "ContentView.swift",                   "ContentView.swift"),
    (ROOT / "Cusp" / "Views" / "OnboardingView.swift",      "OnboardingView.swift"),
    (ROOT / "Cusp" / "Views" / "CosmicBackground.swift",    "CosmicBackground.swift"),
    (ROOT / "Cusp" / "Views" / "RitualCard.swift",          "RitualCard.swift"),
    (ROOT / "Cusp" / "Views" / "PaywallView.swift",         "PaywallView.swift"),
    (ROOT / "Cusp" / "Models" / "BirthData.swift",          "BirthData.swift"),
    (ROOT / "Cusp" / "Models" / "Ritual.swift",             "Ritual.swift"),
    (ROOT / "Cusp" / "Services" / "APIClient.swift",        "APIClient.swift"),
    (ROOT / "Cusp" / "Services" / "Store.swift",            "Store.swift"),
    (ROOT / "Cusp" / "Brand" / "BrandColor.swift",          "BrandColor.swift"),
    (ROOT / "Cusp" / "Brand" / "BrandFont.swift",           "BrandFont.swift"),
]

if not PBXPROJ.exists():
    print(f"No project at {PBXPROJ}.")
    print("Open Xcode → File → New → Project → iOS → App")
    print(f"  Product Name: Cusp")
    print(f"  Bundle ID: com.yourdomain.cusp")
    print(f"  Save to: {PROJECT_DIR}")
    raise SystemExit(1)

project = XcodeProject.load(str(PBXPROJ))
target = next((t for t in project.objects.get_targets() if t.name == TARGET_NAME), None)
if not target:
    raise SystemExit(f"Target {TARGET_NAME} not found")

group = project.get_or_create_group(TARGET_NAME)
added, skipped = 0, 0

for src, dst_name in SOURCES:
    dst = TARGET_SOURCE_DIR / dst_name
    if not dst.exists() or dst.read_bytes() != src.read_bytes():
        shutil.copy2(src, dst)
    rel = str(dst.relative_to(PROJECT_DIR))
    if project.get_files_by_path(rel):
        skipped += 1
        continue
    project.add_file(str(dst), parent=group, target_name=TARGET_NAME, force=False)
    print(f"  + {dst_name}")
    added += 1

project.save()
print(f"\nDone. Added {added}, skipped {skipped}.")
