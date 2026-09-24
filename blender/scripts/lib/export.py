"""Export glTF binaire (.glb) d'une collection ou d'une liste d'objets.

- Y up (conversion Blender -> glTF automatique), modificateurs appliques, Draco active
- ni cameras ni lumieres (recreees dans three.js), emission conservee
- ecrit dans blender/exports/<nom>.glb ; `publish=True` copie aussi dans public/models/

Les parametres de l'operateur varient d'une version de Blender a l'autre : les mots-cles
inconnus sont retires automatiquement (voir `_call_exporter`).
"""
import re
import shutil
from pathlib import Path

import bpy

from . import naming, paths

# Budgets ART_DIRECTION.md : un .glb de zone <= 2 Mo, le monde <= 10 Mo
GLB_BUDGET_BYTES = 2 * 1024 * 1024

EXPORT_DEFAULTS = dict(
    export_format="GLB",
    use_selection=True,
    export_apply=True,
    export_yup=True,
    export_cameras=False,
    export_lights=False,
    export_animations=True,
    export_texcoords=True,
    export_normals=True,
    export_materials="EXPORT",
    export_extras=False,
    export_draco_mesh_compression_enable=True,
    export_draco_mesh_compression_level=6,
)

_UNKNOWN_KW = re.compile(r'keyword "(\w+)" unrecognized')


def slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def select_only(objs) -> None:
    for o in bpy.context.view_layer.objects:
        o.select_set(False)
    for o in objs:
        o.select_set(True)
    bpy.context.view_layer.objects.active = objs[0] if objs else None


def _call_exporter(filepath: Path, params: dict) -> dict:
    """Appelle l'exporteur glTF en retirant les mots-cles inconnus de cette version de Blender."""
    params = dict(params)
    for _ in range(len(params) + 1):
        try:
            bpy.ops.export_scene.gltf(filepath=str(filepath), **params)
            return params
        except TypeError as exc:
            m = _UNKNOWN_KW.search(str(exc))
            if not m or m.group(1) not in params:
                raise
            print(f"[export] parametre inconnu ignore : {m.group(1)}")
            params.pop(m.group(1))
    raise RuntimeError("export glTF : trop de parametres inconnus")


def export_objects(objs, out_name: str, *, publish: bool = False, **overrides) -> Path:
    """Exporte `objs` (maillages + empties) vers blender/exports/<out_name>.glb."""
    objs = [o for o in objs if o.type in {"MESH", "EMPTY"}]
    if not objs:
        raise ValueError("export : aucun maillage a exporter")
    paths.ensure_dirs()
    out = paths.EXPORTS / f"{slug(out_name)}.glb"

    select_only(objs)
    params = {**EXPORT_DEFAULTS, **overrides}
    used = _call_exporter(out, params)
    if "export_draco_mesh_compression_enable" not in used:
        print("[export] Draco indisponible dans cette version : export non compresse")

    size = out.stat().st_size
    flag = "" if size <= GLB_BUDGET_BYTES else "  ATTENTION > budget 2 Mo"
    print(f"[export] {out.name}  {size / 1024:.1f} KB  ({len(objs)} objets){flag}")

    if publish:
        paths.PUBLIC_MODELS.mkdir(parents=True, exist_ok=True)
        shutil.copy2(out, paths.PUBLIC_MODELS / out.name)
        print(f"[export] publie -> public/models/{out.name}")
    return out


def export_collection(collection_name: str, out_name: str | None = None, *, publish: bool = False, **overrides) -> Path:
    """Exporte toute une collection (recursif), sauf les sous-collections `Blockout` et `Lights`."""
    coll = bpy.data.collections.get(collection_name)
    if coll is None:
        raise KeyError(f"collection introuvable : {collection_name}")
    skip = {"Blockout", "Lights"}
    objs = [
        o
        for o in naming.objects_in(coll)
        if not any(c.name in skip for c in o.users_collection)
    ]
    return export_objects(objs, out_name or collection_name, publish=publish, **overrides)
