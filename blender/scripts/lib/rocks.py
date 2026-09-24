"""Roche partagée : polygones irréguliers, dalles extrudées, falaises stratifiées, éboulis, masses
de blockout. Utilisé par les terrains de toutes les zones."""
import math

import bmesh


def polygon(rnd, cx, cy, rx, ry, n, wobble=0.25):
    """Polygone irrégulier (ellipse bruitée) dans le plan XY."""
    pts = []
    for i in range(n):
        a = 2 * math.pi * i / n + rnd.uniform(-0.1, 0.1)
        k = 1.0 + rnd.uniform(-wobble, wobble)
        pts.append((cx + rx * k * math.cos(a), cy + ry * k * math.sin(a)))
    return pts


def extrude_polygon(bm, pts, z, height):
    face = bm.faces.new([bm.verts.new((px, py, z)) for px, py in pts])
    res = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=(0, 0, height), verts=moved)


def rock_mass(rnd, scale, subdivisions=2, jitter=0.12):
    """Blockout : icosphère étirée, sommets légèrement brouillés (scale = demi-largeurs X, Y, hauteur)."""
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=subdivisions, radius=1.0)
    sx, sy, sz = scale
    for v in bm.verts:
        j = 1.0 + rnd.uniform(-jitter, jitter)
        v.co = (v.co.x * sx * j, v.co.y * sy * j, v.co.z * sz * 0.5 * j)
    return bm


def cliff_layers(rnd, pos, scale, layers=4, recede=0.16):
    """Falaise stratifiée : dalles irrégulières empilées, de plus en plus petites et reculées vers
    +Y (la roche se retire en gradins, comme les strates de Jusant). pos = base (x, y, z enterré),
    scale = (demi-largeur X, demi-largeur Y, hauteur totale)."""
    x0, y0, z0 = pos
    sx, sy, total = scale
    bm = bmesh.new()
    z = z0
    weights = (0.34, 0.28, 0.22, 0.16)
    for i in range(layers):
        h = total * weights[i]
        rx, ry = sx * (1.0 - 0.17 * i), sy * (1.0 - 0.17 * i)
        cx = x0 + rnd.uniform(-0.10, 0.10) * sx
        cy = y0 + rnd.uniform(-0.06, 0.06) * sy + recede * i * sy
        extrude_polygon(bm, polygon(rnd, cx, cy, rx, ry, n=10 + i, wobble=0.2), z, h)
        z += h * 0.9
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def scree(rnd, x_range, y_front, count, ground=None, max_slope=0.6, tries=6, accept=None):
    """Éboulis : galets aplatis, enfoncés dans le sol réel (`ground(x, y)`), le long d'une ligne
    y_front (± quelques m ; nombre ou fonction de x, pour suivre une route). Un galet n'est jamais
    posé sur une pente plus raide que `max_slope` (hauteur / distance) : sinon il flotte d'un côté ;
    ni là où `accept(x, y)` dit non (ex. sur la route). Il est enfoncé au quart de sa hauteur."""
    bm = bmesh.new()
    g = ground or (lambda x, y: 0.0)
    for _ in range(count):
        for _ in range(tries):
            x = rnd.uniform(*x_range)
            yf = y_front(x) if callable(y_front) else y_front
            y = yf + rnd.uniform(-1.8, 2.6)
            if accept is not None and not accept(x, y):
                continue
            base = g(x, y)
            slope = max(abs(g(x + 0.8, y) - g(x - 0.8, y)), abs(g(x, y + 0.8) - g(x, y - 0.8))) / 1.6
            if slope <= max_slope:
                break
        else:
            continue
        r = rnd.uniform(0.5, 1.5)
        vs = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=r)["verts"]
        sx, sy, sz = rnd.uniform(0.8, 1.5), rnd.uniform(0.7, 1.2), rnd.uniform(0.45, 0.8)
        rot = rnd.uniform(0, math.pi)
        for v in vs:
            px, py = v.co.x * sx, v.co.y * sy
            v.co = (px * math.cos(rot) - py * math.sin(rot) + x, px * math.sin(rot) + py * math.cos(rot) + y, v.co.z * sz + base + r * sz * 0.25)
    return bm
