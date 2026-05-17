"""Generate the Ditto app icon at 1024x1024 (App Store size).
Run: python3 ditto-ios/scripts/generate_icon.py
Output: ditto-ios/assets/AppIcon-1024.png
"""
from PIL import Image, ImageDraw
from pathlib import Path

SIZE = 1024
OUT = Path(__file__).resolve().parent.parent / "assets" / "AppIcon-1024.png"
OUT.parent.mkdir(parents=True, exist_ok=True)

# Brand palette
CREAM = (242, 233, 214)
PERSIMMON = (255, 90, 54)
INK = (27, 22, 17)

img = Image.new("RGB", (SIZE, SIZE), CREAM)
draw = ImageDraw.Draw(img)

# Geometry: scale the favicon 32-unit viewBox up to 1024.
# Favicon paths (from ditto-favicon.svg):
#   Back bubble (outline):
#     M 10 14 ... rounded box ~ (10..27.5, 11.5..20.5) + tail to 15,23
#   Front bubble (filled persimmon):
#     M 3 8 ... rounded box ~ (3..19.5, 5.5..14.5) + tail to 7,17
#
# For 1024 canvas: scale = 1024/32 = 32 px per unit.

S = SIZE / 32
STROKE = int(round(3.6 * S / 6))  # ~6px at 1024
RAD = 4 * S  # rounded corner radius


def bubble(box, fill=None, outline=None, stroke=0):
    """Draw a rounded-rect speech bubble at `box = (x0,y0,x1,y1)`."""
    x0, y0, x1, y1 = box
    draw.rounded_rectangle(
        (x0, y0, x1, y1),
        radius=RAD,
        fill=fill,
        outline=outline,
        width=stroke,
    )


def tail(tip, base_y, fill=None, outline=None, stroke=0):
    """Triangular tail on the bottom-left of the bubble."""
    tx, ty = tip
    pts = [(tx - 4.5 * S, base_y - 1), (tx + 4.5 * S, base_y - 1), (tx, ty)]
    draw.polygon(pts, fill=fill, outline=outline)
    if stroke:
        # Outline strokes for the two diagonal edges
        draw.line([pts[2], pts[0]], fill=outline, width=stroke)
        draw.line([pts[2], pts[1]], fill=outline, width=stroke)


# Back bubble — outline only, offset right + down
back_box = (10 * S, 11.5 * S, 27.5 * S, 20.5 * S)
bubble(back_box, fill=CREAM, outline=INK, stroke=STROKE)
tail((15 * S, 23 * S), 20.5 * S, fill=CREAM, outline=INK, stroke=STROKE)

# Front bubble — filled persimmon, offset left + up
front_box = (3 * S, 5.5 * S, 19.5 * S, 14.5 * S)
bubble(front_box, fill=PERSIMMON, outline=INK, stroke=STROKE)
tail((7 * S, 17 * S), 14.5 * S, fill=PERSIMMON, outline=INK, stroke=STROKE)

img.save(OUT, "PNG", optimize=True)
print(f"Wrote {OUT} ({SIZE}x{SIZE})")
