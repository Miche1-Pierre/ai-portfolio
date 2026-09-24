"""Tranche verticale Z0 (STORYTELLING §6), étape par étape. Chaque étape produit un ou deux rendus
dans renders/ et sauvegarde scenes/z0-port.blend.

    run("build/z0_slice.py", as_main=True, step="rover_blockout")

Étapes prévues : rover_blockout -> rover_details -> hangar -> piste -> port -> lumière -> export.
"""
import json
import math

import bpy

from lib import export, mesh, naming, paths, render, stage, webexport
from lib import path
from lib.terrain import dune
from mathutils import Vector
from lib.runner import run

SCENE_FILE = paths.SCENES / "z0-port.blend"
LOOK_AT = (0.0, 0.0, 0.85)


def _setup_stage(ground: bool = True):
    stage.clear_startup_scene()
    for category in naming.CATEGORIES:
        naming.ensure_collection(f"Z0_PORT/{category}")
    if ground:
        stage.ground(size=200)
    else:
        stage.remove_ground()
    stage.dawn("z0_port")
    stage.render_settings(1600, 900, samples=24)


def _two_views(subject, distance=7.5):
    outs = []
    stage.camera_orbit(LOOK_AT, distance, azimuth_deg=-38, elevation_deg=16, focal=50)
    outs.append(render.preview(f"{subject}-avant"))
    stage.camera_orbit(LOOK_AT, distance, azimuth_deg=145, elevation_deg=18, focal=50)
    outs.append(render.preview(f"{subject}-arriere"))
    return outs


def _save():
    paths.ensure_dirs()
    bpy.ops.wm.save_as_mainfile(filepath=str(SCENE_FILE))
    print(f"[slice] sauvegardé {SCENE_FILE}")


def rover_blockout():
    _setup_stage()
    root = run("assets/z0_avatar_rover.py")["create"](stage="blockout")
    dims = [mesh.dimensions(o) for o in root.children_recursive if o.type == "MESH"]
    xs = [o.matrix_world.translation.x for o in root.children_recursive]
    print(f"[slice] rover : {len(dims)} pièces, x de {min(xs):.2f} à {max(xs):.2f}")
    outs = _two_views("rover-blockout")
    _save()
    return outs


def rover_details():
    _setup_stage()
    root = run("assets/z0_avatar_rover.py")["create"](stage="details")
    outs = _two_views("rover-details", distance=6.8)
    stage.camera_orbit((0.55, 0.0, 0.95), 4.6, azimuth_deg=-24, elevation_deg=9, focal=50)
    outs.append(render.preview("rover-details-gros-plan"))
    _save()
    return outs


def _check_gltf(root):
    """Exporte le rover dans un .glb temporaire et vérifie ce que three.js recevra : hiérarchie,
    couleurs par sommet (COLOR_0) pour la poussière, facteur de couleur des matériaux, poids."""
    objs = [root] + list(root.children_recursive)
    out = export.export_objects(objs, "_check-rover", publish=False)
    data = out.read_bytes()
    json_len = int.from_bytes(data[12:16], "little")
    doc = json.loads(data[20 : 20 + json_len])
    with_color = sum(1 for m in doc["meshes"] for p in m["primitives"] if "COLOR_0" in p["attributes"])
    factors = {m["name"]: [round(c, 3) for c in m.get("pbrMetallicRoughness", {}).get("baseColorFactor", [])] for m in doc["materials"]}
    print(f"[check] glb {out.stat().st_size / 1024:.0f} KB, {len(doc['nodes'])} nœuds, {len(doc['meshes'])} maillages, {len(doc['materials'])} matériaux")
    print(f"[check] maillages avec COLOR_0 : {with_color}")
    for name in ("MAT_body_dust", "MAT_chassis_dust", "MAT_glass_clear"):
        print(f"[check] {name}: baseColorFactor {factors.get(name)}")
    out.unlink()


def rover_polish():
    _setup_stage()
    root = run("assets/z0_avatar_rover.py")["create"](stage="polish")
    outs = _two_views("rover-polish", distance=6.8)
    stage.camera_orbit((0.55, 0.0, 0.95), 4.6, azimuth_deg=-24, elevation_deg=9, focal=50)
    outs.append(render.preview("rover-polish-gros-plan"))
    _check_gltf(root)
    _save()
    return outs


def hangar_blockout():
    """Le hangar en masses, avec le rover sorti devant pour l'échelle."""
    _setup_stage()
    rover = run("assets/z0_avatar_rover.py")["create"](stage="polish")
    rover.location = (5.4, -2.4, 0.0)  # sorti devant le hangar, pour l'échelle des rendus
    rover.rotation_euler.z = math.radians(-22)
    run("assets/z0_arch_hangar.py")["create"](stage="blockout")
    outs = []
    stage.camera_orbit((1.2, -0.4, 1.9), 16.0, azimuth_deg=-40, elevation_deg=13, focal=40)
    outs.append(render.preview("hangar-blockout-avant"))
    stage.camera_orbit((0.5, -1.0, 1.9), 15.0, azimuth_deg=-118, elevation_deg=11, focal=40)
    outs.append(render.preview("hangar-blockout-cote"))
    _save()
    return outs


def hangar_details():
    """Le hangar détaillé (marques de marée, nervures, échelle, lampe...), rover devant pour l'échelle."""
    _setup_stage()
    rover = run("assets/z0_avatar_rover.py")["create"](stage="polish")
    rover.location = (5.4, -2.4, 0.0)  # sorti devant le hangar, pour l'échelle des rendus
    rover.rotation_euler.z = math.radians(-22)
    run("assets/z0_arch_hangar.py")["create"](stage="details")
    outs = []
    stage.camera_orbit((1.2, -0.4, 1.9), 16.0, azimuth_deg=-40, elevation_deg=13, focal=40)
    outs.append(render.preview("hangar-details-avant"))
    stage.camera_orbit((0.5, -1.0, 1.9), 15.0, azimuth_deg=-118, elevation_deg=11, focal=40)
    outs.append(render.preview("hangar-details-cote"))
    stage.camera_orbit((2.5, 0.2, 1.9), 9.5, azimuth_deg=20, elevation_deg=9, focal=45)  # côté échelle, rover hors champ
    outs.append(render.preview("hangar-details-porte"))
    _save()
    return outs


def hangar_polish():
    """Le hangar poli : ligne d'eau nette, pierre de quai, corde lovée, intérieur meublé et éclairé."""
    _setup_stage()
    rover = run("assets/z0_avatar_rover.py")["create"](stage="polish")
    rover.location = (5.4, -2.4, 0.0)  # sorti devant le hangar, pour l'échelle des rendus
    rover.rotation_euler.z = math.radians(-22)
    run("assets/z0_arch_hangar.py")["create"](stage="polish")
    outs = []
    stage.camera_orbit((1.2, -0.4, 1.9), 16.0, azimuth_deg=-40, elevation_deg=13, focal=40)
    outs.append(render.preview("hangar-polish-avant"))
    stage.camera_orbit((0.5, -1.0, 1.9), 15.0, azimuth_deg=-118, elevation_deg=11, focal=40)
    outs.append(render.preview("hangar-polish-cote"))
    stage.camera_orbit((2.5, 0.2, 1.9), 9.5, azimuth_deg=20, elevation_deg=9, focal=45)
    outs.append(render.preview("hangar-polish-porte"))
    stage.camera_orbit((0.0, 0.2, 1.4), 9.0, azimuth_deg=4, elevation_deg=5, focal=45)  # dans l'axe de la porte
    outs.append(render.preview("hangar-polish-interieur"))
    _save()
    return outs


def _z0_assets(terrain_stage="blockout", boats_stage="blockout", seabed=True):
    """Tout Z0 : rover devant le hangar, terrain, bateaux échoués."""
    rover = run("assets/z0_avatar_rover.py")["create"](stage="polish")
    rover.location = (0.3, -0.35, 0.52)  # garé dans le hangar, sur le plancher, dans l'axe de la porte : le voyage part de là
    rover.rotation_euler.z = 0.0
    run("assets/z0_arch_hangar.py")["create"](stage="polish")
    run("assets/z0_terrain_port.py")["create"](stage=terrain_stage, seabed=seabed)
    boats = run("assets/z0_props_boats.py")["create"]
    boats(kind="fishing", stage=boats_stage, location=(17.0, -16.0, dune(17.0, -16.0) + 0.45), heading=40, heel=18)
    boats(kind="bulb", stage=boats_stage, location=(-1.0, -13.0, dune(-1.0, -13.0) + 0.5), heading=-30, heel=25)


def port_blockout():
    """La zone Z0 en masses : sable, quai, bittes, escalier, falaise, deux épaves."""
    _setup_stage(ground=False)
    _z0_assets()
    outs = []
    stage.camera_orbit((7.0, -5.0, 1.6), 26.0, azimuth_deg=-68, elevation_deg=10, focal=30)  # carte postale depuis la mer : épaves devant, hangar au centre, falaise derrière
    outs.append(render.preview("port-blockout-carte-postale"))
    stage.camera_orbit((10.0, -6.0, 0.0), 45.0, azimuth_deg=-90, elevation_deg=40, focal=35)  # plan d'ensemble
    outs.append(render.preview("port-blockout-ensemble"))
    _save()
    return outs


def port_details():
    """Le port détaillé : falaise en strates, sable craquelé et mares, mur de quai, épaves, phare, props."""
    _setup_stage(ground=False)
    _z0_assets(terrain_stage="details", boats_stage="details")
    run("assets/z0_arch_lighthouse.py")["create"](stage="details", location=(46.0, -5.5, 0.0))
    run("assets/z0_props_port.py")["create"](stage="details")
    outs = []
    stage.camera_orbit((7.0, -5.0, 1.6), 26.0, azimuth_deg=-68, elevation_deg=10, focal=30)
    outs.append(render.preview("port-details-carte-postale"))
    rover = bpy.data.objects["Z0_Avatar_Rover"]  # pour la vue du voyage, le rover roule déjà sur le quai
    rover.location = (14.0, -3.5, 0.0)
    rover.rotation_euler.z = 0.0
    stage.camera_orbit((21.0, -3.5, 1.2), 14.2, azimuth_deg=184, elevation_deg=9, focal=35)  # caméra du voyage, derrière le rover
    outs.append(render.preview("port-details-voyage"))
    stage.camera_orbit((10.0, -6.0, 0.0), 45.0, azimuth_deg=-90, elevation_deg=40, focal=35)
    outs.append(render.preview("port-details-ensemble"))
    _save()
    return outs


def _world():
    """Tout le monde tel qu'il existe : Z0 détaillé, la montagne, la piste sur toute la route, les
    masses des haltes (squelette, STORYTELLING §6 étape 2)."""
    _z0_assets(terrain_stage="details", boats_stage="details", seabed=False)
    run("assets/z0_arch_lighthouse.py")["create"](stage="details", location=(46.0, -5.5, 0.0))
    run("assets/z0_props_port.py")["create"](stage="details")
    run("assets/zx_terrain_mountain.py")["create"]()
    g = run("assets/z1_track.py")
    g["create"](stage="blockout")
    run("assets/zx_stations.py")["create"]()
    run("assets/zx_vegetation.py")["create"]()
    # le phare du bout, sur la crête au-dessus du port : c'est lui qui se rallume
    from lib import probe
    end = (-38.0, 141.0)
    run("assets/z0_arch_lighthouse.py")["create"](stage="details", zone="Z4_OBSERVATOIRE", location=(end[0], end[1], probe.height(*end) - 0.3))
    return g


def skeleton():
    """L'île entière : rendus d'ensemble puis un par biome (plage, forêt, lac et village, canyon, massif, phare)."""
    _setup_stage(ground=False)
    _world()
    outs = []
    for name, target, dist, az, el in (
        ("ile-ensemble", (130.0, 120.0, 10.0), 560.0, -55, 38),
        ("ile-plage", (96.0, -8.0, 0.0), 120.0, -140, 16),
        ("ile-foret", (150.0, 42.0, 12.0), 110.0, -110, 22),
        ("ile-lac-village", (232.0, 100.0, 6.0), 130.0, -60, 24),
        ("ile-canyon", (270.0, 214.0, 12.0), 110.0, -120, 20),
        ("ile-massif", (100.0, 225.0, 40.0), 150.0, -100, 22),
        ("ile-phare", (-28.0, 145.0, 22.0), 100.0, -140, 16),
    ):
        stage.camera_orbit(target, dist, azimuth_deg=az, elevation_deg=el, focal=35)
        outs.append(render.preview(name))
    _save()
    return outs


def track_blockout():
    """La piste en masses : rivage, rampe, premier lacet, bordures, borne ; le rover sur la rampe."""
    _setup_stage(ground=False)
    _z0_assets(terrain_stage="details", boats_stage="details")
    run("assets/z0_arch_lighthouse.py")["create"](stage="details", location=(46.0, -5.5, 0.0))
    run("assets/z0_props_port.py")["create"](stage="details")
    run("assets/zx_terrain_mountain.py")["create"]()
    g = run("assets/z1_track.py")
    g["create"](stage="blockout")
    samples = g["SAMPLES"]
    tangents = path.tangents(samples)
    outs = []
    stage.camera_orbit((95.0, 9.0, 9.0), 75.0, azimuth_deg=-95, elevation_deg=12, focal=35)  # le lacet depuis la mer
    outs.append(render.preview("piste-blockout-lacet"))
    rover = bpy.data.objects["Z0_Avatar_Rover"]
    pos, yaw, pitch = path.pose_at(samples, tangents, 100.0)
    rover.location = pos + Vector((0, 0, 0.05))
    rover.rotation_euler = (0.0, -pitch, yaw)
    ahead = pos + Vector((math.cos(yaw), math.sin(yaw), 0)) * 7.0 + Vector((0, 0, 1.4))
    stage.camera_orbit(tuple(ahead), 12.0, azimuth_deg=math.degrees(yaw) + 180 + 12, elevation_deg=9, focal=35)  # caméra du voyage sur la rampe
    outs.append(render.preview("piste-blockout-voyage"))
    stage.camera_orbit((85.0, 8.0, 8.0), 95.0, azimuth_deg=-90, elevation_deg=50, focal=35)
    outs.append(render.preview("piste-blockout-ensemble"))
    _save()
    return outs


def web_export():
    """Exporte ce que charge /journey : un .glb par zone, le rover, la spline (avec les haltes et la
    caméra d'intro), la palette."""
    _setup_stage(ground=False)
    _world()
    outs = [
        webexport.export_zone("Z0_PORT", "z0-port"),
        webexport.export_zone("Z1_VOIE", "z1-piste"),
        webexport.export_zone("Z1_SABLE", "z1-sable"),
        webexport.export_zone("Z2_FORET", "z2-foret"),
        webexport.export_zone("Z2_ATELIER", "z2-atelier"),
        webexport.export_zone("Z3_COL", "z3-col"),
        webexport.export_zone("Z4_OBSERVATOIRE", "z4-observatoire"),
        webexport.export_root("Z0_Avatar_Rover", "avatar-rover"),
        webexport.write_path_json(),
        webexport.write_palette_ts(),
    ]
    _save()
    return outs


STEPS = {
    "rover_blockout": rover_blockout,
    "rover_details": rover_details,
    "rover_polish": rover_polish,
    "hangar_blockout": hangar_blockout,
    "hangar_details": hangar_details,
    "hangar_polish": hangar_polish,
    "port_blockout": port_blockout,
    "port_details": port_details,
    "track_blockout": track_blockout,
    "skeleton": skeleton,
    "web_export": web_export,
}


def main(step="rover_blockout"):
    if step not in STEPS:
        raise KeyError(f"étape inconnue : {step} (dispo : {', '.join(STEPS)})")
    outs = STEPS[step]()
    print("[slice] rendus :", *[str(p) for p in outs], sep="\n  ")
    return outs


if __name__ == "__main__":
    main(**globals().get("PARAMS", {}))
