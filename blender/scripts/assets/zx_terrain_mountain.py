"""Terrain · l'île entière (lib/route.landform), du fond de la mer au sommet, plus ses eaux.

Un champ de hauteur sur tout le monde (maille 2 m), l'empreinte de la route (plat sur sa largeur,
déblai à ~55° et remblai à ~37°, rien sous les ponts ni au-dessus du tunnel), le quai plat.
Les matières se fondent par couleurs de sommets, par bandes découpées sur le maillage :
- la mer (sable sombre en profondeur), la plage (sable → herbe en montant) ;
- l'herbe (roche chaude sur les pentes raides), le désert de la mesa (terre cuite, sable sur les
  dessus plats) ;
- la ligne de neige (neige tachetée) et la neige (roche froide qui affleure).
Les eaux : la mer (plan), le lac (disque), la rivière (ruban dans son chenal). Des affleurements
rocheux sur les pentes raides, jamais à portée de la route.

    run("assets/zx_terrain_mountain.py")["create"]()
"""
import math
import random

import bmesh
import bpy
from mathutils import Vector

from lib import build, materials, mesh, naming, probe, route
from lib import path as spline
from lib.rocks import rock_mass
from lib.shapes import bisect_z

ZONE, CATEGORY, BASE = "Z1_VOIE", "Terrain", "Mountain"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)  # Z1_Terrain_Mountain
BUCKET = 10.0
BEACH_Z = 2.3
CUTS = (route.SEA_Z - 0.3, BEACH_Z, route.SNOW_FROM, route.SNOW_TO)


def _noise(x, y):
    v = math.sin(0.61 * x + 0.35 * y) * math.cos(0.29 * x - 0.47 * y) + 0.6 * math.sin(0.9 * x - 1.1 * y + 0.7) + 0.5 * math.sin(-0.45 * x + 1.3 * y + 2.1)
    return 0.5 + v / 4.2


def _smooth(v, a, b):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


# ----------------------------------------------------------------------------- empreinte de la route
def _buckets(samples):
    b = {}
    for i, p in enumerate(samples):
        b.setdefault(int(math.floor(p.x / BUCKET)), []).append(i)
    return b


def _road_at(samples, buckets, x, y):
    """(distance 2D à la route, hauteur de la route au pied de la perpendiculaire, index)."""
    k = int(math.floor(x / BUCKET))
    best, best_d = None, 1e18
    for kk in (k - 1, k, k + 1):
        for i in buckets.get(kk, ()):
            p = samples[i]
            d = (p.x - x) ** 2 + (p.y - y) ** 2
            if d < best_d:
                best, best_d = i, d
    if best is None:
        return 1e9, 0.0, -1
    dist, z = math.sqrt(best_d), samples[best].z
    for j in (best - 1, best + 1):
        if 0 <= j < len(samples):
            a, b = samples[best], samples[j]
            ab = Vector((b.x - a.x, b.y - a.y))
            if ab.length_squared < 1e-9:
                continue
            t = max(0.0, min(1.0, ((x - a.x) * ab.x + (y - a.y) * ab.y) / ab.length_squared))
            dd = math.hypot(a.x + ab.x * t - x, a.y + ab.y * t - y)
            if dd < dist:
                dist, z = dd, a.z + (b.z - a.z) * t
    return dist, z, best


def _grid(d, x0, x1, y0, y1, cell):
    i_road = d["i_road"]
    samples = d["samples"][i_road:]
    buckets = _buckets(samples)
    # couverture de la colline sur l'axe de la route (sol naturel - route), par échantillon : la
    # décision "tunnel couvert ici" se prend sur l'axe, pas sommet par sommet (sinon une rive de la
    # route restait haute et l'autre creusée, et un pan de neige fermait la sortie)
    axis_cover = [route.ground_z(p.x, p.y, d) - p.z for p in samples]
    bm = bmesh.new()
    xs = [x0 + i * cell for i in range(int((x1 - x0) / cell))] + [x1]
    ys = [y0 + j * cell for j in range(int((y1 - y0) / cell))] + [y1]
    half = route.ROAD_W / 2
    grid = []
    for x in xs:
        col = []
        for y in ys:
            z = route.ground_z(x, y, d)
            dist, zr, idx = _road_at(samples, buckets, x, y)
            kind = route.span_kind(idx + i_road, d) if idx >= 0 else None
            # ponts : pas de remblai sous le tablier, et le sol ne remonte jamais au-dessus (plafond
            # 1,5 m sous la route dans l'emprise, fondu sur 3 m : au massif le pont était enterré) ;
            # tunnel : pas de déblai là où la colline couvre la route (plus de 4,8 m au-dessus), sinon
            # la tranchée d'accès au portail se creuse normalement
            covered = kind == "tunnel" and idx >= 0 and axis_cover[idx] > 4.8
            skip = kind == "bridge" or covered
            if covered and dist < half + 2.4:
                z = max(z, zr + 5.0)   # dans l'emprise de la voûte le sol reste au-dessus d'elle : rien ne la traverse
            if kind == "bridge" and dist < half + 0.4 + 3.0:
                cap = zr - 1.5
                t = max(0.0, (dist - half - 0.4) / 3.0)
                z = min(z, cap * (1 - t) + z * t)
            if dist < 500.0 and not skip and not (route._in_quay(x, y) and zr <= 0.01):
                flat = half + 0.4
                dz = zr - z
                blend = max(4.0, (1.3 if dz > 0 else 0.7) * abs(dz))   # remblai à ~37°, déblai à ~55°
                if dist < flat:
                    z = zr - 0.02
                elif dist < flat + blend:
                    t = (dist - flat) / blend
                    t = t * t * (3 - 2 * t)
                    z = (zr - 0.02) * (1 - t) + z * t
            col.append(bm.verts.new((x, y, z)))
        grid.append(col)
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            bm.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    # nappe ouverte : recalc peut l'orienter vers le bas (c'était le cas) ; on la veut vers le haut,
    # le glTF garde l'enroulement et les normales (le site coupe les faces arrière du sol)
    bm.normal_update()
    if sum(f.normal.z for f in bm.faces) < 0:
        for f in bm.faces:
            f.normal_flip()
        bm.normal_update()
    return bm, len(xs) * len(ys)


def _classify(c):
    """Bande de matière d'une face depuis son centre (x, y, z)."""
    if c.z < route.SEA_Z - 0.3:
        return "sea"
    if route.is_desert(c.x, c.y) and c.z > BEACH_Z:
        return "desert"
    if c.z < BEACH_Z:
        return "sand"
    if c.z < route.SNOW_FROM:
        return "grass"
    if c.z < route.SNOW_TO:
        return "snowline"
    return "snow"


def _split_bands(bm, cuts):
    """Coupe le maillage aux hauteurs `cuts` (frontières nettes des bandes par altitude) puis le
    répartit par matière (bandes par altitude ou par région)."""
    bm = bisect_z(bm, cuts)
    bm.faces.ensure_lookup_table()
    keys = ("sea", "sand", "grass", "desert", "snowline", "snow")
    bands = {}
    for key in keys:
        part = bm.copy()
        part.faces.ensure_lookup_table()
        kill = [f for f in part.faces if _classify(f.calc_center_median()) != key]
        bmesh.ops.delete(part, geom=kill, context="FACES")
        bands[key] = part
    bm.free()
    return bands


# ----------------------------------------------------------------------------- matières et peinture
def _materials():
    vt = materials.vertex_tinted_material
    M = {}
    M["sea"] = vt("MAT_ground_sea", "materials.sand", "materials.rock_dark", mix=0.4, roughness=1.0)
    M["sand"] = vt("MAT_ground_sand", "materials.grass", "materials.sand", mix=1.0, roughness=1.0)
    M["grass"] = vt("MAT_ground_grass", "materials.grass", "materials.rock_warm", mix=0.85, roughness=1.0)
    M["desert"] = vt("MAT_ground_desert", "materials.terracotta", "materials.sand", mix=0.7, roughness=1.0)
    M["snowline"] = vt("MAT_ground_snowline", "materials.snow", "materials.rock_cold", mix=1.0, roughness=0.95)
    M["snow"] = vt("MAT_ground_snow", "materials.snow", "materials.rock_cold", mix=0.9, roughness=0.95)
    M["outcrop"] = vt("MAT_outcrop_snow", "materials.snow", "materials.rock_cold", mix=1.0, roughness=0.95)
    M["outcrop_warm"] = materials.palette_material("materials.rock_dark", roughness=0.95)
    M["water"] = materials.water_material()
    # Le sol se voit toujours du dessus : faces arrière coupées (glTF doubleSided=false). Dans le
    # tunnel, la face du terrain qui ferme l'entrée n'est ainsi plus visible depuis l'intérieur.
    for key in ("sea", "sand", "grass", "desert", "snowline", "snow"):
        M[key][0].use_backface_culling = True
    return M


def _painters(road_dist):
    """t par sommet (0 = teinte, 1 = base) pour chaque bande, depuis (x, y, z) monde ; `road_dist`
    = distance à la route (lisière de terre battue le long de la chaussée)."""
    def verge(x, y):
        return 1.0 - 0.55 * (1.0 - _smooth(road_dist(x, y), 2.6, 6.0))

    def sea(x, y, z):         # sable clair près du rivage, sombre au large, herbiers par plaques
        return _smooth(z, -6.0, route.SEA_Z - 0.3) * (0.78 + 0.22 * route.fbm01(0.07 * x, 0.07 * y, 2, 31.0))

    def sand(x, y, z):        # plage : sable, puis l'herbe gagne (par plaques)
        return _smooth(z + 0.9 * (route.fbm01(0.12 * x, 0.12 * y, 2, 5.0) - 0.5), 1.2, BEACH_Z + 0.4)

    def grass(x, y, z):       # roche sur les pentes raides, herbe par plaques ailleurs, terre au bord de la route
        patches = 0.66 + 0.34 * route.fbm01(0.06 * x, 0.06 * y, 3, 17.0)
        return (1.0 - _smooth(route.slope(x, y), 0.55, 1.1)) * patches * verge(x, y)

    def desert(x, y, z):      # parois terre cuite, dessus sablés
        return _smooth(route.slope(x, y), 0.15, 0.6) * (0.85 + 0.15 * route.fbm01(0.1 * x, 0.1 * y, 2, 9.0))

    def snowline(x, y, z):
        return _smooth(z + 4.0 * (route.fbm01(0.1 * x, 0.1 * y, 2, 13.0) - 0.5), route.SNOW_FROM, route.SNOW_TO)

    def snow(x, y, z):        # roche froide sur les pentes raides, neige un peu tachetée
        return (1.0 - 0.9 * _smooth(route.slope(x, y), 0.9, 1.5)) * (0.92 + 0.08 * route.fbm01(0.15 * x, 0.15 * y, 2, 19.0))

    return {"sea": sea, "sand": sand, "grass": grass, "desert": desert, "snowline": snowline, "snow": snow}


# ----------------------------------------------------------------------------- eaux et rochers
def _water_meshes(d):
    """La mer (grille de 6 m), le lac (disque en anneaux), la rivière (ruban à trois files) : assez de
    sommets pour l'attribut de rivage (écume) et les vaguelettes du site."""
    w = route.WORLD
    sea = bmesh.new()
    cell = 6.0
    xs = [w["x0"] + i * cell for i in range(int((w["x1"] - w["x0"]) / cell))] + [w["x1"]]
    ys = [w["y0"] + j * cell for j in range(int((w["y1"] - w["y0"]) / cell))] + [w["y1"]]
    grid = [[sea.verts.new((x, y, route.SEA_Z)) for y in ys] for x in xs]
    for i in range(len(xs) - 1):
        for j in range(len(ys) - 1):
            sea.faces.new((grid[i][j], grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]))
    lake = bmesh.new()
    cx, cy, r = route.LAKE
    big = r + 3.0
    centre = lake.verts.new((cx, cy, route.LAKE_WATER_Z))
    rings = [[lake.verts.new((cx + big * f * math.cos(a), cy + big * f * math.sin(a), route.LAKE_WATER_Z)) for a in (2 * math.pi * k / 28 for k in range(28))]
             for f in (0.35, 0.7, 1.0)]
    for k in range(28):
        lake.faces.new((centre, rings[0][k], rings[0][(k + 1) % 28]))
        for ra, rb in zip(rings, rings[1:]):
            lake.faces.new((ra[k], rb[k], rb[(k + 1) % 28], ra[(k + 1) % 28]))
    river = bmesh.new()
    pts = route.river_samples()
    tangents = spline.tangents(pts)
    rights = spline.rights(tangents)
    a = [river.verts.new(p + rr * -2.8) for p, rr in zip(pts, rights)]
    m = [river.verts.new(p) for p in pts]
    b = [river.verts.new(p + rr * 2.8) for p, rr in zip(pts, rights)]
    for i in range(len(pts) - 1):
        river.faces.new((a[i], m[i], m[i + 1], a[i + 1]))
        river.faces.new((m[i], b[i], b[i + 1], m[i + 1]))
    for bm in (sea, lake, river):
        bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
        for f in bm.faces:
            if f.normal.z < 0:
                f.normal_flip()
    return sea, lake, river


def _darken_tunnels(objects, d, road_samples, road_buckets, i_road, factor=0.08):
    """Sous la voûte et au ras des portails (emprise de 4,8 m, une maille avant et après), le sol est
    peint sombre : la face du terrain qui ferme le portail se lit comme l'obscurité du tunnel, pas
    comme un mur de neige, pendant le mètre où la caméra est entre la bouche et cette face."""
    spans = [(i0, i1) for kind, i0, i1 in d["spans"] if kind == "tunnel"]
    if not spans:
        return 0
    n = 0
    for obj in objects:
        me = obj.data
        attr = me.color_attributes.get("Col")
        if attr is None:
            continue
        mw = obj.matrix_world
        for i, v in enumerate(me.vertices):
            w = mw @ v.co
            dist, _zr, idx = _road_at(road_samples, road_buckets, w.x, w.y)
            if idx < 0 or dist > 4.8:
                continue
            k = idx + i_road
            if any(i0 - 1 <= k <= i1 + 1 for i0, i1 in spans):
                c = attr.data[i].color
                attr.data[i].color = (c[0] * factor, c[1] * factor, c[2] * factor, c[3])
                n += 1
    return n


def _paint_water(obj, d, water_z=None):
    """Attribut Col des eaux, lu par le shader du site : B = 1 - 0,5 x rivage (1 au bord, écume),
    G = 1 - 0,35 x profondeur. Le matériau Blender le multiplie (eau un peu plus verte au bord et au
    large, acceptable) ; c'est ce qui le fait exporter en COLOR_0, et l'alpha n'est pas exporté.
    Pour la rivière, le rivage vient de la distance à son axe."""
    me = obj.data
    # un seul attribut couleur : sinon l'exporteur en fait COLOR_0 (blanc) et le nôtre COLOR_1, que le
    # shader du site ne lit pas
    for other in [a for a in me.color_attributes if a.name != "Col"]:
        me.color_attributes.remove(other)
    attr = me.color_attributes.get("Col") or me.color_attributes.new(name="Col", type="FLOAT_COLOR", domain="POINT")
    mw = obj.matrix_world
    for i, v in enumerate(me.vertices):
        w = mw @ v.co
        if water_z is None:
            shore, deep = _smooth(route.river_distance(w.x, w.y), 1.1, 2.7), 0.0
        else:
            depth = water_z - route.ground_z(w.x, w.y, d, detail=False)
            shore, deep = 1.0 - _smooth(depth, 0.05, 0.7), _smooth(depth, 0.8, 6.0)
        attr.data[i].color = (1.0, 1.0 - 0.35 * deep, 1.0 - 0.5 * shore, 1.0)   # l'exporteur perd l'alpha : rivage dans le bleu
    idx = me.color_attributes.find("Col")
    me.color_attributes.active_color_index = idx
    me.color_attributes.render_color_index = idx


def _outcrops(rnd, d, count=60):
    warm, cold = bmesh.new(), bmesh.new()
    placed = 0
    for _ in range(count * 10):
        if placed >= count:
            break
        x, y = rnd.uniform(-60.0, 330.0), rnd.uniform(-20.0, 300.0)
        sx, sy, sz = rnd.uniform(2.0, 5.0), rnd.uniform(1.5, 3.8), rnd.uniform(2.2, 5.5)
        z = probe.height(x, y)
        if z < route.SEA_Z + 1.0 or route.slope(x, y) < 0.9 or route.island_mask(x, y) < 0.9:
            continue
        if route.distance_to_road(x, y, d) < 7.0 + max(sx, sy) or route.distance_to_side_paths(x, y) < 4.0 + max(sx, sy):
            continue
        rock = rock_mass(rnd, (sx, sy, sz), subdivisions=1, jitter=0.18)
        rock.verts.ensure_lookup_table()
        rock.verts.index_update()
        rot = rnd.uniform(0, math.pi)
        target = cold if z > route.SNOW_TO else warm
        vs = [target.verts.new((0, 0, 0)) for _ in rock.verts]
        for v_src, v_dst in zip(rock.verts, vs):
            px, py = v_src.co.x, v_src.co.y
            v_dst.co = (px * math.cos(rot) - py * math.sin(rot) + x, px * math.sin(rot) + py * math.cos(rot) + y, v_src.co.z + z - sz * 0.2)
        for f in rock.faces:
            target.faces.new([vs[v.index] for v in f.verts])
        rock.free()
        placed += 1
    for b in (warm, cold):
        bmesh.ops.recalc_face_normals(b, faces=b.faces)
    return warm, cold, placed


def create(stage: str = "blockout", zone: str = ZONE, cell: float = 2.0, seed: int = 5) -> bpy.types.Object:
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = build.root_empty(ROOT, coll, size=2.0)
    M = _materials()
    d = route.build()
    i_road = d["i_road"]
    road_samples = d["samples"][i_road:]
    road_buckets = _buckets(road_samples)
    P = _painters(lambda x, y: _road_at(road_samples, road_buckets, x, y)[0])
    rnd = random.Random(seed)
    bm, n_verts = _grid(d, cell=cell, **route.WORLD)
    bands = _split_bands(bm, CUTS)
    names = {"sea": "Sea_Floor", "sand": "Sand", "grass": "Grass", "desert": "Desert", "snowline": "Snowline", "snow": "Snow"}
    band_objects = []
    for key, part in bands.items():
        if not part.faces:
            part.free()
            continue
        mat, top, bottom = M[key]
        obj = build.part(f"{ROOT}_{names[key]}", part, (0, 0, 0), root, coll, mat, bevel=0.0, smooth_angle=60, role="hero")
        mesh.paint_fn(obj, top, bottom, P[key])
        band_objects.append(obj)
    n_dark = _darken_tunnels(band_objects, d, road_samples, road_buckets, i_road)
    # la sonde du sol construit : tout ce qui se pose ensuite (arbres, rochers, haltes) l'interroge
    n_faces = probe.set_terrain(band_objects, fallback=lambda x, y: route.ground_z(x, y, d))
    sea, lake, river = _water_meshes(d)
    o = build.part(f"{ROOT}_Sea", sea, (0, 0, 0), root, coll, M["water"], bevel=0.0, smooth_angle=60, role="filler")
    _paint_water(o, d, route.SEA_Z)
    o = build.part(f"{ROOT}_Lake", lake, (0, 0, 0), root, coll, M["water"], bevel=0.0, smooth_angle=60, role="filler")
    _paint_water(o, d, route.LAKE_WATER_Z)
    o = build.part(f"{ROOT}_River", river, (0, 0, 0), root, coll, M["water"], bevel=0.0, smooth_angle=60, role="medium")
    _paint_water(o, d, None)
    warm, cold, n_rocks = _outcrops(rnd, d)
    if warm.faces:
        build.part(f"{ROOT}_Outcrops", warm, (0, 0, 0), root, coll, M["outcrop_warm"], bevel=0.0, smooth_angle=45, role="hero")
    else:
        warm.free()
    if cold.faces:
        mat, top, bottom = M["outcrop"]
        o = build.part(f"{ROOT}_Outcrops_Snow", cold, (0, 0, 0), root, coll, mat, bevel=0.0, smooth_angle=45, role="hero")
        # neige sur les faces tournées vers le ciel, roche froide sur les flancs
        mesh.paint_normal_fn(o, top, bottom, lambda x, y, z, nz: _smooth(nz, 0.3, 0.8) * _smooth(z, route.SNOW_FROM, route.SNOW_TO))
    else:
        cold.free()
    total = build.tri_total(root)
    print(f"[île] {stage}: {n_verts} sommets, {total} triangles, {n_rocks} affleurements, sonde {n_faces} faces, {n_dark} sommets sombres au tunnel, mer à {route.SEA_Z} m, neige {route.SNOW_FROM:.0f}→{route.SNOW_TO:.0f} m")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
