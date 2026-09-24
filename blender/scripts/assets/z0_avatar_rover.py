"""Z0 · Avatar · le rover (STORYTELLING §3.3, ART_DIRECTION §5 et §8).

Étapes : `blockout` (masses et proportions, validées par Pierre le 2026-09-05) puis `details`
(garde-boue, portières, vitres, suspension visible, calandre, treuil, marchepieds, échelle, snorkel,
feux, usure). Repère : avant = +X, gauche = +Y, haut = +Z ; roues au sol (z = 0). Gabarit
3,2 × 1,9 × 1,7 m, roues Ø 0,8. Depuis le 2026-09-06 (retouche de Pierre reprise ici) : la cabine
est une coque percée aux vitres, le verre est transparent (transmission) et l'intérieur existe.

Structure : un Empty racine `Z0_Avatar_Rover`, chaque pièce est un objet enfant (roues, antenne...
animés dans three.js). Les pivots sont posés au bon endroit (centre de roue, base d'antenne),
donc `finalize(origin_base=False)`. Les rotations de placement (pare-brise, snorkel, panneaux de
portière) restent des transforms.

    run("assets/z0_avatar_rover.py")["create"](stage="details")
"""
import math

import bmesh
import bpy
from mathutils import Matrix, Vector

from lib import materials, mesh, naming
from lib.shapes import add_box, add_cyl, arch, box, cylinder, faces_of, open_box, prism, ring, rotate_verts, slatted_box

ZONE, CATEGORY, BASE = "Z0_PORT", "Avatar", "Rover"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)  # Z0_Avatar_Rover

# Gabarit (m)
WHEEL_R, WHEEL_W = 0.40, 0.30
TRACK_Y, WHEELBASE_X = 0.80, 0.95      # roues en (±0.95, ±0.80)
FLOOR_Z = 0.82                         # dessous des caisses, au-dessus des roues (0.80)
CABIN_H, CABIN_TAPER, WINDSHIELD_BACK = 0.80, 0.045, 0.32
ROOF_Z = FLOOR_Z + CABIN_H + 0.03      # galerie

WHEELS = tuple((sx, fx, sy, side) for sx, fx in ((1, "F"), (-1, "R")) for sy, side in ((1, "L"), (-1, "R")))
LEVELS = {"blockout": 0, "details": 1, "polish": 2}
# Panneau de portière en U (x, z locaux) : échancré autour de la vitre latérale (0.50 × 0.28 à z 1.22..1.50)
DOOR_OUTLINE = [(-0.33, -0.30), (0.33, -0.30), (0.33, 0.30), (0.24, 0.30), (0.24, 0.10), (-0.24, 0.10), (-0.24, 0.30), (-0.33, 0.30)]


# ----------------------------------------------------------------------------- géométrie de base
# Les primitives vivent dans lib/shapes.py (partagées par tous les assets) ; alias locaux.
_add_box, _box, _rotate_verts, _add_cyl, _cylinder, _faces_of = add_box, box, rotate_verts, add_cyl, cylinder, faces_of
_open_box, _slatted_box, _arch = open_box, slatted_box, arch


def _wheel(radius, width, axis="Y", segments=24):
    """Roue : cylindre + moyeu en creux. Renvoie (bm, indices des faces de moyeu)."""
    bm = bmesh.new()
    bmesh.ops.create_cone(
        bm, cap_ends=True, cap_tris=False, segments=segments, radius1=radius, radius2=radius, depth=width
    )
    bm.normal_update()
    caps = [f for f in bm.faces if abs(f.normal.z) > 0.9]
    bmesh.ops.inset_individual(bm, faces=caps, thickness=radius * 0.38, depth=0.0)
    bm.normal_update()
    for f in caps:  # les faces d'origine sont devenues le centre : on les enfonce
        for v in f.verts:
            v.co -= f.normal * (width * 0.15)
    bm.faces.index_update()
    hub = [f.index for f in caps]
    _rotate_verts(bm, bm.verts[:], axis)
    return bm, hub


def _wheel_trim(radius, width, axis="Y", outer=-1, lugs=0):
    """Six rayons et chapeau de moyeu sur la face extérieure (`outer` = signe du cap Z qui devient la
    face visible après couchage). Plus de crampons sur la bande de roulement (Pierre, 2026-09-07 :
    à l'écran la roue crantée semblait sauter ; `lugs=0`). Objet à part, sans bevel (budget), enfant
    de la roue : il tourne avec elle. Renvoie (bm, faces des rayons)."""
    bm = bmesh.new()
    for i in range(lugs):
        offset = 0.1 * width if i % 2 else -0.1 * width
        vs = _add_box(bm, (0.05, 0.075 * radius / 0.40, 0.72 * width), (radius, 0, offset))
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(2 * math.pi * i / lugs, 3, "Z"), verts=vs)
    zc = outer * (width / 2 - width * 0.15)
    spoke_verts = []
    for i in range(6):
        vs = _add_box(bm, (radius * 0.45, 0.03, 0.025), (radius * 0.375, 0, zc + outer * 0.0125))
        bmesh.ops.rotate(bm, cent=(0, 0, 0), matrix=Matrix.Rotation(2 * math.pi * i / 6, 3, "Z"), verts=vs)
        spoke_verts += vs
    spoke_verts += _add_cyl(bm, radius * 0.14, 0.03, axis="Z", center=(0, 0, zc + outer * 0.015), segments=12)
    spokes = _faces_of(bm, spoke_verts)
    _rotate_verts(bm, bm.verts[:], axis)
    return bm, spokes


def _cabin_side_y(z):
    """Demi-largeur de la cabine à la hauteur z (le toit est rétréci de CABIN_TAPER)."""
    t = max(0.0, min(1.0, (z - FLOOR_Z) / CABIN_H))
    return 0.75 - CABIN_TAPER * t


# ----------------------------------------------------------------------------- objets
def _cut_opening(bm, pick, center, axes):
    """Perce une ouverture rectangulaire dans les faces retenues par `pick(face)` : `axes` donne deux
    directions dans le plan de la face avec leur demi-longueur. Quatre bissections limitées à ces
    faces (les voisines gagnent juste un sommet sur l'arête partagée), puis la face centrale est
    retirée. Reproduit la découpe faite à la main par Pierre le 2026-09-06."""
    center = Vector(center)
    for direction, half in axes:
        d = Vector(direction).normalized()
        for sign in (-1.0, 1.0):
            bm.normal_update()
            faces = [f for f in bm.faces if pick(f)]
            geom = list({v for f in faces for v in f.verts}) + list({e for f in faces for e in f.edges}) + faces
            bmesh.ops.bisect_plane(
                bm, geom=geom, dist=1e-5, plane_co=center + d * (sign * half), plane_no=d,
                use_snap_center=False, clear_outer=False, clear_inner=False,
            )
    bm.normal_update()
    hole = min((f for f in bm.faces if pick(f)), key=lambda f: (f.calc_center_median() - center).length)
    bmesh.ops.delete(bm, geom=[hole], context="FACES")


def _cabin_openings(bm):
    """Les quatre ouvertures de la coque, dans le repère local de la cabine (pivot en
    (0.575, 0, FLOOR_Z + CABIN_H / 2)), aux dimensions des panneaux vitrés posés par `_details`."""
    z0 = FLOOR_Z + CABIN_H / 2
    up_face = Vector((-WINDSHIELD_BACK, 0, CABIN_H)).normalized()  # « vers le haut » le long du pare-brise
    windshield = (1.15 - WINDSHIELD_BACK * 0.58 - 0.575, 0, CABIN_H * 0.58 - CABIN_H / 2)
    _cut_opening(bm, lambda f: f.normal.x > 0.5, windshield, [((0, 1, 0), 0.62), (up_face, 0.21)])
    for sy in (1, -1):
        _cut_opening(bm, lambda f, sy=sy: f.normal.y * sy > 0.5, (0.45 - 0.575, sy * 0.72, 1.36 - z0), [((1, 0, 0), 0.25), ((0, 0, 1), 0.14)])
    _cut_opening(bm, lambda f: f.normal.x < -0.5, (-0.575, 0, 1.38 - z0), [((0, 1, 0), 0.45), ((0, 0, 1), 0.13)])


def _shell(obj, thickness=0.035):
    """Coque en tôle : épaisseur vers l'intérieur et bords pleins aux ouvertures, avant le bevel."""
    mod = obj.modifiers.new("Solidify", "SOLIDIFY")
    mod.thickness = thickness
    mod.offset = -1.0
    mod.use_rim = True
    mod.use_even_offset = True
    obj.modifiers.move(len(obj.modifiers) - 1, 0)


def _remove_existing(root_name):
    root = bpy.data.objects.get(root_name)
    if root is None:
        return
    for child in list(root.children_recursive):
        data = child.data
        bpy.data.objects.remove(child, do_unlink=True)
        if data is not None and data.users == 0:
            bpy.data.meshes.remove(data)
    bpy.data.objects.remove(root, do_unlink=True)


def _part(name, bm, pivot, root, mat, *, bevel=0.02, segments=2, role="hero", faces_by_material=None):
    """Crée l'objet enfant, assigne les matériaux, finalise (lisse par angle + bevel)."""
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    obj = bpy.data.objects.new(name, me)
    naming.link(obj, naming.ensure_collection(f"{ZONE}/{CATEGORY}"))
    obj.location = Vector(pivot)
    obj.parent = root
    materials.assign(obj, mat)
    for extra_mat, faces in faces_by_material or []:
        materials.assign(obj, extra_mat, faces=faces)
    mesh.finalize(
        obj, role=role, smooth_angle=30, bevel_width=bevel, bevel_segments=segments, origin_base=False
    )
    return obj


def _materials(level: int = 1):
    M = {
        "body": materials.palette_material("avatar.body", roughness=0.55),
        "trim": materials.palette_material("avatar.trim", roughness=0.7),
        "chassis": materials.palette_material("avatar.chassis", roughness=0.8),
        "wheels": materials.palette_material("avatar.wheels", roughness=0.95),
        "accent": materials.palette_material("avatar.accent", roughness=0.3, metallic=1.0),
        "lens": materials.palette_material(
            "avatar.headlight", roughness=0.2, emission="avatar.headlight", emission_strength=0.6, name="MAT_headlight"
        ),
        "glass": materials.palette_material("materials.glass", roughness=0.15),
        "canvas": materials.palette_material("materials.canvas", roughness=0.95),
        "wood": materials.palette_material("materials.wood_light", roughness=0.9),
        "wood_dark": materials.palette_material("materials.wood_dark", roughness=0.9),
        "dust": {},  # nom de matériau -> (attribut haut, z bas, z haut) pour mesh.paint_gradient
    }
    if level >= 2:
        # Passe matières : peinture satinée, fonte un peu métallique, verre profond, et de la
        # poussière sur le bas de caisse par couleurs par sommet (exportable, ART_DIRECTION §6).
        # Discret : seulement les 15 à 20 cm du bas des caisses, et le train roulant.
        body, top, bottom = materials.vertex_tinted_material("MAT_body_dust", "avatar.body", "materials.sand", mix=0.35, roughness=0.45)
        M["body"] = body
        M["dust"][body.name] = (top, bottom, FLOOR_Z - 0.10, FLOOR_Z + 0.16)
        chassis, top, bottom = materials.vertex_tinted_material(
            "MAT_chassis_dust", "avatar.chassis", "materials.sand", mix=0.2, roughness=0.75, metallic=0.35
        )
        M["chassis"] = chassis
        M["dust"][chassis.name] = (top, bottom, 0.25, 0.70)
        M["trim"] = materials.palette_material("avatar.trim", roughness=0.6)
        M["glass"] = materials.glass_material()
    return M


def _masses(root, M, stage):
    """Les masses validées (blockout). En `details`, les petits props gagnent leurs détails ;
    en `polish`, les roues gagnent crampons et rayons."""
    P = f"{ROOT}_"
    level = LEVELS[stage]
    body, trim, chassis, wheels, brass = M["body"], M["trim"], M["chassis"], M["wheels"], M["accent"]

    # Châssis : poutre basse sous les caisses
    _part(P + "Chassis", _box((2.5, 1.2, 0.26)), (0.05, 0, FLOOR_Z - 0.13), root, chassis, bevel=0.015)

    # Cabine : pare-brise incliné, toit rétréci, toit crème (deux tons). Dès `details`, la caisse
    # est une coque percée aux vitres (pare-brise, latérales, arrière) : on voit l'intérieur.
    bm = _box((1.15, 1.50, CABIN_H), (0, 0, 0), taper_top=0.06)
    for v in bm.verts:
        if v.co.x > 0 and v.co.z > 0:
            v.co.x -= WINDSHIELD_BACK
    if stage != "blockout":
        _cabin_openings(bm)
    bm.normal_update()
    bm.faces.index_update()
    roof = [f.index for f in bm.faces if f.normal.z > 0.9]
    cabin = _part(P + "Cabin", bm, (0.575, 0, FLOOR_Z + CABIN_H / 2), root, body, faces_by_material=[(trim, roof)])
    if stage != "blockout":
        _shell(cabin, thickness=0.035)

    # Capot court qui plonge vers l'avant
    bm = _box((0.35, 1.50, 0.23), (0, 0, 0))
    for v in bm.verts:
        if v.co.x > 0 and v.co.z > 0:
            v.co.z -= 0.08
    _part(P + "Hood", bm, (1.325, 0, FLOOR_Z + 0.115), root, body)

    # Benne ouverte
    _part(P + "Bed", _open_box((1.25, 1.50, 0.38), (0, 0, 0)), (-0.725, 0, FLOOR_Z + 0.19), root, body)

    # Pare-chocs (l'avant est cabossé : un coin enfoncé)
    bm = _box((0.10, 1.70, 0.16))
    if stage != "blockout":
        corner = min(bm.verts, key=lambda v: (-v.co.x, v.co.y, v.co.z))
        corner.co.x -= 0.035
        corner.co.z -= 0.012
    _part(P + "Bumper_F", bm, (1.55, 0, 0.66), root, chassis, bevel=0.015)
    _part(P + "Bumper_R", _box((0.10, 1.60, 0.16)), (-1.40, 0, 0.66), root, chassis, bevel=0.015)

    # Roues et moyeux porteurs (pivot roue = centre de roue)
    for sx, fx, sy, side in WHEELS:
        x, y = sx * WHEELBASE_X, sy * TRACK_Y
        bm, hub = _wheel(WHEEL_R, WHEEL_W, axis="Y")
        hub_mat = wheels if level >= 2 else brass  # en polish le creux reste sombre, les rayons sont laiton
        wheel = _part(P + f"Wheel_{fx}{side}", bm, (x, y, WHEEL_R), root, wheels, bevel=0.03, faces_by_material=[(hub_mat, hub)])
        if level >= 2:
            bm, spokes = _wheel_trim(WHEEL_R, WHEEL_W, axis="Y", outer=-sy)
            _part(P + f"WheelTrim_{fx}{side}", bm, (0, 0, 0), wheel, wheels, bevel=0.0, faces_by_material=[(brass, spokes)])
        _part(P + f"Hub_{fx}{side}", _box((0.30, 0.30, 0.20)), (x, sy * 0.62, WHEEL_R), root, chassis, bevel=0.01)
        if stage == "blockout":
            _part(P + f"Strut_{fx}{side}", _box((0.12, 0.12, 0.22)), (x, sy * 0.55, 0.52), root, chassis, bevel=0.008)

    # Galerie de toit : deux longerons + trois traverses
    bm = bmesh.new()
    for sy in (1, -1):
        _add_box(bm, (0.86, 0.05, 0.05), (0.43, sy * 0.62, ROOF_Z))
    for x in (0.06, 0.43, 0.80):
        _add_box(bm, (0.05, 1.29, 0.05), (x, 0, ROOF_Z))
    _part(P + "Rack", bm, (0, 0, 0), root, chassis, bevel=0.008)

    # Bâche roulée (droite), jerrican et caisse dans la benne (gauche) : asymétrie
    _part(P + "Tarp", _cylinder(0.12, 0.80, axis="X", segments=16), (0.43, -0.30, ROOF_Z + 0.025 + 0.12), root, M["canvas"], bevel=0.0)
    if stage == "blockout":
        _part(P + "Jerrycan", _box((0.18, 0.34, 0.42)), (-1.10, 0.45, FLOOR_Z + 0.04 + 0.21), root, trim, bevel=0.012)
        _part(P + "Crate", _box((0.44, 0.44, 0.34)), (-0.55, -0.35, FLOOR_Z + 0.04 + 0.17), root, M["wood"], bevel=0.012)
    else:
        bm = bmesh.new()
        _add_box(bm, (0.18, 0.34, 0.42), (0, 0, 0.21))
        _add_box(bm, (0.04, 0.16, 0.03), (0, 0, 0.445))
        cap = _add_cyl(bm, 0.03, 0.04, axis="Z", center=(0, 0.12, 0.44), segments=10)
        _part(P + "Jerrycan", bm, (-1.10, 0.45, FLOOR_Z + 0.04), root, trim, bevel=0.01, segments=1,
              faces_by_material=[(chassis, _faces_of(bm, cap))])
        bm = _slatted_box((0.44, 0.44, 0.34), (0, 0, 0.17))
        bm.normal_update()
        bm.faces.index_update()
        lids = [f.index for f in bm.faces if abs(f.normal.z) > 0.9]
        _part(P + "Crate", bm, (-0.55, -0.35, FLOOR_Z + 0.04), root, M["wood"], bevel=0.01, segments=1,
              faces_by_material=[(M["wood_dark"], lids)])

    # Roue de secours sur le hayon + sa patte
    bm, hub = _wheel(0.36, 0.20, axis="X")
    spare = _part(P + "Spare", bm, (-1.56, 0, 0.98), root, wheels, bevel=0.03, faces_by_material=[(wheels if level >= 2 else brass, hub)])
    if level >= 2:
        bm, spokes = _wheel_trim(0.36, 0.20, axis="X", outer=-1)
        _part(P + "SpareTrim", bm, (0, 0, 0), spare, wheels, bevel=0.0, faces_by_material=[(brass, spokes)])
    _part(P + "SpareMount", _box((0.14, 0.30, 0.30)), (-1.42, 0, 0.98), root, chassis, bevel=0.01)

    # Antenne fouet (pivot à la base, coin avant-gauche de la benne)
    bm = bmesh.new()
    if stage == "blockout":
        _add_cyl(bm, 0.02, 1.0, axis="Z", center=(0, 0, 0.5), segments=8, radius2=0.01)
    else:
        _add_cyl(bm, 0.045, 0.05, axis="Z", center=(0, 0, 0.025), segments=10)
        _add_cyl(bm, 0.03, 0.10, axis="Z", center=(0, 0, 0.10), segments=10)
        _add_cyl(bm, 0.015, 0.86, axis="Z", center=(0, 0, 0.58), segments=8, radius2=0.008)
    ball = bmesh.ops.create_icosphere(bm, subdivisions=1, radius=0.035)["verts"]
    bmesh.ops.translate(bm, vec=(0, 0, 1.03), verts=ball)
    _part(P + "Antenna", bm, (-0.15, 0.68, FLOOR_Z + 0.38), root, chassis, bevel=0.0)

    # Phares ronds
    for sy, side in ((1, "L"), (-1, "R")):
        _part(P + f"Headlight_{side}", _cylinder(0.075, 0.08, axis="X", segments=16), (1.53, sy * 0.55, 0.90), root, M["lens"], bevel=0.01)


def _details(root, M, level=1):
    """Niveau 2 (détails fonctionnels) et niveau 3 (imperfections) de la DA."""
    P = f"{ROOT}_"
    body, trim, dark, brass, glass, lens = M["body"], M["trim"], M["chassis"], M["accent"], M["glass"], M["lens"]
    tilt = math.atan2(CABIN_TAPER, CABIN_H)                # inclinaison des flancs de cabine
    slope = -math.atan2(WINDSHIELD_BACK, CABIN_H)           # inclinaison du pare-brise (autour de Y)
    normal = Vector((CABIN_H, 0, WINDSHIELD_BACK)).normalized()

    # Garde-boue au-dessus de chaque roue, bavettes derrière les roues arrière
    for sx, fx, sy, side in WHEELS:
        x, y = sx * WHEELBASE_X, sy * TRACK_Y
        _part(P + f"Fender_{fx}{side}", _arch(0.46, 0.52, 0.34, 20, 155, 12), (x, y, WHEEL_R), root, dark, bevel=0.012, segments=1)
        if sx < 0:
            _part(P + f"MudFlap_{side}", _box((0.02, 0.30, 0.30)), (-1.43, y, 0.47), root, dark, bevel=0.006, segments=1)

    # Essieux rigides : tube, nez de pont décalé, deux bras tirés vers le châssis
    for sx, fx in ((1, "F"), (-1, "R")):
        x = sx * WHEELBASE_X
        bm = bmesh.new()
        _add_cyl(bm, 0.05, 1.30, axis="Y", center=(x, 0, WHEEL_R), segments=12)
        diff = bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.11)["verts"]
        bmesh.ops.translate(bm, vec=(x, 0.15, WHEEL_R), verts=diff)
        for sy in (1, -1):
            _add_box(bm, (0.46, 0.05, 0.05), (x - sx * 0.28, sy * 0.40, WHEEL_R + 0.06))
        _part(P + f"Axle_{fx}", bm, (0, 0, 0), root, dark, bevel=0.006, segments=1)

    # Amortisseurs : tige sombre + ressort laiton, entre roue et flanc de caisse
    for sx, fx, sy, side in WHEELS:
        bm = bmesh.new()
        _add_cyl(bm, 0.022, 0.34, axis="Z", center=(0, 0, 0.17), segments=10)
        coil = _add_cyl(bm, 0.05, 0.16, axis="Z", center=(0, 0, 0.10), segments=12)
        _part(P + f"Shock_{fx}{side}", bm, (sx * WHEELBASE_X + sx * 0.16, sy * 0.70, 0.46), root, dark, bevel=0.004, segments=1,
              faces_by_material=[(brass, _faces_of(bm, coil))])

    # Marchepieds entre les roues, sur deux pattes
    for sy, side in ((1, "L"), (-1, "R")):
        bm = bmesh.new()
        _add_box(bm, (0.90, 0.10, 0.05), (0, sy * 0.86, 0.68))
        for bx in (-0.32, 0.32):
            _add_box(bm, (0.06, 0.26, 0.04), (bx, sy * 0.73, 0.70))
        _part(P + f"Step_{side}", bm, (0, 0, 0), root, dark, bevel=0.008, segments=1)

    # Portières (panneau en saillie = ligne de joint), vitres, poignées, rétroviseurs
    for sy, side in ((1, "L"), (-1, "R")):
        bm = prism(DOOR_OUTLINE, 0.012, plane="XZ")  # panneau en U, échancré autour de la vitre
        bmesh.ops.translate(bm, vec=(0, -0.006, 0), verts=bm.verts)
        door = _part(P + f"Door_{side}", bm, (0.45, sy * (_cabin_side_y(1.12) + 0.006), 1.12), root, body, bevel=0.006, segments=1)
        door.rotation_euler.x = sy * tilt
        window = _part(P + f"Window_{side}", _box((0.50, 0.02, 0.28)), (0.45, sy * (_cabin_side_y(1.36) + 0.022), 1.36), root, glass, bevel=0.006, segments=1)
        window.rotation_euler.x = sy * tilt
        handle = _part(P + f"Handle_{side}", _box((0.10, 0.02, 0.03)), (0.70, sy * (_cabin_side_y(1.20) + 0.022), 1.20), root, brass, bevel=0.004, segments=1)
        handle.rotation_euler.x = sy * tilt
        bm = bmesh.new()
        side_y = _cabin_side_y(1.42)
        if level >= 2:  # plus petit, avec une embase visible sur le montant
            _add_box(bm, (0.04, 0.03, 0.06), (0.92, sy * (side_y + 0.012), 1.42))
            _add_box(bm, (0.022, 0.08, 0.022), (0.92, sy * (side_y + 0.065), 1.42))
            _add_box(bm, (0.035, 0.05, 0.08), (0.92, sy * (side_y + 0.13), 1.42))
        else:
            _add_box(bm, (0.03, 0.12, 0.03), (0.92, sy * (side_y + 0.06), 1.42))
            _add_box(bm, (0.05, 0.06, 0.11), (0.92, sy * (side_y + 0.15), 1.42))
        _part(P + f"Mirror_{side}", bm, (0, 0, 0), root, dark, bevel=0.005, segments=1)

    # Pare-brise (panneau vitré posé sur la face inclinée) et vitre arrière
    center = Vector((1.15 - WINDSHIELD_BACK * 0.58, 0, FLOOR_Z + CABIN_H * 0.58)) + normal * 0.012
    windshield = _part(P + "Windshield", _box((0.02, 1.24, 0.42)), tuple(center), root, glass, bevel=0.006, segments=1)
    windshield.rotation_euler.y = slope
    _part(P + "RearWindow", _box((0.02, 0.90, 0.26)), (-0.011, 0, 1.38), root, glass, bevel=0.006, segments=1)

    # Intérieur, visible par les ouvertures de la coque : banquette, dossier, tableau de bord, volant
    canvas = M["canvas"]
    floor = FLOOR_Z + 0.035  # dessus du plancher de la coque (épaisseur de tôle)
    _part(P + "Seat", _box((0.48, 1.26, 0.36)), (0.36, 0, floor + 0.18), root, canvas, bevel=0.02, segments=1, role="medium")
    _part(P + "SeatBack", _box((0.10, 1.26, 0.30)), (0.12, 0, floor + 0.36 + 0.15), root, canvas, bevel=0.02, segments=1, role="medium")
    _part(P + "Dashboard", _box((0.28, 1.36, 0.15)), (0.88, 0, 0.995), root, dark, bevel=0.01, segments=1, role="medium")
    bm = ring(0.17, 0.15, 0.025, axis="X", segments=20)
    _add_cyl(bm, 0.04, 0.03, axis="X", center=(0, 0, 0), segments=12)
    _add_cyl(bm, 0.018, 0.26, axis="X", center=(0.13, 0, 0), segments=8)
    steering = _part(P + "Steering", bm, (0.66, 0.42, 1.23), root, dark, bevel=0.0, role="medium")
    steering.rotation_euler.y = math.radians(39)  # volant perpendiculaire à la colonne, qui descend vers le tableau de bord

    # Snorkel le long du montant droit (prise d'air), coude vers l'avant en haut
    bm = bmesh.new()
    _add_cyl(bm, 0.045, 0.86, axis="Z", center=(0, 0, 0), segments=12)
    _add_box(bm, (0.14, 0.09, 0.09), (0.05, 0, 0.45))
    snorkel = _part(P + "Snorkel", bm, (1.15 - WINDSHIELD_BACK * 0.5, -(_cabin_side_y(1.22) + 0.05), FLOOR_Z + CABIN_H * 0.5), root, dark, bevel=0.005, segments=1)
    snorkel.rotation_euler.y = slope

    # Calandre à lames, cerclages de phares, treuil, plaques
    bm = bmesh.new()
    for z in (0.855, 0.885, 0.915, 0.945):
        _add_box(bm, (0.02, 0.56, 0.018), (1.51, 0, z))
    _part(P + "Grille", bm, (0, 0, 0), root, dark, bevel=0.004, segments=1)
    for sy, side in ((1, "L"), (-1, "R")):
        _part(P + f"HeadlightRim_{side}", _cylinder(0.095, 0.03, axis="X", segments=16), (1.505, sy * 0.55, 0.90), root, dark, bevel=0.006, segments=1)
    bm = bmesh.new()
    for sy in (1, -1):
        _add_box(bm, (0.14, 0.03, 0.12), (1.60, sy * 0.17, 0.78))
    drum = _add_cyl(bm, 0.045, 0.30, axis="Y", center=(1.60, 0, 0.78), segments=12)
    _part(P + "Winch", bm, (0, 0, 0), root, dark, bevel=0.005, segments=1, faces_by_material=[(brass, _faces_of(bm, drum))])
    _part(P + "Plate_F", _box((0.012, 0.30, 0.10)), (1.606, 0.45, 0.66), root, trim, bevel=0.003, segments=1)
    _part(P + "Plate_R", _box((0.012, 0.30, 0.10)), (-1.456, -0.45, 0.66), root, trim, bevel=0.003, segments=1)

    # Benne : lisses, crochets d'arrimage, bouchon de réservoir, hayon, feux, échappement
    bm = bmesh.new()
    for sy in (1, -1):
        _add_box(bm, (1.27, 0.04, 0.03), (-0.725, sy * 0.75, 1.215))
    for x in (-1.35, -0.10):
        _add_box(bm, (0.04, 1.54, 0.03), (x, 0, 1.215))
    _part(P + "BedRails", bm, (0, 0, 0), root, dark, bevel=0.005, segments=1)
    bm = bmesh.new()
    for sy in (1, -1):
        for x in (-1.20, -0.72, -0.25):
            _add_box(bm, (0.05, 0.03, 0.05), (x, sy * 0.775, 1.15))
    _part(P + "TieDowns", bm, (0, 0, 0), root, brass, bevel=0.004, segments=1)
    _part(P + "FuelCap", _cylinder(0.05, 0.02, axis="Y", segments=12), (-0.45, 0.76, 1.05), root, brass, bevel=0.003, segments=1)
    _part(P + "Tailgate", _box((0.012, 1.10, 0.26)), (-1.356, 0, 1.03), root, body, bevel=0.006, segments=1)
    for sy, side in ((1, "L"), (-1, "R")):
        _part(P + f"TailLight_{side}", _box((0.03, 0.10, 0.06)), (-1.365, sy * 0.62, 1.10), root, lens, bevel=0.005, segments=1)
    _part(P + "Exhaust", _cylinder(0.035, 0.36, axis="X", segments=12), (-1.30, -0.50, 0.55), root, dark, bevel=0.004, segments=1)

    # Échelle d'accès, côté gauche de la benne
    bm = bmesh.new()
    for x in (-0.72, -0.46):
        _add_box(bm, (0.03, 0.03, 0.44), (x, 0.78, 1.08))
    for z in (0.94, 1.06, 1.18):
        _add_box(bm, (0.29, 0.03, 0.03), (-0.59, 0.78, z))
    _part(P + "Ladder", bm, (0, 0, 0), root, dark, bevel=0.004, segments=1)

    # Barre de phares sur l'avant de la galerie, sangles de la bâche
    bm = bmesh.new()
    _add_box(bm, (0.10, 0.90, 0.09), (0.06, 0, 1.72))
    lenses = []
    for y in (-0.33, -0.11, 0.11, 0.33):
        lenses += _add_box(bm, (0.02, 0.14, 0.05), (0.115, y, 1.72))
    _part(P + "LightBar", bm, (0, 0, 0), root, dark, bevel=0.005, segments=1, faces_by_material=[(lens, _faces_of(bm, lenses))])
    bm = bmesh.new()
    for x in (0.20, 0.66):
        _add_cyl(bm, 0.135, 0.03, axis="X", center=(x, -0.30, ROOF_Z + 0.025 + 0.12), segments=16)
    _part(P + "TarpStraps", bm, (0, 0, 0), root, dark, bevel=0.004, segments=1)


def create(stage: str = "details", zone: str = ZONE) -> bpy.types.Object:
    _remove_existing(ROOT)
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = bpy.data.objects.new(ROOT, None)
    root.empty_display_type = "ARROWS"
    root.empty_display_size = 0.5
    naming.link(root, coll)

    level = LEVELS[stage]
    M = _materials(level)
    _masses(root, M, stage)
    if level >= 1:
        _details(root, M, level)

    parts = [o for o in root.children_recursive if o.type == "MESH"]
    if M["dust"]:  # poussière : chaque maillage qui porte un matériau "dust" doit être peint
        for part in parts:
            for slot in part.data.materials:
                if slot is not None and slot.name in M["dust"]:
                    top, bottom, z_low, z_high = M["dust"][slot.name]
                    mesh.paint_gradient(part, top, z_low, z_high, bottom)
    total = sum(mesh.tri_count(o) for o in parts)
    print(f"[rover] {stage}: {len(parts)} pièces, {total} triangles (budget héro {mesh.BUDGETS['hero']})")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
