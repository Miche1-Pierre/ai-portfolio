"""Rendu de previsualisation dans blender/renders (EEVEE, rapide), pour la boucle
"reference -> rendu -> comparaison -> une correction".

Nom de fichier : renders/YYYY-MM-DD_<sujet>_v<nn>.png (numero auto-incremente).
"""
import datetime as _dt
from pathlib import Path

import bpy

from . import paths


def set_eevee(scene: bpy.types.Scene | None = None, samples: int = 16) -> str:
    """Active EEVEE (le nom de l'enum a change entre les versions) et renvoie l'enum utilise."""
    scene = scene or bpy.context.scene
    for engine in ("BLENDER_EEVEE_NEXT", "BLENDER_EEVEE"):
        try:
            scene.render.engine = engine
            break
        except TypeError:
            continue
    if hasattr(scene, "eevee"):
        scene.eevee.taa_render_samples = samples
        if hasattr(scene.eevee, "use_raytracing"):
            scene.eevee.use_raytracing = True  # sans lui, le verre en transmission rend opaque (EEVEE Next)
    return scene.render.engine


def next_path(subject: str) -> Path:
    paths.RENDERS.mkdir(parents=True, exist_ok=True)
    day = _dt.date.today().isoformat()
    n = 1
    while (paths.RENDERS / f"{day}_{subject}_v{n:02d}.png").exists():
        n += 1
    return paths.RENDERS / f"{day}_{subject}_v{n:02d}.png"


def preview(subject: str, *, width: int = 1600, height: int = 900, samples: int = 16, scene=None) -> Path:
    """Rend la camera active de la scene dans renders/. Leve une erreur claire s'il n'y a pas de camera."""
    scene = scene or bpy.context.scene
    if scene.camera is None:
        raise RuntimeError("render.preview : la scene n'a pas de camera active")
    set_eevee(scene, samples)
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.image_settings.file_format = "PNG"
    out = next_path(subject)
    scene.render.filepath = str(out)
    bpy.ops.render.render(write_still=True)
    print(f"[render] {out}")
    return out
