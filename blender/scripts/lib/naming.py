"""Zones, categories, collections imbriquees et nommage des assets.

Convention :
- collections  : `Z0_PORT/Props` (zone / categorie), sous la collection de scene
- objets       : `Z0_Props_Caisse` ou `Z0_Props_Caisse_03` (prefixe zone court)
- scenes .blend: `scenes/<zone>.blend`, monde assemble `scenes/world.blend`
"""
import bpy

ZONES = (
    "Z0_PORT",
    "Z1_VOIE",       # le terrain et la piste de tout le monde
    "Z1_SABLE",      # les décors du fond de la mer (épave, récif, ossements)
    "Z2_FORET",      # la forêt du versant est
    "Z2_ATELIER",
    "Z3_COL",
    "Z4_OBSERVATOIRE",
    "Z5_CIEL",
)

CATEGORIES = (
    "Blockout",      # masses provisoires, jamais exportees
    "Terrain",
    "Architecture",
    "Props",
    "Vegetation",
    "Avatar",
    "Lights",        # lampes Blender pour les rendus de controle (recreees dans three.js)
    "FX",
)


def ensure_collection(path: str, scene: bpy.types.Scene | None = None) -> bpy.types.Collection:
    """'Z0_PORT/Props' -> cree (si besoin) et renvoie la collection imbriquee."""
    scene = scene or bpy.context.scene
    parent = scene.collection
    for part in path.strip("/").split("/"):
        child = parent.children.get(part)
        if child is None:
            child = bpy.data.collections.new(part)
            parent.children.link(child)
        parent = child
    return parent


def zone_prefix(zone: str) -> str:
    """'Z0_PORT' -> 'Z0'."""
    return zone.split("_", 1)[0]


def asset_name(zone: str, category: str, base: str, index: int | None = None) -> str:
    name = f"{zone_prefix(zone)}_{category}_{base}"
    return f"{name}_{index:02d}" if index is not None else name


def link(obj: bpy.types.Object, collection: bpy.types.Collection) -> None:
    """Range l'objet dans `collection` (et nulle part ailleurs)."""
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    collection.objects.link(obj)


def objects_in(collection: bpy.types.Collection, recursive: bool = True) -> list[bpy.types.Object]:
    return list(collection.all_objects if recursive else collection.objects)
