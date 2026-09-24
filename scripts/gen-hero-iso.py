# -*- coding: utf-8 -*-
"""Generates the home hero illustration (DA v3.1): an isometric architecture diagram. Square
blocks, one per area of Pierre's work (api, agents, web, data, CI/CD, observability), wired by
right-angle cables on a faded grid floor. No curves anywhere.

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
}
# Surfaces per theme (the block tops keep the same vivid colours in both).
THEMES = {
    "hero-iso.svg": dict(wall_light="#ffffff", wall_dark="#efeeea", wall_line="#e2e0db", wall_edge="#d4d2cd",
                         grid="#e8e7e3", floor="#fbfaf9", cable="#cfccc6", rim=0.45),
    "hero-iso-dark.svg": dict(wall_light="#232a41", wall_dark="#1a2034", wall_line="#2b334d", wall_edge="#323b58",
                              grid="#1c2237", floor="#0f1322", cable="#39425f", rim=0.22),
}
T = THEMES["hero-iso.svg"]


def iso(x, y, z=0.0):
    return ((x - y) * C30 * UNIT, ((x + y) * S30 - z) * UNIT)


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def path(points, close=True):
    d = "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in points)
    return d + (" Z" if close else "")


def signed_area(pts):
    return 0.5 * sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))


def block(pts, h, color):
    """Visible side faces (facing the viewer = +X+Y), then the top. Returns (depth, svg)."""
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
    out = []
    for _, a, b, light in faces:
        quad = [iso(a[0], a[1], h), iso(b[0], b[1], h), iso(b[0], b[1], 0), iso(a[0], a[1], 0)]
        fill = T["wall_light"] if light > 0.55 else T["wall_dark"]
        out.append(f'<path d="{path(quad)}" fill="{fill}" stroke="{fill}" stroke-width="0.6"/>')
    # horizontal courses on the walls (a stacked, engineered look instead of vertical ribs)
    lines = []
    for _, a, b, _light in faces:
        z = 1.5
        while z < h - 0.4:
            (x0, y0), (x1, y1) = iso(a[0], a[1], z), iso(b[0], b[1], z)
            lines.append(f"M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}")
            z += 1.5
    if lines:
        out.append(f'<path d="{" ".join(lines)}" stroke="{T["wall_line"]}" stroke-width="0.7" fill="none"/>')
    base = [iso(x, y, 0) for x, y in pts]
    out.append(f'<path d="{path(base)}" fill="none" stroke="{T["wall_edge"]}" stroke-width="0.8" stroke-opacity="0.7"/>')
    top = [iso(x, y, h) for x, y in pts]
    out.append(f'<path d="{path(top)}" fill="{color}"/>')
    out.append(f'<path d="{path(top)}" fill="none" stroke="#ffffff" stroke-opacity="{T["rim"]}" stroke-width="1.2"/>')
    cx = sum(p[0] for p in pts) / n
    cy = sum(p[1] for p in pts) / n
    return cx + cy, "\n".join(out)


def cable(points, w=0.9):
    """A flat right-angle cable on the floor: one thin rectangle per segment + square joints."""
    out = []
    for (x0, y0), (x1, y1) in zip(points, points[1:]):
        if abs(x1 - x0) >= abs(y1 - y0):
            poly = rect(min(x0, x1) - w, y0 - w, max(x0, x1) + w, y0 + w)
        else:
            poly = rect(x0 - w, min(y0, y1) - w, x0 + w, max(y0, y1) + w)
        out.append(f'<path d="{path([iso(x, y, 0.02) for x, y in poly])}" fill="{T["cable"]}"/>')
    for x, y in points[1:-1]:
        joint = rect(x - 1.6, y - 1.6, x + 1.6, y + 1.6)
        out.append(f'<path d="{path([iso(px, py, 0.03) for px, py in joint])}" fill="{T["cable"]}"/>')
    return "\n".join(out)


# --------------------------------------------------------------------------- the scene (plan units)
BLOCKS = [
    ("web", rect(2, -16, 24, 2), 6.0, "lime"),
    ("api", rect(28, 12, 52, 34), 12.0, "blue"),
    ("agents", rect(60, -4, 80, 16), 9.0, "pink"),
    ("data", rect(26, 44, 48, 58), 4.0, "green"),
    ("ci", rect(-2, 28, 14, 48), 7.0, "yellow"),
    ("obs", rect(62, 30, 72, 40), 15.0, "sky"),
]
# Cables between blocks (plan points, right angles only).
CABLES = [
    [(13, 2), (13, 23), (28, 23)],  # web -> api
    [(60, 8), (56, 8), (56, 20), (52, 20)],  # agents -> api
    [(37, 34), (37, 44)],  # api -> data
    [(14, 38), (20, 38), (20, 30), (28, 30)],  # ci -> api
    [(62, 36), (56, 36), (56, 30), (52, 30)],  # obs -> api
]
# Chips: (id, x, y, block). z = the block height.
CHIPS = [
    ("pierre", 44, 20, "api"),
    ("api", 36, 27, "api"),
    ("agents", 70, 6, "agents"),
    ("web", 13, -7, "web"),
    ("data", 37, 51, "data"),
    ("ci", 6, 38, "ci"),
    ("obs", 67, 35, "obs"),
]
FLOOR = (-12, -24, 90, 70)


def inside(pt, poly):
    x, y = pt
    c = False
    for i in range(len(poly)):
        (x1, y1), (x2, y2) = poly[i], poly[(i + 1) % len(poly)]
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            c = not c
    return c


def check_overlaps():
    for i, (na, pa, _, _) in enumerate(BLOCKS):
        for nb, pb, _, _ in BLOCKS[i + 1:]:
            hits = sum(inside(p, pb) for p in pa) + sum(inside(p, pa) for p in pb)
            if hits:
                print(f"WARNING overlap {na} / {nb}: {hits} vertices")


def build(name):
    global T
    T = THEMES[name]
    out_path = OUT_DIR / name
    heights = {n: h for n, _, h, _ in BLOCKS}
    items = [block(pts, h, COLORS[c]) for _, pts, h, c in BLOCKS]
    items.sort(key=lambda t: t[0])

    xs, ys = [], []
    for _, pts, h, _ in BLOCKS:
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
    for gx in range(int(fx0), int(fx1) + 1, 4):
        (a, b), (c, d) = iso(gx, fy0), iso(gx, fy1)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    for gy in range(int(fy0), int(fy1) + 1, 4):
        (a, b), (c, d) = iso(fx0, gy), iso(fx1, gy)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    mx, my = iso((fx0 + fx1) / 2, (fy0 + fy1) / 2)

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx0:.1f} {vy0:.1f} {vw:.1f} {vh:.1f}" role="img" aria-label="An isometric architecture diagram: api, agents, web, data, CI/CD and observability blocks wired together">
<defs>
  <radialGradient id="fade" cx="{mx:.1f}" cy="{my:.1f}" r="{vw * 0.5:.1f}" gradientUnits="userSpaceOnUse">
    <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="floor-mask"><rect x="{vx0:.1f}" y="{vy0:.1f}" width="{vw:.1f}" height="{vh:.1f}" fill="url(#fade)"/></mask>
</defs>
<g mask="url(#floor-mask)">
  <path d="{path([iso(fx0, fy0), iso(fx1, fy0), iso(fx1, fy1), iso(fx0, fy1)])}" fill="{T["floor"]}"/>
  <path d="{" ".join(grid)}" stroke="{T["grid"]}" stroke-width="0.7" fill="none"/>
</g>
{chr(10).join(cable(c) for c in CABLES)}
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
        z = heights[blk] if blk else 0.0
        sx, sy = iso(x, y, z)
        print(f'  {cid}: {{ left: {100 * (sx - vx0) / vw:.1f}, top: {100 * (sy - vy0) / vh:.1f} }},')
    print(f"// aspect ratio: {vw:.1f} / {vh:.1f}")


if __name__ == "__main__":
    check_overlaps()
    for theme in THEMES:
        build(theme)
