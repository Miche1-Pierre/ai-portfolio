"""Test fumee du pipeline, en headless (aucun addon requis) :

    & "C:\\Program Files\\Blender Foundation\\Blender 5.1\\blender.exe" --background --python C:\\Portfolio\\blender\\scripts\\smoke_test.py

Scene vide -> caisse gabarit -> verifications DA (nommage, collection, origine, lissage, bevel, budget,
materiaux palette) -> export .glb Draco -> nettoyage. Code de sortie 1 si quelque chose casse.
"""
import pathlib
import sys
import traceback

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))

import bpy  # noqa: E402

from lib import export, mesh, palette  # noqa: E402
from lib.runner import run  # noqa: E402


def check(cond: bool, message: str) -> None:
    if not cond:
        raise AssertionError(message)
    print(f"  ok  {message}")


def main() -> None:
    bpy.ops.wm.read_homefile(use_empty=True)
    print(f"Blender {bpy.app.version_string}")

    obj = run("assets/_template.py")["create"](size=0.6, seed=3, index=1)

    check(obj.name == "Z0_Props_Caisse_01", f"nommage : {obj.name}")
    check([c.name for c in obj.users_collection] == ["Props"], "range dans Z0_PORT/Props")
    check(obj.users_collection[0].name in bpy.data.collections["Z0_PORT"].children, "collection imbriquee sous Z0_PORT")

    zs = [v.co.z for v in obj.data.vertices]
    check(abs(min(zs)) < 1e-5, "origine a la base (z min = 0)")
    check(all(abs(s - 1.0) < 1e-6 for s in obj.scale), "echelle appliquee")
    check(all(p.use_smooth for p in obj.data.polygons), "ombrage lisse")
    check(any(m.type == "BEVEL" for m in obj.modifiers), "modificateur Bevel present")
    check(len(obj.data.materials) == 2, "2 materiaux palette")
    check(
        bpy.data.materials["MAT_wood_light"].node_tree.nodes["Principled BSDF"].inputs["Base Color"].default_value[0]
        > 0,
        "materiau palette -> Principled BSDF",
    )
    tris = mesh.tri_count(obj)
    check(0 < tris <= mesh.BUDGETS["filler"], f"budget filler : {tris} tris")
    check(palette.get("accents.taskforce_light") == "#2f6bf6", "palette.json lisible")

    out = export.export_objects([obj], "_smoke_caisse", publish=False)
    check(out.exists() and out.stat().st_size > 500, f"glb ecrit : {out.name} ({out.stat().st_size} octets)")
    check(out.read_bytes()[:4] == b"glTF", "en-tete glTF binaire")
    out.unlink()
    print("SMOKE OK")


if __name__ == "__main__":
    try:
        main()
    except Exception:
        traceback.print_exc()
        print("SMOKE FAIL")
        sys.exit(1)
