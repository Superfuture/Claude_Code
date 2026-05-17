"""Generate the Ditto app icon PNG from the SVG source.
Run: python3 ditto-ios/scripts/generate_icon.py
Reads:  ditto-ios/assets/AppIcon.svg
Writes: ditto-ios/assets/AppIcon-1024.png
"""
from pathlib import Path
import cairosvg

ROOT = Path(__file__).resolve().parent.parent / "assets"
SRC = ROOT / "AppIcon.svg"
OUT = ROOT / "AppIcon-1024.png"

cairosvg.svg2png(
    url=str(SRC),
    write_to=str(OUT),
    output_width=1024,
    output_height=1024,
)
print(f"Wrote {OUT}")
