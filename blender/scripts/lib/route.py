"""L'île et la route qui en fait le tour (STORYTELLING v0.6, « une vraie carte »).

Le relief est DESSINÉ (`landform`) par plaques : le fond de la mer (dunes), une plaine côtière qui
monte doucement vers l'intérieur, des collines boisées, le bassin du lac, la terrasse du village
et ses champs, la mesa du désert (plateau à parois raides), le massif enneigé, la crête du phare
au-dessus du port. Une rivière descend du massif à la mer par la forêt (chenal creusé). La mer est
un plan à `SEA_Z`. La route est tracée en plan et prend l'altitude du relief (lissée) ; à travers la
mesa elle garde l'altitude de la plaine : le terrain se creuse en canyon autour d'elle. Deux ponts
(le terrain n'est pas remblayé sous eux) et un tunnel (le terrain n'est pas creusé au-dessus).

    from lib import route
    d = route.build()                 # samples, tangents, rights, acc, legs, i_road, spans
    z = route.ground_z(x, y)          # relief (sans l'empreinte de la route)
    s = route.station_s("gare")
"""
import math

from mathutils import Vector
from mathutils import noise as mnoise

from . import path as spline
from .terrain import QUAY_BACK_Y, QUAY_X, dune

ROAD_W = 4.2
SEA_Z = -2.0                                    # niveau de la mer (le quai est à 0, le sable à -3,6)
SNOW_FROM, SNOW_Z, SNOW_TO = 32.0, 36.0, 40.0   # la neige, seulement sur le massif
WORLD = dict(x0=-80.0, x1=340.0, y0=-80.0, y1=320.0)
ROAD_LIFT = 0.35

# La rivière (du massif à la mer), le lac, la mesa
RIVER = [(92.0, 238.0), (99.0, 220.0), (102.0, 200.0), (105.0, 172.0), (112.0, 142.0), (122.0, 112.0), (132.0, 90.0), (138.0, 62.0), (134.0, 34.0), (128.0, 10.0), (128.0, -14.0)]
LAKE = (198.0, 90.0, 26.0)                      # centre, rayon
LAKE_WATER_Z = 2.6
MESA = (225.0, 305.0, 165.0, 255.0)             # x0, x1, y0, y1
MESA_Z = 22.0
# La crête que le tunnel traverse, dans le repère de la route : centre, direction de la route, plateau
# puis pied le long de la route (m : pleine hauteur jusqu'à 4 m du centre, nulle à 10 m, donc zéro sous
# le pont voisin), sigma en travers, hauteur. Les portails tombent ainsi dans une vraie paroi.
SPUR = ((85.5, 206.0), (-0.949, -0.316), 4.0, 10.0, 18.0, 16.0)

# Points de contrôle (monde). z = None : l'altitude vient du relief ; z fixé : la route garde cette
# altitude et le terrain se creuse ou se remblaie autour (canyon de la mesa).
PATH = [
    # Z0 · hangar, rampe, quai (hauteurs fixes)
    (0.3, -0.35, 0.52), (2.0, -0.35, 0.52), (3.3, -0.45, 0.30), (4.7, -0.6, 0.0),
    (12.0, -0.5, 0.0), (22.0, -0.3, 0.0), (32.0, -0.1, 0.0), (42.0, 0.0, 0.0), (50.0, -0.8, 0.0),
    # la plage : la crique (route au ras de la plage, le sable se creuse un peu autour), les épaves dans
    # les hauts-fonds, le pont sur l'embouchure de la rivière
    (58.0, -1.5, 0.8), (68.0, -2.5, 1.8), (80.0, -3.5, 2.6), (94.0, -3.5, None), (108.0, -2.0, None),
    (122.0, 0.0, None), (134.0, 2.0, None),
    # la forêt et les collines, en lacets, à l'est de la rivière
    (142.0, 8.0, None), (150.0, 18.0, None), (156.0, 30.0, None), (150.0, 42.0, None), (144.0, 54.0, None),
    (150.0, 66.0, None), (162.0, 74.0, None),
    # le lac (rive sud puis est), la cabane
    (176.0, 68.0, None), (192.0, 62.0, None), (212.0, 66.0, None), (226.0, 82.0, None), (228.0, 100.0, None),
    # le village et ses champs, vers la mesa
    (236.0, 116.0, None), (250.0, 126.0, None), (266.0, 134.0, None), (282.0, 142.0, None),
    (290.0, 158.0, 8.5), (288.0, 176.0, 8.5),
    # le canyon à travers la mesa (la route garde l'altitude de la plaine jusqu'au-delà du rebord)
    (282.0, 196.0, 8.5), (272.0, 214.0, 8.5), (258.0, 226.0, 8.5), (244.0, 238.0, 8.0), (236.0, 242.0, 7.8),
    (220.0, 248.0, 7.5),
    # le massif : profil de route fixé (15 % en moyenne), le terrain se creuse en corniche ou se remblaie ;
    # le pont sur la rivière, le tunnel sous l'éperon
    (206.0, 252.0, 11.0), (186.0, 254.0, 15.0), (172.0, 262.0, 19.0), (156.0, 266.0, 23.0), (142.0, 258.0, 26.5),
    (132.0, 246.0, 30.0), (124.0, 234.0, 33.0), (116.0, 224.0, 36.0), (108.0, 216.0, 38.0), (100.0, 212.0, 39.0),
    (94.0, 210.0, 39.5), (78.0, 205.0, 41.0),
    # les lacets du sommet jusqu'à l'observatoire
    (64.0, 204.0, 42.0), (52.0, 206.0, 42.5), (40.0, 214.0, 43.5), (34.0, 226.0, 45.5), (38.0, 238.0, 48.0),
    (48.0, 246.0, 50.5), (60.0, 250.0, 52.0),
    # la descente vers la crête du phare, au-dessus du port : le bout
    (46.0, 258.0, 50.0), (30.0, 262.0, 47.5), (14.0, 258.0, 43.0), (2.0, 248.0, 38.0), (-8.0, 234.0, 33.5),
    (-16.0, 218.0, 29.0), (-22.0, 202.0, 25.5), (-26.0, 186.0, 23.5), (-28.0, 170.0, 22.5), (-28.0, 154.0, 22.0),
    (-28.0, 140.0, 21.5),
]

STATIONS = [
    ("garage", (0.3, -0.35)),
    ("sortie", (4.7, -0.6)),
    ("phare", (42.0, 0.0)),
    ("borne-2023", (68.0, -2.5)),         # la plage
    ("borne-2024", (94.0, -3.5)),         # la crique, les épaves
    ("borne-2025", (150.0, 42.0)),        # la forêt
    ("poste-de-controle", (150.0, 66.0)), # la sortie de la forêt
    ("borne-dec-2025", (228.0, 100.0)),   # la cabane au bord du lac
    ("gare", (236.0, 116.0)),
    ("maisons", (250.0, 126.0)),
    ("auberge", (266.0, 134.0)),
    ("atelier", (272.0, 214.0)),          # dans le canyon
    ("col-neige", (124.0, 234.0)),        # le flanc du massif, la neige
    ("observatoire", (60.0, 250.0)),      # le sommet
    ("bout", (-28.0, 140.0)),             # la crête du phare
]
ROAD_FROM = (4.7, -0.6)
# Travées : ponts (pas de remblai sous la route) et tunnel (pas de déblai au-dessus)
SPANS = [
    ("bridge", (120.0, 0.0), (136.0, 2.5)),
    ("bridge", (106.0, 215.0), (95.0, 210.5)),
    ("tunnel", (93.0, 210.0), (78.0, 205.0)),
]
# Chemins secondaires de la forêt (« plusieurs chemins »), posés sur le relief
_PATH_XY = [(x, y) for x, y, _ in PATH]

SIDE_PATHS = [
    [(150.0, 18.0), (160.0, 26.0), (166.0, 38.0), (150.0, 42.0)],
    [(144.0, 54.0), (156.0, 52.0), (166.0, 60.0), (162.0, 74.0)],
]
CAMERA_INTRO = [(-1.8, -2.25, 2.5), (0.6, -1.85, 2.3), (2.4, -0.9, 2.1), (5.5, -2.2, 2.9)]
INTRO_HANDOVER = 9.0

_cache: dict = {}


# ----------------------------------------------------------------------------- outils
def _smooth(v, a, b):
    t = max(0.0, min(1.0, (v - a) / (b - a)))
    return t * t * (3 - 2 * t)


def _fbm(x, y, octaves=3, seed=0.0):
    """Bruit fractal (Perlin de mathutils, rapide) dans [-1, 1] environ : le petit relief, les
    patchs d'herbe, la côte. `seed` décale le champ."""
    amp, total, norm, f = 1.0, 0.0, 0.0, 1.0
    for _ in range(octaves):
        total += amp * mnoise.noise(Vector((x * f + seed, y * f - 0.7 * seed, 0.37 * seed)))
        norm += amp
        amp *= 0.5
        f *= 2.05
    return total / norm


def fbm01(x, y, octaves=3, seed=0.0):
    """Le même bruit ramené dans [0, 1]."""
    return max(0.0, min(1.0, 0.5 + 0.7 * _fbm(x, y, octaves, seed)))


def _gauss(x, y, cx, cy, sx, sy):
    return math.exp(-(((x - cx) / sx) ** 2 + ((y - cy) / sy) ** 2))


def _box(x, y, x0, x1, y0, y1, edge):
    return _smooth(x, x0 - edge, x0 + edge) * (1 - _smooth(x, x1 - edge, x1 + edge)) * _smooth(y, y0 - edge, y0 + edge) * (1 - _smooth(y, y1 - edge, y1 + edge))


def polyline_distance(pts, x, y):
    best = 1e9
    for (ax, ay), (bx, by) in zip(pts, pts[1:]):
        abx, aby = bx - ax, by - ay
        l2 = abx * abx + aby * aby
        t = 0.0 if l2 < 1e-9 else max(0.0, min(1.0, ((x - ax) * abx + (y - ay) * aby) / l2))
        best = min(best, math.hypot(ax + abx * t - x, ay + aby * t - y))
    return best


# ----------------------------------------------------------------------------- l'île
def _ellipse(x, y, cx, cy, rx, ry):
    return ((x - cx) / rx) ** 4 + ((y - cy) / ry) ** 4


def island_u(x, y):
    """« Distance » super-elliptique au rivage : < 1 dans l'île. Trois masses : l'île principale, le
    massif au nord, la mesa au nord-est ; un léger bruit rend la côte irrégulière."""
    u = min(_ellipse(x, y, 150.0, 95.0, 190.0, 105.0), _ellipse(x, y, 80.0, 235.0, 120.0, 80.0), _ellipse(x, y, 265.0, 205.0, 72.0, 72.0))
    wobble = 0.10 * math.sin(0.05 * x + 1.0) * math.cos(0.04 * y - 0.5)
    # baies et pointes (bruit), atténuées près de la route pour ne pas la noyer
    wobble += 0.22 * _fbm(0.02 * x, 0.02 * y, 2, 23.0) * _smooth(polyline_distance(_PATH_XY, x, y), 14.0, 34.0)
    return u + wobble


def island_mask(x, y):
    return 1.0 - _smooth(island_u(x, y), 0.85, 1.15)


def mesa_mask(x, y):
    return _box(x, y, *MESA, edge=7.0)


def is_desert(x, y):
    return mesa_mask(x, y) > 0.5


def river_distance(x, y):
    return polyline_distance(RIVER, x, y)


def spur_height(x: float, y: float) -> float:
    (cx, cy), (ux, uy), a0, a1, sv, h = SPUR
    dx, dy = x - cx, y - cy
    u = dx * ux + dy * uy
    v = -dx * uy + dy * ux
    return h * (1.0 - _smooth(abs(u), a0, a1)) * math.exp(-0.5 * (v / sv) ** 2)


def landform(x: float, y: float, detail: bool = True, spur: bool = True) -> float:
    """Le relief de l'île (voir l'en-tête)."""
    u = island_u(x, y)
    m = 1.0 - _smooth(u, 0.85, 1.15)
    inner = 1.0 - _smooth(u, 0.45, 1.05)
    plain = 2.0 + 4.0 * inner
    hills = (9.0 * _gauss(x, y, 140, 45, 30, 26) + 7.0 * _gauss(x, y, 175, 25, 26, 20) + 7.0 * _gauss(x, y, 120, 80, 22, 20)
             + 6.0 * _gauss(x, y, 185, 70, 20, 18) + 6.0 * _gauss(x, y, 160, 110, 26, 22))
    mesa = MESA_Z * mesa_mask(x, y)
    mountain = (50.0 * _gauss(x, y, 70, 250, 90, 70) + 6.0 * _gauss(x, y, 140, 215, 35, 30)
                + 16.0 * _gauss(x, y, -20, 140, 30, 45) + 10.0 * _gauss(x, y, 20, 190, 40, 35))
    if spur:
        mountain += spur_height(x, y)
    land = plain + hills + mesa + mountain
    terrace = _box(x, y, 215.0, 295.0, 95.0, 150.0, edge=14.0)     # le village et ses champs, à plat
    land = land * (1.0 - terrace) + 8.0 * terrace
    pad = 1.0 - _smooth(math.hypot(x - 60.0, y - 250.0), 10.0, 21.0)   # le replat du sommet (l'observatoire)
    land = land * (1.0 - pad) + 52.6 * pad
    basin = 1.0 - _smooth(math.hypot(x - LAKE[0], y - LAKE[1]), LAKE[2] - 8.0, LAKE[2] + 6.0)
    land -= 10.0 * basin                                             # le lac (fond à -2 : l'eau y est profonde)
    channel = 1.0 - _smooth(river_distance(x, y), 3.0, 9.0)
    land -= (3.5 + 0.12 * max(0.0, land - 12.0)) * channel * m       # la rivière : gorge plus profonde en montagne (le pont la franchit)
    # le fond de la mer : les dunes, 2,2 m plus bas qu'à marée basse (l'eau est une vraie eau), avec
    # quelques bancs de sable qui affleurent encore
    sea = dune(x, y) - 2.2 + 5.0 * max(0.0, _fbm(0.03 * x, 0.03 * y, 2, 41.0) - 0.42)
    z = sea + (land - sea) * m
    # ondulations : discrètes, nulles sur les plats (terrasse, lac, dessus de la mesa) et sur la mer
    calm = max(terrace, basin, _box(x, y, MESA[0] + 12, MESA[1] - 12, MESA[2] + 12, MESA[3] - 12, edge=6.0))
    amp = m * (1.0 - 0.85 * calm)
    # petit relief en bruit fractal (plus de quadrillage sinusoïdal) ; la route ne lit que la moitié
    # du grand bruit (detail=False), le reste se creuse ou se remblaie autour d'elle
    wave = (2.2 if detail else 1.1) * _fbm(0.05 * x, 0.05 * y, 3, 11.0)
    if detail:
        wave += 0.7 * _fbm(0.16 * x, 0.16 * y, 2, 4.0)
    return z + amp * wave


def _in_quay(x: float, y: float) -> bool:
    return QUAY_X[0] - 1.0 <= x <= QUAY_X[1] + 0.5 and -8.5 <= y <= QUAY_BACK_Y + 0.3


def ground_z(x: float, y: float, data: dict | None = None, detail: bool = True, spur: bool = True) -> float:
    """Hauteur du terrain sans l'empreinte de la route : l'île, le quai plat (la surface passe sous le
    bloc du quai), le sable qui reste bas devant le mur de quai."""
    quay_x = QUAY_X[0] - 1.0 <= x <= QUAY_X[1] + 0.5
    if quay_x and y < -8.5:
        return dune(x, y)
    z = landform(x, y, detail, spur)
    if _in_quay(x, y):
        z = min(z, -0.5)
    return z


def slope(x: float, y: float, step: float = 1.5) -> float:
    dzx = (landform(x + step, y) - landform(x - step, y)) / (2 * step)
    dzy = (landform(x, y + step) - landform(x, y - step)) / (2 * step)
    return math.hypot(dzx, dzy)


# ----------------------------------------------------------------------------- la route
def build(per_segment: int = 10) -> dict:
    """Échantillonne la route (mis en cache) : samples (z suivant le relief, lissé, sauf les points à
    altitude fixée), tangents, rights, acc, legs, i_road, spans (index de début et de fin)."""
    if "samples" not in _cache:
        pts = [(x, y, 0.0 if z is None else z) for x, y, z in PATH]
        fixed = [z is not None for _, _, z in PATH]
        samples = spline.catmull_rom(pts, per_segment=per_segment)
        acc = spline.cumulative(samples)
        i_road = min(range(len(samples)), key=lambda i: (samples[i].x - ROAD_FROM[0]) ** 2 + (samples[i].y - ROAD_FROM[1]) ** 2)
        # travées : indices de début et de fin (échantillons les plus proches)
        near = lambda p: min(range(len(samples)), key=lambda i: (samples[i].x - p[0]) ** 2 + (samples[i].y - p[1]) ** 2)
        spans = [(kind, near(a), near(b)) for kind, a, b in SPANS]
        spans = [(kind, min(i, j), max(i, j)) for kind, i, j in spans]
        in_tunnel = lambda i: any(kind == "tunnel" and i0 <= i <= i1 for kind, i0, i1 in spans)
        # altitude fixée : entre deux points de contrôle fixés, la spline garde le z interpolé
        seg = per_segment
        raw, hold = [], []
        for i, p in enumerate(samples):
            k = min(i // seg, len(PATH) - 2)
            both_fixed = fixed[k] and fixed[k + 1]
            if i <= i_road or both_fixed:
                raw.append(p.z)
                hold.append(True)
            elif _in_quay(p.x, p.y):
                raw.append(0.0)
                hold.append(True)
            else:
                raw.append(ground_z(p.x, p.y, detail=False, spur=not in_tunnel(i)) + ROAD_LIFT)
                hold.append(False)
        sigma = 8.0
        zs = list(raw)
        for i in range(len(samples)):
            if hold[i]:
                continue
            num = den = 0.0
            for j in range(max(0, i - 20), min(len(samples), i + 21)):
                w = math.exp(-((acc[j] - acc[i]) / sigma) ** 2)
                num += w * raw[j]
                den += w
            zs[i] = num / den
        samples = [Vector((p.x, p.y, z)) for p, z in zip(samples, zs)]
        tangents = spline.tangents(samples)
        _cache.update(samples=samples, tangents=tangents, rights=spline.rights(tangents), acc=spline.cumulative(samples),
                      legs=split_legs(samples), i_road=i_road, spans=spans)
    return _cache


def split_legs(samples):
    legs, cur, sign = [], [samples[0]], 0
    for a, b in zip(samples, samples[1:]):
        dx = b.x - a.x
        s = 1 if dx > 0.05 else (-1 if dx < -0.05 else 0)
        if s and sign and s != sign:
            legs.append(cur)
            cur = [a]
        if s:
            sign = s
        cur.append(b)
    legs.append(cur)
    return legs


def leg_at(leg, x, margin=1.0):
    xs = [p.x for p in leg]
    if x < min(xs) - margin or x > max(xs) + margin:
        return None
    p = min(leg, key=lambda q: abs(q.x - x))
    return p.y, p.z


def outer_sign(r) -> float:
    """+1 si la droite de la marche est le côté vide (y plus bas), -1 sinon."""
    return 1.0 if r.y < 0 else -1.0


def in_span(i: int, kind: str | None = None, data: dict | None = None) -> bool:
    d = data or build()
    return any((kind is None or k == kind) and i0 <= i <= i1 for k, i0, i1 in d["spans"])


def span_kind(i: int, data: dict | None = None):
    d = data or build()
    return next((k for k, i0, i1 in d["spans"] if i0 <= i <= i1), None)


def camera_sides(data: dict | None = None, window: int = 15):
    """Côté de la caméra de poursuite par échantillon, dans [-1, 1] : +1 = à droite de la marche,
    -1 = à gauche, toujours vers l'aval (le sol 6 m de côté est plus bas), lissé le long de la route
    pour que la caméra glisse d'un côté à l'autre sans sauter."""
    d = data or build()
    samples, rights = d["samples"], d["rights"]
    raw, prev = [], 1.0
    for p, r in zip(samples, rights):
        zr = ground_z(p.x + r.x * 6.0, p.y + r.y * 6.0, d)
        zl = ground_z(p.x - r.x * 6.0, p.y - r.y * 6.0, d)
        if abs(zr - zl) > 0.4:
            prev = 1.0 if zr < zl else -1.0
        raw.append(prev)
    out = []
    for i in range(len(raw)):
        lo, hi = max(0, i - window), min(len(raw), i + window + 1)
        out.append(round(sum(raw[lo:hi]) / (hi - lo), 2))
    return out


def nearest_index(x: float, y: float, data: dict | None = None) -> int:
    d = data or build()
    return min(range(len(d["samples"])), key=lambda i: (d["samples"][i].x - x) ** 2 + (d["samples"][i].y - y) ** 2)


def station_s(station_id: str, data: dict | None = None) -> float:
    d = data or build()
    x, y = dict(STATIONS)[station_id]
    return d["acc"][nearest_index(x, y, d)]


def index_at_s(s: float, data: dict | None = None) -> int:
    d = data or build()
    acc = d["acc"]
    return min(range(len(acc)), key=lambda k: abs(acc[k] - s))


def pose_at_station(station_id: str, back: float = 0.0, along: float = 0.0, data: dict | None = None):
    """Point sur la route à la halte, décalé de `back` m côté montagne (côté opposé au vide) et
    `along` m le long de la route, à la hauteur de la route. Renvoie (Vector, yaw)."""
    d = data or build()
    i = index_at_s(station_s(station_id, d), d)
    p, r, t = d["samples"][i], d["rights"][i], d["tangents"][i]
    mountain = -r * outer_sign(r)
    q = p + mountain * back + t * along
    return Vector((q.x, q.y, p.z)), math.atan2(t.y, t.x)


def distance_to_road(x: float, y: float, data: dict | None = None) -> float:
    d = data or build()
    return min(math.hypot(p.x - x, p.y - y) for p in d["samples"][d["i_road"]:])


def distance_to_side_paths(x: float, y: float) -> float:
    return min(polyline_distance(pts, x, y) for pts in SIDE_PATHS)


def side_path_samples(index: int, per_segment: int = 12):
    pts = [(x, y, 0.0) for x, y in SIDE_PATHS[index]]
    samples = spline.catmull_rom(pts, per_segment=per_segment)
    return [Vector((p.x, p.y, ground_z(p.x, p.y) + 0.15)) for p in samples]


def river_samples(per_segment: int = 8):
    """La rivière posée dans son chenal : eau à 1,2 m au-dessus du fond."""
    pts = [(x, y, 0.0) for x, y in RIVER]
    samples = spline.catmull_rom(pts, per_segment=per_segment)
    return [Vector((p.x, p.y, max(SEA_Z, ground_z(p.x, p.y, detail=False) + 1.2))) for p in samples]


def stations_json(data: dict | None = None):
    d = data or build()
    return [{"name": name, "s": round(station_s(name, d), 2)} for name, _ in STATIONS]


def grades(data: dict | None = None, window: float = 10.0):
    d = data or build()
    samples, acc = d["samples"], d["acc"]
    out, s = [], 0.0
    while s < acc[-1] - window:
        i, j = index_at_s(s, d), index_at_s(s + window, d)
        dz, ds = samples[j].z - samples[i].z, acc[j] - acc[i]
        out.append((round(s), round(100 * dz / ds) if ds else 0))
        s += window
    return out
