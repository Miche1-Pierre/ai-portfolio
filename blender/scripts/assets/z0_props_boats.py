"""Z0 · Props · les bateaux échoués du port à sec (STORYTELLING §4, références
`architecture/z0-jusant-epaves-01` et `z0-jusant-sous-marin-echoue-02`).

Deux silhouettes : `fishing` (barque de pêche de 8 m, gîtée, cabine et mât) et `bulb` (vaisseau
ventru de 6 m façon Jusant, tourelle, aileron, mât penché). Étapes : `blockout` (masses, validées
le 2026-09-06) puis `details` (hublots, lisses, cordes vertes qui pendent, filet, haubans, écoutille,
lanterne). Le pivot est au milieu de la quille : on pose le bateau dans le sable en jouant sur z,
la gîte (rotation X) et le cap (rotation Z). Les coquillages et débris autour vivent dans
z0_props_port.py (coordonnées monde).

    run("assets/z0_props_boats.py")["create"](kind="fishing", stage="details", location=(17, -16, -0.9), heading=40, heel=18)
"""
import math

import bmesh
import bpy
from mathutils import Vector

from lib import build, materials, naming
from lib.shapes import add_box, add_cyl, box, cylinder, ring

ZONE, CATEGORY = "Z0_PORT", "Props"
LEVELS = {"blockout": 0, "details": 1, "polish": 2}


def _materials():
    pm = materials.palette_material
    return {
        "hull_rust": pm("materials.rust", roughness=0.85),
        "hull_teal": pm("materials.hull_teal", roughness=0.75),
        "hull_pink": pm("materials.terracotta", roughness=0.8),
        "plaster": pm("materials.plaster", roughness=0.9),
        "wood": pm("materials.wood_dark", roughness=0.9),
        "iron": pm("materials.iron_dark", roughness=0.8, metallic=0.3),
        "brass": pm("materials.brass", roughness=0.3, metallic=1.0),
        "rope": pm("materials.rope", roughness=0.95),
        "weed": pm("materials.moss", roughness=0.95),
        "glass": materials.glass_material(),
    }


def _rope(part, name, a, b, radius, mat):
    """Corde tendue entre deux points (repère local du bateau)."""
    a, b = Vector(a), Vector(b)
    d = b - a
    rot = d.normalized().to_track_quat("Z", "Y").to_euler()
    return part(name, cylinder(radius, d.length, axis="Z", segments=6), tuple((a + b) / 2), mat=mat, bevel=0.0, rotation=tuple(rot), role="filler")


# ----------------------------------------------------------------------------- barque
def _hull_fishing(length=8.0, beam=2.6, depth=1.9):
    """Coque de barque : boîte étirée, étrave effilée et relevée, fond en V, arrière rétréci."""
    bm = box((length, beam, depth))
    for v in bm.verts:
        if v.co.x > 0:
            v.co.y *= 0.28
            v.co.z += 0.25
        else:
            v.co.y *= 0.82
        if v.co.z < 0:
            v.co.y *= 0.5
    return bm


def _fishing(part, M, level):
    part("Hull", _hull_fishing(), mat=M["hull_rust"], bevel=0.18, segments=3)
    part("Keel", box((6.4, 0.14, 0.4), (-0.4, 0, -1.05)), mat=M["iron"], bevel=0.02, segments=1)
    part("Deck", box((6.6, 2.1, 0.08), (-0.5, 0, 0.98)), mat=M["wood"], bevel=0.01, segments=1)
    part("Cabin", box((2.2, 1.9, 1.5), (-1.6, 0, 1.75)), mat=M["plaster"], bevel=0.05, segments=2)
    part("CabinRoof", box((2.5, 2.2, 0.12), (-1.6, 0, 2.55)), mat=M["hull_teal"], bevel=0.02, segments=1)
    part("Mast", cylinder(0.09, 6.5, axis="Z", segments=10, center=(0, 0, 3.25)), (0.9, 0, 1.0), mat=M["wood"], bevel=0.0)
    part("Boom", cylinder(0.06, 3.2, axis="X", segments=8, center=(-1.3, 0, 0)), (0.9, 0, 3.6), mat=M["wood"], bevel=0.0)
    part("Rudder", box((0.5, 0.08, 1.3), (-4.1, 0, -0.1)), mat=M["iron"], bevel=0.01, segments=1)
    if level < 1:
        return

    # Lisses, hublots de cabine, porte, lanterne de mât
    for sy in (1, -1):
        part(f"Gunwale_{'L' if sy > 0 else 'R'}", box((6.6, 0.08, 0.14), (-0.5, sy * 1.04, 1.06)), mat=M["wood"], bevel=0.01, segments=1)
        for i, x in enumerate((-2.1, -1.1)):
            part(f"Porthole_{'L' if sy > 0 else 'R'}{i + 1}", cylinder(0.16, 0.06, axis="Y", segments=14), (x, sy * 0.96, 1.9), mat=M["brass"], bevel=0.006, segments=1, role="filler")
            part(f"PortholeGlass_{'L' if sy > 0 else 'R'}{i + 1}", cylinder(0.12, 0.02, axis="Y", segments=14), (x, sy * 0.995, 1.9), mat=M["glass"], bevel=0.0, role="filler")
    part("CabinDoor", box((0.04, 0.6, 1.2), (-0.48, 0.3, 1.62)), mat=M["wood"], bevel=0.006, segments=1, role="filler")
    part("MastLamp", cylinder(0.09, 0.16, axis="Z", segments=8), (0.9, 0, 4.35), mat=M["iron"], bevel=0.006, segments=1, role="filler")
    part("Bowsprit", cylinder(0.05, 1.4, axis="X", segments=8, center=(0.7, 0, 0)), (3.6, 0, 1.15), mat=M["wood"], bevel=0.0, role="filler")

    # Cordes vertes d'algues qui pendent par-dessus bord, haubans, filet sur le pont
    for i, (x, sy) in enumerate(((1.2, 1), (-0.4, 1), (-2.9, -1), (0.6, -1))):
        top = (x, sy * 1.05, 1.1)
        bottom = (x + 0.15, sy * 1.55, -0.6)
        _rope(part, f"Weed_{i + 1}", top, bottom, 0.03, M["weed"])
    _rope(part, "Stay_F", (0.9, 0, 7.4), (3.9, 0, 1.3), 0.02, M["rope"])
    _rope(part, "Stay_B", (0.9, 0, 7.4), (-3.9, 0, 1.2), 0.02, M["rope"])
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=1, radius=1.0)
    for v in bm.verts:
        v.co = (v.co.x * 0.9, v.co.y * 0.7, v.co.z * 0.32)
    part("Net", bm, (1.7, 0.35, 1.32), mat=M["rope"], bevel=0.0, smooth_angle=60, role="filler")


# ----------------------------------------------------------------------------- vaisseau ventru
HULL_R = (3.1, 1.35, 1.5)


def _hull_bulb():
    """Coque ventrue : icosphère étirée, un peu plus fine à l'arrière."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=1.0)
    for v in bm.verts:
        stretch = 1.0 if v.co.x > 0 else 0.85
        v.co = (v.co.x * HULL_R[0], v.co.y * HULL_R[1] * stretch, v.co.z * HULL_R[2] * stretch)
    return bm


def _hull_half_width(x, z):
    """Demi-largeur de la coque ellipsoïdale à (x, z), pour poser les hublots sur la surface."""
    rx, ry, rz = HULL_R
    k = 1.0 - (x / rx) ** 2 - (z / rz) ** 2
    return ry * math.sqrt(max(0.0, k))


def _bulb(part, M, level):
    part("Hull", _hull_bulb(), mat=M["hull_pink"], bevel=0.0)
    part("Tower", cylinder(0.55, 1.1, axis="Z", segments=14, center=(0, 0, 0.55)), (-0.4, 0, 1.2), mat=M["hull_pink"], bevel=0.04, segments=1)
    part("TowerCap", cylinder(0.62, 0.12, axis="Z", segments=14), (-0.4, 0, 2.36), mat=M["plaster"], bevel=0.02, segments=1)
    part("Fin", box((1.1, 0.10, 1.2), (-2.6, 0, 0.9)), mat=M["hull_pink"], bevel=0.03, segments=1)
    for sy in (1, -1):
        part(f"Plane_{'L' if sy > 0 else 'R'}", box((0.9, 1.1, 0.08), (-2.4, sy * 1.2, 0.1)), mat=M["hull_pink"], bevel=0.02, segments=1)
    part("Mast", cylinder(0.07, 5.0, axis="Z", segments=8, center=(0, 0, 2.5)), (0.8, 0, 1.3), mat=M["wood"], bevel=0.0, rotation=(0, math.radians(-8), 0))
    part("Snout", cylinder(0.5, 0.6, axis="X", segments=14, center=(0.3, 0, 0)), (3.0, 0, 0.1), mat=M["iron"], bevel=0.04, segments=1)
    if level < 1:
        return

    # Hublots cerclés de laiton sur les flancs, écoutille, haubans du mât, cordes d'algues
    for sy in (1, -1):
        for i, x in enumerate((-1.3, 0.2, 1.6)):
            yw = _hull_half_width(x, 0.35)
            part(f"Porthole_{'L' if sy > 0 else 'R'}{i + 1}", cylinder(0.22, 0.10, axis="Y", segments=14), (x, sy * (yw - 0.02), 0.35), mat=M["brass"], bevel=0.008, segments=1, role="filler")
            part(f"PortholeGlass_{'L' if sy > 0 else 'R'}{i + 1}", cylinder(0.16, 0.03, axis="Y", segments=14), (x, sy * (yw + 0.03), 0.35), mat=M["glass"], bevel=0.0, role="filler")
    part("Hatch", cylinder(0.3, 0.07, axis="Z", segments=12), (-0.4, 0, 2.44), mat=M["iron"], bevel=0.008, segments=1, role="filler")
    part("HatchHandle", box((0.36, 0.05, 0.05)), (-0.4, 0, 2.5), mat=M["brass"], bevel=0.004, segments=1, role="filler")
    top = (0.8 + 5.0 * math.sin(math.radians(8)), 0, 1.3 + 5.0 * math.cos(math.radians(8)))
    _rope(part, "Stay_F", top, (2.9, 0, 0.9), 0.02, M["rope"])
    _rope(part, "Stay_B", top, (-2.4, 0, 1.4), 0.02, M["rope"])
    for i, (x, sy) in enumerate(((-0.6, 1), (1.4, -1), (-1.8, -1))):
        yw = _hull_half_width(x, 0.6)
        _rope(part, f"Weed_{i + 1}", (x, sy * yw, 0.6), (x + 0.2, sy * (yw + 0.5), -1.2), 0.03, M["weed"])
    part("Belt", ring(1.42, 1.3, 0.16, axis="X", segments=20), (0.2, 0, 0.0), mat=M["plaster"], bevel=0.01, segments=1, role="filler")


def create(
    kind: str = "fishing",
    stage: str = "details",
    zone: str = ZONE,
    location=(0.0, 0.0, 0.0),
    heading: float = 0.0,
    heel: float = 0.0,
) -> bpy.types.Object:
    level = LEVELS[stage]
    base = {"fishing": "BoatFishing", "bulb": "BoatBulb"}[kind]
    root_name = naming.asset_name(zone, CATEGORY, base)
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = build.root_empty(root_name, coll, size=1.0)
    M = _materials()

    def part(name, bm, pivot=(0, 0, 0), mat=None, **kw):
        kw.setdefault("role", "medium")
        return build.part(f"{root_name}_{name}", bm, pivot, root, coll, mat or M["iron"], **kw)

    (_fishing if kind == "fishing" else _bulb)(part, M, level)
    root.location = location
    root.rotation_euler = (math.radians(heel), 0.0, math.radians(heading))
    total = build.tri_total(root)
    print(f"[boat:{kind}] {stage}: {len(root.children_recursive)} pièces, {total} triangles")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
