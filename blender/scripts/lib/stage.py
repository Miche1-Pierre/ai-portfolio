"""Mise en scène de contrôle : nettoyage du fichier de démarrage, sol, ciel, lumière d'aube,
caméra orbitale, réglages de rendu. Tout ce qui est créé ici va dans la collection `_Stage`
(jamais exportée : ce n'est pas une zone).
"""
import math

import bmesh
import bpy
from mathutils import Vector

from . import materials, naming, palette, render

STAGE_COLLECTION = "_Stage"


def clear_startup_scene() -> bool:
    """Supprime Cube / Light / Camera du fichier de démarrage, uniquement si le fichier n'est pas
    sauvegardé et ne contient rien d'autre. Ne touche jamais au travail de Pierre."""
    names = {o.name for o in bpy.data.objects}
    if bpy.data.filepath or not names or not names <= {"Cube", "Light", "Camera"}:
        return False
    for o in list(bpy.data.objects):
        bpy.data.objects.remove(o, do_unlink=True)
    for block in (bpy.data.meshes, bpy.data.lights, bpy.data.cameras, bpy.data.materials):
        for datablock in list(block):
            if datablock.users == 0:
                block.remove(datablock)
    default = bpy.data.collections.get("Collection")
    if default is not None and not default.objects and not default.children:
        bpy.data.collections.remove(default)
    return True


def stage_collection() -> bpy.types.Collection:
    return naming.ensure_collection(STAGE_COLLECTION)


def _stage_object(name: str, data) -> bpy.types.Object:
    obj = bpy.data.objects.get(name)
    if obj is None or obj.data is not data:
        if obj is not None:
            bpy.data.objects.remove(obj, do_unlink=True)
        obj = bpy.data.objects.new(name, data)
    naming.link(obj, stage_collection())
    return obj


def ground(size: float = 200.0, color: str = "materials.sand", name: str = "Stage_Ground") -> bpy.types.Object:
    """Un grand plan au sol (z = 0) pour recevoir les ombres des rendus de contrôle."""
    me = bpy.data.meshes.get(name) or bpy.data.meshes.new(name)
    bm = bmesh.new()
    s = size / 2
    verts = [bm.verts.new((x, y, 0.0)) for x, y in ((-s, -s), (s, -s), (s, s), (-s, s))]
    bm.faces.new(verts)
    bm.to_mesh(me)
    bm.free()
    obj = _stage_object(name, me)
    obj.data.materials.clear()
    materials.assign(obj, materials.palette_material(color, roughness=0.95))
    return obj


def remove_ground(name: str = "Stage_Ground") -> None:
    """Retire le plan de sol de contrôle quand la zone a son vrai terrain."""
    obj = bpy.data.objects.get(name)
    if obj is not None:
        data = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if data is not None and data.users == 0:
            bpy.data.meshes.remove(data)


def world(color: str = "zones.z0_port.sky", strength: float = 0.7) -> bpy.types.World:
    """Ciel uni = couleur de zone ; il sert aussi de fill (couleur des ombres)."""
    scene = bpy.context.scene
    w = scene.world or bpy.data.worlds.new("World")
    scene.world = w
    w.use_nodes = True
    tree = w.node_tree
    bg = next((n for n in tree.nodes if n.type == "BACKGROUND"), None)
    if bg is None:
        bg = tree.nodes.new("ShaderNodeBackground")
        out = next((n for n in tree.nodes if n.type == "OUTPUT_WORLD"), None) or tree.nodes.new("ShaderNodeOutputWorld")
        tree.links.new(bg.outputs["Background"], out.inputs["Surface"])
    bg.inputs["Color"].default_value = palette.rgba(color)
    bg.inputs["Strength"].default_value = strength
    return w


def _direction(azimuth_deg: float, elevation_deg: float) -> Vector:
    """Vecteur unitaire depuis la cible vers un point du ciel. Azimut 0 = +X (avant), 90 = +Y (gauche)."""
    az, el = math.radians(azimuth_deg), math.radians(elevation_deg)
    return Vector((math.cos(az) * math.cos(el), math.sin(az) * math.cos(el), math.sin(el)))


def sun(
    name: str,
    color: str,
    strength: float,
    azimuth_deg: float,
    elevation_deg: float,
    angle_deg: float = 3.0,
    shadow: bool = True,
) -> bpy.types.Object:
    light = bpy.data.lights.get(name)
    if light is None or light.type != "SUN":
        light = bpy.data.lights.new(name, "SUN")
    light.color = palette.rgb(color)
    light.energy = strength
    light.angle = math.radians(angle_deg)
    light.use_shadow = shadow
    obj = _stage_object(name, light)
    d = _direction(azimuth_deg, elevation_deg)
    obj.location = d * 30.0
    obj.rotation_euler = (-d).to_track_quat("-Z", "Y").to_euler()
    return obj


def dawn(zone: str = "z0_port") -> dict:
    """Lumière d'aube (ART_DIRECTION §7) : un soleil bas avant-gauche, fill par le ciel de la zone."""
    key = sun("Stage_Key", "lights.key_dawn", 3.5, azimuth_deg=60, elevation_deg=22)
    w = world(f"zones.{zone}.sky", 0.7)
    return {"key": key, "world": w}


def look_at(obj: bpy.types.Object, target) -> None:
    direction = Vector(target) - obj.location
    obj.rotation_euler = direction.to_track_quat("-Z", "Y").to_euler()


def camera_orbit(
    target,
    distance: float,
    azimuth_deg: float,
    elevation_deg: float,
    focal: float = 50.0,
    name: str = "Stage_Camera",
) -> bpy.types.Object:
    """Caméra sur une orbite autour de `target`, active pour le rendu."""
    cam = bpy.data.cameras.get(name) or bpy.data.cameras.new(name)
    cam.lens = focal
    cam.sensor_width = 36.0
    cam.clip_start = 0.1
    cam.clip_end = 1000.0
    obj = _stage_object(name, cam)
    obj.location = Vector(target) + _direction(azimuth_deg, elevation_deg) * distance
    look_at(obj, target)
    bpy.context.scene.camera = obj
    return obj


def _try_set(owner, attr: str, value) -> bool:
    try:
        setattr(owner, attr, value)
        return True
    except (AttributeError, TypeError):
        return False


def render_settings(width: int = 1600, height: int = 900, samples: int = 24) -> None:
    """EEVEE, couleurs 'Standard' (les hex de la palette rendent tels quels), 16:9."""
    scene = bpy.context.scene
    render.set_eevee(scene, samples)
    scene.render.resolution_x = width
    scene.render.resolution_y = height
    scene.render.resolution_percentage = 100
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = "PNG"
    scene.render.image_settings.color_mode = "RGB"
    _try_set(scene.view_settings, "view_transform", "Standard")
    _try_set(scene.view_settings, "look", "None")
    scene.view_settings.exposure = 0.0
    scene.view_settings.gamma = 1.0
    if hasattr(scene, "eevee"):
        _try_set(scene.eevee, "use_gtao", True)
        _try_set(scene.eevee, "use_shadows", True)
