"""Sonde du terrain CONSTRUIT : la hauteur exacte du maillage (BVH), pas celle du relief analytique.

Le relief analytique (`route.ground_z`) et la nappe construite (grille de 2 m + empreinte de la route)
diffèrent de quelques dizaines de centimètres sur les pentes et de plus près de la route : posé sur
l'analytique, un arbre flotte ou s'enfonce (vu le 2026-09-07). Tout ce qui se pose sur le sol
interroge la sonde ; hors maillage elle retombe sur l'analytique.

    from lib import probe
    probe.set_terrain(band_objects, fallback=lambda x, y: route.ground_z(x, y, d))   # après la nappe
    z = probe.height(x, y)
"""
from mathutils import Vector
from mathutils.bvhtree import BVHTree

_tree = None
_fallback = None
_TOP = 400.0


def set_terrain(objects, fallback=None) -> int:
    """Construit le BVH (coordonnées monde) depuis les maillages donnés. Renvoie le nombre de faces."""
    global _tree, _fallback
    verts, polys = [], []
    for o in objects:
        if o.type != "MESH":
            continue
        mw = o.matrix_world
        base = len(verts)
        verts.extend(tuple(mw @ v.co) for v in o.data.vertices)
        polys.extend(tuple(base + i for i in p.vertices) for p in o.data.polygons)
    _tree = BVHTree.FromPolygons(verts, polys) if polys else None
    _fallback = fallback
    return len(polys)


def clear() -> None:
    global _tree, _fallback
    _tree, _fallback = None, None


def height(x: float, y: float, default: float = 0.0) -> float:
    """Hauteur du sol construit en (x, y) : rayon vertical depuis le ciel."""
    if _tree is not None:
        hit = _tree.ray_cast(Vector((x, y, _TOP)), Vector((0.0, 0.0, -1.0)), 2.0 * _TOP)
        if hit[0] is not None:
            return hit[0].z
    if _fallback is not None:
        return _fallback(x, y)
    return default


def normal(x: float, y: float):
    """Normale du sol construit en (x, y) (Vector, vers le haut), ou None."""
    if _tree is None:
        return None
    hit = _tree.ray_cast(Vector((x, y, _TOP)), Vector((0.0, 0.0, -1.0)), 2.0 * _TOP)
    return None if hit[0] is None else hit[1]
