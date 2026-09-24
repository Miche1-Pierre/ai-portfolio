"""Végétation · les conifères et les buissons de l'île, en un maillage par matière et par zone.

Trois ceintures : la forêt des collines (Z2_FORET), les rives du lac (Z2_FORET), les pentes du
massif (Z3_COL, calotte de neige au-dessus de la ligne de neige). Jamais dans l'eau, ni dans le
désert, ni à portée de la route, des chemins ou des haltes (la distance tient compte du rayon de
l'arbre : aucun obstacle sur la route). Tout est posé sur le sol CONSTRUIT (`lib.probe`), enfoncé
d'un peu : plus d'arbre qui flotte.

    run("assets/zx_vegetation.py")["create"]()
"""
import math
import random

import bmesh
import bpy

from lib import build, materials, naming, probe, route
from lib.shapes import add_cyl

CATEGORY = "Vegetation"
BELTS = (
    # zone, nom, x (min, max), y (min, max), z (min, max), pente max, sapins, buissons, graine, calotte de neige
    ("Z2_FORET", "Forest", (96.0, 205.0), (2.0, 100.0), (2.6, 30.0), 0.85, 260, 140, 3, False),
    ("Z2_FORET", "Lakeside", (160.0, 240.0), (52.0, 128.0), (2.8, 14.0), 0.7, 60, 60, 7, False),
    ("Z3_COL", "Mountain", (-40.0, 200.0), (150.0, 300.0), (12.0, route.SNOW_TO + 4.0), 0.85, 150, 40, 11, True),
)


def _conifer(needles, trunk, caps, x, y, z, scale, snow):
    add_cyl(trunk, 0.12 * scale, 1.3 * scale, axis="Z", center=(x, y, z + 0.65 * scale), segments=6)
    base = z + 1.0 * scale
    for r, h in ((1.7, 2.4), (1.25, 2.2), (0.8, 2.0)):
        add_cyl(needles, r * scale, h * scale, axis="Z", center=(x, y, base + h * scale / 2), segments=7, radius2=0.03)
        base += h * scale * 0.62
    if snow and z > route.SNOW_TO - 2.0:
        add_cyl(caps, 0.55 * scale, 0.9 * scale, axis="Z", center=(x, y, base - 0.2 * scale), segments=7, radius2=0.02)


def _bush(bm, rnd, x, y, z, scale):
    """Buisson : deux ou trois boules basses fondues, un peu aplaties."""
    for _ in range(rnd.randint(2, 3)):
        r = rnd.uniform(0.45, 0.85) * scale
        geom = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)["verts"]
        ox, oy = rnd.uniform(-0.5, 0.5) * scale, rnd.uniform(-0.5, 0.5) * scale
        for v in geom:
            v.co = (v.co.x * 1.15 + x + ox, v.co.y * 1.15 + y + oy, v.co.z * 0.72 + z + r * 0.45)


def create(stage: str = "blockout") -> list:
    pm = materials.palette_material
    M = {
        "needles": pm("materials.moss", roughness=1.0),
        "trunk": pm("materials.wood_dark", roughness=0.95),
        "snow": pm("materials.snow", roughness=0.95),
        "bush": pm("materials.grass_dark", roughness=1.0),
    }
    d = route.build()
    stations = [xy for _, xy in route.STATIONS]
    lx, ly, lr = route.LAKE
    roots = []
    for zone, name, (x0, x1), (y0, y1), (z0, z1), max_slope, count, bushes, seed, snow in BELTS:
        coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
        root = build.root_empty(naming.asset_name(zone, CATEGORY, f"Conifers{name}"), coll, size=2.0)
        rnd = random.Random(seed)
        needles, trunk, caps, shrub = bmesh.new(), bmesh.new(), bmesh.new(), bmesh.new()
        placed = placed_bushes = 0

        def spot(radius, road_margin):
            """Un point valide de la ceinture, ou None."""
            x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
            z = route.ground_z(x, y, d)
            if not (z0 <= z <= z1) or route.slope(x, y) > max_slope or route.is_desert(x, y):
                return None
            if math.hypot(x - lx, y - ly) < lr + 3.5 or route.river_distance(x, y) < 5.0:
                return None
            if route.distance_to_road(x, y, d) < route.ROAD_W / 2 + road_margin + radius:
                return None
            if route.distance_to_side_paths(x, y) < 1.4 + radius:
                return None
            if any(math.hypot(x - sx, y - sy) < 9.0 + radius for sx, sy in stations):
                return None
            return x, y

        for _ in range(count * 16):
            if placed >= count:
                break
            scale = rnd.uniform(0.7, 1.35)
            found = spot(1.7 * scale, 3.0)   # la caméra de poursuite balaie jusqu'à 3,5 m de l'axe
            if found is None:
                continue
            x, y = found
            _conifer(needles, trunk, caps, x, y, probe.height(x, y) - 0.3 * scale, scale, snow)
            placed += 1
        for _ in range(bushes * 12):
            if placed_bushes >= bushes:
                break
            scale = rnd.uniform(0.7, 1.4)
            found = spot(1.0 * scale, 0.9)
            if found is None:
                continue
            x, y = found
            if probe.height(x, y) > route.SNOW_FROM:
                continue
            _bush(shrub, rnd, x, y, probe.height(x, y) - 0.25 * scale, scale)
            placed_bushes += 1
        for bm in (needles, trunk, caps, shrub):
            bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        P = naming.asset_name(zone, CATEGORY, f"Conifers{name}") + "_"
        build.part(P + "Needles", needles, (0, 0, 0), root, coll, M["needles"], bevel=0.0, smooth_angle=40, role="hero")
        build.part(P + "Trunks", trunk, (0, 0, 0), root, coll, M["trunk"], bevel=0.0, smooth_angle=40, role="medium")
        if caps.faces:
            build.part(P + "SnowCaps", caps, (0, 0, 0), root, coll, M["snow"], bevel=0.0, smooth_angle=40, role="medium")
        else:
            caps.free()
        if shrub.faces:
            build.part(P + "Bushes", shrub, (0, 0, 0), root, coll, M["bush"], bevel=0.0, smooth_angle=50, role="medium")
        else:
            shrub.free()
        print(f"[végétation] {zone} {name}: {placed} sapins, {placed_bushes} buissons, {build.tri_total(root)} triangles")
        roots.append(root)
    return roots


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
