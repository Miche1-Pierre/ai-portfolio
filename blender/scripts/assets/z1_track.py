"""Z1 · Terrain · la piste (STORYTELLING §3.2 : la Voie), sur toute la route (lib/route.py).

La piste part du plancher du hangar (le rover y est garé, le voyage du site commence à l'intérieur :
points de la caméra d'intro exportés avec la spline), descend la rampe, longe le quai tout droit,
passe à droite du phare, attaque le flanc, fait ses lacets et monte jusqu'au sommet. Le terrain est
construit à part (assets/zx_terrain_mountain.py) depuis la même route ; ici : la surface de terre et
les ornières (dès le pied de rampe), les bordures de pierre et les lisses de bois côté vide, les
bornes datées des haltes, deux falaises en strates et des éboulis hors de la route. La spline et les
haltes sont exportées dans exports/z0-path.json : le rover et la caméra du site les suivent.

    g = run("assets/z1_track.py"); g["create"](); g["SAMPLES"]
"""
import math
import random

import bmesh
import bpy
from mathutils import Vector

from lib import build, materials, mesh, naming, probe, route
from lib import path as spline
from lib.rocks import cliff_layers, scree
from lib.shapes import add_box, rotate_about_z, add_box, add_cyl, bisect_z, box
from lib.terrain import TIDE_CUTS, TIDE_STOPS

ZONE, CATEGORY, BASE = "Z1_VOIE", "Terrain", "Piste"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)  # Z1_Terrain_Piste
LEVELS = {"blockout": 0, "details": 1, "polish": 2}

ROAD_W = route.ROAD_W
# Falaises en strates de Z1 : (x, y, enfoncement sous le sol), (demi-largeur X, demi-largeur Y,
# hauteur). Posées sur la pente, loin de la piste (elles ne la mordent plus).
CLIFFS_Z1 = (
    ((170.0, 232.0, 4.0), (12.0, 6.0, 14.0)),  # le bas du massif, à l'est
    ((28.0, 182.0, 4.0), (11.0, 6.0, 12.0)),   # le bas du massif, au sud-ouest
)
MILESTONES = ("borne-2023", "borne-2024", "borne-2025", "borne-dec-2025")
SAMPLES = []


# ----------------------------------------------------------------------------- bandes et bordures
def _strip(samples, rights, offset, width, lift=0.02, depth=0.0):
    """Bande posée sur la route (surface, ornière) ou, avec `depth`, petit muret extrudé (bordure)."""
    bm = bmesh.new()
    a = [bm.verts.new(p + r * (offset - width / 2) + Vector((0, 0, lift))) for p, r in zip(samples, rights)]
    b = [bm.verts.new(p + r * (offset + width / 2) + Vector((0, 0, lift))) for p, r in zip(samples, rights)]
    for i in range(len(samples) - 1):
        bm.faces.new((a[i], b[i], b[i + 1], a[i + 1]))
    if depth > 0:
        res = bmesh.ops.extrude_face_region(bm, geom=bm.faces[:])
        moved = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
        bmesh.ops.translate(bm, vec=(0, 0, -depth), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def _side_runs(rights, acc, from_s):
    """Suites d'indices où le côté vide reste le même (il change à chaque lacet)."""
    runs, start = [], None
    for i, (r, s) in enumerate(zip(rights, acc)):
        if s < from_s:
            continue
        sign = route.outer_sign(r)
        if start is None or sign != start[1]:
            if start is not None:
                runs.append((start[0], i, start[1]))
            start = (i, sign)
    if start is not None:
        runs.append((start[0], len(rights), start[1]))
    return runs


def _kerbs(part, M, samples, rights, acc, from_s):
    """Bordure de pierre côté vide, par tronçon."""
    for k, (i0, i1, sign) in enumerate(_side_runs(rights, acc, from_s)):
        if i1 - i0 < 3:
            continue
        part(f"Kerb_{k + 1}", _strip(samples[i0:i1], rights[i0:i1], sign * (ROAD_W / 2 + 0.12), 0.36, lift=0.14, depth=0.30),
             mat=M["berm"], bevel=0.0, smooth_angle=60)


def _tube(samples, rights, radius=4.4, steps=10):
    """Voûte de tunnel : demi-cercles autour de la route, reliés en quads, normales vers l'intérieur."""
    bm = bmesh.new()
    rings = []
    for p, r in zip(samples, rights):
        ring = []
        for k in range(steps + 1):
            a = math.pi * k / steps
            ring.append(bm.verts.new(p + r * (radius * math.cos(a)) + Vector((0, 0, radius * math.sin(a)))))
        rings.append(ring)
    for ra, rb in zip(rings, rings[1:]):
        for k in range(steps):
            bm.faces.new((ra[k], ra[k + 1], rb[k + 1], rb[k]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    for f in bm.faces:  # l'intérieur est ce qu'on voit
        f.normal_flip()
    return bm


def _mouth(p, r, outward, radius=4.3, steps=10):
    """Demi-disque fermant la voûte, orienté vers `outward` (une seule face, sombre)."""
    bm = bmesh.new()
    verts = [bm.verts.new(p + r * (radius * math.cos(math.pi * k / steps)) + Vector((0, 0, radius * math.sin(math.pi * k / steps))))
             for k in range(steps + 1)]
    f = bm.faces.new(verts)  # le demi-cercle part et revient au niveau de la route
    bm.normal_update()
    if f.normal.dot(Vector(outward)) < 0:
        f.normal_flip()
    return bm


def _portal(p, into, r, radius=4.6, outer=6.7, thick=1.4, steps=10):
    """Portail de tunnel : bandeau d'arc en roche (anneau de `radius` à `outer`, du sol au sol), épais
    de `thick` vers l'intérieur de la colline (`into`), face avant 20 cm devant le bord de la voûte ;
    une clé de voûte en saillie. Pas de grand mur plat : la colline fait le reste."""
    bm = bmesh.new()
    up = Vector((0.0, 0.0, 1.0))

    def ring(offset, rad):
        base = p + into * offset
        return [bm.verts.new(base + r * (rad * math.cos(math.pi * k / steps)) + up * (rad * math.sin(math.pi * k / steps))) for k in range(steps + 1)]

    fi, fo = ring(-0.2, radius), ring(-0.2, outer)
    bi, bo = ring(thick, radius), ring(thick, outer)
    for k in range(steps):
        bm.faces.new((fi[k], fi[k + 1], fo[k + 1], fo[k]))
        bm.faces.new((bo[k], bo[k + 1], bi[k + 1], bi[k]))
        bm.faces.new((fo[k], fo[k + 1], bo[k + 1], bo[k]))
        bm.faces.new((fi[k + 1], fi[k], bi[k], bi[k + 1]))
    for k in (0, steps):
        bm.faces.new((fi[k], fo[k], bo[k], bi[k]))
    # clé de voûte
    top = p + up * (outer - 0.3)
    vs = add_box(bm, (1.1, 1.4, 1.5), (0.0, 0.0, 0.0))
    ang = math.degrees(math.atan2(into.y, into.x))
    rotate_about_z(bm, vs, ang)
    bmesh.ops.translate(bm, vec=(top.x + into.x * 0.45, top.y + into.y * 0.45, top.z), verts=vs)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def _snow_banks(part, M, samples, rights, d):
    """Congères de déneigement des deux côtés de la chaussée au-dessus de la ligne de neige (hors
    ponts et tunnel) : un bourrelet arrondi de 55 cm."""
    def keep(i):
        return samples[i].z >= route.SNOW_FROM + 1.0 and route.span_kind(i, d) is None

    runs, start = [], None
    for i in range(len(samples) + 1):
        ok = i < len(samples) and keep(i)
        if ok and start is None:
            start = i
        if not ok and start is not None:
            if i - start > 3:
                runs.append((start, i))
            start = None
    h = ROAD_W / 2
    bm = bmesh.new()
    for i0, i1 in runs:
        for side in (-1, 1):
            rows = []
            for p, r in zip(samples[i0:i1], rights[i0:i1]):
                rr = r * side
                rows.append((bm.verts.new(p + rr * (h + 0.2) + Vector((0, 0, 0.06))),
                             bm.verts.new(p + rr * (h + 0.75) + Vector((0, 0, 0.55))),
                             bm.verts.new(p + rr * (h + 1.6) + Vector((0, 0, 0.1)))))
            for (a0, b0, c0), (a1, b1, c1) in zip(rows, rows[1:]):
                bm.faces.new((a0, a1, b1, b0))
                bm.faces.new((b0, b1, c1, c0))
    if not bm.faces:
        bm.free()
        return
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.normal_update()
    if sum(f.normal.z for f in bm.faces) < 0:
        for f in bm.faces:
            f.normal_flip()
    part("SnowBanks", bm, mat=M["snow"], bevel=0.0, smooth_angle=60, role="medium")


SIGNS = ("phare", "borne-2023", "borne-2024", "borne-2025", "poste-de-controle", "borne-dec-2025", "gare", "maisons", "auberge", "atelier", "col-neige", "observatoire", "bout")


def _signposts(part, M, d):
    """Un poteau indicateur de bois quatre mètres avant chaque halte, deux flèches, côté montagne."""
    posts, boards = bmesh.new(), bmesh.new()
    for name in SIGNS:
        p, yaw = route.pose_at_station(name, back=ROAD_W / 2 + 1.5, along=-4.0, data=d)
        z = probe.height(p.x, p.y)
        add_box(posts, (0.13, 0.13, 2.5), (p.x, p.y, z + 1.15))
        for zz, ang in ((2.15, 0.45), (1.8, -0.35)):
            vs = add_box(boards, (0.95, 0.05, 0.26), (0.45, 0.0, 0.0))
            rotate_about_z(boards, vs, math.degrees(yaw + ang))
            bmesh.ops.translate(boards, vec=(p.x, p.y, z + zz), verts=vs)
    part("Signposts", posts, mat=M["wood"], bevel=0.01, role="filler")
    part("SignBoards", boards, mat=M["plaster"], bevel=0.01, role="filler")


def _spans(part, M, d, samples, rights):
    """Ponts : tablier plein sous la route et garde-corps des deux côtés ; tunnel : voûte de roche,
    portails de pierre, nervures, lampes (positions renvoyées pour les lumières du site)."""
    lamps = []
    for kind, i0, i1 in d["spans"]:
        seg, seg_r = samples[i0:i1 + 1], rights[i0:i1 + 1]
        if len(seg) < 2:
            continue
        if kind == "bridge":
            part(f"Bridge_Deck_{i0}", _strip(seg, seg_r, 0.0, ROAD_W + 0.6, lift=-0.04, depth=0.9), mat=M["berm"], bevel=0.0, smooth_angle=60)
            for side in (-1, 1):
                part(f"Bridge_Rail_{i0}_{side + 1}", _strip(seg, seg_r, side * (ROAD_W / 2 + 0.2), 0.14, lift=1.05, depth=1.1), mat=M["wood"], bevel=0.0, smooth_angle=60)
        else:
            # La voûte dépasse de 3 m de chaque côté du portail ; à 1 m du bord, un demi-disque sombre
            # ferme la bouche vue de l'extérieur (l'obscurité du tunnel) et masque la face du terrain.
            # Vu de l'intérieur, il est coupé (face arrière), on voit dehors.
            t0 = (seg[1] - seg[0]).normalized()
            t1 = (seg[-1] - seg[-2]).normalized()
            ext = [seg[0] - t0 * 3.0] + list(seg) + [seg[-1] + t1 * 3.0]
            ext_r = [seg_r[0]] + list(seg_r) + [seg_r[-1]]
            part(f"Tunnel_{i0}", _tube(ext, ext_r), mat=M["rock_dark"], bevel=0.0, smooth_angle=45)
            # juste devant la face du terrain qui ferme le portail (peinte sombre par le terrain) : la caméra
            # de poursuite ne reste qu'un mètre entre la bouche et cette face
            part(f"Tunnel_Mouth_{i0}_0", _mouth(seg[0] - t0 * 1.2, seg_r[0], -t0), mat=M["dark"], bevel=0.0, smooth_angle=45)
            part(f"Tunnel_Mouth_{i0}_2", _mouth(seg[-1] + t1 * 1.2, seg_r[-1], t1), mat=M["dark"], bevel=0.0, smooth_angle=45)
            part(f"Tunnel_Portal_{i0}_0", _portal(seg[0], t0, seg_r[0]), mat=M["rock_dark"], bevel=0.0, smooth_angle=30)
            part(f"Tunnel_Portal_{i0}_2", _portal(seg[-1], -t1, seg_r[-1]), mat=M["rock_dark"], bevel=0.0, smooth_angle=30)
            for i in range(i0 + 2, i1 - 1, 2):
                tt = (samples[i + 1] - samples[i - 1]).normalized()
                part(f"Tunnel_Rib_{i}", _tube([samples[i] - tt * 0.22, samples[i] + tt * 0.22], [rights[i], rights[i]], radius=4.15), mat=M["rock_dark"], bevel=0.0, smooth_angle=45, role="medium")
            lamps_bm = bmesh.new()
            for i in range(i0 + 2, i1 - 1, 3):
                q = samples[i] + rights[i] * 3.25 + Vector((0, 0, 3.1))
                add_box(lamps_bm, (0.36, 0.22, 0.16), tuple(q))
                lamps.append([round(q.x, 2), round(q.y, 2), round(q.z, 2)])
            part(f"Tunnel_Lamps_{i0}", lamps_bm, mat=M["lamp"], bevel=0.0, role="filler")
    return lamps


def _barriers(part, M, samples, rights, tangents, acc, every=4.0, from_s=52.0, d=None):
    """Poteaux et lisses de bois sur le bord côté vide, dès que la piste monte. Un seul maillage pour
    les poteaux, un seul pour les lisses (des centaines de mètres de piste : pas un objet par lisse).
    Rien sur les ponts ni dans le tunnel."""
    posts = []
    next_s = from_s
    for i, (p, r, t, s) in enumerate(zip(samples, rights, tangents, acc)):
        if s < next_s or (d is not None and route.in_span(i, None, d)):
            continue
        next_s = s + every
        sign = route.outer_sign(r)
        edge = p + r * sign * (ROAD_W / 2 + 0.25)
        posts.append((edge, math.atan2(t.y, t.x), sign))
    bm = bmesh.new()
    for edge, yaw, _ in posts:
        vs = add_box(bm, (0.16, 0.16, 1.0), (0, 0, 0.5))
        for v in vs:
            x, y = v.co.x, v.co.y
            v.co = (x * math.cos(yaw) - y * math.sin(yaw) + edge.x, x * math.sin(yaw) + y * math.cos(yaw) + edge.y, v.co.z + edge.z)
    part("BarrierPosts", bm, mat=M["wood"], bevel=0.01, segments=1, role="hero")
    bm = bmesh.new()
    for (a, _, side_a), (b, _, side_b) in zip(posts, posts[1:]):
        if side_a != side_b or (b - a).length > every * 1.8:
            continue  # au lacet le bord extérieur change de côté : pas de lisse en travers de la route
        for h in (0.45, 0.9):
            pa, pb = a + Vector((0, 0, h)), b + Vector((0, 0, h))
            d = pb - pa
            quat = d.normalized().to_track_quat("Z", "Y")
            mid = (pa + pb) / 2
            vs = add_cyl(bm, 0.05, d.length, axis="Z", center=(0, 0, 0), segments=6)
            for v in vs:
                v.co = quat @ v.co + mid
    part("BarrierRails", bm, mat=M["wood"], bevel=0.0, role="hero")


def _milestone(part, M, index, samples, rights, acc, s):
    """Borne blanche à chapeau terre cuite, côté montagne, à une halte datée."""
    i = min(range(len(acc)), key=lambda k: abs(acc[k] - s))
    p, r = samples[i], rights[i]
    inner = p - r * route.outer_sign(r) * (ROAD_W / 2 + 0.7)
    part(f"Milestone_{index}", box((0.36, 0.30, 0.95), (0, 0, 0.475)), tuple(inner), mat=M["plaster"], bevel=0.03, segments=2, role="filler")
    part(f"MilestoneCap_{index}", box((0.38, 0.32, 0.26), (0, 0, 1.08)), tuple(inner), mat=M["cap"], bevel=0.03, segments=2, role="filler")
    part(f"MilestonePlate_{index}", box((0.02, 0.22, 0.18), (-0.18, 0, 0.7)), tuple(inner), mat=M["iron"], bevel=0.003, segments=1, role="filler")


# ----------------------------------------------------------------------------- matériaux
def _materials(level):
    pm, vt = materials.palette_material, materials.vertex_tinted_material
    M = {
        "track": None,  # rempli plus bas : terre qui s'enneige (couleurs par sommets)
        "rut": pm("materials.rock_dark", roughness=1.0),
        "berm": pm("materials.stone_quay", roughness=0.95),
        "wood": pm("materials.wood_dark", roughness=0.9),
        "plaster": pm("materials.plaster", roughness=0.9),
        "cap": pm("materials.terracotta", roughness=0.85),
        "iron": pm("materials.iron_dark", roughness=0.8, metallic=0.3),
        "dust": {},
    }
    track, top, bottom = vt("MAT_track_snow", "materials.snow", "materials.dirt_track", mix=1.0, roughness=1.0)
    M["track"] = track
    M["dust"][track.name] = (top, bottom, [(route.SNOW_FROM, 0.0), (route.SNOW_TO, 1.0)])
    sand, top, bottom = vt("MAT_track_sand", "materials.dirt_track", "materials.sand", mix=0.75, roughness=1.0)
    M["track_sand"] = sand  # sable tassé sur le fond de la mer, terre en arrivant au rivage
    M["dust"][sand.name] = (top, bottom, [(0.5, 0.0), (3.0, 1.0)])
    rock, top, bottom = vt("MAT_rock_tide", "materials.rock_warm", "materials.rock_dark", mix=0.5, roughness=0.95)
    M["rock"] = rock
    M["dust"][rock.name] = (top, bottom, TIDE_STOPS)
    rock_dark, top, bottom = vt("MAT_rockdark_tide", "materials.rock_dark", "materials.charcoal", mix=0.45, roughness=0.95)
    M["rock_dark"] = rock_dark
    M["dust"][rock_dark.name] = (top, bottom, TIDE_STOPS)
    # Bouche de tunnel : presque opaque (on devine le rover qui s'enfonce dans le noir), une seule face.
    dark = pm("materials.charcoal", roughness=1.0, name="MAT_tunnel_mouth")
    bsdf = next(n for n in dark.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Alpha"].default_value = 0.86
    for attr, value in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND"), ("use_backface_culling", True)):
        try:
            setattr(dark, attr, value)
        except (AttributeError, TypeError):
            pass
    M["dark"] = dark
    M["stone"] = pm("materials.stone_quay", roughness=0.95)
    M["snow"] = pm("materials.snow", roughness=0.95)
    M["lamp"] = pm("materials.brass", roughness=0.4, emission="#ffd9a0", emission_strength=6.0, name="MAT_tunnel_lamp")
    return M


def create(stage: str = "blockout", zone: str = ZONE, seed: int = 21) -> bpy.types.Object:
    global SAMPLES
    level = LEVELS[stage]
    rnd = random.Random(seed)
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = build.root_empty(ROOT, coll, size=2.0)
    M = _materials(level)
    P = f"{ROOT}_"

    def part(name, bm, pivot=(0, 0, 0), mat=None, **kw):
        kw.setdefault("role", "hero")
        return build.part(P + name, bm, pivot, root, coll, mat or M["track"], **kw)

    d = route.build()
    samples, tangents, rights, acc, legs = d["samples"], d["tangents"], d["rights"], d["acc"], d["legs"]
    SAMPLES = samples
    i_road = d["i_road"]
    s_road = acc[i_road]
    s_climb = route.station_s("borne-2025", d)  # bordures et lisses dès la forêt (rien sur le sable)

    def to_road(x, y):
        """Distance 2D à la route."""
        return route.distance_to_road(x, y, d)

    def runs(keep):
        """Suites d'indices consécutifs (depuis le pied de rampe) où `keep(sample)` est vrai."""
        out, start = [], None
        for i in range(i_road, len(samples) + 1):
            ok = i < len(samples) and keep(samples[i])
            if ok and start is None:
                start = i
            if not ok and start is not None:
                if i - start > 2:
                    out.append((start, i))
                start = None
        return out

    # Surface : sable tassé sur le fond de la mer, terre ensuite (qui s'enneige en haut) ; ornières ;
    # bordures et lisses ; bornes datées ; chemins secondaires de la forêt
    for k, (i0, i1) in enumerate(runs(lambda p: p.z < 2.3)):
        part(f"RoadSand_{k + 1}", _strip(samples[i0:i1], rights[i0:i1], 0.0, ROAD_W - 0.2, lift=0.05), mat=M["track_sand"], bevel=0.0, smooth_angle=60)
    for k, (i0, i1) in enumerate(runs(lambda p: p.z >= 2.3)):
        part(f"RoadSurface_{k + 1}", _strip(samples[i0:i1], rights[i0:i1], 0.0, ROAD_W - 0.2, lift=0.05), mat=M["track"], bevel=0.0, smooth_angle=60)
    for k in range(len(route.SIDE_PATHS)):
        side = [Vector((p.x, p.y, probe.height(p.x, p.y) + 0.12)) for p in route.side_path_samples(k, per_segment=24)]
        side_rights = spline.rights(spline.tangents(side))
        part(f"SidePath_{k + 1}", _strip(side, side_rights, 0.0, 2.0, lift=0.0), mat=M["track"], bevel=0.0, smooth_angle=60, role="medium")
    # Les ornières de terre s'arrêtent à la ligne de neige : dans la neige, ce sont les traces du rover
    # (dessinées par le site derrière lui) qui marquent la chaussée.
    for j, off in enumerate((-0.75, 0.75)):
        for k, (i0, i1) in enumerate(runs(lambda p: p.z < route.SNOW_FROM + 2.0)):
            part(f"Rut_{j + 1}_{k + 1}", _strip(samples[i0:i1], rights[i0:i1], off, 0.35, lift=0.08), mat=M["rut"], bevel=0.0, smooth_angle=60)
    _kerbs(part, M, samples, rights, acc, from_s=s_climb)
    _barriers(part, M, samples, rights, tangents, acc, from_s=route.station_s("atelier", d) + 40.0, d=d)
    lamps = _spans(part, M, d, samples, rights)
    _snow_banks(part, M, samples, rights, d)
    _signposts(part, M, d)
    for k, station in enumerate(MILESTONES):
        _milestone(part, M, k + 1, samples, rights, acc, route.station_s(station, d) + 4.0)

    # Falaises en strates posées sur la pente, éboulis hors de la route : côté vide sous la piste
    # basse, et sur la pente entre les deux tronçons de la tranche verticale
    for i, ((x, y, sink), scale) in enumerate(CLIFFS_Z1):
        pos = (x, y, probe.height(x, y) - sink)
        part(f"Cliff_{i + 1}", bisect_z(cliff_layers(rnd, pos, scale), TIDE_CUTS), mat=M["rock"] if i == 0 else M["rock_dark"], bevel=0.35, segments=2)
    # Un galet fait jusqu'à 2,3 m de rayon : on le tient à plus de 2,6 m du bord de la route
    clear = lambda x, y: to_road(x, y) > ROAD_W / 2 + 2.6 and route.distance_to_side_paths(x, y) > 3.4
    ground = lambda x, y: probe.height(x, y)
    part("Scree_Massif", scree(rnd, (100.0, 200.0), lambda x: 212.0 + 0.37 * (x - 78.0), 16, ground=ground, max_slope=0.8, accept=clear), mat=M["rock_dark"], bevel=0.0, smooth_angle=55)
    part("Scree_Canyon", scree(rnd, (246.0, 286.0), lambda x: 214.0 - 1.4 * (x - 272.0) + 9.0, 10, ground=ground, max_slope=0.8, accept=clear), mat=M["rock"], bevel=0.0, smooth_angle=55)

    parts = [o for o in root.children_recursive if o.type == "MESH"]
    for obj in parts:
        for slot in obj.data.materials:
            if slot is not None and slot.name in M["dust"]:
                top, bottom, stops = M["dust"][slot.name]
                mesh.paint_stops(obj, top, stops, bottom)

    extras = {
        "intro": {"camera": [list(p) for p in route.CAMERA_INTRO], "handover_s": round(s_road + route.INTRO_HANDOVER, 2)},
        "snow": {"from": route.SNOW_FROM, "z": route.SNOW_Z, "to": route.SNOW_TO},
        "camera_side": route.camera_sides(d),
        "tunnels": [[round(acc[i0], 1), round(acc[i1], 1)] for kind, i0, i1 in d["spans"] if kind == "tunnel"],
        "tunnel_lamps": lamps,
        "side_paths": [[[round(p.x, 1), round(p.y, 1)] for p in route.side_path_samples(k, per_segment=6)] for k in range(len(route.SIDE_PATHS))],
    }
    out = spline.export_json(samples, route.stations_json(d), "z0-path", extras=extras)
    total = build.tri_total(root)
    print(f"[piste] {stage}: {len(parts)} pièces, {total} triangles, {acc[-1]:.0f} m de piste, {len(legs)} tronçons, spline -> {out.name}")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
