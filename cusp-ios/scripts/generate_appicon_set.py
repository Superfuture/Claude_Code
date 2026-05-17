"""Render every iOS app icon size from AppIcon.svg into
Resources/Assets.xcassets/AppIcon.appiconset/ with the matching Contents.json.
"""
import json
from pathlib import Path
import cairosvg

ROOT = Path(__file__).resolve().parent.parent
SVG = ROOT / "assets" / "AppIcon.svg"
ICONSET = ROOT / "Resources" / "Assets.xcassets" / "AppIcon.appiconset"
ICONSET.mkdir(parents=True, exist_ok=True)

# (size_pt, scale, idiom)
SLOTS = [
    (20,  "2x", "iphone"),
    (20,  "3x", "iphone"),
    (29,  "2x", "iphone"),
    (29,  "3x", "iphone"),
    (40,  "2x", "iphone"),
    (40,  "3x", "iphone"),
    (60,  "2x", "iphone"),
    (60,  "3x", "iphone"),
    (20,  "1x", "ipad"),
    (20,  "2x", "ipad"),
    (29,  "1x", "ipad"),
    (29,  "2x", "ipad"),
    (40,  "1x", "ipad"),
    (40,  "2x", "ipad"),
    (76,  "2x", "ipad"),
    (83.5, "2x", "ipad"),
    (1024, "1x", "ios-marketing"),
]

images = []
for size_pt, scale, idiom in SLOTS:
    scale_n = int(scale.replace("x", ""))
    px = int(round(size_pt * scale_n))
    fname = f"icon-{size_pt}@{scale}-{idiom}.png"
    out = ICONSET / fname
    cairosvg.svg2png(url=str(SVG), write_to=str(out), output_width=px, output_height=px)
    size_label = f"{size_pt}x{size_pt}" if not isinstance(size_pt, float) else "83.5x83.5"
    images.append({
        "filename": fname,
        "idiom": idiom,
        "scale": scale,
        "size": size_label,
    })

(ICONSET / "Contents.json").write_text(
    json.dumps({"images": images, "info": {"author": "xcode", "version": 1}}, indent=2)
)

# Clean up the old single-icon if present
old = ICONSET / "AppIcon-1024.png"
if old.exists(): old.unlink()

print(f"Wrote {len(images)} icon variants + Contents.json")
