"""
Generate the TaxShieldAgent app icon (256x256 PNG).
Uses Pillow to draw a professional shield + dollar sign icon.
"""

from PIL import Image, ImageDraw, ImageFilter, ImageFont
import math
import os

SIZE = 256
CENTER = SIZE // 2

# Colors
BG_DARK = (15, 23, 42)        # #0f172a - deep navy
BG_MID = (26, 31, 46)         # #1a1f2e
SHIELD_FILL = (99, 102, 241)  # #6366f1 - indigo
SHIELD_BORDER = (129, 140, 248)  # #818cf8 - lighter indigo
SHIELD_HIGHLIGHT = (165, 180, 252)  # lighter highlight for top
WHITE = (255, 255, 255)
GLOW_COLOR = (99, 102, 241, 60)  # semi-transparent indigo


def make_shield_points(cx, cy, w, h):
    """Create a classic shield polygon: wide flat top, straight sides tapering to a point."""
    top = cy - h * 0.46
    bottom = cy + h * 0.54
    left = cx - w * 0.5
    right = cx + w * 0.5

    points = []

    # Top-left rounded corner
    corner_r = w * 0.08
    for i in range(5, -1, -1):
        angle = math.pi / 2 + (math.pi / 2) * (i / 5)
        x = left + corner_r + corner_r * math.cos(angle)
        y = top + corner_r + corner_r * math.sin(angle)
        points.append((x, y))

    # Flat top edge with very subtle upward arc
    for i in range(1, 20):
        t = i / 20.0
        x = left + corner_r + t * (w - 2 * corner_r)
        arc = -h * 0.012 * math.sin(t * math.pi)
        y = top + arc
        points.append((x, y))

    # Top-right rounded corner
    for i in range(0, 6):
        angle = math.pi + (math.pi / 2) * (i / 5)
        x = right - corner_r + corner_r * math.cos(angle)
        y = top + corner_r + corner_r * math.sin(angle)
        points.append((x, y))

    # Right side: straight for top 55%, then curves inward to point
    straight_end_y = top + h * 0.55
    # Straight portion
    for i in range(1, 8):
        t = i / 8.0
        y = top + corner_r + t * (straight_end_y - top - corner_r)
        points.append((right, y))

    # Curved taper from straight_end_y to bottom point
    for i in range(1, 16):
        t = i / 16.0
        # Smooth curve using sine easing
        ease = math.sin(t * math.pi / 2)
        x = right - (right - cx) * ease
        y = straight_end_y + (bottom - straight_end_y) * t
        points.append((x, y))

    # Bottom point
    points.append((cx, bottom))

    # Left side: mirror of right (curved taper then straight)
    for i in range(15, 0, -1):
        t = i / 16.0
        ease = math.sin(t * math.pi / 2)
        x = left + (cx - left) * ease
        y = straight_end_y + (bottom - straight_end_y) * t
        points.append((x, y))

    # Straight left side going up
    for i in range(7, 0, -1):
        t = i / 8.0
        y = top + corner_r + t * (straight_end_y - top - corner_r)
        points.append((left, y))

    return points


def draw_radial_gradient(img, center, radius, color_center, color_edge):
    """Draw a simple radial gradient background."""
    pixels = img.load()
    cx, cy = center
    for y in range(img.height):
        for x in range(img.width):
            dist = math.sqrt((x - cx) ** 2 + (y - cy) ** 2)
            t = min(dist / radius, 1.0)
            # Ease the gradient
            t = t * t
            r = int(color_center[0] + (color_edge[0] - color_center[0]) * t)
            g = int(color_center[1] + (color_edge[1] - color_center[1]) * t)
            b = int(color_center[2] + (color_edge[2] - color_center[2]) * t)
            pixels[x, y] = (r, g, b)


def find_bold_font(size):
    """Try to find a bold system font, fall back to default."""
    font_candidates = [
        "C:/Windows/Fonts/arialbd.ttf",    # Arial Bold
        "C:/Windows/Fonts/segoeui.ttf",     # Segoe UI
        "C:/Windows/Fonts/calibrib.ttf",    # Calibri Bold
        "C:/Windows/Fonts/verdanab.ttf",    # Verdana Bold
        "C:/Windows/Fonts/arial.ttf",       # Arial
        "C:/Windows/Fonts/times.ttf",       # Times
    ]
    for path in font_candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()


def main():
    # Create base image with radial gradient background
    img = Image.new("RGB", (SIZE, SIZE), BG_DARK)
    draw_radial_gradient(img, (CENTER, CENTER - 20), SIZE * 0.8, BG_MID, BG_DARK)

    # --- Glow effect behind shield ---
    glow_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow_layer)

    shield_w, shield_h = 170, 190
    glow_points = make_shield_points(CENTER, CENTER + 5, shield_w + 20, shield_h + 20)
    glow_draw.polygon(glow_points, fill=(99, 102, 241, 50))

    # Blur the glow
    glow_layer = glow_layer.filter(ImageFilter.GaussianBlur(radius=12))
    # Apply glow twice for intensity
    img_rgba = img.convert("RGBA")
    img_rgba = Image.alpha_composite(img_rgba, glow_layer)
    img_rgba = Image.alpha_composite(img_rgba, glow_layer)

    draw = ImageDraw.Draw(img_rgba)

    # --- Shield border (slightly larger) ---
    border_points = make_shield_points(CENTER, CENTER + 5, shield_w + 6, shield_h + 6)
    draw.polygon(border_points, fill=SHIELD_BORDER)

    # --- Shield main fill ---
    shield_points = make_shield_points(CENTER, CENTER + 5, shield_w, shield_h)
    draw.polygon(shield_points, fill=SHIELD_FILL)

    # --- Shield inner highlight (top portion for 3D effect) ---
    highlight_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    hl_draw = ImageDraw.Draw(highlight_layer)
    inner_points = make_shield_points(CENTER, CENTER + 5, shield_w - 10, shield_h - 10)
    # Draw a subtle lighter fill only on top half
    hl_draw.polygon(inner_points, fill=(130, 150, 255, 35))
    # Mask bottom half
    hl_draw.rectangle([(0, CENTER + 10), (SIZE, SIZE)], fill=(0, 0, 0, 0))
    img_rgba = Image.alpha_composite(img_rgba, highlight_layer)

    # --- Draw "TS" text inside shield ---
    draw = ImageDraw.Draw(img_rgba)

    # Try to get a nice bold font
    font_large = find_bold_font(72)

    # Measure text
    bbox = draw.textbbox((0, 0), "TS", font=font_large)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]

    text_x = CENTER - tw // 2
    text_y = CENTER - th // 2 - 5  # slight upward shift since shield center is visual

    # Text shadow for depth
    shadow_layer = Image.new("RGBA", (SIZE, SIZE), (0, 0, 0, 0))
    shadow_draw = ImageDraw.Draw(shadow_layer)
    shadow_draw.text((text_x + 2, text_y + 2), "TS", font=font_large, fill=(20, 20, 60, 120))
    shadow_layer = shadow_layer.filter(ImageFilter.GaussianBlur(radius=3))
    img_rgba = Image.alpha_composite(img_rgba, shadow_layer)

    # Draw main text
    draw = ImageDraw.Draw(img_rgba)
    draw.text((text_x, text_y), "TS", font=font_large, fill=WHITE)

    # --- Small checkmark below the text ---
    check_cx = CENTER
    check_cy = CENTER + th // 2 + 18
    check_size = 10
    check_points = [
        (check_cx - check_size, check_cy),
        (check_cx - check_size * 0.3, check_cy + check_size * 0.7),
        (check_cx + check_size, check_cy - check_size * 0.6),
    ]
    draw.line(check_points, fill=(180, 255, 180), width=3)

    # --- Subtle bottom edge line on shield for polish ---
    # (already looks good from the border)

    # Convert to RGB and save
    final = img_rgba.convert("RGB")

    out_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "icon.png")
    final.save(out_path, "PNG")
    print(f"Icon saved to: {out_path}")
    print(f"Size: {final.size}, Mode: {final.mode}")


if __name__ == "__main__":
    main()
