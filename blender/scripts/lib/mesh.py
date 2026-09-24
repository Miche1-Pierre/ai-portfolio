"""Finalisation d'un asset : le "low-poly lisse" de la DA, en une fonction.

`finalize(obj)` :
1. applique l'echelle (et la rotation si demande) dans la geometrie
2. met l'origine a la base (centre du pied) pour tout ce qui se pose
3. ombrage lisse partout, aretes marquees au-dela de `smooth_angle` (pas de facettes parasites)
4. modificateur Bevel (1-2 segments, limite par angle) pour que les aretes attrapent la lumiere
5. verifie le budget de triangles

Tout est fait sur les donnees (bmesh / matrices), jamais via la selection : marche en headless.
"""
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

# Budgets ART_DIRECTION.md par role d'asset (triangles, modificateurs evalues)
BUDGETS = {"hero": 12_000, "medium": 4_000, "filler": 800}


def tri_count(obj: bpy.types.Object) -> int:
    """Triangles de l'objet avec ses modificateurs evalues."""
    if obj.type != "MESH":
        return 0
    depsgraph = bpy.context.evaluated_depsgraph_get()
    evaluated = obj.evaluated_get(depsgraph)
    me = evaluated.to_mesh()
    try:
        me.calc_loop_triangles()
        return len(me.loop_triangles)
    finally:
        evaluated.to_mesh_clear()


def apply_transforms(obj: bpy.types.Object, *, rotation: bool = False, scale: bool = True) -> None:
    """Bake l'echelle (et la rotation) locale dans le maillage, sans passer par un operateur."""
    if obj.type != "MESH" or not (rotation or scale):
        return
    loc, rot, sca = obj.matrix_basis.decompose()
    baked = Matrix.Identity(4)
    if rotation:
        baked = rot.to_matrix().to_4x4() @ baked
        rot = rot.__class__()  # quaternion identite
    if scale:
        baked = baked @ Matrix.Diagonal(sca).to_4x4()
        sca = Vector((1.0, 1.0, 1.0))
    obj.data.transform(baked)
    obj.matrix_basis = Matrix.Translation(loc) @ rot.to_matrix().to_4x4() @ Matrix.Diagonal(sca).to_4x4()
    obj.data.update()


def origin_to_base(obj: bpy.types.Object) -> None:
    """Origine au centre XY de la boite englobante, au Z minimum (l'objet 'se pose' en (0,0,0))."""
    if obj.type != "MESH" or not obj.data.vertices:
        return
    xs, ys, zs = zip(*(v.co for v in obj.data.vertices))
    offset = Vector(((min(xs) + max(xs)) / 2, (min(ys) + max(ys)) / 2, min(zs)))
    obj.data.transform(Matrix.Translation(-offset))
    obj.matrix_basis = obj.matrix_basis @ Matrix.Translation(offset)
    obj.data.update()


def smooth_by_angle(obj: bpy.types.Object, angle_deg: float = 30.0) -> None:
    """Ombrage lisse sur toutes les faces, aretes marquees nettes au-dela de l'angle."""
    if obj.type != "MESH":
        return
    me = obj.data
    threshold = math.radians(angle_deg)
    bm = bmesh.new()
    bm.from_mesh(me)
    bm.normal_update()
    for f in bm.faces:
        f.smooth = True
    for e in bm.edges:
        if len(e.link_faces) == 2:
            e.smooth = e.calc_face_angle(0.0) <= threshold
        else:
            e.smooth = True
    bm.to_mesh(me)
    bm.free()
    me.update()


def bevel(
    obj: bpy.types.Object,
    width: float = 0.02,
    segments: int = 2,
    angle_deg: float = 30.0,
    harden_normals: bool = True,
    name: str = "Bevel",
) -> bpy.types.Modifier:
    """Bevel parametrique (non applique dans le .blend, applique a l'export)."""
    mod = obj.modifiers.get(name) or obj.modifiers.new(name, "BEVEL")
    mod.width = width
    mod.segments = segments
    mod.limit_method = "ANGLE"
    mod.angle_limit = math.radians(angle_deg)
    mod.harden_normals = harden_normals
    return mod


def _paint(obj: bpy.types.Object, top_rgb, bottom_rgb, factor, name: str) -> None:
    """Attribut couleur par sommet : `bottom_rgb` (teinte) à t = 0, `top_rgb` (base) à t = 1,
    t = factor(z monde)."""
    if obj.type != "MESH":
        return
    bpy.context.view_layer.update()
    me = obj.data
    attr = me.color_attributes.get(name)
    if attr is None:
        attr = me.color_attributes.new(name=name, type="FLOAT_COLOR", domain="POINT")
    mw = obj.matrix_world
    for i, v in enumerate(me.vertices):
        t = max(0.0, min(1.0, factor((mw @ v.co).z)))
        attr.data[i].color = tuple(b + (c - b) * t for c, b in zip(top_rgb, bottom_rgb)) + (1.0,)
    idx = me.color_attributes.find(name)
    me.color_attributes.active_color_index = idx
    me.color_attributes.render_color_index = idx


def paint_gradient(obj: bpy.types.Object, top_rgb, z_low: float, z_high: float, bottom_rgb=(1.0, 1.0, 1.0), name: str = "Col") -> None:
    """Dégradé en Z monde : `bottom_rgb` sous `z_low` (pleine teinte du matériau
    `vertex_tinted_material`), `top_rgb` au-dessus de `z_high` (couleur de base), linéaire entre."""
    span = (z_high - z_low) or 1.0
    _paint(obj, top_rgb, bottom_rgb, lambda z: (z - z_low) / span, name)


def paint_stops(obj: bpy.types.Object, top_rgb, stops, bottom_rgb=(1.0, 1.0, 1.0), name: str = "Col") -> None:
    """Comme paint_gradient, mais par paliers : `stops` = [(z monde, t), ...] avec t = 0 pleine
    teinte (`bottom_rgb`) et t = 1 couleur de base (`top_rgb`), interpolation linéaire entre deux
    paliers, constante au-delà. Couper le maillage aux z des paliers (shapes.bisect_z), sinon
    l'attribut n'est interpolé qu'entre les coins."""
    stops = sorted(stops)

    def factor(z):
        if z <= stops[0][0]:
            return stops[0][1]
        for (z0, t0), (z1, t1) in zip(stops, stops[1:]):
            if z <= z1:
                return t0 if z1 == z0 else t0 + (t1 - t0) * (z - z0) / (z1 - z0)
        return stops[-1][1]

    _paint(obj, top_rgb, bottom_rgb, factor, name)


def paint_fn(obj: bpy.types.Object, top_rgb, bottom_rgb, fn, name: str = "Col") -> None:
    """Comme paint_stops, mais t = fn(x, y, z) monde : transitions par la pente, le bruit, la position
    (neige tachetée, lichen des plats, roche qui affleure)."""
    if obj.type != "MESH":
        return
    bpy.context.view_layer.update()
    me = obj.data
    attr = me.color_attributes.get(name)
    if attr is None:
        attr = me.color_attributes.new(name=name, type="FLOAT_COLOR", domain="POINT")
    mw = obj.matrix_world
    for i, v in enumerate(me.vertices):
        w = mw @ v.co
        t = max(0.0, min(1.0, fn(w.x, w.y, w.z)))
        attr.data[i].color = tuple(b + (c - b) * t for c, b in zip(top_rgb, bottom_rgb)) + (1.0,)
    idx = me.color_attributes.find(name)
    me.color_attributes.active_color_index = idx
    me.color_attributes.render_color_index = idx


def paint_normal_fn(obj: bpy.types.Object, top_rgb, bottom_rgb, fn, name: str = "Col") -> None:
    """Comme paint_fn, avec en plus la composante verticale de la normale (monde) du sommet :
    t = fn(x, y, z, nz). Neige sur les faces tournées vers le ciel, roche sur les flancs."""
    if obj.type != "MESH":
        return
    bpy.context.view_layer.update()
    me = obj.data
    attr = me.color_attributes.get(name)
    if attr is None:
        attr = me.color_attributes.new(name=name, type="FLOAT_COLOR", domain="POINT")
    mw = obj.matrix_world
    rot = mw.to_3x3()
    for i, v in enumerate(me.vertices):
        w = mw @ v.co
        n = (rot @ v.normal).normalized()
        t = max(0.0, min(1.0, fn(w.x, w.y, w.z, n.z)))
        attr.data[i].color = tuple(b + (c - b) * t for c, b in zip(top_rgb, bottom_rgb)) + (1.0,)
    idx = me.color_attributes.find(name)
    me.color_attributes.active_color_index = idx
    me.color_attributes.render_color_index = idx


def dimensions(obj: bpy.types.Object) -> Vector:
    """Dimensions monde (utile pour verifier l'echelle : porte 2.1 m, marche 0.17 m...)."""
    return obj.dimensions.copy()


def finalize(
    obj: bpy.types.Object,
    *,
    role: str = "medium",
    smooth_angle: float = 30.0,
    bevel_width: float = 0.02,
    bevel_segments: int = 2,
    origin_base: bool = True,
    apply_rotation: bool = False,
) -> bpy.types.Object:
    """Passe un asset au standard DA. `role` in BUDGETS ('hero' | 'medium' | 'filler')."""
    apply_transforms(obj, rotation=apply_rotation, scale=True)
    if origin_base:
        origin_to_base(obj)
    smooth_by_angle(obj, smooth_angle)
    if bevel_width > 0:
        bevel(obj, width=bevel_width, segments=bevel_segments, angle_deg=smooth_angle)
    if obj.data is not None:
        obj.data.name = obj.name
    tris = tri_count(obj)
    budget = BUDGETS.get(role, BUDGETS["medium"])
    if tris > budget:
        print(f"[mesh] ATTENTION {obj.name}: {tris} tris > budget {role} ({budget})")
    return obj
