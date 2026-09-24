"""Les haltes et les décors de l'île, en détail (v0.7, « peaufiner ») : de vrais bâtiments low-poly
(murs, toits débordants, cheminées, portes, fenêtres éclairées), posés sur le sol CONSTRUIT
(`lib.probe`), toujours hors de la route.

Z0_PORT : la grue du quai.  Z1_SABLE : l'épave, trois récifs, les ossements d'une baleine.
Z1_VOIE : le poste de contrôle (barrière levée), la cabane de rondins et son ponton (lac).
Z3_COL : la gare et son auvent, trois maisons et leurs jardins, l'auberge, le moulin, les champs
clôturés et leurs bottes ; le panneau du col.  Z2_ATELIER : la terrasse-atelier (conteneurs nervurés,
grue, fûts, palettes), les cactus.  Z4_OBSERVATOIRE : l'observatoire (dôme, lunette, parabole).

    run("assets/zx_stations.py")["create"]()
"""
import math
import random

import bmesh
import bpy
from mathutils import Vector

from lib import build, materials, naming, probe, route
from lib.rocks import rock_mass
from lib.shapes import add_box, add_cyl, arch, box, cylinder, prism, rotate_about_z

ROOTS = {"Z0_PORT": ("Props", "Quay"), "Z1_SABLE": ("Props", "Decor"), "Z1_VOIE": ("Architecture", "Skeleton"),
         "Z2_ATELIER": ("Architecture", "Skeleton"), "Z3_COL": ("Architecture", "Skeleton"), "Z4_OBSERVATOIRE": ("Architecture", "Skeleton")}
ROAD_W = route.ROAD_W


def _materials():
    pm = materials.palette_material
    return {
        "plaster": pm("materials.plaster", roughness=0.9),
        "white": pm("materials.plaster", roughness=0.7, name="MAT_plaster_obs"),
        "roof": pm("materials.roof_red", roughness=0.85),
        "slate": pm("materials.rail_steel", roughness=0.9, name="MAT_slate"),
        "wood": pm("materials.wood_dark", roughness=0.9),
        "wood_light": pm("materials.wood_light", roughness=0.9),
        "iron": pm("materials.iron_dark", roughness=0.8, metallic=0.3),
        "rust": pm("materials.rust", roughness=0.9),
        "steel": pm("materials.steel", roughness=0.5, metallic=0.8),
        "stone": pm("materials.stone_quay", roughness=0.95),
        "reef": pm("materials.rock_dark", roughness=0.95),
        "bone": pm("materials.plaster", roughness=0.85, name="MAT_bone"),
        "field_a": pm("materials.field_a", roughness=1.0),
        "field_b": pm("materials.field_b", roughness=1.0),
        "soil": pm("materials.rock_dark", roughness=1.0, name="MAT_soil"),
        "leaf": pm("materials.grass_dark", roughness=0.95),
        "cactus": pm("materials.grass_dark", roughness=0.9),
        "snow": pm("materials.snow", roughness=0.95),
        "canvas": pm("materials.canvas", roughness=0.9),
        "brass": pm("materials.brass", roughness=0.35, metallic=0.6),
        "glass": pm("#ffe6b3", roughness=0.3, emission="#ffd58a", emission_strength=2.5, name="MAT_window_lit"),
        "lantern": pm("#fff1c8", roughness=0.3, emission="#ffe3a0", emission_strength=6.0, name="MAT_lantern_lit"),
        "cold_glass": materials.glass_material(),
        "stripe": pm("#f3e6d3", roughness=0.6, name="MAT_stripe_light"),
        "stripe_red": pm("materials.roof_red", roughness=0.6, name="MAT_stripe_red"),
    }


def _merge(dst, src):
    src.verts.ensure_lookup_table()
    src.verts.index_update()
    vs = [dst.verts.new(v.co) for v in src.verts]
    for f in src.faces:
        dst.faces.new([vs[v.index] for v in f.verts])
    src.free()
    return vs


class Kit:
    """Un bâtiment = un bmesh par matière, en repère local (x le long de la route, y en travers,
    z depuis le sol) ; `emit` crée une pièce par matière."""

    def __init__(self):
        self.bms = {}

    def bm(self, key):
        return self.bms.setdefault(key, bmesh.new())

    def box(self, key, size, center, yaw_deg=0.0):
        vs = add_box(self.bm(key), size, center)
        if yaw_deg:
            rotate_about_z(self.bm(key), vs, yaw_deg, center)
        return vs

    def cyl(self, key, r, h, axis="Z", center=(0, 0, 0), segments=12, r2=None):
        return add_cyl(self.bm(key), r, h, axis=axis, center=center, segments=segments, radius2=r2)

    def gable(self, key, length, width, z0, roof_h, overhang=0.35, x0=0.0):
        """Toit à deux pans (prisme), débordant de `overhang`, centré en x0."""
        roof = prism([(-width / 2 - overhang, z0 - 0.02), (width / 2 + overhang, z0 - 0.02), (0.0, z0 + roof_h)], length + 2 * overhang, plane="YZ")
        bmesh.ops.translate(roof, vec=(x0 - length / 2 - overhang, 0, 0), verts=roof.verts)
        _merge(self.bm(key), roof)

    def sphere(self, key, r, center, subdivisions=1, squash=1.0):
        vs = bmesh.ops.create_icosphere(self.bm(key), subdivisions=subdivisions, radius=r)["verts"]
        for v in vs:
            v.co = (v.co.x + center[0], v.co.y + center[1], v.co.z * squash + center[2])
        return vs

    def emit(self, part, zone, prefix, pivot, yaw, M, role="medium", bevel=0.02):
        for key, bm in self.bms.items():
            if bm.faces:
                bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
                part(zone, f"{prefix}_{key}", bm, pivot, M[key], yaw, bevel=0.0 if key in ("glass", "lantern", "leaf") else bevel, role=role)
            else:
                bm.free()
        self.bms = {}


# ----------------------------------------------------------------------------- modèles
def house(k, length, width, wall_h, roof_h, *, face=-1, wall="plaster", roof="roof", windows=2, door_x=None, storeys=1, chimney=True, awning=True):
    """Maison à pignon : soubassement de pierre, murs, toit débordant, cheminée, porte et fenêtres
    éclairées côté route (`face` = signe du côté de la route en y local)."""
    k.box("stone", (length + 0.24, width + 0.24, 0.36), (0, 0, 0.18))
    k.box(wall, (length, width, wall_h - 0.3), (0, 0, 0.3 + (wall_h - 0.3) / 2))
    k.gable(roof, length, width, wall_h, roof_h)
    k.box("wood", (length + 0.8, 0.16, 0.16), (0, 0, wall_h + roof_h - 0.04))   # faîtage
    if chimney:
        k.box("stone", (0.6, 0.6, roof_h * 0.6 + 1.0), (length * 0.28, 0.0, wall_h + roof_h * 0.55 + 0.4))
    y = face * (width / 2)
    dx = -length * 0.25 if door_x is None else door_x
    k.box("wood", (0.95, 0.10, 1.95), (dx, y + face * 0.05, 0.3 + 0.975))         # porte
    k.box("wood", (1.2, 0.08, 0.14), (dx, y + face * 0.06, 0.3 + 2.0))            # linteau
    k.box("stone", (1.3, 0.5, 0.12), (dx, y + face * 0.25, 0.3 + 0.06))           # seuil
    if awning:
        k.box("wood", (1.7, 0.9, 0.06), (dx, y + face * 0.45, 0.3 + 2.35))
        for sx in (-0.7, 0.7):
            k.box("wood", (0.08, 0.08, 0.7), (dx + sx, y + face * 0.85, 0.3 + 2.0))
    for storey in range(storeys):
        zc = 0.3 + 1.55 + storey * 2.65
        xs = [(-length / 2) + length * (i + 1) / (windows + 1) for i in range(windows)]
        for i, wx in enumerate(xs):
            if storey == 0 and abs(wx - dx) < 0.9:
                continue
            k.box("wood", (0.98, 0.06, 1.08), (wx, y + face * 0.03, zc))
            k.box("glass", (0.78, 0.08, 0.88), (wx, y + face * 0.05, zc))
        # deux fenêtres sur la face arrière
        for wx in (xs[0], xs[-1]):
            k.box("wood", (0.9, 0.06, 1.0), (wx, -y - face * 0.03, zc))
            k.box("glass", (0.7, 0.08, 0.8), (wx, -y - face * 0.05, zc))


def garden_tree(k, x, y, scale=1.0, key="leaf"):
    k.cyl("wood", 0.12 * scale, 1.3 * scale, center=(x, y, 0.65 * scale), segments=6)
    k.sphere(key, 1.1 * scale, (x, y, 1.9 * scale), subdivisions=1, squash=0.85)
    k.sphere(key, 0.8 * scale, (x + 0.5 * scale, y - 0.3 * scale, 2.4 * scale), subdivisions=1, squash=0.9)


def fence(k, pts, height=1.0, every=2.4, key="wood"):
    """Clôture de bois fermée le long de `pts` (locaux) : poteaux et deux lisses."""
    loop = list(pts) + [pts[0]]
    for (ax, ay), (bx, by) in zip(loop, loop[1:]):
        dx, dy = bx - ax, by - ay
        length = math.hypot(dx, dy)
        n = max(1, int(length / every))
        ang = math.degrees(math.atan2(dy, dx))
        for i in range(n + 1):
            t = i / n
            k.box(key, (0.1, 0.1, height), (ax + dx * t, ay + dy * t, height / 2))
        for z in (height - 0.15, height * 0.55):
            k.box(key, (length, 0.05, 0.08), ((ax + bx) / 2, (ay + by) / 2, z), yaw_deg=ang)


def field(k, length, width, key_soil, key_crop, bales=3, rnd=None):
    k.box(key_soil, (length, width, 0.14), (0, 0, 0.07))
    rows = int(width / 1.4)
    for i in range(rows):
        y = -width / 2 + width * (i + 0.5) / rows
        k.box(key_crop, (length - 0.6, 0.55, 0.22), (0, y, 0.22))
    fence(k, [(-length / 2 - 0.6, -width / 2 - 0.6), (length / 2 + 0.6, -width / 2 - 0.6), (length / 2 + 0.6, width / 2 + 0.6), (-length / 2 - 0.6, width / 2 + 0.6)], height=0.9)
    rnd = rnd or random.Random(1)
    for _ in range(bales):
        x, y = rnd.uniform(-length / 2 + 1.5, length / 2 - 1.5), rnd.uniform(-width / 2 + 1.0, width / 2 - 1.0)
        k.cyl("field_a", 0.6, 1.1, axis="X", center=(x, y, 0.75), segments=10)


def log_cabin(k, length, width, wall_h, roof_h, face=-1):
    k.box("stone", (length + 0.6, width + 0.6, 0.5), (0, 0, 0.25))
    n = int((wall_h - 0.5) / 0.32)
    for i in range(n):
        z = 0.5 + 0.16 + i * 0.32
        for sy in (-1, 1):
            k.cyl("wood", 0.16, length + 0.5, axis="X", center=(0, sy * width / 2, z), segments=8)
        for sx in (-1, 1):
            k.cyl("wood", 0.16, width + 0.5, axis="Y", center=(sx * length / 2, 0, z + 0.16), segments=8)
    k.box("wood", (length - 0.3, width - 0.3, wall_h - 0.5), (0, 0, 0.5 + (wall_h - 0.5) / 2))   # remplissage
    k.gable("slate", length, width, wall_h + 0.2, roof_h, overhang=0.5)
    k.box("stone", (0.55, 0.55, roof_h * 0.6 + 0.9), (length * 0.3, 0.0, wall_h + roof_h * 0.55 + 0.4))
    y = face * (width / 2 + 0.25)
    k.box("wood_light", (0.9, 0.1, 1.9), (-length * 0.2, y + face * 0.05, 0.5 + 0.95))
    k.box("wood_light", (0.9, 0.06, 0.9), (length * 0.25, y + face * 0.03, 0.5 + 1.5))
    k.box("glass", (0.7, 0.08, 0.7), (length * 0.25, y + face * 0.05, 0.5 + 1.5))
    # porche : plancher, deux poteaux, petit toit
    k.box("wood_light", (length, 1.6, 0.12), (0, y + face * 0.8, 0.5))
    for sx in (-length / 2 + 0.3, length / 2 - 0.3):
        k.box("wood", (0.14, 0.14, 2.3), (sx, y + face * 1.5, 0.5 + 1.15))
    k.box("slate", (length + 0.4, 1.9, 0.08), (0, y + face * 0.85, wall_h + 0.1))
    k.box("lantern", (0.16, 0.16, 0.22), (length / 2 - 0.3, y + face * 1.5, 0.5 + 2.05))


def container(k, length, width, height, key):
    k.box(key, (length, width, height), (0, 0, height / 2))
    for sy in (-1, 1):
        for i in range(6):
            x = -length / 2 + length * (i + 0.5) / 6
            k.box(key, (0.12, 0.06, height - 0.3), (x, sy * (width / 2 + 0.03), height / 2))
    k.box("iron", (0.05, width - 0.2, height - 0.3), (length / 2 + 0.03, 0, height / 2))   # portes
    for sy in (-0.35, 0.35):
        k.box("iron", (0.08, 0.06, height - 0.6), (length / 2 + 0.06, sy, height / 2))


# ----------------------------------------------------------------------------- l'ensemble
def create(stage: str = "details") -> list:
    M = _materials()
    d = route.build()
    rnd = random.Random(23)
    roots, made = {}, []

    def part(zone, name, bm, pivot, mat, yaw=0.0, bevel=0.04, role="medium", rotation=None):
        category, base = ROOTS[zone]
        coll = naming.ensure_collection(f"{zone}/{category}")
        if zone not in roots:
            roots[zone] = build.root_empty(naming.asset_name(zone, category, base), coll, size=2.0)
        obj = build.part(naming.asset_name(zone, category, name), bm, tuple(pivot), roots[zone], coll, mat,
                         bevel=bevel, segments=1, role=role, rotation=rotation or (0.0, 0.0, yaw))
        made.append(obj)
        return obj

    def ground(x, y, sink=0.0):
        return Vector((x, y, probe.height(x, y) - sink))

    def pose(station, back, along=0.0, sink=0.12):
        """Pose au sol construit, à `back` m de la route ; `face` = signe (y local) du côté route."""
        p, yaw = route.pose_at_station(station, back=back, along=along, data=d)
        q, _ = route.pose_at_station(station, back=0.0, along=along, data=d)
        yl = Vector((-math.sin(yaw), math.cos(yaw), 0.0))
        face = 1 if (q - p).dot(yl) > 0 else -1
        return Vector((p.x, p.y, probe.height(p.x, p.y) - sink)), yaw, face

    # ------------------------------------------------------------------ Z0 · la grue du quai
    k = Kit()
    k.cyl("stone", 1.5, 1.2, center=(0, 0, 0.6), segments=14)
    k.cyl("iron", 0.55, 2.2, center=(0, 0, 2.3), segments=10)
    k.box("rust", (2.6, 2.0, 2.0), (0.4, 0, 4.4))                              # cabine
    k.box("glass", (0.9, 0.08, 0.7), (0.4, -1.04, 4.6))
    k.box("iron", (1.8, 1.4, 1.2), (-1.6, 0, 4.2))                              # contrepoids
    for sy in (-0.45, 0.45):                                                    # flèche en treillis, vers la mer (-y)
        vs = add_box(k.bm("rust"), (0.22, 12.0, 0.22), (0.6, -6.0, 5.4))
        for v in vs:
            v.co = (v.co.x + sy, v.co.y, v.co.z + (-v.co.y) * 0.62)
    for i in range(7):
        y = -1.0 - i * 1.6
        k.box("rust", (1.1, 0.12, 0.12), (0.6, y, 5.4 + (-y) * 0.62))
    k.cyl("iron", 0.03, 5.2, center=(0.6, -11.6, 5.4 + 11.6 * 0.62 - 2.6), segments=6)
    k.box("iron", (0.5, 0.5, 0.5), (0.6, -11.6, 5.4 + 11.6 * 0.62 - 5.3))
    k.box("iron", (2.4, 0.5, 1.4), (0.6, -11.6, 5.4 + 11.6 * 0.62 - 6.4))     # caisse au bout du câble
    k.emit(part, "Z0_PORT", "Crane", Vector((27.0, 5.6, 0.0)), 0.0, M, role="hero")

    # ------------------------------------------------------------------ Z1_SABLE · la crique
    def _hull(length, beam, depth):
        half, b = length / 2, beam / 2
        bm = prism([(-half, 0.0), (-half * 0.72, -b), (half * 0.55, -b), (half, 0.0), (half * 0.55, b), (-half * 0.72, b)], depth, plane="XY")
        add_box(bm, (5.0, 3.2, 2.6), (2.0, 0.0, depth + 1.3))
        add_box(bm, (1.2, 1.2, 1.2), (2.0, 0.0, depth + 3.2))
        add_cyl(bm, 0.18, 9.0, axis="Z", center=(-3.5, 0.0, depth + 4.5), segments=8)
        return bm

    part("Z1_SABLE", "Wreck", _hull(22.0, 6.0, 5.5), ground(96.0, -30.0, sink=1.6), M["rust"], role="hero", rotation=(math.radians(12), 0.0, 0.35))
    for i, (x, y) in enumerate(((74.0, -34.0), (120.0, -38.0), (142.0, -24.0))):
        bm = bmesh.new()
        for _ in range(4):
            sx, sy, sz = rnd.uniform(1.6, 3.4), rnd.uniform(1.2, 2.6), rnd.uniform(1.4, 3.2)
            rock = rock_mass(rnd, (sx, sy, sz), subdivisions=1, jitter=0.2)
            ox, oy = rnd.uniform(-3.0, 3.0), rnd.uniform(-3.0, 3.0)
            bmesh.ops.translate(rock, vec=(ox, oy, -sz * 0.25), verts=rock.verts)
            _merge(bm, rock)
        part("Z1_SABLE", f"Reef_{i + 1}", bm, ground(x, y, sink=-1.4), M["reef"], bevel=0.0, role="hero")   # émergent de l'eau
    bm = bmesh.new()
    for i in range(7):
        r = 3.2 - 0.34 * i
        rib = arch(r - 0.16, r, 0.22, 0.0, 180.0, steps=10, axis="X")
        bmesh.ops.translate(rib, vec=(1.5 * i, 0, 0), verts=rib.verts)
        _merge(bm, rib)
    add_cyl(bm, 0.18, 10.5, axis="X", center=(4.5, 0.0, 0.25), segments=8)
    part("Z1_SABLE", "WhaleBones", bm, ground(104.0, -9.5, sink=0.3), M["bone"], bevel=0.0, role="medium", rotation=(0.0, 0.0, 0.3))   # sur le sable, pas sous l'eau

    # ------------------------------------------------------------------ Z1 · le poste de contrôle
    p, yaw, face = pose("poste-de-controle", ROAD_W / 2 + 2.6)
    k = Kit()
    k.box("stone", (3.0, 2.7, 0.3), (0, 0, 0.15))
    k.box("plaster", (2.6, 2.3, 2.5), (0, 0, 0.3 + 1.25))
    k.box("wood", (1.4, 0.06, 1.0), (0, face * 1.18, 1.7))
    k.box("glass", (1.2, 0.08, 0.85), (0, face * 1.2, 1.7))
    k.box("wood", (0.8, 0.1, 1.8), (0.6, -face * 1.18, 1.2))
    k.gable("roof", 2.6, 2.3, 2.8, 0.7, overhang=0.4)
    k.box("stripe_red", (0.14, 0.14, 4.4), (1.9, face * 1.9, 2.2))                    # bras de barrière levé (jamais en travers)
    k.box("stripe", (0.18, 0.18, 0.5), (1.9, face * 1.9, 0.25))
    k.box("iron", (0.5, 0.5, 0.9), (1.9, face * 1.9, 0.45))
    k.box("wood", (0.12, 0.12, 2.2), (-1.6, face * 1.9, 1.1))                          # panneau
    k.box("stripe", (1.1, 0.06, 0.5), (-1.6, face * 1.93, 2.0))
    k.emit(part, "Z1_VOIE", "Checkpoint", p, yaw, M)
    q, _ = route.pose_at_station("poste-de-controle", back=0.0, data=d)
    bm = bmesh.new()
    for sy in (-1, 1):
        add_box(bm, (0.26, 0.26, 4.6), (0, sy * (ROAD_W / 2 + 0.6), 2.3))
    add_box(bm, (0.3, ROAD_W + 1.5, 0.3), (0, 0, 4.75))
    add_box(bm, (0.06, 2.4, 0.6), (0.16, 0, 4.2))
    part("Z1_VOIE", "Checkpoint_Gantry", bm, q, M["iron"], yaw, bevel=0.01)

    # ------------------------------------------------------------------ Z1 · la cabane de rondins et son ponton
    p, yaw, face = pose("borne-dec-2025", -(ROAD_W / 2 + 5.5), along=2.0, sink=0.2)
    k = Kit()
    log_cabin(k, 4.2, 3.4, 2.6, 1.3, face=face)
    k.cyl("steel", 0.05, 6.5, center=(1.4, -face * 1.2, 3.2), segments=8)
    k.box("steel", (0.9, 0.05, 0.6), (1.4, -face * 1.2, 6.2))
    garden_tree(k, -3.6, -face * 1.0, 1.1)
    k.emit(part, "Z1_VOIE", "Cabin", p, yaw, M, role="hero")
    lx, ly, lr = route.LAKE
    toward = Vector((lx - p.x, ly - p.y, 0.0)).normalized()
    pier = p + toward * 8.0
    ang = math.atan2(toward.y, toward.x)
    k = Kit()
    for i in range(14):
        k.box("wood_light", (0.55, 1.5, 0.08), (-4.5 + i * 0.68, 0, 0.0))
    for x in (-4.0, -0.5, 3.0):
        for sy in (-0.6, 0.6):
            k.cyl("wood", 0.1, 1.6, center=(x, sy, -0.7), segments=6)
    # la barque amarrée
    bm = k.bm("wood_light")
    hull = prism([(-1.6, 0.0), (-1.2, -0.55), (1.1, -0.55), (1.6, 0.0), (1.1, 0.55), (-1.2, 0.55)], 0.45, plane="XY")
    bmesh.ops.translate(hull, vec=(4.9, 1.6, -0.45), verts=hull.verts)
    _merge(bm, hull)
    k.box("wood", (0.12, 1.0, 0.06), (4.6, 1.6, 0.0))
    k.emit(part, "Z1_VOIE", "Pier", Vector((pier.x, pier.y, route.LAKE_WATER_Z + 0.35)), ang, M, bevel=0.01)

    # ------------------------------------------------------------------ Z3 · le village
    p, yaw, face = pose("gare", ROAD_W / 2 + 5.4)
    k = Kit()
    house(k, 9.0, 4.6, 3.6, 1.8, face=face, windows=3, door_x=0.0, chimney=True, awning=False)
    for x in (-3.6, -1.2, 1.2, 3.6):                                                   # auvent du quai
        k.box("wood", (0.16, 0.16, 2.9), (x, face * 3.3, 1.45))
    k.box("slate", (9.6, 2.4, 0.08), (0, face * 2.55, 3.0))
    k.box("wood", (2.4, 0.08, 0.5), (0, face * 2.32, 2.55))                           # enseigne
    k.cyl("brass", 0.32, 0.08, axis="Y", center=(2.6, face * 2.32, 2.9), segments=12)    # horloge
    k.box("wood", (1.6, 0.5, 0.08), (-2.6, face * 2.9, 0.55))                           # banc
    k.box("lantern", (0.18, 0.18, 0.24), (-4.2, face * 2.35, 2.75))
    k.emit(part, "Z3_COL", "Gare", p, yaw, M, role="hero")
    q, _ = route.pose_at_station("gare", back=ROAD_W / 2 + 0.7, data=d)
    part("Z3_COL", "Gare_Platform", box((14.0, 1.4, 0.35), (0, 0, 0.175)), Vector((q.x, q.y, probe.height(q.x, q.y) - 0.05)), M["stone"], yaw)
    specs = ((5.2, 4.6, 3.0, 1.7, "plaster", "roof"), (5.8, 4.4, 3.1, 1.9, "wood", "slate"), (4.8, 4.8, 3.2, 1.6, "plaster", "roof"))
    for i, (along, (L, W, H, R, wall, roof)) in enumerate(zip((-11.0, 0.0, 11.0), specs)):
        p, yaw, face = pose("maisons", ROAD_W / 2 + 7.5, along=along)
        k = Kit()
        house(k, L, W, H, R, face=face, wall=wall, roof=roof, windows=2)
        garden_tree(k, L / 2 + 2.0, -face * 1.0, rnd.uniform(0.8, 1.2))
        fence(k, [(-L / 2 - 2.5, -W / 2 - 2.0), (L / 2 + 3.5, -W / 2 - 2.0), (L / 2 + 3.5, W / 2 + 2.0), (-L / 2 - 2.5, W / 2 + 2.0)], height=0.8)
        k.emit(part, "Z3_COL", f"House_{i + 1}", p, yaw, M, role="hero")
    p, yaw, face = pose("auberge", ROAD_W / 2 + 9.0)
    k = Kit()
    house(k, 10.5, 6.5, 5.7, 2.4, face=face, wall="wood", roof="roof", windows=4, storeys=2, door_x=-1.0)
    k.box("wood_light", (4.6, 1.2, 0.12), (1.5, face * (3.25 + 0.6), 3.05))          # balcon
    for x in (-0.7, 0.5, 1.7, 2.9, 3.7):
        k.box("wood", (0.08, 0.08, 1.0), (x, face * (3.25 + 1.15), 3.6))
    k.box("wood", (4.7, 0.06, 0.08), (1.5, face * (3.25 + 1.15), 4.1))
    k.box("wood", (2.6, 0.08, 0.6), (-1.0, face * 3.3, 2.75))                         # enseigne
    k.box("lantern", (0.2, 0.2, 0.28), (-2.6, face * 3.35, 2.6))
    garden_tree(k, -7.0, -face * 0.5, 1.3)
    garden_tree(k, 7.4, face * 0.8, 1.0)
    k.emit(part, "Z3_COL", "Auberge", p, yaw, M, role="hero")
    p, yaw, face = pose("maisons", -(ROAD_W / 2 + 24.0), along=6.0)
    k = Kit()
    k.cyl("stone", 2.1, 9.0, center=(0, 0, 4.5), segments=12, r2=1.45)
    k.cyl("roof", 1.8, 1.8, center=(0, 0, 9.9), segments=12, r2=0.12)
    k.box("wood", (0.9, 0.1, 1.9), (0, face * 2.02, 1.0))
    k.box("glass", (0.6, 0.1, 0.7), (0, face * 1.72, 5.5))
    k.emit(part, "Z3_COL", "Windmill", p, yaw, M, role="hero")
    k = Kit()
    for j in range(4):
        vs = k.box("wood", (0.22, 5.4, 0.22), (0.0, 2.7, 0.0))
        for t in (1.4, 2.7, 4.0):
            vs += k.box("wood", (0.06, 0.06, 1.3), (0.0, t, 0.0))
        vs += k.box("canvas", (0.04, 3.6, 1.05), (0.0, 3.2, -0.55))
        for v in vs:
            y, z = v.co.y, v.co.z
            a = j * math.pi / 2
            v.co = (v.co.x, y * math.cos(a) - z * math.sin(a), y * math.sin(a) + z * math.cos(a))
    k.cyl("iron", 0.25, 1.0, axis="X", center=(0, 0, 0), segments=8)
    hub = Vector((p.x, p.y, p.z + 8.2)) + Vector((-math.sin(yaw), math.cos(yaw), 0)) * face * 2.2
    k.emit(part, "Z3_COL", "Windmill_Blades", hub, yaw + math.pi / 2, M, bevel=0.01)
    fields = (("gare", -1, 14.0, -12.0), ("gare", -1, 9.0, 10.0), ("maisons", -1, 20.0, -6.0), ("auberge", -1, 24.0, 12.0), ("auberge", 1, 12.0, 8.0), ("auberge", -1, 30.0, -8.0))
    for i, (station, side, back, along) in enumerate(fields):
        p, yaw, face = pose(station, side * (ROAD_W / 2 + back), along=along, sink=0.05)
        k = Kit()
        field(k, 16.0, 9.0, "soil", "field_b" if i % 2 else "field_a", bales=3 if i % 2 else 0, rnd=rnd)
        k.emit(part, "Z3_COL", f"Field_{i + 1}", p, yaw + rnd.uniform(-0.2, 0.2), M, bevel=0.0, role="filler")

    # ------------------------------------------------------------------ Z2 · la terrasse-atelier, les cactus
    p, yaw, face = pose("atelier", ROAD_W / 2 + 7.0, sink=0.3)
    k = Kit()
    k.box("stone", (18.0, 11.0, 1.2), (0, 0, 0.6))
    fence(k, [(-8.6, -5.2), (8.6, -5.2), (8.6, 5.2), (-8.6, 5.2)], height=1.0, key="iron")
    k.box("stone", (3.0, 1.6, 0.4), (0, face * 6.0, 0.2))                               # marche vers la route
    for i, (dx, dy, key, rot) in enumerate(((-4.5, 1.6, "steel", 0.0), (1.5, 2.2, "roof", 0.0), (5.0, -1.8, "rust", 10.0))):
        sub = Kit()
        container(sub, 6.0, 2.4, 2.6, key)
        for kk, bm in sub.bms.items():
            for v in bm.verts:
                v.co = (v.co.x + dx, v.co.y + dy, v.co.z + 1.2)
            if rot:
                rotate_about_z(bm, bm.verts, rot, (dx, dy, 0))
            _merge(k.bm(kk), bm)
    k.box("iron", (0.6, 0.6, 9.0), (-7.0, -3.2, 1.2 + 4.5))                             # grue : mât, flèche, câble, crochet
    k.box("iron", (8.0, 0.4, 0.4), (-3.2, -3.2, 1.2 + 8.9))
    k.cyl("iron", 0.03, 4.0, center=(0.4, -3.2, 1.2 + 6.7), segments=6)
    k.box("brass", (0.4, 0.3, 0.5), (0.4, -3.2, 1.2 + 4.5))
    for j, (x, y) in enumerate(((-2.0, -3.6), (-1.0, -3.6), (0.0, -3.9))):
        k.cyl("rust" if j else "roof", 0.42, 0.9, center=(x, y, 1.2 + 0.45), segments=10)
    for x, y in ((3.2, 3.4), (4.4, 3.4)):
        k.box("wood_light", (1.2, 0.8, 0.14), (x, y, 1.2 + 0.07))
        k.box("wood_light", (1.0, 0.7, 0.5), (x, y, 1.2 + 0.4))
    k.box("wood", (2.4, 0.9, 0.08), (-6.0, 3.6, 1.2 + 0.9))
    for sx in (-1.0, 1.0):
        k.box("wood", (0.1, 0.8, 0.86), (-6.0 + sx, 3.6, 1.2 + 0.43))
    k.box("lantern", (0.3, 0.3, 0.3), (-7.0, -3.2, 1.2 + 9.4))
    k.emit(part, "Z2_ATELIER", "Workshop", p, yaw, M, role="hero")
    bm = bmesh.new()
    placed = 0
    x0, x1, y0, y1 = route.MESA
    for _ in range(300):
        if placed >= 18:
            break
        x, y = rnd.uniform(x0 + 10, x1 - 10), rnd.uniform(y0 + 10, y1 - 10)
        if route.distance_to_road(x, y, d) < 14.0 or not route.is_desert(x, y):
            continue
        z = probe.height(x, y) - 0.2
        h = rnd.uniform(2.2, 4.0)
        add_cyl(bm, 0.45, h, axis="Z", center=(x, y, z + h / 2), segments=8)
        for sx in (-1, 1):
            add_cyl(bm, 0.28, 1.4, axis="Z", center=(x + sx * 0.9, y, z + h * 0.55 + 0.7), segments=7)
            add_cyl(bm, 0.28, 0.9, axis="X", center=(x + sx * 0.45, y, z + h * 0.55), segments=7)
        placed += 1
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    part("Z2_ATELIER", "Cacti", bm, (0, 0, 0), M["cactus"], bevel=0.0, role="medium")

    # ------------------------------------------------------------------ Z3 · le panneau du col
    p, yaw, face = pose("col-neige", ROAD_W / 2 + 1.2)
    k = Kit()
    k.box("wood", (0.14, 0.14, 2.6), (0, 0, 1.3))
    k.box("stripe", (1.4, 0.06, 0.4), (0.4, 0, 2.2))
    k.box("snow", (1.5, 0.2, 0.08), (0.4, 0, 2.44))
    k.emit(part, "Z3_COL", "ColSign", p, yaw, M, bevel=0.01, role="filler")

    # ------------------------------------------------------------------ Z4 · l'observatoire
    p, yaw, face = pose("observatoire", ROAD_W / 2 + 7.5, sink=0.6)
    k = Kit()
    # fondation en pyramide tronquée, enfouie dans le replat du sommet
    bmf = k.bm("stone")
    lo = [bmf.verts.new((sx * 10.5, sy * 8.5, -6.0)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    hi = [bmf.verts.new((sx * 6.2, sy * 4.7, 0.1)) for sx, sy in ((-1, -1), (1, -1), (1, 1), (-1, 1))]
    bmf.faces.new(hi)
    bmf.faces.new(list(reversed(lo)))
    for i in range(4):
        bmf.faces.new((lo[i], lo[(i + 1) % 4], hi[(i + 1) % 4], hi[i]))
    k.box("stone", (12.0, 9.0, 1.6), (0, 0, 0.8))
    fence(k, [(-5.8, -4.3), (5.8, -4.3), (5.8, 4.3), (-5.8, 4.3)], height=1.0, key="iron")
    k.box("stone", (3.0, 1.4, 0.5), (0, face * 5.2, 0.25))
    k.cyl("white", 1.7, 13.0, center=(-3.0, 1.0, 1.6 + 6.5), segments=20, r2=1.5)
    for zc in (4.0, 7.5, 11.0):
        k.box("wood", (0.06, 0.8, 1.0), (-3.0 + face * 0.0 - 1.62, 1.0, 1.6 + zc))
        k.box("glass", (0.08, 0.6, 0.8), (-3.0 - 1.64, 1.0, 1.6 + zc))
    k.cyl("cold_glass", 1.95, 1.6, center=(-3.0, 1.0, 1.6 + 13.6), segments=20)
    k.cyl("lantern", 0.5, 1.0, center=(-3.0, 1.0, 1.6 + 13.6), segments=10)
    k.cyl("white", 2.1, 0.3, center=(-3.0, 1.0, 1.6 + 14.55), segments=20, r2=0.3)
    k.cyl("white", 3.2, 2.2, center=(2.8, 0.2, 1.6 + 1.1), segments=20)                  # tambour du dôme
    k.sphere("white", 3.4, (2.8, 0.2, 1.6 + 2.2), subdivisions=2, squash=1.0)
    k.cyl("iron", 0.42, 3.6, axis="Z", center=(2.8, 0.2, 1.6 + 5.0), segments=10)        # la lunette qui pointe
    k.box("wood", (0.9, 0.1, 1.9), (2.8, face * 3.2, 1.6 + 0.95))
    k.box("iron", (0.3, 0.3, 7.0), (-0.5, -2.8, 1.6 + 3.5))                                # antenne
    k.cyl("steel", 1.5, 0.25, axis="Z", center=(-0.5, -2.8, 1.6 + 7.1), segments=16, r2=0.2)
    vs = k.cyl("steel", 1.3, 0.16, axis="Y", center=(4.6, -3.0, 1.6 + 2.6), segments=16)   # parabole
    k.box("iron", (0.2, 0.2, 2.4), (4.6, -3.0, 1.6 + 1.2))
    k.emit(part, "Z4_OBSERVATOIRE", "Observatory", p, yaw, M, role="hero")

    print(f"[haltes] {stage}: {len(made)} pièces dans {len(roots)} zones, {sum(build.tri_total(r) for r in roots.values())} triangles")
    return list(roots.values())


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
