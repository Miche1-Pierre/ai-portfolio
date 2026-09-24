"""Exporte la scene OUVERTE telle quelle vers le web : sans reconstruction, sans sauvegarde.

A utiliser quand scenes/z0-port.blend contient des retouches faites a la main dans Blender :
les etapes de build/z0_slice.py reconstruisent tout depuis les scripts et ecrasent le .blend.

    & "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" --background C:\Portfolio\blender\scenes\z0-port.blend --python C:\Portfolio\blender\scripts\build\export_scene.py
"""
import json
import pathlib
import struct
import sys

SCRIPTS = pathlib.Path(__file__).resolve().parents[1]
if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))

import bpy  # noqa: E402

from lib import paths, webexport  # noqa: E402


def _gltf_summary(path: pathlib.Path) -> None:
    """Resume du .glb : maillages, materiaux, et ceux qui sortent de l'opaque (alpha, transmission)."""
    data = path.read_bytes()
    json_len = struct.unpack_from("<I", data, 12)[0]
    doc = json.loads(data[20 : 20 + json_len])
    mats = doc.get("materials", [])
    print(f"[gltf] {path.name}: {len(doc.get('meshes', []))} maillages, {len(mats)} materiaux, extensions={sorted(doc.get('extensionsUsed', []))}")
    for m in mats:
        if m.get("alphaMode") or m.get("extensions"):
            print(f"[gltf]   {m.get('name')}: alphaMode={m.get('alphaMode', 'OPAQUE')} ext={sorted(m.get('extensions', {}))}")


def main() -> None:
    print(f"[export_scene] fichier : {bpy.data.filepath}")
    outs = [
        webexport.export_zone("Z0_PORT", "z0-port"),
        webexport.export_zone("Z1_VOIE", "z1-piste"),
        webexport.export_root("Z0_Avatar_Rover", "avatar-rover"),
    ]
    for out in outs:
        _gltf_summary(out)
    if (paths.EXPORTS / "z0-path.json").exists():
        webexport.write_path_json()
    else:
        print("[export_scene] pas de exports/z0-path.json : spline non copiee (relancer la piste)")
    webexport.write_palette_ts()
    print("[export_scene] termine (le .blend n'est pas modifie)")


if __name__ == "__main__":
    main()
