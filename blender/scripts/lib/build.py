"""Assemblage d'un asset : Empty racine, pièces enfants finalisées, nettoyage d'une hiérarchie."""
import bpy
from mathutils import Vector

from . import materials, mesh, naming, palette


def remove_hierarchy(root_name: str) -> None:
    """Supprime l'objet et toute sa descendance (avec leurs maillages orphelins)."""
    root = bpy.data.objects.get(root_name)
    if root is None:
        return
    for child in list(root.children_recursive):
        data = child.data
        bpy.data.objects.remove(child, do_unlink=True)
        if data is not None and data.users == 0:
            bpy.data.meshes.remove(data)
    bpy.data.objects.remove(root, do_unlink=True)


def root_empty(name: str, collection: bpy.types.Collection, size: float = 0.5) -> bpy.types.Object:
    """Empty racine d'un asset (remplace l'existant : un script d'asset est rejouable)."""
    remove_hierarchy(name)
    root = bpy.data.objects.new(name, None)
    root.empty_display_type = "ARROWS"
    root.empty_display_size = size
    naming.link(root, collection)
    return root


def part(
    name: str,
    bm,
    pivot,
    root: bpy.types.Object,
    collection: bpy.types.Collection,
    mat: bpy.types.Material,
    *,
    bevel: float = 0.02,
    segments: int = 2,
    role: str = "medium",
    faces_by_material=None,
    rotation=(0.0, 0.0, 0.0),
    smooth_angle: float = 30.0,
) -> bpy.types.Object:
    """Crée l'objet enfant depuis un bmesh, assigne les matériaux, finalise (lisse par angle + bevel).
    Le pivot est laissé où on le pose (origin_base=False) : roues, gonds, bases d'antenne..."""
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    naming.link(obj, collection)
    obj.location = Vector(pivot)
    obj.rotation_euler = rotation
    obj.parent = root
    materials.assign(obj, mat)
    for extra_mat, faces in faces_by_material or []:
        materials.assign(obj, extra_mat, faces=faces)
    mesh.finalize(obj, role=role, smooth_angle=smooth_angle, bevel_width=bevel, bevel_segments=segments, origin_base=False)
    return obj


def tri_total(root: bpy.types.Object) -> int:
    return sum(mesh.tri_count(o) for o in root.children_recursive if o.type == "MESH")


def point_light(name, collection, location, color="lights.key_dawn", energy=60.0, radius=0.15, shadow=False):
    """Lampe ponctuelle de contrôle (collection Lights, jamais exportée) : en EEVEE un maillage
    émissif n'éclaire pas, il faut une vraie lampe dans le halo. Sans ombre pour que l'abat-jour
    ne la bloque pas."""
    light = bpy.data.lights.get(name)
    if light is None or light.type != "POINT":
        light = bpy.data.lights.new(name, "POINT")
    light.color = palette.rgb(color)
    light.energy = energy
    light.shadow_soft_size = radius
    light.use_shadow = shadow
    obj = bpy.data.objects.get(name)
    if obj is None or obj.data is not light:
        if obj is not None:
            bpy.data.objects.remove(obj, do_unlink=True)
        obj = bpy.data.objects.new(name, light)
    naming.link(obj, collection)
    obj.location = Vector(location)
    return obj
