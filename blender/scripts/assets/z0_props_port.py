"""Z0 · Props · le remplissage du port à sec : caisses, tonneaux, cordes lovées, filets, bouées,
coquillages et coraux secs au pied des épaves, planches, une ancre (référence
`terrain/z0-jusant-fond-marin-dunes-01` : l'ancre et les débris au premier plan).

Tout est en coordonnées monde et se pose sur le relief de lib/terrain.py.

    run("assets/z0_props_port.py")["create"]()
"""
import math
import random

import bmesh
import bpy

from lib import build, materials, naming
from lib.shapes import add_box, add_cyl, box, cylinder, ring, slatted_box
from lib.terrain import QUAY_EDGE_Y, dune, ground_z

ZONE, CATEGORY, BASE = "Z0_PORT", "Props", "PortProps"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)
LEVELS = {"blockout": 0, "details": 1, "polish": 2}


def _materials():
    pm = materials.palette_material
    return {
        "wood": pm("materials.wood_dark", roughness=0.9),
        "wood_light": pm("materials.wood_light", roughness=0.9),
        "iron": pm("materials.iron_dark", roughness=0.8, metallic=0.3),
        "rope": pm("materials.rope", roughness=0.95),
        "buoy": pm("materials.terracotta", roughness=0.8),
        "buoy_band": pm("materials.hull_teal", roughness=0.75),
        "shell": pm("materials.plaster", roughness=0.9),
        "coral": pm("materials.hull_teal", roughness=0.9),
        "rust": pm("materials.rust", roughness=0.85),
    }


def _barrel(bm, x, y, z):
    add_cyl(bm, 0.32, 0.9, axis="Z", center=(x, y, z + 0.45), segments=14)
    return bm


def _buoy(part, name, x, y, z, M, rnd):
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.36)
    part(f"Buoy_{name}", bm, (x, y, z), mat=M["buoy"], bevel=0.0, smooth_angle=60)
    part(f"BuoyBand_{name}", ring(0.385, 0.30, 0.12, axis="Z", segments=18), (x, y, z), mat=M["buoy_band"], bevel=0.01, segments=1, rotation=(rnd.uniform(-0.5, 0.5), rnd.uniform(-0.5, 0.5), 0))
    part(f"BuoyEye_{name}", ring(0.09, 0.05, 0.03, axis="X", segments=8), (x, y, z + 0.4), mat=M["iron"], bevel=0.0)


def _shells(rnd, center, count, radius, z_lift=0.0):
    """Coquillages : petites demi-sphères posées dans le sable autour d'un point."""
    bm = bmesh.new()
    cx, cy = center
    for _ in range(count):
        a, d = rnd.uniform(0, 2 * math.pi), rnd.uniform(1.2, radius)
        x, y = cx + d * math.cos(a), cy + d * math.sin(a)
        r = rnd.uniform(0.10, 0.26)
        vs = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)["verts"]
        sz = rnd.uniform(0.35, 0.6)
        for v in vs:
            v.co = (v.co.x + x, v.co.y * rnd.uniform(0.7, 1.0) + y, v.co.z * sz + dune(x, y) + z_lift)
    return bm


def _anchor(part, M, x, y):
    """Ancre à jas couchée dans le sable, une patte en l'air (référence Jusant)."""
    z = dune(x, y)
    bm = bmesh.new()
    add_box(bm, (2.4, 0.16, 0.16), (0, 0, 0))                      # verge
    add_box(bm, (0.16, 1.8, 0.16), (-1.1, 0, 0))                    # bras
    add_box(bm, (0.5, 0.3, 0.12), (-1.15, 0.85, 0.0))               # pattes
    add_box(bm, (0.5, 0.3, 0.12), (-1.15, -0.85, 0.0))
    add_box(bm, (0.14, 0.14, 1.4), (0.9, 0, 0))                     # jas
    part("Anchor", bm, (x, y, z + 0.12), mat=M["iron"], bevel=0.02, segments=1, rotation=(math.radians(28), 0, math.radians(35)))
    part("AnchorRing", ring(0.26, 0.16, 0.06, axis="Z", segments=12), (x + 1.35 * math.cos(math.radians(35)), y + 1.35 * math.sin(math.radians(35)), z + 0.25), mat=M["iron"], bevel=0.0, rotation=(math.radians(90), 0, math.radians(35)))


def create(stage: str = "details", zone: str = ZONE, seed: int = 11) -> bpy.types.Object:
    rnd = random.Random(seed)
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = build.root_empty(ROOT, coll, size=1.0)
    M = _materials()
    P = f"{ROOT}_"

    def part(name, bm, pivot=(0, 0, 0), mat=None, **kw):
        kw.setdefault("role", "filler")
        return build.part(P + name, bm, pivot, root, coll, mat or M["wood"], **kw)

    # Sur le quai : caisses, tonneaux, cordes lovées, filets
    for i, (x, y, s, rot) in enumerate(((9.0, -6.5, 0.62, 12), (9.8, -6.4, 0.55, -8), (22.0, -6.8, 0.6, 30), (-6.2, -6.9, 0.58, 5))):
        part(f"Crate_{i + 1}", slatted_box((s, s, s * 0.8), (0, 0, s * 0.4)), (x, y, 0), mat=M["wood_light"], bevel=0.01, segments=1, rotation=(0, 0, math.radians(rot)))
    part("Crate_5", slatted_box((0.5, 0.5, 0.4), (0, 0, 0.2)), (9.3, -6.5, 0.5), mat=M["wood_light"], bevel=0.01, segments=1, rotation=(0, 0, math.radians(40)))
    for i, (x, y) in enumerate(((23.1, -6.1), (-5.2, -6.2), (-4.6, -6.9))):
        bm = _barrel(bmesh.new(), 0, 0, 0)
        for z in (0.18, 0.72):
            add_cyl(bm, 0.34, 0.05, axis="Z", center=(0, 0, z), segments=14)
        part(f"Barrel_{i + 1}", bm, (x, y, 0), mat=M["wood"], bevel=0.012, segments=1)
    for i, (x, y) in enumerate(((14.5, -6.8), (2.0, -7.0))):
        part(f"RopeCoil_{i + 1}", ring(0.38, 0.14, 0.12, axis="Z", segments=18), (x, y, 0.06), mat=M["rope"], bevel=0.012, segments=1)
        part(f"RopeCoil_{i + 1}b", ring(0.32, 0.15, 0.09, axis="Z", segments=18), (x + 0.05, y + 0.04, 0.18), mat=M["rope"], bevel=0.01, segments=1)
    for i, (x, y, z) in enumerate(((5.0, -6.7, 0.0), (28.5, -11.2, None))):
        bm = bmesh.new()
        bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0)
        for v in bm.verts:
            v.co = (v.co.x * 1.2, v.co.y * 0.9, v.co.z * 0.3)
        part(f"Net_{i + 1}", bm, (x, y, (z if z is not None else dune(x, y)) + 0.28), mat=M["rope"], bevel=0.0, smooth_angle=60)

    # Bouées : sur le sable près du mur, et une suspendue au mur
    for name, (x, y) in {"1": (10.0, -10.5), "2": (-4.0, -11.6), "3": (30.0, -12.4)}.items():
        _buoy(part, name, x, y, dune(x, y) + 0.3, M, rnd)
    _buoy(part, "Wall", 18.0, QUAY_EDGE_Y - 0.45, -0.55, M, rnd)
    bm = bmesh.new()
    add_cyl(bm, 0.02, 0.9, axis="Z", center=(0, 0, 0.45), segments=6)
    part("BuoyRope", bm, (18.0, QUAY_EDGE_Y - 0.4, -0.2), mat=M["rope"], bevel=0.0)

    # Au pied des épaves : coquillages, coraux secs, planches, l'ancre au premier plan
    part("Shells_Fishing", _shells(rnd, (17.0, -16.0), 14, 5.2), mat=M["shell"], bevel=0.0, smooth_angle=60)
    part("Shells_Bulb", _shells(rnd, (-1.0, -13.0), 12, 4.6), mat=M["shell"], bevel=0.0, smooth_angle=60)
    part("Coral_Fishing", _shells(rnd, (18.5, -17.5), 6, 3.6, z_lift=0.05), mat=M["coral"], bevel=0.0, smooth_angle=60)
    part("Coral_Bulb", _shells(rnd, (-2.5, -14.0), 5, 3.2, z_lift=0.05), mat=M["coral"], bevel=0.0, smooth_angle=60)
    for i, (x, y, rot) in enumerate(((13.5, -13.2, 20), (20.5, -19.0, -35), (-4.5, -15.5, 60))):
        part(f"Plank_{i + 1}", box((1.5, 0.18, 0.05)), (x, y, dune(x, y) + 0.03), mat=M["wood"], bevel=0.006, segments=1, rotation=(0, 0, math.radians(rot)))
    _anchor(part, M, 7.5, -13.5)

    parts = [o for o in root.children_recursive if o.type == "MESH"]
    total = build.tri_total(root)
    print(f"[props] {stage}: {len(parts)} pièces, {total} triangles")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
