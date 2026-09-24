"""Gabarit d'asset. Copier en assets/<zone>_<categorie>_<nom>.py et adapter.

Contrat d'un script d'asset :
- une fonction `create(**params) -> bpy.types.Object`, deterministe (tout aleatoire via `random.Random(seed)`)
- construit la geometrie (bmesh de preference), range l'objet dans `Z<n>_<ZONE>/<Categorie>`
- materiaux uniquement via `materials.palette_material` (couleurs de palette.json)
- termine par `mesh.finalize(obj, role=...)` (echelle appliquee, origine a la base, lisse par angle, bevel, budget)
- un bloc `if __name__ == "__main__"` qui appelle create(**PARAMS) pour `run(..., as_main=True)`

Ce gabarit fabrique une caisse en bois a planches (demo du pipeline) : ce n'est PAS un asset valide
par la direction artistique. Le vrai travail commence par la reference et la silhouette (ART_DIRECTION.md).
"""
import math
import random

import bmesh
import bpy

from lib import materials, mesh, naming

ZONE, CATEGORY, BASE = "Z0_PORT", "Props", "Caisse"


def create(size: float = 0.6, seed: int = 0, zone: str = ZONE, index: int | None = None) -> bpy.types.Object:
    rnd = random.Random(seed)
    w = size * rnd.uniform(0.9, 1.1)
    d = size * rnd.uniform(0.8, 1.0)
    h = size * rnd.uniform(0.6, 0.9)

    bm = bmesh.new()
    bmesh.ops.create_cube(bm, size=1.0)
    bmesh.ops.scale(bm, vec=(w, d, h), verts=bm.verts)
    bm.normal_update()

    # Rainures entre les planches : inset individuel des faces laterales, puis on enfonce la face centrale.
    sides = [f for f in bm.faces if abs(f.normal.z) < 0.5]
    bmesh.ops.inset_individual(bm, faces=sides, thickness=size * 0.06, depth=0.0)
    bm.normal_update()
    for f in sides:  # apres inset_individual, `sides` designe toujours les faces centrales
        for v in f.verts:
            v.co -= f.normal * (size * 0.02)

    me = bpy.data.meshes.new("tmp")
    bm.to_mesh(me)
    bm.free()

    obj = bpy.data.objects.new(naming.asset_name(zone, CATEGORY, BASE, index), me)
    naming.link(obj, naming.ensure_collection(f"{zone}/{CATEGORY}"))

    wood = materials.palette_material("materials.wood_light", roughness=0.9)
    wood_dark = materials.palette_material("materials.wood_dark", roughness=0.9)
    materials.assign(obj, wood)
    materials.assign(obj, wood_dark, faces=[p.index for p in me.polygons if abs(p.normal.z) > 0.5])

    # Pose legerement de travers : une rotation de placement reste un transform (pas appliquee).
    obj.rotation_euler.z = math.radians(rnd.uniform(-8, 8))

    return mesh.finalize(obj, role="filler", smooth_angle=30, bevel_width=size * 0.02, bevel_segments=2)


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
