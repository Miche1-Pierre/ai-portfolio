# -*- coding: utf-8 -*-
"""Generates the home hero illustration (DA v3.2): an abstract isometric composition of building
blocks, square and round volumes stacked on a faded grid floor. A staircase climbs to the main
block ("from scoping to production"), a round tower, a rounded tower on top, a few slabs. No
labels, no cables: it stays friendly rather than technical.

Output: public/illustrations/hero-iso.svg (light) and hero-iso-dark.svg (dark theme), and the chip
anchors (in % of the view box) to copy into src/components/site/hero-iso.tsx (stdout).

    python scripts/gen-hero-iso.py
"""
import math
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "illustrations"
UNIT = 6.0  # px per plan unit
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))

COLORS = {
    "blue": "#2f6bf6",
    "lime": "#e2f78c",
    "pink": "#f99bc3",
    "sky": "#a9c6ff",
    "yellow": "#ffc94d",
    "green": "#6fbf8f",
    "red": "#ef6a4c",
}
# Surfaces per theme (the tops keep the same vivid colours in both).
THEMES = {
    "hero-iso.svg": dict(wall_light="#ffffff", wall_dark="#efeeea", wall_line="#e2e0db", wall_edge="#d4d2cd",
                         grid="#e8e7e3", floor="#fbfaf9", rim=0.45),
    "hero-iso-dark.svg": dict(wall_light="#232a41", wall_dark="#1a2034", wall_line="#2b334d", wall_edge="#323b58",
                              grid="#1c2237", floor="#0f1322", rim=0.22),
}
T = THEMES["hero-iso.svg"]


def iso(x, y, z=0.0):
    return ((x - y) * C30 * UNIT, ((x + y) * S30 - z) * UNIT)


def arc(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def circle(cx, cy, r, n=72):
    return arc(cx, cy, r, 0, 360, n)[:-1]


def dee(x0, y0, x1, y1, n=28):
    """Half stadium: flat on the -x side, round on the +x side."""
    r = (y1 - y0) / 2
    return [(x0, y0)] + arc(x1 - r, y0 + r, r, -90, 90, n) + [(x0, y1)]


def pill(x0, y0, x1, y1, n=20):
    r = (y1 - y0) / 2
    return arc(x1 - r, y0 + r, r, -90, 90, n) + arc(x0 + r, y0 + r, r, 90, 270, n)


def quarter(cx, cy, r, a0, n=24):
    """Quarter disc: the corner at (cx, cy), the arc from a0 to a0 + 90."""
    return [(cx, cy)] + arc(cx, cy, r, a0, a0 + 90, n)


def path(points, close=True):
    d = "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in points)
    return d + (" Z" if close else "")


def signed_area(pts):
    return 0.5 * sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))


def block(pts, h, color, z0=0.0, courses=False):
    """Visible side faces (facing the viewer = +X+Y), then the top, from z0 to z0 + h."""
    ccw = signed_area(pts) > 0
    faces = []
    n = len(pts)
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        ex, ey = b[0] - a[0], b[1] - a[1]
        if math.hypot(ex, ey) < 1e-9:
            continue
        nx, ny = (ey, -ex) if ccw else (-ey, ex)  # outward normal from the winding
        if nx + ny <= 1e-9:
            continue  # faces away from the viewer
        light = 0.5 + 0.5 * (nx - ny) / (math.hypot(nx, ny) * math.sqrt(2))  # +X light, +Y shaded
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        faces.append((mx + my, a, b, light))
    faces.sort()
    z1 = z0 + h
    # the base outline goes first: the walls then hide its back half
    base = [iso(x, y, z0) for x, y in pts]
    out = [f'<path d="{path(base)}" fill="none" stroke="{T["wall_edge"]}" stroke-width="0.8" stroke-opacity="0.7"/>']
    for _, a, b, light in faces:
        quad = [iso(a[0], a[1], z1), iso(b[0], b[1], z1), iso(b[0], b[1], z0), iso(a[0], a[1], z0)]
        fill = T["wall_light"] if light > 0.55 else T["wall_dark"]
        out.append(f'<path d="{path(quad)}" fill="{fill}" stroke="{fill}" stroke-width="0.6"/>')
    lines = []
    if courses:  # horizontal courses on square blocks
        for _, a, b, _light in faces:
            z = z0 + 1.5
            while z < z1 - 0.4:
                (x0, y0), (x1, y1) = iso(a[0], a[1], z), iso(b[0], b[1], z)
                lines.append(f"M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}")
                z += 1.5
    else:  # vertical ribs on round volumes
        for _, a, b, _light in faces:
            seg = math.hypot(b[0] - a[0], b[1] - a[1])
            steps = max(1, int(seg / 1.6))
            for k in range(steps):
                t = (k + 0.5) / steps
                px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                (x0, y0), (x1, y1) = iso(px, py, z1 - 0.35), iso(px, py, z0 + 0.2)
                lines.append(f"M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}")
    if lines:
        out.append(f'<path d="{" ".join(lines)}" stroke="{T["wall_line"]}" stroke-width="0.7" fill="none"/>')
    top = [iso(x, y, z1) for x, y in pts]
    out.append(f'<path d="{path(top)}" fill="{color}"/>')
    out.append(f'<path d="{path(top)}" fill="none" stroke="#ffffff" stroke-opacity="{T["rim"]}" stroke-width="1.2"/>')
    cx = sum(p[0] for p in pts) / n
    cy = sum(p[1] for p in pts) / n
    return (cx + cy, z0), "\n".join(out)


# --------------------------------------------------------------------------- the scene (plan units)
# (name, footprint, height, colour, base z, square courses?)
BLOCKS = [
    ("pill", pill(8, 8, 30, 18), 4.0, "sky", 0.0, False),
    ("step-1", rect(4, 30, 12, 46), 3.0, "yellow", 0.0, True),
    ("step-2", rect(12, 30, 20, 46), 6.0, "yellow", 0.0, True),
    ("step-3", rect(20, 30, 28, 46), 9.0, "yellow", 0.0, True),
    ("cube", rect(28, 26, 48, 48), 12.0, "blue", 0.0, True),
    ("tower", dee(31, 29, 45, 43), 7.0, "pink", 12.0, False),
    ("round", circle(60, 24, 8), 18.0, "lime", 0.0, False),
    ("cap", circle(60, 24, 4.5), 3.0, "red", 18.0, False),
    ("slab", quarter(50, 60, 14, 270), 3.0, "green", 0.0, False),
]
# Chips: (id, x, y, block). z = the block top.
CHIPS = [
    ("pierre", 38, 36, "tower"),
    ("round", 60, 24, "cap"),
    ("steps", 24, 38, "step-3"),
    ("pill", 19, 13, "pill"),
    ("slab", 56, 54, "slab"),
]
FLOOR = (-6, -10, 78, 70)


def build(name):
    global T
    T = THEMES[name]
    out_path = OUT_DIR / name
    tops = {n: z0 + h for n, _, h, _, z0, _ in BLOCKS}
    items = [block(pts, h, COLORS[c], z0, courses) for _, pts, h, c, z0, courses in BLOCKS]
    items.sort(key=lambda t: t[0])

    xs, ys = [], []
    for _, pts, h, _, z0, _ in BLOCKS:
        for x, y in pts:
            for z in (z0, z0 + h):
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

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx0:.1f} {vy0:.1f} {vw:.1f} {vh:.1f}" role="img" aria-label="Isometric building blocks: a staircase climbing to a blue block with a pink tower, a round lime tower and a few slabs">
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
    for cid, x, y, blk in CHIPS:
        sx, sy = iso(x, y, tops[blk])
        print(f'  {cid}: {{ left: {100 * (sx - vx0) / vw:.1f}, top: {100 * (sy - vy0) / vh:.1f} }},')
    print(f"// aspect ratio: {vw:.1f} / {vh:.1f}")


if __name__ == "__main__":
    for theme in THEMES:
        build(theme)
