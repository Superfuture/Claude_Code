"""Render the Cusp app icon SVG to 1024x1024 PNG."""
from pathlib import Path
import cairosvg

ROOT = Path(__file__).resolve().parent.parent / "assets"
cairosvg.svg2png(
    url=str(ROOT / "AppIcon.svg"),
    write_to=str(ROOT / "AppIcon-1024.png"),
    output_width=1024,
    output_height=1024,
)
print(f"Wrote {ROOT/'AppIcon-1024.png'}")
