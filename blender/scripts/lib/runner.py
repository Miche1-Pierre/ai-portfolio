"""Execution d'un script de blender/scripts/ depuis Blender (MCP, console) ou en headless.

    from lib.runner import run
    g = run("assets/_template.py")            # charge le script, renvoie ses globals
    obj = g["create"](size=0.6, seed=3)       # appelle sa fonction create(**params)
    run("build/build_scene.py", as_main=True) # execute son bloc `if __name__ == "__main__"`

Les scripts recoivent `PARAMS` (dict) dans leurs globals quand on passe des mots-cles :
    run("assets/_template.py", as_main=True, size=0.4)  -> create(size=0.4)
"""
from pathlib import Path

from . import paths


def run(relative: str, *, as_main: bool = False, **params) -> dict:
    path = (paths.SCRIPTS / relative).resolve()
    if not path.exists():
        raise FileNotFoundError(path)
    g = {
        "__name__": "__main__" if as_main else f"script.{path.stem}",
        "__file__": str(path),
        "PARAMS": params,
    }
    code = compile(path.read_text(encoding="utf-8"), str(path), "exec")
    exec(code, g)
    return g
