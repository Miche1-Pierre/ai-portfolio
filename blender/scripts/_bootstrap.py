"""Bootstrap a executer dans Blender AVANT tout script de l'atelier.

Depuis le MCP (execute_blender_code) ou la console Python de Blender :

    exec(open(r"C:\\Portfolio\\blender\\scripts\\_bootstrap.py", encoding="utf-8").read())

Ensuite, dans le meme espace de noms :

    g = run("assets/_template.py"); obj = g["create"](seed=1)
    from lib import mesh, materials, export, render
    export.export_collection("Z0_PORT", "z0-port", publish=False)

Chaque appel recharge `lib` depuis le disque : on edite les fichiers, on relance, sans
redemarrer Blender. Les scripts vivent sur disque (versionnes), jamais seulement dans le chat.
"""
import importlib
import pathlib
import sys

try:
    SCRIPTS = pathlib.Path(__file__).resolve().parent
except NameError:  # exec(...) sans __file__ : on retombe sur l'emplacement connu
    SCRIPTS = pathlib.Path(r"C:\Portfolio\blender\scripts")

if str(SCRIPTS) not in sys.path:
    sys.path.insert(0, str(SCRIPTS))


def reload_lib():
    for name in [n for n in list(sys.modules) if n == "lib" or n.startswith("lib.")]:
        del sys.modules[name]
    return importlib.import_module("lib")


lib = reload_lib()
from lib.runner import run  # noqa: E402  (expose `run` dans l'espace de noms courant)

print(f"[bootstrap] scripts={SCRIPTS}  lib rechargee  (run(...) disponible)")
