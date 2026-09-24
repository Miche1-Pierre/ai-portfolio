"""Materiaux "palette" : un Principled BSDF par couleur, reutilise dans tout le monde.

Regle DA : uniquement des couleurs de palette.json, roughness elevee (mat), metallic seulement
pour laiton/cuivre/acier, emission seulement pour ce qui eclaire (lampes, vitres, faisceaux).
Pas de texture image ici : si un bake/atlas est valide un jour, il aura son propre module.
"""
import bpy

from . import palette


def _socket(bsdf: bpy.types.Node, *names: str):
    for n in names:
        s = bsdf.inputs.get(n)
        if s is not None:
            return s
    raise KeyError(f"socket introuvable sur Principled BSDF : {names}")


def palette_material(
    color: str,
    *,
    roughness: float = 0.85,
    metallic: float = 0.0,
    emission: str | None = None,
    emission_strength: float = 4.0,
    name: str | None = None,
    reuse: bool = True,
) -> bpy.types.Material:
    """`color` / `emission` : cle palette ('materials.brass') ou hex ('#d6a516')."""
    key = color.lstrip("#") if color.startswith("#") else color.split(".")[-1]
    name = name or (f"MAT_{key}" + ("_emit" if emission else ""))

    mat = bpy.data.materials.get(name) if reuse else None
    if mat is None:
        mat = bpy.data.materials.new(name)
        mat.use_nodes = True

    tree = mat.node_tree
    bsdf = next((n for n in tree.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf is None:
        bsdf = tree.nodes.new("ShaderNodeBsdfPrincipled")
        out = next((n for n in tree.nodes if n.type == "OUTPUT_MATERIAL"), None) or tree.nodes.new(
            "ShaderNodeOutputMaterial"
        )
        tree.links.new(bsdf.outputs["BSDF"], out.inputs["Surface"])

    base = palette.rgba(color)
    _socket(bsdf, "Base Color").default_value = base
    _socket(bsdf, "Roughness").default_value = roughness
    _socket(bsdf, "Metallic").default_value = metallic
    if emission:
        _socket(bsdf, "Emission Color", "Emission").default_value = palette.rgba(emission)
        _socket(bsdf, "Emission Strength").default_value = emission_strength
    else:
        _socket(bsdf, "Emission Strength").default_value = 0.0

    mat.diffuse_color = base  # couleur du viewport Solid
    mat.roughness = roughness
    mat.metallic = metallic
    return mat


def vertex_tinted_material(
    name: str,
    base: str,
    tint: str,
    *,
    mix: float = 0.5,
    roughness: float = 0.85,
    metallic: float = 0.0,
) -> tuple[bpy.types.Material, tuple[float, float, float]]:
    """Dégradé vertical EXPORTABLE (poussière, usure, marque de marée) : couleur = facteur × attribut
    couleur `Col` du maillage. Le facteur est, canal par canal, la plus claire des deux couleurs
    (`base` ou `base` mélangée à `tint` en proportion `mix`), donc les attributs restent ≤ 1 que la
    teinte éclaircisse (poussière) ou assombrisse (tache). Renvoie (matériau, top, bottom) : `top`
    est l'attribut qui rend `base`, `bottom` celui qui rend la teinte. glTF : COLOR_0 ×
    baseColorFactor ; three.js : vertexColors. Chaque maillage qui porte ce matériau DOIT être peint
    (`mesh.paint_gradient` / `mesh.paint_stops`), sinon il rend noir."""
    base_rgb, tint_rgb = palette.rgb(base), palette.rgb(tint)
    dust = tuple(b * (1.0 - mix) + t * mix for b, t in zip(base_rgb, tint_rgb))
    factor = tuple(max(b, d) for b, d in zip(base_rgb, dust))
    top = tuple(b / f if f > 1e-6 else 1.0 for b, f in zip(base_rgb, factor))
    bottom = tuple(d / f if f > 1e-6 else 1.0 for d, f in zip(dust, factor))

    mat = palette_material(base, roughness=roughness, metallic=metallic, name=name)
    tree = mat.node_tree
    bsdf = next(n for n in tree.nodes if n.type == "BSDF_PRINCIPLED")
    attr = tree.nodes.get("DustAttr")
    if attr is None:
        attr = tree.nodes.new("ShaderNodeVertexColor")
        attr.name = "DustAttr"
    attr.layer_name = "Col"
    mixer = tree.nodes.get("DustMix")
    if mixer is None:
        mixer = tree.nodes.new("ShaderNodeMix")
        mixer.name = "DustMix"
    mixer.data_type = "RGBA"
    mixer.blend_type = "MULTIPLY"
    mixer.inputs[0].default_value = 1.0
    a, b = [s for s in mixer.inputs if s.type == "RGBA"][:2]
    a.default_value = (*factor, 1.0)
    tree.links.new(attr.outputs["Color"], b)
    result = [s for s in mixer.outputs if s.type == "RGBA"][0]
    tree.links.new(result, _socket(bsdf, "Base Color"))
    mat.diffuse_color = (*factor, 1.0)
    return mat, top, bottom


def assign(obj: bpy.types.Object, mat: bpy.types.Material, faces=None) -> int:
    """Ajoute `mat` aux slots de l'objet si besoin et l'assigne a toutes les faces
    (ou aux indices de faces donnes). Renvoie l'index de slot."""
    slots = obj.data.materials
    idx = next((i for i, m in enumerate(slots) if m is not None and m.name == mat.name), None)
    if idx is None:
        slots.append(mat)
        idx = len(slots) - 1
    polys = obj.data.polygons
    if faces is None:
        for p in polys:
            p.material_index = idx
    else:
        for f in faces:
            polys[f].material_index = idx
    return idx


def water_material(color: str = "materials.water", *, alpha: float = 0.72, name: str | None = None) -> bpy.types.Material:
    """Eau (mer, lac, rivière) : couleur de palette, un peu transparente (alpha), lisse. glTF : alphaMode
    BLEND ; three.js la rend transparente telle quelle."""
    # Bâti sur vertex_tinted_material (mix 0 : couleur inchangée) pour que le matériau RÉFÉRENCE
    # l'attribut "Col" : l'exporteur glTF l'écrit alors en COLOR_0 (sinon il exporte un COLOR_0 blanc
    # et notre attribut en COLOR_1, que le shader d'eau du site ne lit pas). Le site remplace de toute
    # façon ce matériau par son shader ; seul l'attribut (rivage, profondeur) compte.
    # Le multiplicateur reste actif (facteur 1) : avec un facteur 0 l'exporteur juge l'attribut inutilisé
    # et le relègue en COLOR_1. L'attribut est donc écrit presque blanc en RGB (Blender ne teinte
    # presque pas l'eau) : le rivage va dans l'alpha, la profondeur dans un léger assombrissement du vert.
    mat, _top, _bottom = vertex_tinted_material(name or "MAT_water", color, color, mix=0.0, roughness=0.15)
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Alpha"].default_value = alpha
    for attr, value in (("surface_render_method", "BLENDED"), ("blend_method", "BLEND"), ("use_backface_culling", True)):
        try:
            setattr(mat, attr, value)
        except (AttributeError, TypeError):
            pass
    return mat


def glass_material(
    color: str = "materials.glass_clear",
    *,
    roughness: float = 0.05,
    ior: float = 1.1,
    name: str | None = None,
) -> bpy.types.Material:
    """Vitre transparente (pare-brise, hublots, lanterne) : Principled en transmission 1.0 et IOR bas
    (vitre mince, pas d'effet de loupe), tel que Pierre l'a réglé à la main le 2026-09-06.
    Export glTF : KHR_materials_transmission ; le site le remplace par un simple mélange alpha
    (journey-scene.tsx), même intention sans la passe de rendu supplémentaire de three.js."""
    mat = palette_material(color, roughness=roughness, name=name)
    bsdf = next(n for n in mat.node_tree.nodes if n.type == "BSDF_PRINCIPLED")
    bsdf.inputs["Transmission Weight"].default_value = 1.0
    bsdf.inputs["IOR"].default_value = ior
    for attr, value in (("use_raytrace_refraction", True), ("use_transparent_shadow", True)):
        if hasattr(mat, attr):
            setattr(mat, attr, value)
    return mat
