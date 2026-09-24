"""La piste : spline Catmull-Rom sur des points de contrôle monde, repères (tangente, droite à plat),
décalages latéraux, abscisse curviligne, pose d'un véhicule, export JSON pour three.js (le rover et
la caméra du site suivent la même spline). Tout est en Z up (repère Blender) : la conversion Y up
se fait côté web, le JSON le déclare.
"""
import json
import math

from mathutils import Vector

from . import paths


def catmull_rom(points, per_segment: int = 10):
    """Échantillonne une Catmull-Rom (uniforme) passant par tous les points de contrôle."""
    pts = [Vector(p) for p in points]
    if len(pts) < 2:
        return pts
    ext = [pts[0]] + pts + [pts[-1]]
    out = []
    for i in range(1, len(ext) - 2):
        p0, p1, p2, p3 = ext[i - 1], ext[i], ext[i + 1], ext[i + 2]
        for k in range(per_segment):
            t = k / per_segment
            t2, t3 = t * t, t * t * t
            out.append(0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (-p0 + 3 * p1 - 3 * p2 + p3) * t3))
    out.append(pts[-1])
    return out


def tangents(samples):
    n = len(samples)
    out = []
    for i in range(n):
        d = samples[min(n - 1, i + 1)] - samples[max(0, i - 1)]
        out.append(d.normalized() if d.length > 1e-6 else Vector((1.0, 0.0, 0.0)))
    return out


def rights(tangents_):
    """Normale horizontale à droite de la marche (Z up)."""
    out = []
    for t in tangents_:
        r = Vector((t.y, -t.x, 0.0))
        out.append(r.normalized() if r.length > 1e-6 else Vector((0.0, -1.0, 0.0)))
    return out


def cumulative(samples):
    acc = [0.0]
    for a, b in zip(samples, samples[1:]):
        acc.append(acc[-1] + (b - a).length)
    return acc


def pose_at(samples, tangents_, s: float):
    """Position, lacet (rad) et tangage (rad) à l'abscisse curviligne s (m)."""
    acc = cumulative(samples)
    s = max(0.0, min(acc[-1], s))
    for i in range(len(acc) - 1):
        if acc[i + 1] >= s:
            k = (s - acc[i]) / max(1e-6, acc[i + 1] - acc[i])
            p = samples[i].lerp(samples[i + 1], k)
            t = tangents_[i].lerp(tangents_[i + 1], k).normalized()
            return p, math.atan2(t.y, t.x), math.atan2(t.z, math.hypot(t.x, t.y))
    t = tangents_[-1]
    return samples[-1], math.atan2(t.y, t.x), math.atan2(t.z, math.hypot(t.x, t.y))


def station_s(samples, point):
    """Abscisse curviligne de l'échantillon le plus proche d'un point (pour les haltes)."""
    acc = cumulative(samples)
    p = Vector(point)
    i = min(range(len(samples)), key=lambda k: (samples[k] - p).length)
    return acc[i]


def export_json(samples, stations, name: str, extras: dict | None = None):
    """exports/<name>.json : points (m, Z up), haltes {name, s}, longueur totale, plus `extras`
    recopiés tels quels (ex. la caméra d'intro dans le hangar, lue par journey-scene.tsx)."""
    paths.ensure_dirs()
    out = paths.EXPORTS / f"{name}.json"
    doc = {
        "units": "m",
        "up": "z",
        "length": round(cumulative(samples)[-1], 2),
        "points": [[round(c, 3) for c in p] for p in samples],
        "stations": stations,
        **(extras or {}),
    }
    out.write_text(json.dumps(doc), encoding="utf-8")
    return out
