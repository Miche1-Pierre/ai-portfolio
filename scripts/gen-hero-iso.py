# -*- coding: utf-8 -*-
"""Generates the home hero illustration: an isometric "floor" of extruded platforms (DA v3,
after dust.tt). Each platform is one of Pierre's areas: backend (blue cross), applied AI (pink
disc), frontend (lime pill), DevOps (sky "dee"), on a faded grid floor.

Output: public/illustrations/hero-iso.svg (light) and hero-iso-dark.svg (dark theme), and the
chip anchors (in % of the view box) to copy into src/components/site/hero-iso.tsx (stdout).

    python scripts/gen-hero-iso.py
"""
import math
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "illustrations"
UNIT = 6.0  # px per plan unit
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))

COLORS = {
    "blue": "#1c91ff",
    "lime": "#e2f78c",
    "pink": "#f99bc3",
    "sky": "#9fdbff",
    "yellow": "#ffc94d",
}
# Surfaces per theme (the platform tops keep the same vivid colours in both).
THEMES = {
    "hero-iso.svg": dict(wall_light="#ffffff", wall_dark="#f1f0ed", wall_line="#e4e3df", wall_edge="#d9d8d4",
                         grid="#e8e7e3", floor="#fbfaf9", rim=0.4),
    "hero-iso-dark.svg": dict(wall_light="#232a41", wall_dark="#1a2034", wall_line="#2b334d", wall_edge="#323b58",
                              grid="#1c2237", floor="#0f1322", rim=0.22),
}
T = THEMES["hero-iso.svg"]


def iso(x, y, z=0.0):
    return ((x - y) * C30 * UNIT, ((x + y) * S30 - z) * UNIT)


def arc(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]


def rounded_rect(x0, y0, x1, y1, r, n=10):
    return (arc(x1 - r, y0 + r, r, -90, 0, n) + arc(x1 - r, y1 - r, r, 0, 90, n)
            + arc(x0 + r, y1 - r, r, 90, 180, n) + arc(x0 + r, y0 + r, r, 180, 270, n))


def circle(cx, cy, r, n=72):
    return arc(cx, cy, r, 0, 360, n)[:-1]


def pill(x0, y0, x1, y1, n=20):
    r = (y1 - y0) / 2
    return arc(x1 - r, y0 + r, r, -90, 90, n) + arc(x0 + r, y0 + r, r, 90, 270, n)


def dee(x0, y0, x1, y1, n=24):
    """Half stadium: flat on the -x side, round on the +x side."""
    r = (y1 - y0) / 2
    return [(x0, y0)] + arc(x1 - r, y0 + r, r, -90, 90, n) + [(x0, y1)]


def plus(cx, cy, w, px, nx, py, ny, n=14):
    """Asymmetric plus with rounded tips. w = half width of an arm; px/nx/py/ny = distance from
    the centre to the tip of the +x / -x / +y / -y arm. Each arm must be >= 2w (2w = a plain
    rounded end), otherwise the outline folds over itself."""
    assert min(px, nx, py, ny) >= 2 * w - 1e-9, "plus(): arm shorter than 2w"
    r = w
    return ([(cx + w, cy - w)] + arc(cx + px - r, cy, r, -90, 90, n)
            + [(cx + w, cy + w)] + arc(cx, cy + py - r, r, 0, 180, n)
            + [(cx - w, cy + w)] + arc(cx - nx + r, cy, r, 90, 270, n)
            + [(cx - w, cy - w)] + arc(cx, cy - ny + r, r, 180, 360, n))


def path(points, close=True):
    d = "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in points)
    return d + (" Z" if close else "")


def signed_area(pts):
    return 0.5 * sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))


def platform(pts, h, color):
    """Visible side faces (facing the viewer = +X+Y), then the top. Returns (depth, svg)."""
    ccw = signed_area(pts) > 0
    faces = []
    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        ex, ey = b[0] - a[0], b[1] - a[1]
        if math.hypot(ex, ey) < 1e-9:
            continue
        # outward normal from the winding (robust for concave outlines)
        nx, ny = (ey, -ex) if ccw else (-ey, ex)
        if nx + ny <= 1e-9:
            continue  # faces away from the viewer
        light = 0.5 + 0.5 * (nx - ny) / (math.hypot(nx, ny) * math.sqrt(2))  # +X light, +Y shaded
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        faces.append((mx + my, a, b, light))
    faces.sort()
    out = []
    for _, a, b, light in faces:
        quad = [iso(a[0], a[1], h), iso(b[0], b[1], h), iso(b[0], b[1], 0), iso(a[0], a[1], 0)]
        fill = T["wall_light"] if light > 0.55 else T["wall_dark"]
        out.append(f'<path d="{path(quad)}" fill="{fill}" stroke="{fill}" stroke-width="0.6"/>')
    lines = []
    for _, a, b, _light in faces:
        seg = math.hypot(b[0] - a[0], b[1] - a[1])
        steps = max(1, int(seg / 1.5))
        for k in range(steps):
            t = (k + 0.5) / steps
            px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
            (x0, y0), (x1, y1) = iso(px, py, h - 0.35), iso(px, py, 0.2)
            lines.append(f"M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}")
    if lines:
        out.append(f'<path d="{" ".join(lines)}" stroke="{T["wall_line"]}" stroke-width="0.7" fill="none"/>')
    base = [iso(x, y, 0) for x, y in pts]
    out.append(f'<path d="{path(base)}" fill="none" stroke="{T["wall_edge"]}" stroke-width="0.8" stroke-opacity="0.6"/>')
    top = [iso(x, y, h) for x, y in pts]
    out.append(f'<path d="{path(top)}" fill="{color}"/>')
    out.append(f'<path d="{path(top)}" fill="none" stroke="#ffffff" stroke-opacity="{T["rim"]}" stroke-width="1.2"/>')
    cx = sum(p[0] for p in pts) / n
    cy = sum(p[1] for p in pts) / n
    return cx + cy, "\n".join(out)


# --------------------------------------------------------------------------- the scene (plan units)
PLATFORMS = [
    ("frontend", rounded_rect(4, -14, 24, 24, 9), 7.0, "lime"),
    ("backend", plus(40, 36, 9, 34, 18, 28, 24), 10.0, "blue"),
    ("ai", circle(70, 12, 14), 8.0, "pink"),
    ("devops", dee(2, 48, 28, 74), 6.0, "sky"),
]
# Chips: (id, x, y, platform or None for the floor). z = the platform height.
CHIPS = [
    ("pierre", 40, 36, "backend"),
    ("api", 62, 36, "backend"),
    ("db", 40, 56, "backend"),
    ("web", 9, 15, "frontend"),
    ("ui", 18, 20, "frontend"),
    ("agent", 65, 5, "ai"),
    ("rag", 77, 15, "ai"),
    ("ci", 11, 56, "devops"),
    ("obs", 17, 66, "devops"),
    ("git", 62, 60, None),
]
LABELS = [("cortex", 70, 23, "ai")]  # mono label chip (like Dust's "@ContentWriter")
FLOOR = (-12, -22, 88, 78)


def inside(pt, poly):
    x, y = pt
    c = False
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def check_overlaps():
    for i, (na, pa, _, _) in enumerate(PLATFORMS):
        for nb, pb, _, _ in PLATFORMS[i + 1:]:
            hits = sum(inside(p, pb) for p in pa) + sum(inside(p, pa) for p in pb)
            if hits:
                print(f"WARNING overlap {na} / {nb}: {hits} vertices")


def build(name):
    global T
    T = THEMES[name]
    out_path = OUT_DIR / name
    heights = {name: h for name, _, h, _ in PLATFORMS}
    items = [platform(pts, h, COLORS[c]) for _, pts, h, c in PLATFORMS]
    items.sort(key=lambda t: t[0])

    xs, ys = [], []
    for _, pts, h, _ in PLATFORMS:
        for x, y in pts:
            for z in (0, h):
                sx, sy = iso(x, y, z)
                xs.append(sx)
                ys.append(sy)
    fx0, fy0, fx1, fy1 = FLOOR
    for x, y in ((fx0, fy0), (fx1, fy0), (fx1, fy1), (fx0, fy1)):
        sx, sy = iso(x, y)
        xs.append(sx)
        ys.append(sy)
    pad = 10
    vx0, vy0 = min(xs) - pad, min(ys) - pad - 40  # room above for chips
    vw, vh = max(xs) - min(xs) + 2 * pad, max(ys) - min(ys) + 2 * pad + 40

    grid = []
    for gx in range(int(fx0), int(fx1) + 1, 6):
        (a, b), (c, d) = iso(gx, fy0), iso(gx, fy1)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    for gy in range(int(fy0), int(fy1) + 1, 6):
        (a, b), (c, d) = iso(fx0, gy), iso(fx1, gy)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    mx, my = iso((fx0 + fx1) / 2, (fy0 + fy1) / 2)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx0:.1f} {vy0:.1f} {vw:.1f} {vh:.1f}" role="img" aria-label="An isometric floor of four platforms: backend, applied AI, frontend and DevOps">
<defs>
  <radialGradient id="fade" cx="{mx:.1f}" cy="{my:.1f}" r="{vw * 0.5:.1f}" gradientUnits="userSpaceOnUse">
    <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="floor-mask"><rect x="{vx0:.1f}" y="{vy0:.1f}" width="{vw:.1f}" height="{vh:.1f}" fill="url(#fade)"/></mask>
</defs>
<g mask="url(#floor-mask)">
  <path d="{path([iso(fx0, fy0), iso(fx1, fy0), iso(fx1, fy1), iso(fx0, fy1)])}" fill="{T["floor"]}"/>
  <path d="{" ".join(grid)}" stroke="{T["grid"]}" stroke-width="0.8" fill="none"/>
</g>
{chr(10).join(s for _, s in items)}
</svg>
'''
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text(svg, encoding="utf-8")
    print(f"OK {out_path.name} ({len(svg)} bytes), view {vw:.0f}x{vh:.0f}")
    if name != "hero-iso.svg":
        return
    print("// chip anchors (% of the view), copy into hero-iso.tsx")
    for name, x, y, plat in CHIPS + LABELS:
        z = heights[plat] if plat else 0.0
        sx, sy = iso(x, y, z)
        print(f'  {name}: {{ left: {100 * (sx - vx0) / vw:.1f}, top: {100 * (sy - vy0) / vh:.1f} }},')
    print(f"// aspect ratio: {vw:.1f} / {vh:.1f}")


if __name__ == "__main__":
    check_overlaps()
    for theme in THEMES:
        build(theme)
