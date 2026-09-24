"""Z0 · Architecture · le hangar du port à sec (STORYTELLING §3.2 et §4).

Étapes : `blockout` (masses, validées le 2026-09-06), `details` (marques de marée, nervures de
voûte, lames de porte, échelle, lampe, rampe, pilastres, fenêtre, tonneau, corde, rapiéçages,
validés le 2026-09-06), `polish` (ligne d'eau nette avec ligne d'écume, soubassement en pierre de
quai, corde lovée en anneau, intérieur meublé, croisillons, lampe de contrôle).
Repère local : la porte est sur la face +X (le rover en sort vers +X, le sens de la piste),
largeur 6,4 m le long de Y, profondeur 5,4 m le long de X, faîte de la voûte à 4,1 m.
Références : `references/architecture/z0-jusant-*` (volumes bombés, hublots, cordes qui pendent)
et `z2-jusant-village-falaise-01` (maisons rondes encastrées, échelles, passerelles).

    run("assets/z0_arch_hangar.py")["create"](stage="polish")
"""
import math

import bmesh
import bpy

from lib import build, materials, mesh, naming
from lib.shapes import add_box, add_cyl, arch, bisect_z, box, cylinder, prism, ring, slatted_box

ZONE, CATEGORY, BASE = "Z0_PORT", "Architecture", "Hangar"
ROOT = naming.asset_name(ZONE, CATEGORY, BASE)  # Z0_Architecture_Hangar
LEVELS = {"blockout": 0, "details": 1, "polish": 2}

W, D = 6.0, 5.0                                  # murs : largeur (Y) et profondeur (X)
WALL_T = 0.30
PLINTH_H, WALL_TOP, RISE = 0.5, 3.1, 1.0
R_IN = (W * W / 4) / (2 * RISE) + RISE / 2       # 5,0 m : rayon de la voûte surbaissée
ROOF_T = 0.15
CZ = WALL_TOP + RISE - R_IN                      # centre de la voûte (z = -0,9)
A0 = math.degrees(math.acos((W / 2) / R_IN))     # 53,13° : naissance de la voûte
A1 = 180.0 - A0
DOOR_W, DOOR_H = 3.0, 3.05                       # porte relevée (2026-09-06) : le rover sort avec sa galerie et son rouleau de bâche

# Marques de marée : paliers (z monde, t) avec t = 0 pleine teinte, t = 1 plâtre propre.
# details : simple dégradé ; polish : bas très taché, plus clair en montant, ligne d'écume sombre,
# puis coupure nette à l'ancienne ligne d'eau.
TIDE_STOPS = {
    1: [(0.5, 0.0), (1.15, 0.0), (1.5, 1.0)],
    2: [(0.5, 0.0), (1.25, 0.55), (1.36, 0.0), (1.46, 0.0), (1.52, 1.0)],
}
PLINTH_STOPS = [(0.0, 0.0), (0.3, 0.6), (0.5, 1.0)]


def _tide_cuts(level):
    return tuple(z for z, _ in TIDE_STOPS[level][1:]) if level >= 1 else ()


def _gable(door: bool, steps: int = 12):
    """Pignon dans le plan YZ : base, encoche de porte en option, arc de la voûte en haut."""
    half = W / 2
    pts = [(-half, PLINTH_H)]
    if door:
        pts += [(-DOOR_W / 2, PLINTH_H), (-DOOR_W / 2, DOOR_H), (DOOR_W / 2, DOOR_H), (DOOR_W / 2, PLINTH_H)]
    pts.append((half, PLINTH_H))
    for i in range(steps + 1):
        a = math.radians(A0 + (A1 - A0) * i / steps)
        pts.append((R_IN * math.cos(a), CZ + R_IN * math.sin(a)))
    return pts


def _roof_top(y: float) -> float:
    """z de la surface extérieure de la voûte à l'ordonnée y."""
    return CZ + math.sqrt((R_IN + ROOF_T) ** 2 - y * y)


def _materials(level: int):
    pm = materials.palette_material
    M = {
        "plaster": pm("materials.plaster", roughness=0.9),
        "plinth": pm("materials.rock_warm", roughness=0.95),
        "roof": pm("materials.hull_teal", roughness=0.7, metallic=0.2),
        "iron": pm("materials.iron_dark", roughness=0.8, metallic=0.3),
        "wood": pm("materials.wood_dark", roughness=0.9),
        "wood_light": pm("materials.wood_light", roughness=0.9),
        "brass": pm("materials.brass", roughness=0.3, metallic=1.0),
        "rope": pm("materials.rope", roughness=0.95),
        "glass": materials.glass_material(),
        "floor": pm("materials.rock_cold", roughness=0.95),
        "rust": pm("materials.rust", roughness=0.85),
        "patch": pm("materials.canvas", roughness=0.95),
        "charcoal": pm("materials.charcoal", roughness=0.95),
        "bulb": pm("lights.key_dawn", roughness=0.3, emission="lights.key_dawn", emission_strength=3.0, name="MAT_bulb"),
        "dust": {},  # nom de matériau -> (attribut haut, paliers) pour mesh.paint_stops
    }
    if level >= 1:
        # Marques de marée sur le plâtre (couleurs par sommet, exportables ; coupes aux paliers).
        plaster, top, bottom = materials.vertex_tinted_material("MAT_plaster_tide", "materials.plaster", "materials.rock_dark", mix=0.5 if level >= 2 else 0.4, roughness=0.9)
        M["plaster"] = plaster
        M["dust"][plaster.name] = (top, bottom, TIDE_STOPS[level])
    if level >= 2:
        # Soubassement en pierre de quai, humide et sombre en bas.
        plinth, top, bottom = materials.vertex_tinted_material("MAT_quay_wet", "materials.stone_quay", "materials.rock_dark", mix=0.4, roughness=0.95)
    else:
        plinth, top, bottom = materials.vertex_tinted_material("MAT_plinth_wet", "materials.rock_warm", "materials.rock_dark", mix=0.35, roughness=0.95)
    if level >= 1:
        M["plinth"] = plinth
        M["dust"][plinth.name] = (top, bottom, PLINTH_STOPS)
    return M


def _parts(root, coll, M):
    P = f"{ROOT}_"

    def part(name, bm, pivot=(0, 0, 0), mat=None, **kw):
        kw.setdefault("role", "hero")
        return build.part(P + name, bm, pivot, root, coll, mat or M["plaster"], **kw)

    return part


def _masses(part, M, level):
    tide = _tide_cuts(level)
    plinth_cuts = (0.3,) if level >= 1 else ()

    # Soubassement, pignons, murs, voûte, sol
    part("Plinth", bisect_z(box((D + 0.4, W + 0.4, PLINTH_H), (0, 0, PLINTH_H / 2)), plinth_cuts), mat=M["plinth"], bevel=0.03)
    part("Gable_F", bisect_z(prism(_gable(door=True), WALL_T, "YZ"), tide), (D / 2 - WALL_T, 0, 0), bevel=0.03, segments=1)
    part("Gable_B", bisect_z(prism(_gable(door=False), WALL_T, "YZ"), tide), (-D / 2, 0, 0), bevel=0.03, segments=1)
    for sy, side in ((1, "L"), (-1, "R")):
        bm = box((D - 2 * WALL_T, WALL_T, WALL_TOP - PLINTH_H), (0, sy * (W / 2 - WALL_T / 2), (WALL_TOP + PLINTH_H) / 2))
        part(f"Wall_{side}", bisect_z(bm, tide), bevel=0.03, segments=1)
    part("Roof", arch(R_IN, R_IN + ROOF_T, D + 0.6, A0, A1, steps=14, axis="X"), (0, 0, CZ), mat=M["roof"], bevel=0.03, segments=1)
    part("Floor", box((D - 2 * WALL_T, W - 2 * WALL_T, 0.02), (0, 0, PLINTH_H + 0.01)), mat=M["floor"], bevel=0.0)

    # Porte à enroulement, relevée : tambour dehors sous le linteau, vantail à demi baissé dans l'ouverture
    part("DoorDrum", cylinder(0.22, DOOR_W + 0.3, axis="Y", segments=16), (D / 2 + 0.22, 0, DOOR_H + 0.28), mat=M["iron"], bevel=0.01, segments=1)
    for sy, side in ((1, "L"), (-1, "R")):
        part(f"DoorBracket_{side}", box((0.30, 0.10, 0.34)), (D / 2 + 0.12, sy * (DOOR_W / 2 + 0.2), DOOR_H + 0.28), mat=M["iron"], bevel=0.008, segments=1)
    part("DoorPanel", box((0.06, DOOR_W - 0.1, 0.22)), (D / 2 - 0.16, 0, DOOR_H - 0.10), mat=M["iron"], bevel=0.008, segments=1)  # vantail relevé : seul le rail bas dépasse du tambour

    # Poutre de levage au-dessus de la porte (décalée : asymétrie), poulie, corde, crochet
    part("HoistBeam", box((1.5, 0.2, 0.2)), (D / 2 + 0.55, 0.9, 3.45), mat=M["wood"], bevel=0.015, segments=1)
    part("HoistBrace", box((0.9, 0.12, 0.12)), (D / 2 + 0.28, 0.9, 3.05), mat=M["wood"], bevel=0.01, segments=1, rotation=(0, math.radians(-40), 0))
    part("Pulley", cylinder(0.13, 0.07, axis="Y", segments=16), (D / 2 + 1.15, 0.9, 3.27), mat=M["brass"], bevel=0.006, segments=1)
    part("Rope", cylinder(0.014, 1.3, axis="Z", segments=8), (D / 2 + 1.15, 0.9, 2.55), mat=M["rope"], bevel=0.0)
    part("Hook", box((0.05, 0.05, 0.16)), (D / 2 + 1.15, 0.9, 1.84), mat=M["iron"], bevel=0.005, segments=1)

    # Hublot rond (Jusant) à gauche de la porte, enseigne sans texte à droite
    part("Porthole", cylinder(0.38, 0.34, axis="X", segments=20), (D / 2 - 0.05, -2.0, 1.95), mat=M["iron"], bevel=0.02, segments=1)
    part("PortholeGlass", cylinder(0.30, 0.04, axis="X", segments=20), (D / 2 + 0.13, -2.0, 1.95), mat=M["glass"], bevel=0.0)
    part("Sign", box((0.06, 1.4, 0.36)), (D / 2 + 0.04, 1.5, 3.4), mat=M["wood"], bevel=0.006, segments=1)

    # Cheminée du poêle d'atelier, sur la voûte
    bm = cylinder(0.16, 1.3, axis="Z", segments=12, center=(0, 0, 0.55))
    add_cyl(bm, 0.28, 0.16, axis="Z", center=(0, 0, 1.28), segments=12, radius2=0.06)
    part("Chimney", bm, (-1.2, 1.6, _roof_top(1.6) - 0.1), mat=M["iron"], bevel=0.008, segments=1)

    # Appentis côté droit (-Y) : toit en appui sur le mur, poutre et deux poteaux
    slope = math.radians(14)
    part("LeanTo_Roof", box((4.2, 2.5, 0.10)), (0, -(W / 2 + 1.25), 2.72), mat=M["roof"], bevel=0.015, segments=1, rotation=(slope, 0, 0))
    part("LeanTo_Beam", box((4.2, 0.14, 0.14)), (0, -(W / 2 + 2.35), 2.30), mat=M["wood"], bevel=0.01, segments=1)
    for sx, end in ((1, "F"), (-1, "B")):
        part(f"LeanTo_Post_{end}", box((0.16, 0.16, 2.30), (0, 0, 1.15)), (sx * 1.85, -(W / 2 + 2.35), 0), mat=M["wood"], bevel=0.01, segments=1)

    # Sous l'appentis : fûts et caisses (remplissage)
    for i, (x, y) in enumerate(((-1.1, -4.0), (-0.45, -4.35), (-0.85, -4.95))):
        part(f"Drum_{i + 1}", cylinder(0.30, 0.90, axis="Z", segments=16, center=(0, 0, 0.45)), (x, y, 0), mat=M["rust"], bevel=0.02, segments=1, role="filler")
    part("Crate_1", slatted_box((0.62, 0.62, 0.50), (0, 0, 0.25)), (1.15, -4.25, 0), mat=M["wood_light"], bevel=0.01, segments=1, role="filler")
    part("Crate_2", slatted_box((0.55, 0.55, 0.45), (0, 0, 0.225)), (1.2, -4.3, 0.5), mat=M["wood_light"], bevel=0.01, segments=1, role="filler", rotation=(0, 0, math.radians(12)))

    # Intérieur visible par la porte : établi contre le mur du fond, étagère
    part("Bench", box((0.75, 1.8, 0.85), (0, 0, 0.425)), (-1.65, 1.2, PLINTH_H), mat=M["wood"], bevel=0.012, segments=1)
    part("Shelf", box((0.28, 2.6, 0.05)), (-2.05, 0.9, 2.25), mat=M["wood"], bevel=0.006, segments=1)


def _details(part, M, level):
    """Niveau 2 (détails fonctionnels) et niveau 3 (usure, histoire)."""
    iron, wood, brass, roof, plaster = M["iron"], M["wood"], M["brass"], M["roof"], M["plaster"]
    tide = _tide_cuts(level)

    # Pilastres arrondis aux quatre coins : les murs ne sont plus des boîtes
    for sx in (1, -1):
        for sy in (1, -1):
            bm = box((0.40, 0.40, WALL_TOP - PLINTH_H + 0.05), (0, 0, (WALL_TOP + PLINTH_H) / 2))
            part(f"Pilaster_{'F' if sx > 0 else 'B'}{'L' if sy > 0 else 'R'}", bisect_z(bm, tide), (sx * (D / 2 - 0.05), sy * (W / 2 - 0.05), 0), mat=plaster, bevel=0.06, segments=2)

    # Rampe d'accès : le rover doit pouvoir sortir du soubassement
    ramp = math.atan2(PLINTH_H, 1.6)
    part("Ramp", box((1.68, DOOR_W + 0.3, 0.12)), (D / 2 + 0.2 + 0.78, 0, 0.19), mat=M["plinth"], bevel=0.02, segments=1, rotation=(0, ramp, 0))

    # Nervures de la voûte (joints de tôle), tous les 0,96 m
    for i in range(6):
        x = -2.4 + i * 0.96
        part(f"RoofRib_{i + 1}", arch(R_IN + ROOF_T, R_IN + ROOF_T + 0.05, 0.10, A0 - 1, A1 + 1, steps=14, axis="X"), (x, 0, CZ), mat=roof, bevel=0.01, segments=1)

    # Porte : lames horizontales sur le vantail, flasques laiton du tambour
    bm = bmesh.new()
    for z in (DOOR_H - 0.16, DOOR_H - 0.05):
        add_box(bm, (0.02, DOOR_W - 0.2, 0.03), (D / 2 - 0.12, 0, z))
    part("DoorSlats", bm, mat=iron, bevel=0.004, segments=1)
    for sy, side in ((1, "L"), (-1, "R")):
        part(f"DrumCap_{side}", cylinder(0.25, 0.04, axis="Y", segments=16), (D / 2 + 0.22, sy * (DOOR_W / 2 + 0.17), DOOR_H + 0.28), mat=brass, bevel=0.005, segments=1)

    # Échelle vers le toit, à droite de la porte
    bm = bmesh.new()
    for y in (2.55, 2.85):
        add_box(bm, (0.04, 0.04, 2.9), (D / 2 + 0.12, y, 0.6 + 1.45))
    for i in range(9):
        add_box(bm, (0.04, 0.34, 0.035), (D / 2 + 0.12, 2.7, 0.85 + i * 0.32))
    for z in (1.0, 3.2):
        add_box(bm, (0.14, 0.04, 0.04), (D / 2 + 0.05, 2.7, z))
    part("Ladder", bm, mat=iron, bevel=0.004, segments=1)

    # Corde lovée sur un piton, entre la porte et l'échelle (un vrai anneau en polish)
    bm = cylinder(0.05, 0.16, axis="X", segments=8, center=(D / 2 + 0.08, 0, 0))
    if level >= 2:
        part("RopePeg", bm, (0, 2.05, 1.55), mat=iron, bevel=0.004, segments=1)
        bm = ring(0.25, 0.10, 0.09, axis="X", segments=20, center=(D / 2 + 0.10, 0, -0.16))
        part("RopeCoil", bm, (0, 2.05, 1.55), mat=M["rope"], bevel=0.012, segments=1)
        part("RopeCoil_2", ring(0.21, 0.11, 0.07, axis="X", segments=20), (D / 2 + 0.18, 2.09, 1.40), mat=M["rope"], bevel=0.01, segments=1, rotation=(0, 0, math.radians(6)))
    else:
        add_cyl(bm, 0.24, 0.10, axis="X", center=(D / 2 + 0.11, 0, -0.16), segments=16)
        part("RopeCoil", bm, (0, 2.05, 1.55), mat=M["rope"], bevel=0.01, segments=1)

    # Rapiéçages de plâtre (teinte plus claire, à peine en saillie)
    part("Patch_F", box((0.02, 0.5, 0.6)), (D / 2 + 0.005, -2.7, 1.05), mat=M["patch"], bevel=0.004, segments=1)
    part("Patch_R", box((0.6, 0.02, 0.5)), (-1.4, -(W / 2) - 0.005, 1.9), mat=M["patch"], bevel=0.004, segments=1)

    # Fenêtre sous l'appentis : cadre bois, vitre sombre, appui (croisillons en polish)
    part("WindowFrame", box((0.95, 0.06, 0.75)), (0.6, -(W / 2) - 0.03, 2.0), mat=wood, bevel=0.006, segments=1)
    part("WindowGlass", box((0.80, 0.02, 0.60)), (0.6, -(W / 2) - 0.05, 2.0), mat=M["glass"], bevel=0.0)
    part("WindowSill", box((1.05, 0.14, 0.05)), (0.6, -(W / 2) - 0.06, 1.6), mat=wood, bevel=0.005, segments=1)
    if level >= 2:
        bm = bmesh.new()
        add_box(bm, (0.03, 0.03, 0.62), (0.6, -(W / 2) - 0.065, 2.0))
        add_box(bm, (0.82, 0.03, 0.03), (0.6, -(W / 2) - 0.065, 2.0))
        part("WindowBars", bm, mat=wood, bevel=0.003, segments=1)

    # Appentis : deux contrefiches entre poteaux et poutre
    for sx in (1, -1):
        part(f"LeanTo_Brace_{'F' if sx > 0 else 'B'}", box((0.06, 0.06, 0.66)), (sx * 1.6, -(W / 2 + 2.35), 2.02), mat=wood, bevel=0.004, segments=1, rotation=(0, sx * math.radians(-38), 0))

    # Descente d'eau au coin arrière droit et tonneau de récupération
    bm = cylinder(0.05, 2.3, axis="Z", segments=10, center=(0, 0, 1.15))
    add_cyl(bm, 0.05, 0.36, axis="Y", center=(0, 0.18, 2.32), segments=10)
    part("Downpipe", bm, (-D / 2 - 0.1, -(W / 2) - 0.12, 0.9), mat=iron, bevel=0.0)
    bm = cylinder(0.34, 0.95, axis="Z", segments=18, center=(0, 0, 0.475))
    for z in (0.2, 0.78):
        add_cyl(bm, 0.36, 0.05, axis="Z", center=(0, 0, z), segments=18)
    part("RainBarrel", bm, (-D / 2 - 0.45, -(W / 2) - 0.45, 0), mat=wood, bevel=0.012, segments=1)

    # Lampe suspendue à la voûte, remontée pour que le rover (galerie, bâche) passe dessous (2026-09-06)
    bm = cylinder(0.012, 1.38, axis="Z", segments=6, center=(0, 0, 3.41))
    add_cyl(bm, 0.28, 0.22, axis="Z", center=(0, 0, 2.61), segments=14, radius2=0.06)
    part("Lamp", bm, (-0.4, 0.0, 0), mat=iron, bevel=0.0)
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=2, radius=0.07)
    part("Bulb", bm, (-0.4, 0.0, 2.45), mat=M["bulb"], bevel=0.0)


def _polish(part, M, zone):
    """Intérieur meublé (visible dans l'axe de la porte) et lampe de contrôle."""
    iron, wood = M["iron"], M["wood"]

    # Panneau d'outils sur le mur du fond, à droite de l'établi
    part("ToolBoard", box((0.05, 1.5, 0.9)), (-2.15, -1.0, 1.75), mat=M["wood_light"], bevel=0.006, segments=1)
    bm = bmesh.new()
    add_box(bm, (0.04, 0.04, 0.34), (-2.10, -0.45, 1.75))      # marteau : manche
    add_box(bm, (0.06, 0.16, 0.07), (-2.10, -0.45, 1.95))      # marteau : tête
    add_box(bm, (0.03, 0.05, 0.40), (-2.10, -0.80, 1.72))      # clé plate
    add_box(bm, (0.03, 0.12, 0.09), (-2.10, -0.80, 1.96))
    add_box(bm, (0.03, 0.30, 0.10), (-2.10, -1.30, 1.62))      # scie : lame
    add_box(bm, (0.04, 0.10, 0.14), (-2.10, -1.50, 1.62))      # scie : poignée
    add_box(bm, (0.03, 0.05, 0.26), (-2.10, -1.05, 1.98))      # tournevis
    part("Tools", bm, mat=iron, bevel=0.003, segments=1)

    # Roue de rechange contre le mur gauche, seau, tabouret, bidons sur l'étagère
    bm = ring(0.38, 0.14, 0.22, axis="Y", segments=20)
    add_cyl(bm, 0.14, 0.10, axis="Y", center=(0, 0, 0), segments=12)
    part("SpareWheel", bm, (0.7, W / 2 - WALL_T - 0.16, PLINTH_H + 0.40), mat=M["charcoal"], bevel=0.015, segments=1, rotation=(math.radians(-10), 0, 0))
    part("Bucket", cylinder(0.17, 0.32, axis="Z", segments=14, center=(0, 0, 0.16)), (-0.9, -1.9, PLINTH_H), mat=iron, bevel=0.006, segments=1)
    bm = cylinder(0.19, 0.04, axis="Z", segments=12, center=(0, 0, 0.44))
    for i in range(3):
        a = math.radians(90 + 120 * i)
        add_box(bm, (0.04, 0.04, 0.42), (0.13 * math.cos(a), 0.13 * math.sin(a), 0.21))
    part("Stool", bm, (-0.9, 1.7, PLINTH_H), mat=wood, bevel=0.004, segments=1)
    bm = bmesh.new()
    for y, h in ((0.2, 0.22), (0.5, 0.18), (0.85, 0.26)):
        add_box(bm, (0.12, 0.14, h), (-2.05, y, 2.275 + h / 2))
    part("Cans", bm, mat=M["rust"], bevel=0.004, segments=1)

    # Lampe de contrôle dans l'abat-jour (collection Lights, jamais exportée)
    build.point_light("Z0_Lights_HangarLamp", naming.ensure_collection(f"{zone}/Lights"), (-0.4, 0.0, 2.55), "lights.key_dawn", energy=90.0, radius=0.12)


def create(stage: str = "polish", zone: str = ZONE, location=(0.0, 0.0, 0.0), rotation_z: float = 0.0) -> bpy.types.Object:
    level = LEVELS[stage]
    coll = naming.ensure_collection(f"{zone}/{CATEGORY}")
    root = build.root_empty(ROOT, coll, size=1.0)
    M = _materials(level)
    part = _parts(root, coll, M)
    _masses(part, M, level)
    if level >= 1:
        _details(part, M, level)
    if level >= 2:
        _polish(part, M, zone)

    parts = [o for o in root.children_recursive if o.type == "MESH"]
    if M["dust"]:
        for obj in parts:
            for slot in obj.data.materials:
                if slot is not None and slot.name in M["dust"]:
                    top, bottom, stops = M["dust"][slot.name]
                    mesh.paint_stops(obj, top, stops, bottom)

    root.location = location
    root.rotation_euler.z = math.radians(rotation_z)
    total = build.tri_total(root)
    print(f"[hangar] {stage}: {len(parts)} pièces, {total} triangles (budget héro {mesh.BUDGETS['hero']})")
    return root


if __name__ == "__main__":
    create(**globals().get("PARAMS", {}))
