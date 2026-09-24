"""Primitives bmesh partagées par tous les assets : boîtes, cylindres, arcs, boîtes ouvertes ou à
planches, prismes extrudés. Aucune dépendance au contexte ou à la sélection.

Convention : un cylindre naît le long de Z ; `axis="X"|"Y"` le couche. Un arc (`arch`) vit dans le
plan XZ autour de l'axe Y (`axis="Y"`) ou dans le plan YZ autour de X (`axis="X"`).
"""
import math

import bmesh
from mathutils import Matrix, Vector


def add_box(bm, size, center, taper_top=0.0):
    """Ajoute une boîte au bmesh, renvoie ses verts. `taper_top` rétrécit le dessus en Y."""
    verts = bmesh.ops.create_cube(bm, size=1.0)["verts"]
    sx, sy, sz = size
    for v in verts:
        v.co = Vector((v.co.x * sx, v.co.y * sy, v.co.z * sz))
        if taper_top and v.co.z > 0:
            v.co.y *= 1.0 - taper_top
        v.co += Vector(center)
    return verts


def box(size, center=(0, 0, 0), taper_top=0.0):
    bm = bmesh.new()
    add_box(bm, size, center, taper_top)
    return bm


def rotate_verts(bm, verts, axis):
    """Couche une géométrie née le long de Z sur X ou Y."""
    if axis == "Y":
        rot = Matrix.Rotation(math.radians(90), 3, "X")
    elif axis == "X":
        rot = Matrix.Rotation(math.radians(90), 3, "Y")
    else:
        return
    bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=rot, verts=verts)


def rotate_about_z(bm, verts, angle_deg, center=(0, 0, 0)):
    bmesh.ops.rotate(bm, cent=Vector(center), matrix=Matrix.Rotation(math.radians(angle_deg), 3, "Z"), verts=verts)


def add_cyl(bm, radius, depth, axis="Z", center=(0, 0, 0), segments=16, radius2=None):
    verts = bmesh.ops.create_cone(
        bm,
        cap_ends=True,
        cap_tris=False,
        segments=segments,
        radius1=radius,
        radius2=radius if radius2 is None else radius2,
        depth=depth,
    )["verts"]
    rotate_verts(bm, verts, axis)
    bmesh.ops.translate(bm, vec=Vector(center), verts=verts)
    return verts


def cylinder(radius, depth, axis="Z", segments=24, center=(0, 0, 0)):
    bm = bmesh.new()
    add_cyl(bm, radius, depth, axis, center, segments)
    return bm


def faces_of(bm, verts):
    """Indices des faces dont tous les sommets sont dans `verts` (pour un matériau à part)."""
    bm.verts.index_update()
    bm.faces.index_update()
    ids = {v.index for v in verts}
    return [f.index for f in bm.faces if all(v.index in ids for v in f.verts)]


def arch(r_in, r_out, width, a0_deg, a1_deg, steps=12, axis="Y"):
    """Tranche d'anneau pleine, de a0 à a1 (degrés, depuis l'horizontale vers le haut).
    axis="Y" : plan XZ, épaisseur le long de Y ; axis="X" : plan YZ, épaisseur le long de X."""
    bm = bmesh.new()
    rings = []
    for i in range(steps + 1):
        a = math.radians(a0_deg + (a1_deg - a0_deg) * i / steps)
        c, s = math.cos(a), math.sin(a)
        rings.append(
            [
                bm.verts.new((r * c, y, r * s))
                for r, y in ((r_in, -width / 2), (r_out, -width / 2), (r_out, width / 2), (r_in, width / 2))
            ]
        )
    for r0, r1 in zip(rings, rings[1:]):
        for j in range(4):
            bm.faces.new((r0[j], r0[(j + 1) % 4], r1[(j + 1) % 4], r1[j]))
    bm.faces.new(rings[0][::-1])
    bm.faces.new(rings[-1])
    if axis == "X":
        rotate_about_z(bm, bm.verts[:], 90)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def open_box(size, center, wall=0.06):
    """Boîte ouverte sur le dessus (benne, bac) : inset du dessus, fond enfoncé."""
    bm = bmesh.new()
    add_box(bm, size, (0, 0, 0))
    bm.normal_update()
    top = [f for f in bm.faces if f.normal.z > 0.9]
    bmesh.ops.inset_individual(bm, faces=top, thickness=wall, depth=0.0)
    bm.normal_update()
    depth = size[2] - wall
    for f in top:
        for v in f.verts:
            v.co.z -= depth
    bmesh.ops.translate(bm, vec=Vector(center), verts=bm.verts)
    return bm


def slatted_box(size, center, inset=0.03, recess=0.012):
    """Caisse à planches : faces latérales en léger retrait."""
    bm = bmesh.new()
    add_box(bm, size, (0, 0, 0))
    bm.normal_update()
    sides = [f for f in bm.faces if abs(f.normal.z) < 0.5]
    bmesh.ops.inset_individual(bm, faces=sides, thickness=inset, depth=0.0)
    bm.normal_update()
    for f in sides:
        for v in f.verts:
            v.co -= f.normal * recess
    bmesh.ops.translate(bm, vec=Vector(center), verts=bm.verts)
    return bm


def prism(points, thickness, plane="YZ"):
    """Polygone (liste de (u, v), concave accepté) extrudé de `thickness` le long de l'axe normal
    au plan : plane="YZ" -> extrusion le long de +X ; "XZ" -> +Y ; "XY" -> +Z."""
    bm = bmesh.new()
    if plane == "YZ":
        make, push = (lambda u, v: (0.0, u, v)), (thickness, 0, 0)
    elif plane == "XZ":
        make, push = (lambda u, v: (u, 0.0, v)), (0, thickness, 0)
    else:
        make, push = (lambda u, v: (u, v, 0.0)), (0, 0, thickness)
    face = bm.faces.new([bm.verts.new(make(u, v)) for u, v in points])
    res = bmesh.ops.extrude_face_region(bm, geom=[face])
    moved = [g for g in res["geom"] if isinstance(g, bmesh.types.BMVert)]
    bmesh.ops.translate(bm, vec=Vector(push), verts=moved)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    return bm


def bisect_z(bm, heights):
    """Coupe le maillage par des plans horizontaux (coordonnées locales) : indispensable avant un
    dégradé par couleurs par sommet (marque de marée, bande de poussière), sinon l'attribut n'est
    interpolé qu'entre les coins."""
    for z in heights:
        geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
        bmesh.ops.bisect_plane(bm, geom=geom, plane_co=(0, 0, z), plane_no=(0, 0, 1), clear_inner=False, clear_outer=False)
    return bm


def ring(r_out, r_in, depth, axis="Z", segments=24, center=(0, 0, 0)):
    """Anneau plein (tore à section rectangulaire) : corde lovée, pneu, bouée, cerclage."""
    bm = bmesh.new()
    levels = {}
    for z in (depth / 2, -depth / 2):
        angles = [2 * math.pi * i / segments for i in range(segments)]
        levels[z] = (
            [bm.verts.new((r_out * math.cos(a), r_out * math.sin(a), z)) for a in angles],
            [bm.verts.new((r_in * math.cos(a), r_in * math.sin(a), z)) for a in angles],
        )
    (to, ti), (bo, bi) = levels[depth / 2], levels[-depth / 2]
    for i in range(segments):
        j = (i + 1) % segments
        bm.faces.new((to[i], to[j], ti[j], ti[i]))
        bm.faces.new((bi[i], bi[j], bo[j], bo[i]))
        bm.faces.new((bo[i], bo[j], to[j], to[i]))
        bm.faces.new((ti[i], ti[j], bi[j], bi[i]))
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    rotate_verts(bm, bm.verts[:], axis)
    bmesh.ops.translate(bm, vec=Vector(center), verts=bm.verts)
    return bm
