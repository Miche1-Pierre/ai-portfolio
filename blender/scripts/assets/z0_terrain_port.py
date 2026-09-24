"""Z0 · Terrain · le port à sec (STORYTELLING §3.2 et §4).

Étapes : `blockout` (masses, validées le 2026-09-06) puis `details` : falaise en strates de dalles
arrondies avec éboulis au pied, sable craquelé (plaques soulevées) et mares résiduelles, mur de quai
avec assises et joints, anneaux d'amarrage et échelle, marques de marée sur le mur et la falaise.
Le relief (dunes, cotes du quai, ligne d'eau) vit dans lib/terrain.py.

    run("assets/z0_terrain_port.py")["create"](stage="details")
"""
import math
import random

import bmesh
import bpy

from lib import build, materials, mesh, naming
from lib.rocks import cliff_layers, extrude_polygon, polygon, rock_mass, scree
from lib.shapes import add_box, add_cyl, bisect_z, box, cylinder, ring
from lib.terrain import QUAY_BACK_Y, QUAY_DEPTH, QUAY_EDGE_Y, QUAY_X, TIDE_CUTS, TIDE_STOPS, dune

ZONE, CATEGORY, BASE = "Z0_PORT", "Terrain", "Port"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)  # Z0_Terrain_Port
LEVELS = {"blockout": 0, "details": 1, "polish": 2}

# Masses de la falaise : (base x, y, z enterré), (demi-largeur X, demi-largeur Y, hauteur totale)
# Réduites le 2026-09-07 : le versant dessiné derrière le port (lib/route.landform) est doux, les
# falaises ne sont plus un mur mais des affleurements en strates au pied de la pente.
CLIFFS = (
    ((-12.0, 16.0, -3.0), (10.0, 6.5, 14.0)),
    ((4.0, 19.0, -4.0), (8.0, 6.0, 19.0)),
    ((20.0, 15.0, -3.0), (11.0, 6.5, 12.0)),
    ((36.0, 18.0, -4.0), (9.0, 6.5, 16.0)),
    ((52.0, 14.0, -3.0), (10.0, 6.0, 11.0)),
    ((28.0, 30.0, -2.0), (18.0, 9.0, 22.0)),
    ((-4.0, 32.0, -2.0), (16.0, 8.0, 20.0)),
)


# ----------------------------------------------------------------------------- générateurs
def _seabed(x0=-40.0, x1=186.0, y0=-60.0, y1=QUAY_EDGE_Y, cell=2.0):
    """Grille de sable ondulée."""
    bm = bmesh.new()
    xs = [x0 + i * cell for i in range(int((x1 - x0) / cell))] + [x1]
    ys = [y0 + j * cell for j in range(int((y1 - y0) / cell))] + [y1]
    grid = [[bm.verts.new((x, y, dune(x, y))) for y in ys] for x in xs]
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


# Roche : générateurs partagés (lib/rocks.py)
_polygon, _extrude_polygon, _rock_mass, _cliff_layers, _scree = polygon, extrude_polygon, rock_mass, cliff_layers, scree


def _sand_plates(rnd, count):
    """Sable craquelé : plaques polygonales à peine soulevées, qui suivent les dunes."""
    bm = bmesh.new()
    for _ in range(count):
        x, y = rnd.uniform(-30, 60), rnd.uniform(-24, -8.6)
        r = rnd.uniform(0.9, 2.3)
        pts = _polygon(rnd, x, y, r, r * rnd.uniform(0.7, 1.0), n=rnd.randint(5, 8), wobble=0.3)
        face = bm.faces.new([bm.verts.new((px, py, dune(px, py) - 0.02)) for px, py in pts])
        res = bmesh.ops.extrude_face_region(bm, geom=[face])
        moved = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
        bmesh.ops.translate(bm, vec=(0, 0, 0.07), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def _pool_spots(rnd, count, tries=80):
    """Les mares vont dans les creux : on garde les points les plus bas parmi des tirages."""
    spots = []
    for _ in range(tries):
        x, y = rnd.uniform(-30, 60), rnd.uniform(-38, -12)
        spots.append((dune(x, y), x, y))
    spots.sort()
    chosen = []
    for z, x, y in spots:
        if all(math.hypot(x - cx, y - cy) > 9.0 for cx, cy, _ in chosen):
            chosen.append((x, y, rnd.uniform(1.6, 3.2)))
        if len(chosen) == count:
            break
    return chosen


def _quay_courses():
    """Assises horizontales et joints verticaux décalés sur la face du mur de quai."""
    bm = bmesh.new()
    x0, x1 = QUAY_X
    yf = QUAY_EDGE_Y - 0.012
    n_rows = 9  # jusqu'au sable (z ≈ -2,6), plus bas c'est enfoui
    for k in range(1, n_rows):
        add_box(bm, (x1 - x0, 0.024, 0.035), ((x0 + x1) / 2, yf, -0.35 * k))
    for j in range(n_rows):
        z = -0.175 - 0.35 * j
        for i, x in enumerate(range(int(x0) + 1, int(x1), 3)):
            add_box(bm, (0.024, 0.024, 0.30), (x + (1.5 if (i + j) % 2 else 0.0), yf, z))
    return bm


def _wall_ladder(x):
    bm = bmesh.new()
    yf = QUAY_EDGE_Y - 0.10
    for dx in (-0.25, 0.25):
        add_box(bm, (0.05, 0.05, 3.0), (x + dx, yf, -1.25))
    for i in range(8):
        add_box(bm, (0.55, 0.05, 0.04), (x, yf, 0.1 - i * 0.34))
    for z in (0.15, -2.5):
        add_box(bm, (0.6, 0.12, 0.05), (x, QUAY_EDGE_Y - 0.05, z))
    return bm


# ----------------------------------------------------------------------------- matériaux
def _materials(level):
    pm, vt = materials.palette_material, materials.vertex_tinted_material
    M = {
        "sand": pm("materials.sand", roughness=1.0),
        "quay": pm("materials.stone_quay", roughness=0.95),
        "iron": pm("materials.iron_dark", roughness=0.8, metallic=0.3),
        "rock": pm("materials.rock_warm", roughness=0.95),
        "rock_dark": pm("materials.rock_dark", roughness=0.95),
        "joint": pm("materials.charcoal", roughness=1.0),
        "pool": pm("materials.glass", roughness=0.05),
        "dust": {},
    }
    M["seabed"] = M["sand"]
    if level >= 1:
        seabed, top, bottom = vt("MAT_seabed", "materials.sand", "materials.rock_dark", mix=0.14, roughness=1.0)
        M["seabed"] = seabed
        M["dust"][seabed.name] = (top, bottom, [(-99.0, 0.0), (99.0, 0.0)])
        quay, top, bottom = vt("MAT_quay_wet", "materials.stone_quay", "materials.rock_dark", mix=0.4, roughness=0.95)
        M["quay"] = quay
        M["dust"][quay.name] = (top, bottom, [(-1.5, 0.0), (-0.3, 0.15), (0.0, 0.8), (0.2, 1.0)])
        rock, top, bottom = vt("MAT_rock_tide", "materials.rock_warm", "materials.rock_dark", mix=0.5, roughness=0.95)
        M["rock"] = rock
        M["dust"][rock.name] = (top, bottom, TIDE_STOPS)
        rock_dark, top, bottom = vt("MAT_rockdark_tide", "materials.rock_dark", "materials.charcoal", mix=0.45, roughness=0.95)
        M["rock_dark"] = rock_dark
        M["dust"][rock_dark.name] = (top, bottom, TIDE_STOPS)
    return M


# ----------------------------------------------------------------------------- assemblage
def _details(part, M, rnd):
    quay_top = lambda x, y: 0.0 if y < QUAY_BACK_Y else 4.0  # sur le quai ; au-delà c'est la falaise, on n'y pose rien
    part("Scree", _scree(rnd, (-18.0, 48.0), 6.4, 26, ground=quay_top, max_slope=0.5), mat=M["rock"], bevel=0.0, smooth_angle=55, role="hero")
    part("Scree_Dark", _scree(rnd, (-18.0, 48.0), 7.0, 12, ground=quay_top, max_slope=0.5), mat=M["rock_dark"], bevel=0.0, smooth_angle=55, role="hero")
    part("SandPlates", _sand_plates(rnd, 46), mat=M["sand"], bevel=0.05, segments=1, role="hero")
    for i, (x, y, r) in enumerate(_pool_spots(rnd, 5)):
        part(f"Pool_{i + 1}", cylinder(r, 0.04, axis="Z", segments=18), (x, y, dune(x, y) + 0.035), mat=M["pool"], bevel=0.0, role="filler")
    part("QuayCourses", _quay_courses(), mat=M["joint"], bevel=0.0, role="hero")
    for i, x in enumerate((0.0, 18.0, 36.0)):
        part(f"MooringRing_{i + 1}", ring(0.22, 0.14, 0.05, axis="Y", segments=14), (x, QUAY_EDGE_Y - 0.06, -0.45), mat=M["iron"], bevel=0.006, segments=1, role="filler")
        part(f"MooringPlate_{i + 1}", box((0.30, 0.04, 0.30)), (x, QUAY_EDGE_Y - 0.02, -0.25), mat=M["iron"], bevel=0.005, segments=1, role="filler")
    part("WallLadder", _wall_ladder(12.0), mat=M["iron"], bevel=0.004, segments=1, role="medium")


def create(stage: str = "details", zone: str = ZONE, seed: int = 7, seabed: bool = True) -> bpy.types.Object:
    level = LEVELS[stage]
    rnd = random.Random(seed)
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = build.root_empty(ROOT, coll, size=2.0)
    M = _materials(level)
    P = f"{ROOT}_"

    def part(name, bm, pivot=(0, 0, 0), mat=None, **kw):
        kw.setdefault("role", "hero")
        return build.part(P + name, bm, pivot, root, coll, mat or M["quay"], **kw)

    quay_cuts = (-0.3,) if level >= 1 else ()
    if seabed:  # sinon le terrain unifié (assets/zx_terrain_mountain.py) porte le fond de la mer
        part("Seabed", _seabed(), mat=M["seabed"], bevel=0.0)
    cx = (QUAY_X[0] + QUAY_X[1]) / 2
    part("Quay", bisect_z(box((QUAY_X[1] - QUAY_X[0], QUAY_BACK_Y - QUAY_EDGE_Y, QUAY_DEPTH), (cx, (QUAY_EDGE_Y + QUAY_BACK_Y) / 2, -QUAY_DEPTH / 2)), quay_cuts), bevel=0.05, segments=1)
    part("Kerb", box((QUAY_X[1] - QUAY_X[0], 0.5, 0.16), (cx, QUAY_EDGE_Y + 0.25, 0.08)), bevel=0.03, segments=1)

    bm = bmesh.new()
    for x in (-9, -3, 3, 9, 15, 21, 27, 33):
        add_cyl(bm, 0.18, 0.70, axis="Z", center=(x, QUAY_EDGE_Y + 0.7, 0.35), segments=12)
        cap = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.24)["verts"]
        bmesh.ops.translate(bm, vec=(x, QUAY_EDGE_Y + 0.7, 0.72), verts=cap)
    part("Bollards", bm, mat=M["iron"], bevel=0.01, segments=1)

    bm = bmesh.new()
    for i in range(10):  # du quai (0) au sable (≈ -2,6), marches de 0,28 m
        add_box(bm, (2.0, 0.40, 0.28), (31.0, QUAY_EDGE_Y - 0.20 - i * 0.40, -0.14 - i * 0.28))
    part("Stairs", bisect_z(bm, quay_cuts), bevel=0.02, segments=1)

    for i, (pos, scale) in enumerate(CLIFFS):
        mat = M["rock"] if i % 2 == 0 else M["rock_dark"]
        if level >= 1:
            part(f"Cliff_{i + 1}", bisect_z(_cliff_layers(rnd, pos, scale), TIDE_CUTS), mat=mat, bevel=0.35, segments=2)
        else:
            part(f"Cliff_{i + 1}", _rock_mass(rnd, scale), pos, mat=mat, bevel=0.0)

    if level >= 1:
        _details(part, M, rnd)

    parts = [o for o in root.children_recursive if o.type == "MESH"]
    if M["dust"]:
        for obj in parts:
            for slot in obj.data.materials:
                if slot is not None and slot.name in M["dust"]:
                    top, bottom, stops = M["dust"][slot.name]
                    mesh.paint_stops(obj, top, stops, bottom)
    total = build.tri_total(root)
    print(f"[port] {stage}: {len(parts)} pièces, {total} triangles")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
