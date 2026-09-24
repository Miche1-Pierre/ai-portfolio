"""Lecture de blender/palette.json et conversion des couleurs pour Blender.

Les sockets couleur de Blender attendent du lineaire ; palette.json est en sRGB hex.
`rgba("materials.brass")` ou `rgba("#d6a516")` renvoie un tuple RGBA lineaire pret a l'emploi.
"""
import json
from functools import lru_cache

from . import paths


@lru_cache(maxsize=1)
def load() -> dict:
    return json.loads(paths.PALETTE.read_text(encoding="utf-8"))


def reload() -> dict:
    load.cache_clear()
    return load()


def get(path: str) -> str:
    """'zones.z0_port.sky' -> '#f6d9b8'."""
    node = load()
    for part in path.split("."):
        node = node[part]
    if not isinstance(node, str) or not node.startswith("#"):
        raise KeyError(f"'{path}' n'est pas une couleur de palette.json")
    return node


def hex_to_srgb(value: str) -> tuple[float, float, float]:
    h = value.lstrip("#")
    if len(h) != 6:
        raise ValueError(f"hex invalide : {value}")
    return tuple(int(h[i : i + 2], 16) / 255.0 for i in (0, 2, 4))


def srgb_to_linear(c: float) -> float:
    return c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4


def resolve(value: str) -> str:
    """Accepte une cle palette ou un hex, renvoie le hex."""
    return value if value.startswith("#") else get(value)


def rgba(value: str, alpha: float = 1.0) -> tuple[float, float, float, float]:
    r, g, b = (srgb_to_linear(c) for c in hex_to_srgb(resolve(value)))
    return (r, g, b, alpha)


def rgb(value: str) -> tuple[float, float, float]:
    return rgba(value)[:3]
