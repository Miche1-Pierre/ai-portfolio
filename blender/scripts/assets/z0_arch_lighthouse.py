"""Z0 · Architecture · le phare éteint, au bout du quai (STORYTELLING §3.2 : il se rallume tout en
bas quand on atteint le sommet, en Z5).

Tour tronconique blanche à deux bandes terre cuite, galerie et garde-corps, chambre de lanterne
vitrée et coiffe, porte au pied. Marques de marée jusqu'à 1,5 m comme partout dans le port.
Étape courante : `details` (pas de blockout séparé : c'est un asset moyen, 15 m, budget 4 000).

    run("assets/z0_arch_lighthouse.py")["create"](location=(46, -5.5, 0))
"""
import math

import bmesh
import bpy

from lib import build, materials, mesh, naming
from lib.shapes import add_box, add_cyl, bisect_z, box, cylinder, ring
from lib.terrain import TIDE_CUTS, TIDE_STOPS

ZONE, CATEGORY, BASE = "Z0_PORT", "Architecture", "Lighthouse"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)
LEVELS = {"blockout": 0, "details": 1, "polish": 2}

R_BOTTOM, R_TOP, H_TOWER, Z_BASE = 1.7, 1.25, 11.0, 0.6


def _radius_at(z):
    t = (z - Z_BASE) / H_TOWER
    return R_BOTTOM + (R_TOP - R_BOTTOM) * t


def create(stage: str = "details", zone: str = ZONE, location=(46.0, -5.5, 0.0)) -> bpy.types.Object:
    level = LEVELS[stage]
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root_name = naming.asset_name(zone, CATEGORY, BASE)
    root = build.root_empty(root_name, coll, size=1.0)
    pm = materials.palette_material
    plaster, top, bottom = materials.vertex_tinted_material("MAT_plaster_tide", "materials.plaster", "materials.rock_dark", mix=0.5, roughness=0.9)
    quay, qtop, qbottom = materials.vertex_tinted_material("MAT_quay_wet", "materials.stone_quay", "materials.rock_dark", mix=0.4, roughness=0.95)
    iron = pm("materials.iron_dark", roughness=0.8, metallic=0.3)
    band = pm("materials.terracotta", roughness=0.85)
    glass = materials.glass_material()
    wood = pm("materials.wood_dark", roughness=0.9)
    P = f"{root_name}_"

    def part(name, bm, pivot=(0, 0, 0), mat=None, **kw):
        kw.setdefault("role", "medium")
        return build.part(P + name, bm, pivot, root, coll, mat or plaster, **kw)

    # Socle, tour, bandes
    part("Base", cylinder(2.2, Z_BASE, axis="Z", segments=24, center=(0, 0, Z_BASE / 2)), mat=quay, bevel=0.06, segments=1)
    bm = bmesh.new()
    add_cyl(bm, R_BOTTOM, H_TOWER, axis="Z", center=(0, 0, Z_BASE + H_TOWER / 2), segments=24, radius2=R_TOP)
    part("Tower", bisect_z(bm, TIDE_CUTS), bevel=0.0, smooth_angle=40)
    for i, z in enumerate((4.2, 8.2)):
        r = _radius_at(z)
        part(f"Band_{i + 1}", ring(r + 0.06, r - 0.3, 1.1, axis="Z", segments=24), (0, 0, z), mat=band, bevel=0.02, segments=1)

    # Galerie, garde-corps, chambre de lanterne, coiffe
    z_gal = Z_BASE + H_TOWER
    part("Gallery", ring(2.05, 1.0, 0.22, axis="Z", segments=24), (0, 0, z_gal + 0.11), mat=iron, bevel=0.02, segments=1)
    bm = bmesh.new()
    for i in range(14):
        a = 2 * math.pi * i / 14
        add_cyl(bm, 0.03, 0.95, axis="Z", center=(1.9 * math.cos(a), 1.9 * math.sin(a), z_gal + 0.22 + 0.475), segments=6)
    part("RailPosts", bm, mat=iron, bevel=0.0)
    part("RailTop", ring(1.96, 1.86, 0.05, axis="Z", segments=24), (0, 0, z_gal + 1.2), mat=iron, bevel=0.0)
    part("Lantern", cylinder(1.1, 1.7, axis="Z", segments=16, center=(0, 0, 0.85)), (0, 0, z_gal + 0.22), mat=glass, bevel=0.0, smooth_angle=40)
    bm = bmesh.new()
    for i in range(8):
        a = 2 * math.pi * i / 8
        vs = add_box(bm, (0.07, 0.07, 1.7), (1.12 * math.cos(a), 1.12 * math.sin(a), z_gal + 0.22 + 0.85))
    part("Mullions", bm, mat=iron, bevel=0.0)
    part("LanternBase", ring(1.2, 0.9, 0.12, axis="Z", segments=16), (0, 0, z_gal + 0.28), mat=iron, bevel=0.01, segments=1)
    part("LanternTop", cylinder(1.22, 0.14, axis="Z", segments=16), (0, 0, z_gal + 0.22 + 1.7 + 0.07), mat=iron, bevel=0.01, segments=1)
    bm = bmesh.new()
    add_cyl(bm, 1.2, 1.1, axis="Z", center=(0, 0, 0.55), segments=16, radius2=0.12)
    part("Dome", bm, (0, 0, z_gal + 0.22 + 1.84), mat=iron, bevel=0.0, smooth_angle=40)
    part("Finial", cylinder(0.05, 0.6, axis="Z", segments=6, center=(0, 0, 0.3)), (0, 0, z_gal + 0.22 + 1.84 + 1.05), mat=iron, bevel=0.0)

    # Porte au pied côté quai (+Y), petite fenêtre, marches
    part("Door", box((0.08, 0.9, 1.9), (0, 0, 0.95)), (0, R_BOTTOM - 0.02, Z_BASE), mat=wood, bevel=0.01, segments=1, rotation=(0, 0, math.radians(90)))
    part("DoorFrame", box((0.10, 1.1, 2.05), (0, 0, 1.0)), (0, R_BOTTOM - 0.08, Z_BASE), mat=quay, bevel=0.01, segments=1, rotation=(0, 0, math.radians(90)))
    part("Window", box((0.06, 0.5, 0.7)), (0, _radius_at(6.5) - 0.01, 6.5), mat=glass, bevel=0.0, rotation=(0, 0, math.radians(90)))
    bm = bmesh.new()
    for i in range(3):
        add_box(bm, (1.4, 0.36, 0.2), (0, 2.2 + 0.18 + i * 0.36, Z_BASE - 0.1 - i * 0.2))
    part("Steps", bm, mat=quay, bevel=0.02, segments=1)

    parts = [o for o in root.children_recursive if o.type == "MESH"]
    for obj in parts:
        names = [m.name for m in obj.data.materials if m is not None]
        if plaster.name in names:
            mesh.paint_stops(obj, top, TIDE_STOPS, bottom)
        if quay.name in names:
            mesh.paint_stops(obj, qtop, [(-1.5, 0.0), (-0.3, 0.15), (0.0, 0.8), (0.2, 1.0)], qbottom)

    root.location = location
    total = build.tri_total(root)
    print(f"[lighthouse] {stage}: {len(parts)} pièces, {total} triangles (budget moyen {mesh.BUDGETS['medium']})")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
