"""Export web : ce que charge la route /journey du site.

- les zones en .glb (Draco) dans public/models (sans Blockout, Lights, ni l'avatar)
- l'avatar (le rover) dans son propre .glb, posé à l'origine, orienté +X
- la spline exportée par lib/path.py, copiée dans src/data (bundlée, 4 Ko)
- la palette en module TypeScript dans src/content (jamais éditée à la main)
"""
import json
import shutil

import bpy

from . import export, palette, paths

WEB_PATH_JSON = paths.REPO / "src" / "data" / "journey-path.json"
WEB_PALETTE_TS = paths.REPO / "src" / "content" / "world-palette.ts"
SKIP = {"Blockout", "Lights"}


def _category(collection) -> str:
    """'Terrain.001' -> 'Terrain' (Blender suffixe les collections homonymes des autres zones)."""
    return collection.name.split(".")[0]


def zone_objects(zone: str, skip_categories=("Avatar",)):
    coll = bpy.data.collections[zone]
    skip = SKIP | set(skip_categories)
    return [
        o
        for o in coll.all_objects
        if o.type in {"MESH", "EMPTY"} and not any(_category(c) in skip for c in o.users_collection)
    ]


def export_zone(zone: str, out_name: str, skip_categories=("Avatar",)):
    return export.export_objects(zone_objects(zone, skip_categories), out_name, publish=True)


def export_root(root_name: str, out_name: str, reset_transform: bool = True):
    """Exporte l'asset posé à l'origine, orienté +X, puis le remet où il était dans la scène."""
    root = bpy.data.objects[root_name]
    location, rotation = tuple(root.location), tuple(root.rotation_euler)
    if reset_transform:
        root.location = (0.0, 0.0, 0.0)
        root.rotation_euler = (0.0, 0.0, 0.0)
    try:
        return export.export_objects([root] + list(root.children_recursive), out_name, publish=True)
    finally:
        root.location = location
        root.rotation_euler = rotation


def write_path_json(name: str = "z0-path"):
    src = paths.EXPORTS / f"{name}.json"
    WEB_PATH_JSON.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(src, WEB_PATH_JSON)
    print(f"[web] spline -> {WEB_PATH_JSON.relative_to(paths.REPO)}")
    return WEB_PATH_JSON


def write_palette_ts():
    data = {k: v for k, v in palette.load().items() if not k.startswith("_")}
    body = json.dumps(data, indent=2, ensure_ascii=False)
    WEB_PALETTE_TS.write_text(
        "// Généré depuis blender/palette.json par blender/scripts/lib/webexport.py : ne pas éditer à la main.\n"
        f"export const worldPalette = {body} as const;\n",
        encoding="utf-8",
    )
    print(f"[web] palette -> {WEB_PALETTE_TS.relative_to(paths.REPO)}")
    return WEB_PALETTE_TS
