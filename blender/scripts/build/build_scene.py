"""Assemble le monde : hierarchie de collections par zone + generateurs enregistres.

    run("build/build_scene.py", as_main=True)                 # tout le monde
    run("build/build_scene.py", as_main=True, zones=["Z0_PORT"])

`BUILDERS` se remplit au fil des assets valides par Pierre : (script relatif, params). Un asset qui
n'est pas dans cette liste n'existe pas pour le monde final (le .blend peut en contenir, l'export non).
"""
from lib import naming
from lib.runner import run

BUILDERS: dict[str, list[tuple[str, dict]]] = {
    # "Z0_PORT": [
    #     ("assets/z0_props_caisse.py", {"seed": 1, "index": 1}),
    #     ("assets/z0_props_caisse.py", {"seed": 2, "index": 2}),
    # ],
}


def build(zones=None) -> dict[str, list]:
    built: dict[str, list] = {}
    for zone in zones or naming.ZONES:
        for category in naming.CATEGORIES:
            naming.ensure_collection(f"{zone}/{category}")
        built[zone] = [run(script)["create"](**params) for script, params in BUILDERS.get(zone, [])]
        print(f"[build] {zone}: {len(built[zone])} asset(s)")
    return built


if __name__ == "__main__":
    build(**globals().get("PARAMS", {}))
