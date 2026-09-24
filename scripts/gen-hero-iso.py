# -*- coding: utf-8 -*-
"""Generates the home hero illustration (DA v3.3): the whole product pipeline as a small isometric
diorama, "from scoping to production". A blueprint with a pencil (scope), a sawtooth workshop with
gears and a smoking chimney (build), a conveyor carrying crates to a loading dock and a delivery van
(ship), and a rocket on its launch pad (launch). Same language as the rest of the DA: neutral
walls, vivid tops, round details. Nobody on it.

Output: public/illustrations/hero-iso.svg (light) and hero-iso-dark.svg (dark theme), and the tag
anchors (in % of the view box) to copy into src/components/site/hero-iso.tsx (stdout).

    python scripts/gen-hero-iso.py
"""
import math
import re
from pathlib import Path

OUT_DIR = Path(__file__).resolve().parent.parent / "public" / "illustrations"
UNIT = 6.0  # px per plan unit
C30, S30 = math.cos(math.radians(30)), math.sin(math.radians(30))
ASPECT = 1.45  # width / height of the view box: tight around the scene so it reads at phone width

COLORS = {
    "blue": "#2f6bf6",
    "lime": "#e2f78c",
    "pink": "#f99bc3",
    "sky": "#a9c6ff",
    "yellow": "#ffc94d",
    "green": "#6fbf8f",
    "red": "#ef6a4c",
}
# Surfaces per theme (the tops keep the same vivid colours in both). In the dark theme the workshop
# windows are lit.
THEMES = {
    "hero-iso.svg": dict(
        wall_light="#ffffff", wall_dark="#efeeea", wall_line="#e2e0db", wall_edge="#d4d2cd",
        grid="#e8e7e3", floor="#fbfaf9", rim=0.45,
        window="#a9c6ff", mullion="#ffffff", glass="#cfe0ff", opening="#5b6272",
        belt="#3b4150", belt_line="#5b6272", tyre="#2d313b", hub="#d4d2cd", metal="#d4d2cd",
        smoke="#ffffff", smoke_line="#dcdad4", road="#f1f0ec", road_line="#ffffff", shadow="#e8e6e1",
        wood="#f3d9a4", lead="#3b4150",
    ),
    "hero-iso-dark.svg": dict(
        wall_light="#232a41", wall_dark="#1a2034", wall_line="#2b334d", wall_edge="#323b58",
        grid="#1c2237", floor="#0f1322", rim=0.22,
        window="#ffd66b", mullion="#1a2034", glass="#7ea4ff", opening="#070a12",
        belt="#0a0d17", belt_line="#232a41", tyre="#05070d", hub="#39425f", metal="#39425f",
        smoke="#323b58", smoke_line="#434d6e", road="#141a2d", road_line="#2b334d", shadow="#0a0e1a",
        wood="#c7ad7f", lead="#0a0d17",
    ),
}
T = THEMES["hero-iso.svg"]
VIEW = (1.0, 1.0, 1.0)  # direction towards the viewer: a face is visible when its normal points this way


# --------------------------------------------------------------------------- geometry helpers
def iso(x, y, z=0.0):
    return ((x - y) * C30 * UNIT, ((x + y) * S30 - z) * UNIT)


def arc(cx, cy, r, a0, a1, n):
    return [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * k / n)), cy + r * math.sin(math.radians(a0 + (a1 - a0) * k / n))) for k in range(n + 1)]


def rect(x0, y0, x1, y1):
    return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]


def circle(cx, cy, r, n=72):
    return arc(cx, cy, r, 0, 360, n)[:-1]


def path(points, close=True):
    d = "M" + " L".join(f"{x:.2f} {y:.2f}" for x, y in points)
    return d + (" Z" if close else "")


def signed_area(pts):
    return 0.5 * sum(pts[i][0] * pts[(i + 1) % len(pts)][1] - pts[(i + 1) % len(pts)][0] * pts[i][1] for i in range(len(pts)))


def shade(color, k):
    """Darken a #rrggbb colour (k < 1)."""
    r, g, b = (int(color[i:i + 2], 16) for i in (1, 3, 5))
    return "#" + "".join(f"{max(0, min(255, round(c * k))):02x}" for c in (r, g, b))


def sub(a, b):
    return (a[0] - b[0], a[1] - b[1], a[2] - b[2])


def cross(a, b):
    return (a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0])


def poly(points3, fill, stroke=None, width=0.6):
    """A flat 3D polygon, projected."""
    pts = [iso(*p) for p in points3]
    return f'<path d="{path(pts)}" fill="{fill}" stroke="{stroke or fill}" stroke-width="{width}"/>'


def lit(n):
    """Wall shading from a horizontal normal: +X faces are light, +Y faces are shaded."""
    h = math.hypot(n[0], n[1]) or 1.0
    return 0.5 + 0.5 * (n[0] - n[1]) / (h * math.sqrt(2)) > 0.55


# --------------------------------------------------------------------------- primitives
def block(pts, h, color, z0=0.0, texture="courses", wall=None, top=True, rim=True):
    """A footprint extruded from z0 to z0 + h: visible side faces (facing +X+Y), then the top.
    texture: "courses" (horizontal lines, square volumes), "ribs" (vertical lines, round volumes) or None.
    wall: colour the walls instead of the neutral theme walls (bands, chimney cap)."""
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
        mx, my = (a[0] + b[0]) / 2, (a[1] + b[1]) / 2
        faces.append((mx + my, a, b, lit((nx, ny))))
    faces.sort()
    z1 = z0 + h
    light, dark = (wall, shade(wall, 0.86)) if wall else (T["wall_light"], T["wall_dark"])
    out = []
    if not wall:  # the base outline goes first: the walls then hide its back half
        base = [iso(x, y, z0) for x, y in pts]
        out.append(f'<path d="{path(base)}" fill="none" stroke="{T["wall_edge"]}" stroke-width="0.8" stroke-opacity="0.7"/>')
    for _, a, b, is_light in faces:
        quad = [iso(a[0], a[1], z1), iso(b[0], b[1], z1), iso(b[0], b[1], z0), iso(a[0], a[1], z0)]
        fill = light if is_light else dark
        out.append(f'<path d="{path(quad)}" fill="{fill}" stroke="{fill}" stroke-width="0.6"/>')
    lines = []
    if texture == "courses":
        for _, a, b, _l in faces:
            z = z0 + 1.5
            while z < z1 - 0.4:
                (x0, y0), (x1, y1) = iso(a[0], a[1], z), iso(b[0], b[1], z)
                lines.append(f"M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}")
                z += 1.5
    elif texture == "ribs":
        for _, a, b, _l in faces:
            seg = math.hypot(b[0] - a[0], b[1] - a[1])
            steps = max(1, int(seg / 1.6))
            for k in range(steps):
                t = (k + 0.5) / steps
                px, py = a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t
                (x0, y0), (x1, y1) = iso(px, py, z1 - 0.35), iso(px, py, z0 + 0.2)
                lines.append(f"M{x0:.2f} {y0:.2f}L{x1:.2f} {y1:.2f}")
    if lines:
        line = shade(wall, 0.8) if wall else T["wall_line"]
        out.append(f'<path d="{" ".join(lines)}" stroke="{line}" stroke-width="0.7" fill="none"/>')
    if top:
        tp = [iso(x, y, z1) for x, y in pts]
        out.append(f'<path d="{path(tp)}" fill="{color}"/>')
        if rim:
            out.append(f'<path d="{path(tp)}" fill="none" stroke="#ffffff" stroke-opacity="{T["rim"]}" stroke-width="1.2"/>')
    return "\n".join(out)


def box(x0, y0, x1, y1, z0, h, color, **kw):
    return block(rect(x0, y0, x1, y1), h, color, z0, **kw)


def on_face(face, u, z):
    """A point on a vertical face: ("x", k) is the plane x = k (u along y), ("y", k) the plane y = k (u along x)."""
    axis, k = face
    return (k, u, z) if axis == "x" else (u, k, z)


def face_rect(face, u0, u1, z0, z1, fill, stroke=None, width=0.6):
    return poly([on_face(face, u0, z0), on_face(face, u1, z0), on_face(face, u1, z1), on_face(face, u0, z1)], fill, stroke, width)


def face_circle(face, cu, cz, r, fill, stroke=None, width=0.6, n=40):
    pts = [on_face(face, cu + r * math.cos(2 * math.pi * i / n), cz + r * math.sin(2 * math.pi * i / n)) for i in range(n)]
    return poly(pts, fill, stroke, width)


def face_gear(face, cu, cz, r_out, r_in, teeth, fill, hole):
    pts = []
    pitch = 2 * math.pi / teeth
    for k in range(teeth):
        for off, rr in ((-0.27, r_in), (-0.13, r_out), (0.13, r_out), (0.27, r_in)):
            a = k * pitch + off * pitch
            pts.append(on_face(face, cu + rr * math.cos(a), cz + rr * math.sin(a)))
    return poly(pts, fill, shade(fill, 0.85), 0.6) + "\n" + face_circle(face, cu, cz, r_in * 0.36, hole)


def cone(cx, cy, r, z0, z1, color, n=48):
    """A cone as thin triangles: only the faces turned to the viewer, light on +X and shaded on +Y."""
    apex = (cx, cy, z1)
    faces = []
    for i in range(n):
        a0, a1 = 2 * math.pi * i / n, 2 * math.pi * (i + 1) / n
        p0 = (cx + r * math.cos(a0), cy + r * math.sin(a0), z0)
        p1 = (cx + r * math.cos(a1), cy + r * math.sin(a1), z0)
        nrm = cross(sub(p1, p0), sub(apex, p0))  # outward for increasing angles
        if nrm[0] * VIEW[0] + nrm[1] * VIEW[1] + nrm[2] * VIEW[2] <= 0:
            continue
        fill = color if lit(nrm) else shade(color, 0.84)
        faces.append(((p0[0] + p1[0]) / 2 + (p0[1] + p1[1]) / 2, poly([p0, p1, apex], fill, fill, 0.5)))
    faces.sort(key=lambda f: f[0])
    return "\n".join(s for _, s in faces)


def fin(cx, cy, r, angle, zb, color, length=2.4):
    """A swept fin in the vertical plane through the rocket axis, standing on the pad."""
    a = math.radians(angle)
    ux, uy = math.cos(a), math.sin(a)
    ri, ro = r - 0.1, r + length
    pts = [(cx + ri * ux, cy + ri * uy, zb + 7.2), (cx + ro * ux, cy + ro * uy, zb + 2.8),
           (cx + ro * ux, cy + ro * uy, zb), (cx + ri * ux, cy + ri * uy, zb + 1.0)]
    nrm = (-uy, ux, 0.0)
    if nrm[0] + nrm[1] < 0:
        nrm = (uy, -ux, 0.0)
    fill = color if lit(nrm) else shade(color, 0.84)
    return poly(pts, fill, shade(color, 0.72), 0.7)


CLOUD = [(-1.0, 0.25, 0.72), (0.0, -0.32, 1.0), (1.02, 0.18, 0.7), (0.5, 0.48, 0.62), (-0.42, 0.52, 0.6)]


def cloud(x, y, z, scale):
    """A small cloud: overlapping puffs outlined as one shape (outline circles first, fills on top)."""
    sx, sy = iso(x, y, z)
    k = scale * UNIT
    rings = "".join(f'<circle cx="{sx + dx * k:.2f}" cy="{sy + dy * k:.2f}" r="{r * k + 0.9:.2f}" fill="{T["smoke_line"]}"/>' for dx, dy, r in CLOUD)
    fills = "".join(f'<circle cx="{sx + dx * k:.2f}" cy="{sy + dy * k:.2f}" r="{r * k:.2f}" fill="{T["smoke"]}"/>' for dx, dy, r in CLOUD)
    return rings + fills


def floor_poly(pts, fill):
    return f'<path d="{path([iso(x, y) for x, y in pts])}" fill="{fill}"/>'


# --------------------------------------------------------------------------- the pieces (plan units)
def blueprint():
    """Scope: a blueprint of the workshop on the floor, and a pencil."""
    x0, y0, x1, y1 = 0.0, 30.0, 13.0, 42.0
    z = 0.35
    out = [box(x0, y0, x1, y1, 0.0, z, COLORS["sky"], texture=None)]
    grid = []
    g = x0 + 1.3
    while g < x1 - 0.2:
        (a, b), (c, d) = iso(g, y0, z), iso(g, y1, z)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
        g += 1.3
    g = y0 + 1.2
    while g < y1 - 0.2:
        (a, b), (c, d) = iso(x0, g, z), iso(x1, g, z)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
        g += 1.2
    out.append(f'<path d="{" ".join(grid)}" stroke="#ffffff" stroke-opacity="0.45" stroke-width="0.6" fill="none"/>')
    # the drawing: the workshop seen from above (walls, the roof teeth, the chimney)
    sketch = [path([iso(2.4, 32.2, z), iso(8.6, 32.2, z), iso(8.6, 38.2, z), iso(2.4, 38.2, z)])]
    for yy in (34.2, 36.2):
        (a, b), (c, d) = iso(2.4, yy, z), iso(8.6, yy, z)
        sketch.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    cx, cy = iso(2.9, 31.0, z)
    out.append(f'<path d="{" ".join(sketch)}" stroke="#ffffff" stroke-width="1.1" fill="none" stroke-linejoin="round"/>')
    out.append(f'<ellipse cx="{cx:.2f}" cy="{cy:.2f}" rx="{0.6 * UNIT * 1.22:.2f}" ry="{0.6 * UNIT * 0.71:.2f}" stroke="#ffffff" stroke-width="1.1" fill="none"/>')
    # the pencil, lying across the sheet (eraser, ferrule, body, wood, lead)
    px, py = 3.4, 40.6
    dx, dy = 0.8, -0.6
    ex, ey = 0.6 * 0.55, 0.8 * 0.55  # half width, perpendicular

    def seg(t0, t1, w0=1.0, w1=1.0):
        a = (px + dx * t0, py + dy * t0)
        b = (px + dx * t1, py + dy * t1)
        return [(a[0] - ex * w0, a[1] - ey * w0), (b[0] - ex * w1, b[1] - ey * w1), (b[0] + ex * w1, b[1] + ey * w1), (a[0] + ex * w0, a[1] + ey * w0)]

    zp, hp = z, 0.9
    out.append(block(seg(0.0, 0.9), hp, COLORS["pink"], zp, texture=None))
    out.append(block(seg(0.9, 1.4), hp, T["metal"], zp, texture=None))
    out.append(block(seg(1.4, 7.4), hp, COLORS["yellow"], zp, texture=None))
    out.append(block(seg(7.4, 8.4, 1.0, 0.32), hp * 0.8, T["wood"], zp, texture=None, rim=False))
    out.append(block(seg(8.4, 8.9, 0.32, 0.02), hp * 0.6, T["lead"], zp, texture=None, rim=False))
    return "\n".join(out)


def workshop():
    """Build: a sawtooth workshop with a roller door, windows, gears and the conveyor opening."""
    x0, y0, x1, y1, h = 16.0, 14.0, 34.0, 32.0, 9.0
    out = [box(x0, y0, x1, y1, 0.0, h, COLORS["blue"], texture="courses", top=False)]
    front = ("y", y1)
    # roller door (the path from the blueprint arrives here) and two windows
    out.append(face_rect(front, 18.5, 22.5, 0.0, 5.2, COLORS["sky"]))
    slats = []
    for zz in (1.0, 2.0, 3.0, 4.0):
        (a, b), (c, d) = iso(18.5, y1, zz), iso(22.5, y1, zz)
        slats.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    out.append(f'<path d="{" ".join(slats)}" stroke="#ffffff" stroke-opacity="0.8" stroke-width="0.7" fill="none"/>')
    for u0, u1 in ((24.6, 27.6), (29.2, 32.2)):
        out.append(face_rect(front, u0, u1, 3.2, 6.4, T["window"]))
        (a, b), (c, d) = iso((u0 + u1) / 2, y1, 3.2), iso((u0 + u1) / 2, y1, 6.4)
        (e, f), (g, k) = iso(u0, y1, 4.8), iso(u1, y1, 4.8)
        out.append(f'<path d="M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}M{e:.2f} {f:.2f}L{g:.2f} {k:.2f}" stroke="{T["mullion"]}" stroke-width="0.8" fill="none"/>')
    side = ("x", x1)
    # the conveyor comes out of this opening; two gears say what happens inside
    out.append(face_rect(side, 21.0, 25.0, 2.4, 6.9, T["opening"]))
    out.append(face_gear(side, 17.6, 5.0, 2.25, 1.75, 9, COLORS["yellow"], T["wall_light"]))
    out.append(face_gear(side, 19.9, 7.35, 1.35, 1.02, 7, COLORS["red"], T["wall_light"]))
    # sawtooth roof: teeth along x, each rising towards +y and glazed on its vertical face
    teeth, hr = 3, 3.6
    w = (y1 - y0) / teeth
    for k in range(teeth):
        ya, yb = y0 + k * w, y0 + (k + 1) * w
        slope = [(x0, ya, h), (x1, ya, h), (x1, yb, h + hr), (x0, yb, h + hr)]
        out.append(poly(slope, COLORS["blue"]))
        out.append(f'<path d="{path([iso(*p) for p in slope])}" fill="none" stroke="#ffffff" stroke-opacity="{T["rim"]}" stroke-width="1.2"/>')
        out.append(poly([(x0, yb, h), (x1, yb, h), (x1, yb, h + hr), (x0, yb, h + hr)], T["window"]))
        ml = []
        u = x0 + 2.25
        while u < x1 - 0.5:
            (a, b), (c, d) = iso(u, yb, h), iso(u, yb, h + hr)
            ml.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
            u += 2.25
        out.append(f'<path d="{" ".join(ml)}" stroke="{T["mullion"]}" stroke-width="0.8" fill="none"/>')
        out.append(poly([(x1, ya, h), (x1, yb, h + hr), (x1, yb, h)], T["wall_light"]))
    return "\n".join(out)


CHIMNEY = (13.6, 17.2)  # beside the workshop's back left corner, so its smoke stays clear of the hero card


def chimney():
    (cx, cy), r = CHIMNEY, 1.5
    return block(circle(cx, cy, r, 40), 15.0, COLORS["red"], texture="ribs", top=False) + "\n" + block(
        circle(cx, cy, r, 40), 2.0, COLORS["red"], 15.0, texture=None, wall=COLORS["red"])


def crate(x, y, s, z, h=None):
    """A crate: yellow lid, a tape strip across it and down the +X side."""
    h = h or s * 0.82
    tape = shade(COLORS["yellow"], 0.82)
    ym = y + s / 2
    out = [block(rect(x, y, x + s, y + s), h, COLORS["yellow"], z, texture=None)]
    out.append(poly([(x, ym - 0.28, z + h), (x + s, ym - 0.28, z + h), (x + s, ym + 0.28, z + h), (x, ym + 0.28, z + h)], tape, tape, 0.2))
    out.append(poly([(x + s, ym - 0.28, z + h), (x + s, ym + 0.28, z + h), (x + s, ym + 0.28, z + h * 0.45), (x + s, ym - 0.28, z + h * 0.45)], tape, tape, 0.2))
    return "\n".join(out)


def conveyor():
    """From the workshop to the dock: a belt on legs, rollers, two crates on their way."""
    x0, x1, y0, y1, zt = 34.0, 46.0, 21.0, 25.0, 4.5
    legs = [(lx, ly) for lx in (36.2, 40.0, 43.8) for ly in (y0 + 0.3, y1 - 1.0)]
    legs.sort(key=lambda p: p[0] + p[1])
    out = [box(lx, ly, lx + 0.7, ly + 0.7, 0.0, zt - 1.0, T["wall_edge"], texture=None, rim=False) for lx, ly in legs]
    out.append(box(x0, y0, x1, y1, zt - 1.0, 1.0, T["belt"], texture=None, rim=False))
    rollers = []
    u = x0 + 0.6
    while u < x1 - 0.3:
        (a, b), (c, d) = iso(u, y0, zt), iso(u, y1, zt)
        rollers.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
        u += 0.9
    out.append(f'<path d="{" ".join(rollers)}" stroke="{T["belt_line"]}" stroke-width="0.6" fill="none"/>')
    out.append(crate(35.4, 21.6, 2.8, zt))
    out.append(crate(40.6, 21.6, 2.8, zt))
    return "\n".join(out)


def dock():
    """Ship: a loading dock (same height as the belt) with stacked crates."""
    out = [box(46.0, 16.0, 60.0, 30.0, 0.0, 4.5, COLORS["green"], texture="courses")]
    stack = [(47.2, 17.2, 3.0, 4.5), (50.6, 17.2, 3.0, 4.5), (54.2, 17.4, 2.6, 4.5), (47.2, 20.6, 3.0, 4.5), (47.4, 17.4, 2.7, 4.5 + 3.0 * 0.82)]
    stack.sort(key=lambda c: (c[0] + c[1] + c[2], c[3]))
    for x, y, s, z in stack:
        out.append(crate(x, y, s, z))
    return "\n".join(out)


def van():
    """The delivery van, on the road in front of the dock, heading to the launch pad."""
    y0, y1, zb = 32.0, 36.6, 1.1
    out = [box(48.0, y0, 56.0, y1, zb, 5.6, COLORS["lime"], texture=None)]
    out.append(box(56.0, y0, 59.5, y1, zb, 4.0, COLORS["lime"], texture=None))
    side, nose = ("y", y1), ("x", 59.5)
    out.append(face_rect(side, 48.5, 55.5, zb + 1.9, zb + 2.7, COLORS["blue"]))
    out.append(face_rect(side, 56.4, 58.9, zb + 1.9, zb + 3.6, T["glass"]))
    out.append(face_rect(nose, y0 + 0.5, y1 - 0.5, zb + 1.9, zb + 3.6, T["glass"]))
    out.append(face_circle(nose, y1 - 0.9, zb + 0.9, 0.35, COLORS["yellow"]))
    for wx in (50.6, 57.4):
        out.append(face_circle(side, wx, 1.15, 1.15, T["tyre"]))
        out.append(face_circle(side, wx, 1.15, 0.45, T["hub"]))
    return "\n".join(out)


def launch_pad():
    """Launch: a round pad and the rocket, fins as legs, a porthole, a blue band, a red nose."""
    cx, cy, r = 76.0, 30.0, 2.9
    zb = 1.8
    out = [block(circle(cx, cy, 6.5), zb, COLORS["yellow"], texture="ribs")]
    ring = [iso(cx + 5.2 * math.cos(2 * math.pi * i / 72), cy + 5.2 * math.sin(2 * math.pi * i / 72), zb) for i in range(72)]
    out.append(f'<path d="{path(ring)}" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-opacity="0.9"/>')
    out.append(fin(cx, cy, r, 240, zb, COLORS["red"]))
    body0, body1 = zb + 1.0, zb + 14.5
    out.append(block(circle(cx, cy, r, 48), body1 - body0, COLORS["red"], body0, texture="ribs", top=False))
    out.append(block(circle(cx, cy, r + 0.02, 48), 1.2, COLORS["blue"], zb + 11.2, texture=None, wall=COLORS["blue"], top=False))
    # porthole on the side facing the viewer
    a = math.radians(45)
    px, py = cx + r * math.cos(a), cy + r * math.sin(a)
    ux, uy = -math.sin(a), math.cos(a)
    for rad, fill in ((1.3, COLORS["blue"]), (0.9, T["glass"])):
        pts = [(px + rad * math.cos(t) * ux, py + rad * math.cos(t) * uy, zb + 8.2 + rad * math.sin(t)) for t in (2 * math.pi * i / 40 for i in range(40))]
        out.append(poly(pts, fill))
    out.append(cone(cx, cy, r, body1, body1 + 6.5, COLORS["red"]))
    out.append(fin(cx, cy, r, 120, zb, COLORS["red"]))
    out.append(fin(cx, cy, r, 0, zb, COLORS["red"]))
    # a little vapour at its feet
    out.append(cloud(80.2, 31.4, zb + 0.6, 0.95))
    out.append(cloud(73.6, 34.4, zb + 0.6, 0.9))
    out.append(cloud(77.4, 34.0, zb + 0.8, 1.25))
    return "\n".join(out)


def tree(x, y, s, color):
    trunk = block(circle(x, y, 0.3 * s, 16), 1.6 * s, T["wall_edge"], texture=None, top=False)
    sx, sy = iso(x, y, 1.6 * s + 1.9 * s)
    rr = 2.0 * s * UNIT
    crown = (f'<circle cx="{sx:.2f}" cy="{sy:.2f}" r="{rr:.2f}" fill="{shade(COLORS[color], 0.86)}"/>'
             f'<circle cx="{sx - 0.2 * rr:.2f}" cy="{sy - 0.2 * rr:.2f}" r="{0.78 * rr:.2f}" fill="{COLORS[color]}"/>')
    return trunk + "\n" + crown


TREES = [(1.5, 24.5, 1.1, "green"), (-2.0, 33.0, 0.8, "lime"), (29.0, 38.5, 1.0, "green"), (33.0, 42.0, 0.75, "lime"),
         (63.0, 42.5, 1.0, "green")]
# Tag anchors: (id, x, y, z) at the top of each stage.
TAGS = [("scope", 6.5, 36.0, 0.35), ("build", 20.5, 26.0, 12.6), ("ship", 48.75, 18.75, 9.9), ("launch", 76.0, 30.0, 22.8)]


def scene():
    items = [
        (sum(CHIMNEY), chimney()),
        (42.5, blueprint()),
        (48.0, workshop()),
        (63.0, conveyor()),
        (76.0, dock()),
        (88.3, van()),
        (106.0, launch_pad()),
    ]
    items += [(x + y, tree(x, y, s, c)) for x, y, s, c in TREES]
    items.sort(key=lambda t: t[0])
    return [s for _, s in items]


def floor_marks():
    """Drawn on the floor under everything: the road to the pad, the path to the workshop, shadows."""
    out = [floor_poly(rect(36.0, 31.4, 71.0, 37.2), T["road"])]
    (a, b), (c, d) = iso(37.0, 34.3), iso(69.5, 34.3)
    out.append(f'<path d="M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}" stroke="{T["road_line"]}" stroke-width="1.4" stroke-dasharray="7 7" fill="none"/>')
    dots = path([iso(13.4, 36.0), iso(20.5, 36.0), iso(20.5, 32.3)], close=False)
    out.append(f'<path d="{dots}" stroke="{T["wall_edge"]}" stroke-width="1.6" stroke-linecap="round" stroke-dasharray="0.1 5" fill="none"/>')
    out.append(floor_poly(rect(48.0, 32.0, 59.5, 36.6), T["shadow"]))
    for x, y, s, _c in TREES:
        out.append(floor_poly(circle(x + 0.6 * s, y + 0.6 * s, 1.5 * s, 32), T["shadow"]))
    return out


def smoke():
    """Two clouds leaving the chimney, drifting to the left."""
    cx, cy = CHIMNEY
    return [cloud(cx - 0.3, cy + 0.9, 19.2, 1.05), cloud(cx - 1.6, cy + 3.4, 22.2, 1.5)]


def extents(svg_parts):
    """Screen bounds of everything drawn (paths and circles)."""
    xs, ys = [], []
    for s in svg_parts:
        for d in re.findall(r' d="([^"]+)"', s):
            nums = [float(v) for v in re.findall(r"-?\d+(?:\.\d+)?", d)]
            xs += nums[0::2]
            ys += nums[1::2]
        for cx, cy, r in re.findall(r'<circle cx="([-\d.]+)" cy="([-\d.]+)" r="([-\d.]+)"', s):
            cx, cy, r = float(cx), float(cy), float(r)
            xs += [cx - r, cx + r]
            ys += [cy - r, cy + r]
    return min(xs), min(ys), max(xs), max(ys)


def build(name):
    global T
    T = THEMES[name]
    out_path = OUT_DIR / name
    objects = scene()
    marks = floor_marks()
    sky = smoke()
    x0, y0, x1, y1 = extents(objects + sky)
    pad, top_room = 18, 22  # a little room above the smoke
    vx0, vy0 = x0 - pad, y0 - top_room
    vw, vh = x1 - x0 + 2 * pad, y1 - y0 + pad + top_room
    if vw < ASPECT * vh:  # widen to the target aspect ratio, centred
        extra = ASPECT * vh - vw
        vx0 -= extra / 2
        vw += extra
    else:
        extra = vw / ASPECT - vh
        vy0 -= extra / 2
        vh += extra

    # a large grid floor, faded towards every edge of the view
    fx0, fy0, fx1, fy1 = -40, -40, 120, 100
    grid = []
    for gx in range(fx0, fx1 + 1, 6):
        (a, b), (c, d) = iso(gx, fy0), iso(gx, fy1)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    for gy in range(fy0, fy1 + 1, 6):
        (a, b), (c, d) = iso(fx0, gy), iso(fx1, gy)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    mx, my = (x0 + x1) / 2, (y0 + y1) / 2 + 20
    ry = vh / vw

    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx0:.1f} {vy0:.1f} {vw:.1f} {vh:.1f}" role="img" aria-label="The product pipeline as a small isometric scene: a blueprint with a pencil, a workshop with gears and a smoking chimney, a conveyor carrying crates to a loading dock and a delivery van, and a rocket on its launch pad">
<defs>
  <radialGradient id="fade" cx="{mx:.1f}" cy="{my:.1f}" r="{vw * 0.5:.1f}" gradientUnits="userSpaceOnUse" gradientTransform="translate({mx:.1f} {my:.1f}) scale(1 {ry:.3f}) translate({-mx:.1f} {-my:.1f})">
    <stop offset="0.55" stop-color="#fff" stop-opacity="1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="floor-mask"><rect x="{vx0:.1f}" y="{vy0:.1f}" width="{vw:.1f}" height="{vh:.1f}" fill="url(#fade)"/></mask>
</defs>
<g mask="url(#floor-mask)">
  <path d="{path([iso(fx0, fy0), iso(fx1, fy0), iso(fx1, fy1), iso(fx0, fy1)])}" fill="{T["floor"]}"/>
  <path d="{" ".join(grid)}" stroke="{T["grid"]}" stroke-width="0.8" fill="none"/>
</g>
{chr(10).join(marks)}
{chr(10).join(objects)}
{chr(10).join(sky)}
</svg>
'''
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out_path.write_text(svg, encoding="utf-8")
    print(f"OK {out_path.name} ({len(svg)} bytes), view {vw:.1f}x{vh:.1f}")
    if name != "hero-iso.svg":
        return
    print("// tag anchors (% of the view), copy into hero-iso.tsx")
    for tid, x, y, z in TAGS:
        sx, sy = iso(x, y, z)
        print(f'  {tid}: {{ left: {100 * (sx - vx0) / vw:.1f}, top: {100 * (sy - vy0) / vh:.1f} }},')
    print(f"// aspect ratio: {vw:.1f} / {vh:.1f}")


if __name__ == "__main__":
    for theme in THEMES:
        build(theme)
