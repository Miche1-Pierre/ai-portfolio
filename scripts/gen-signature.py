# -*- coding: utf-8 -*-
"""Generates the Gmail signature assets in public/signature/: the hero diorama as a small looping GIF
(the gears turn, crates ride the belt into the dock, the chimney smokes, the rocket takes off and lands back) and the square portrait (from the LinkedIn profile photo).
Same geometry as the hero (scripts/gen-hero-iso.py), light theme only: an email is read on white.

    python scripts/gen-signature.py        # writes the frames + portrait, then:
    node scripts/capture-signature.mjs     # renders the frames in headless Chrome and builds scene.gif
"""
import importlib.util
import json
import math
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
OUT_DIR = ROOT / "public" / "signature"
FRAMES = ROOT / ".signature-frames"  # scratch, removed by the capture script

spec = importlib.util.spec_from_file_location("hero", ROOT / "scripts" / "gen-hero-iso.py")
H = importlib.util.module_from_spec(spec)
spec.loader.exec_module(H)
H.T = H.THEMES["hero-iso.svg"]

N = 144  # frames: 7.2 s at 20 fps
BELT = (34.0, 46.0)  # the belt runs from the workshop opening to the dock
CRATE, SPACING = 2.8, 6.0

state = {"t": 0.0, "r": 0.0}  # t: factory cycle, r: rocket flight (the whole loop)
_face_gear = H.face_gear


def turning_gear(face, cu, cz, r_out, r_in, teeth, fill, hole):
    """The hero's gear, turned: the big one advances one tooth per loop, the small one meshes with it."""
    pitch = 2 * math.pi / teeth
    phase = state["t"] * pitch * (1 if teeth == 9 else -1)
    pts = []
    for k in range(teeth):
        for off, rr in ((-0.27, r_in), (-0.13, r_out), (0.13, r_out), (0.27, r_in)):
            a = k * pitch + off * pitch + phase
            pts.append(H.on_face(face, cu + rr * math.cos(a), cz + rr * math.sin(a)))
    return H.poly(pts, fill, H.shade(fill, 0.85), 0.6) + "\n" + H.face_circle(face, cu, cz, r_in * 0.36, hole)


H.face_gear = turning_gear


def moving_crate(x, y, s, z):
    """A crate cut to the belt: it comes out of the workshop opening and slides into the dock."""
    xa, xb = max(x, BELT[0]), min(x + s, BELT[1])
    if xb - xa < 0.05:
        return ""
    h = s * 0.82
    tape = H.shade(H.COLORS["yellow"], 0.82)
    ym = y + s / 2
    out = [H.block(H.rect(xa, y, xb, y + s), h, H.COLORS["yellow"], z, texture=None)]
    out.append(H.poly([(xa, ym - 0.28, z + h), (xb, ym - 0.28, z + h), (xb, ym + 0.28, z + h), (xa, ym + 0.28, z + h)], tape, tape, 0.2))
    if xb == x + s:  # the tape down the +X side, while that side is still on the belt
        out.append(H.poly([(xb, ym - 0.28, z + h), (xb, ym + 0.28, z + h), (xb, ym + 0.28, z + h * 0.45), (xb, ym - 0.28, z + h * 0.45)], tape, tape, 0.2))
    return "\n".join(out)


def conveyor():
    x0, x1, y0, y1, zt = BELT[0], BELT[1], 21.0, 25.0, 4.5
    legs = [(lx, ly) for lx in (36.2, 40.0, 43.8) for ly in (y0 + 0.3, y1 - 1.0)]
    legs.sort(key=lambda p: p[0] + p[1])
    out = [H.box(lx, ly, lx + 0.7, ly + 0.7, 0.0, zt - 1.0, H.T["wall_edge"], texture=None, rim=False) for lx, ly in legs]
    out.append(H.box(x0, y0, x1, y1, zt - 1.0, 1.0, H.T["belt"], texture=None, rim=False))
    rollers = []
    u = x0 + 0.6
    while u < x1 - 0.3:
        (a, b), (c, d) = H.iso(u, y0, zt), H.iso(u, y1, zt)
        rollers.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
        u += 0.9
    out.append(f'<path d="{" ".join(rollers)}" stroke="{H.T["belt_line"]}" stroke-width="0.6" fill="none"/>')
    for k in range(3):
        out.append(moving_crate(x0 - CRATE + (k + state["t"]) * SPACING, 21.6, CRATE, zt))
    return "\n".join(out)


H.conveyor = conveyor


def smoke():
    """Puffs leave the chimney, grow, drift left and fade; three of them, a third of a loop apart."""
    cx, cy = H.CHIMNEY
    out = []
    for p in sorted(((state["t"] + k / 3) % 1.0 for k in range(3)), reverse=True):
        alpha = min(1.0, p / 0.12) * min(1.0, (1.0 - p) / 0.5)
        cloud = H.cloud(cx - 0.3 - 2.0 * p, cy + 0.9 + 3.0 * p, 17.4 + 6.0 * p, 0.6 + 1.0 * p)
        out.append(f'<g opacity="{alpha:.3f}">{cloud}</g>')
    return out


PAD = (76.0, 30.0)
LIFT_TOP = 90.0  # high enough to leave the view


def rocket_flight(r):
    """Over the whole loop: on the pad, ignition, lift-off out of the view, then it lands back.
    Returns (lift in plan units, flame 0..1, exhaust clouds 0..1)."""
    if r < 0.30:
        return 0.0, 0.0, 0.0
    if r < 0.38:  # ignition, still on the pad
        k = (r - 0.30) / 0.08
        return 0.0, k, k
    if r < 0.60:  # lift-off, accelerating
        u = (r - 0.38) / 0.22
        return LIFT_TOP * u * u, 1.0, 1.0 - u
    if r < 0.70:  # out of the view
        return LIFT_TOP, 0.0, 0.0
    if r < 0.92:  # landing, slowing down
        u = (r - 0.70) / 0.22
        return LIFT_TOP * (1 - u) ** 2, 1.0, u
    k = (r - 0.92) / 0.08  # engine off, the exhaust settles
    return 0.0, max(0.0, 1.0 - 3 * k), 1.0 - k


def flame(cx, cy, z, power):
    """The exhaust: three nested flames under the nozzle, flickering with the frame."""
    if power <= 0.01:
        return ""
    sx, sy = H.iso(cx, cy, z)
    flicker = 1.0 + 0.12 * math.sin(state["r"] * 2 * math.pi * 23)
    out = []
    for w, length, color in ((2.2, 7.5, H.COLORS["red"]), (1.6, 5.4, H.COLORS["yellow"]), (0.9, 3.2, "#fff6de")):
        hw, ln = w * H.UNIT, length * H.UNIT * power * flicker
        out.append(f'<path d="M{sx - hw:.2f} {sy:.2f} Q{sx - hw * 0.7:.2f} {sy + ln * 0.55:.2f} {sx:.2f} {sy + ln:.2f} '
                   f'Q{sx + hw * 0.7:.2f} {sy + ln * 0.55:.2f} {sx + hw:.2f} {sy:.2f} Z" fill="{color}"/>')
    return "\n".join(out)


def launch_pad():
    """The hero's pad and rocket, with the rocket on its own altitude (see rocket_flight)."""
    cx, cy = PAD
    r, zb = 2.9, 1.8
    lift, power, puff = rocket_flight(state["r"])
    zr = zb + lift
    out = [H.block(H.circle(cx, cy, 6.5), zb, H.COLORS["yellow"], texture="ribs")]
    ring = [H.iso(cx + 5.2 * math.cos(2 * math.pi * i / 72), cy + 5.2 * math.sin(2 * math.pi * i / 72), zb) for i in range(72)]
    out.append(f'<path d="{H.path(ring)}" fill="none" stroke="#ffffff" stroke-width="1.1" stroke-opacity="0.9"/>')
    out.append(flame(cx, cy, zr + 1.0, power))
    out.append(H.fin(cx, cy, r, 240, zr, H.COLORS["red"]))
    body0, body1 = zr + 1.0, zr + 14.5
    out.append(H.block(H.circle(cx, cy, r, 48), body1 - body0, H.COLORS["red"], body0, texture="ribs", top=False))
    out.append(H.block(H.circle(cx, cy, r + 0.02, 48), 1.2, H.COLORS["blue"], zr + 11.2, texture=None, wall=H.COLORS["blue"], top=False))
    a = math.radians(45)
    px, py = cx + r * math.cos(a), cy + r * math.sin(a)
    ux, uy = -math.sin(a), math.cos(a)
    for rad, fill in ((1.3, H.COLORS["blue"]), (0.9, H.T["glass"])):
        pts = [(px + rad * math.cos(t) * ux, py + rad * math.cos(t) * uy, zr + 8.2 + rad * math.sin(t)) for t in (2 * math.pi * i / 40 for i in range(40))]
        out.append(H.poly(pts, fill))
    out.append(H.cone(cx, cy, r, body1, body1 + 6.5, H.COLORS["red"]))
    out.append(H.fin(cx, cy, r, 120, zr, H.COLORS["red"]))
    out.append(H.fin(cx, cy, r, 0, zr, H.COLORS["red"]))
    # the vapour at its feet, swelling into an exhaust cloud while the engine pushes on the pad
    grow = 1.0 + 0.7 * puff
    out.append(H.cloud(80.2 + 1.2 * puff, 31.4, zb + 0.6, 0.95 * grow))
    out.append(H.cloud(73.6 - 1.2 * puff, 34.4, zb + 0.6, 0.9 * grow))
    out.append(H.cloud(77.4, 34.0 + 0.8 * puff, zb + 0.8, 1.25 * grow))
    return "\n".join(out)


H.launch_pad = launch_pad


def frame(T, view):
    state["t"], state["r"] = (2 * T) % 1.0, T  # the factory runs two cycles per rocket flight
    vx0, vy0, vw, vh = view
    objects = H.scene()
    marks = H.floor_marks()
    fx0, fy0, fx1, fy1 = -40, -40, 120, 100
    grid = []
    for gx in range(fx0, fx1 + 1, 6):
        (a, b), (c, d) = H.iso(gx, fy0), H.iso(gx, fy1)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    for gy in range(fy0, fy1 + 1, 6):
        (a, b), (c, d) = H.iso(fx0, gy), H.iso(fx1, gy)
        grid.append(f"M{a:.2f} {b:.2f}L{c:.2f} {d:.2f}")
    mx, my = vx0 + vw / 2, vy0 + vh / 2 + 10
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vx0:.1f} {vy0:.1f} {vw:.1f} {vh:.1f}">
<defs>
  <radialGradient id="fade" cx="{mx:.1f}" cy="{my:.1f}" r="{vw * 0.5:.1f}" gradientUnits="userSpaceOnUse" gradientTransform="translate({mx:.1f} {my:.1f}) scale(1 {vh / vw:.3f}) translate({-mx:.1f} {-my:.1f})">
    <stop offset="0.5" stop-color="#fff" stop-opacity="1"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/>
  </radialGradient>
  <mask id="floor-mask"><rect x="{vx0:.1f}" y="{vy0:.1f}" width="{vw:.1f}" height="{vh:.1f}" fill="url(#fade)"/></mask>
</defs>
<rect x="{vx0:.1f}" y="{vy0:.1f}" width="{vw:.1f}" height="{vh:.1f}" fill="#fff"/>
<g mask="url(#floor-mask)">
  <path d="{H.path([H.iso(fx0, fy0), H.iso(fx1, fy0), H.iso(fx1, fy1), H.iso(fx0, fy1)])}" fill="{H.T["floor"]}"/>
  <path d="{" ".join(grid)}" stroke="{H.T["grid"]}" stroke-width="0.8" fill="none"/>
</g>
{chr(10).join(marks)}
{chr(10).join(objects)}
{chr(10).join(smoke())}
</svg>'''


def view_box():
    """Tight around the scene and every smoke puff of the loop, with a little room."""
    parts = []
    for i in range(0, N, 6):
        state["t"], state["r"] = i / N, 0.0  # the rocket on its pad: in flight it may leave the view
        parts += H.scene() + smoke()
    x0, y0, x1, y1 = H.extents(parts)
    pad = 14
    return x0 - pad, y0 - pad, x1 - x0 + 2 * pad, y1 - y0 + 2 * pad


def portrait():
    """The LinkedIn profile photo, cropped square on the face: 160 px for an 80 px slot (retina)."""
    src = Image.open(ROOT / "public" / "images" / "profile-linkedin.jpg").convert("RGB")
    face = src.crop((50, 10, 410, 370)).resize((160, 160), Image.LANCZOS)
    face.save(OUT_DIR / "pierre-michel.jpg", quality=90, optimize=True, progressive=True)


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    FRAMES.mkdir(exist_ok=True)
    view = view_box()
    (FRAMES / "frames.json").write_text(json.dumps({"view": view, "frames": [frame(i / N, view) for i in range(N)]}), encoding="utf-8")
    portrait()
    print(f"OK {N} frames, view {view[2]:.1f}x{view[3]:.1f} (aspect {view[2] / view[3]:.3f})")
