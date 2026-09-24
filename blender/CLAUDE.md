# CLAUDE.md, atelier 3D du portfolio (`blender/`)

> Ici tu es **directeur artistique + technical artist procédural**. Blender est le moteur d'exécution ;
> le produit, c'est l'expérience 3D du portfolio (Next.js + React Three Fiber). Ce fichier est le
> contrat de travail de ce dossier. Il complète le [`CLAUDE.md`](../CLAUDE.md) racine (stack Next,
> règles du site), il ne le remplace pas.

## 0. Avant de toucher à quoi que ce soit

Lire, dans cet ordre :

1. [`ART_DIRECTION.md`](./ART_DIRECTION.md) : le contrat artistique. Il prime sur tes idées.
2. [`STORYTELLING.md`](./STORYTELLING.md) : le monde, les zones, l'avatar, le parcours.
3. [`references/`](./references/README.md) : les images de Pierre. **La référence EST la spec** (§4).
4. [`palette.json`](./palette.json) : la seule source de vérité couleur (docs et scripts la lisent).

Puis répondre à trois questions : quelle zone / quel asset, quel rôle (héro, moyen, remplissage),
quelle référence le décrit ? Si une réponse manque, demander à Pierre avant de modéliser.

## 1. Arborescence et versionnement

```
blender/
├── CLAUDE.md            ce contrat
├── ART_DIRECTION.md     direction artistique : style, palette, lumière, caméra, budgets, checklist
├── STORYTELLING.md      monde, zones, avatar, parcours, tranche verticale, décisions ouvertes
├── palette.json         couleurs (sRGB hex), lues par scripts/lib/palette.py
├── references/          images de référence de Pierre, par catégorie, + references/models/ pour ses
│                        assets 3D d'exemple (style, échelle, topologie ; jamais exportés) (voir README)
├── scenes/              sources .blend (une par zone + world.blend), suivies par Git LFS
├── exports/             .glb exportés (Draco), commités ; publish=True copie dans ../public/models/
├── renders/             rendus de contrôle (PNG), ignorés par git, envoyés à Pierre au fil de l'eau
└── scripts/
    ├── _bootstrap.py    à exécuter d'abord dans Blender (sys.path + rechargement de lib + run())
    ├── _incoming/       scripts déposés par Pierre : à adapter aux conventions, puis ranger dans assets/ ou lib/
    ├── smoke_test.py    test du pipeline en headless
    ├── lib/             paths · palette · naming · materials · mesh · export · render · runner
    ├── assets/          un script = un asset, create(**params) (gabarit : _template.py)
    └── build/           build_scene.py : assemble le monde à partir des assets validés (BUILDERS)
```

- `.blend` → Git LFS (`.gitattributes` racine). Jamais de `.blend1`. Images et modèles de
  `references/` : **locaux uniquement** (`.gitignore`), œuvres de tiers et dépôt public.
  `renders/` ignoré. `exports/*.glb` commités (petits, Draco).
- Les scripts vivent **sur disque**, pas dans le chat : tout ce qui passe par le MCP doit exister
  dans `scripts/` (rejouable, versionné). Exception : les micro-inspections (`get_scene_info`, un `print`).

## 2. Outils

- **Blender 5.1** : `C:\Program Files\Blender Foundation\Blender 5.1\blender.exe`.
- **Blender MCP** (déclaré dans `.mcp.json` racine : `uvx blender-mcp`). Côté Blender : addon
  *Blender MCP* activé, panneau latéral (N) → onglet *BlenderMCP* → *Connect to Claude* (port 9876).
  Si `get_scene_info` échoue, Blender n'est pas ouvert ou le serveur n'est pas démarré : le dire à
  Pierre, ne pas contourner.
  - `get_scene_info` / `get_object_info` : l'état réel avant d'agir (noms d'objets jamais devinés).
  - `execute_blender_code` : le cheval de bataille. Toujours ouvrir une session par le bootstrap :
    `exec(open(r"C:\Portfolio\blender\scripts\_bootstrap.py", encoding="utf-8").read())`
    puis `run("assets/<script>.py")`, `from lib import mesh, materials, export, render`.
  - `get_viewport_screenshot` : vérification rapide. Pour un rendu à montrer : `render.preview("<sujet>")`.
  - PolyHaven : **HDRI seulement**, pour tester la lumière. Sketchfab / Poly Pizza / Hyper3D /
    Hunyuan : **jamais dans la scène finale** (§9) ; au mieux une référence d'échelle, supprimée ensuite.
- **Headless** (tests, exports en lot, aucun addon requis) :
  `& "C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" --background --python C:\Portfolio\blender\scripts\smoke_test.py`
  (PowerShell 5.1 : pas de `2>$null` sur un exécutable natif.)
- **Côté web** : les `.glb` se chargent avec `@react-three/drei` (`useGLTF`, décodeur Draco à copier
  une fois dans `public/draco/` depuis `node_modules/three/examples/jsm/libs/draco/gltf/`). Un viewer
  de contrôle (`/lab/models`, dev seulement) est à créer dès le premier asset validé.

## 3. Pipeline, de la référence au site

```
référence (references/)  +  ART_DIRECTION  +  STORYTELLING
        │
        ▼
brief de l'asset : rôle, silhouette, proportions, détails, matériaux, échelle
        │
        ▼
scripts/assets/<zone>_<categorie>_<nom>.py    create(**params) -> Object   (déterministe, seedé)
        │       └─ lib.materials.palette_material(...)  puis  lib.mesh.finalize(obj, role=...)
        ▼
rendu de contrôle (lib.render.preview) -> renders/ -> comparaison côte à côte avec la référence
        │       └─ UNE correction par itération, rendu montré toutes les 1 à 2 itérations
        ▼
validation Pierre -> inscription dans build/build_scene.py (BUILDERS)
        │
        ▼
lib.export.export_collection("Z0_PORT", "z0-port", publish=True) -> exports/ + public/models/
        │
        ▼
intégration R3F (route dédiée) -> vérif navigateur : poids, draw calls, mobile, reduced-motion
```

**Retouches à la main de Pierre dans le `.blend`** : les étapes de `build/z0_slice.py` reconstruisent
tout depuis les scripts et **écrasent** `scenes/z0-port.blend`. Quand le fichier contient des retouches
manuelles (2026-09-06 : lisses retirées au lacet, cabine percée, verre transparent), on exporte
**sans reconstruire** avec `build/export_scene.py` (headless, ne sauvegarde rien), puis on **reporte la
retouche dans le script** avant toute reconstruction, rendu à l'appui pour prouver qu'elle est reproduite.

## 4. La boucle d'itération (non négociable, apprise à la dure)

1. **Copier la référence d'abord**, élément par élément (ciel, sol, masses, objet, lumière, caméra).
   Mes « améliorations » lisent comme du bruit ; Pierre juge à la ressemblance côte à côte.
2. Ensuite seulement : « quel est le plus gros écart restant ? », et on corrige **une** chose.
3. Ordre de travail : silhouette → proportions → détails → matériaux → lumière → composition.
   On ne texture pas une silhouette fausse.
4. **Un rendu montré toutes les 1 à 2 itérations** (`SendUserFile`), jamais dix passes en silence.
5. Avant de montrer : la checklist « fait par un artiste » (ART_DIRECTION §10). Une primitive à
   peine retouchée ne sort pas de l'atelier.
6. **Prototype d'abord** : la tranche verticale (STORYTELLING §6) valide DA + pipeline + intégration
   avant d'élargir. Pas de fabrique à cinquante assets avant ça.

## 5. Conventions Blender

- Unités : mètres, `1 unité = 1 m`. Z up dans Blender ; l'export glTF passe en Y up tout seul
  (ne rien tourner à la main). Échelles de référence : ART_DIRECTION §8.
- Origine **à la base** (centre du pied) pour tout ce qui se pose ; échelle appliquée ; la rotation
  de *placement* reste un transform. `lib.mesh.finalize()` fait tout ça.
- Nommage : objets `Z<n>_<Categorie>_<Nom>[_<nn>]` (`Z2_Architecture_MaisonFalaise_A`), collections
  `Z<n>_<ZONE>/<Categorie>` (`lib.naming`). Catégories : Blockout, Terrain, Architecture, Props,
  Vegetation, Avatar, Lights, FX. `Blockout` et `Lights` ne s'exportent jamais.
- Géométrie : low-poly **lisse** (ombrage lisse, arêtes nettes au-delà de ~30°, bevel 1 à 2
  segments), aucune primitive laissée intacte, asymétrie, détails fonctionnels, imperfections.
  Le détail vient des formes, pas du nombre de polygones.
- Matériaux : uniquement `materials.palette_material(...)` (Principled : base color, roughness,
  metallic, émission), couleurs de `palette.json`. Pas de texture image sans validation de Pierre.
- Ni caméra ni lumière dans les exports (recréées dans three.js). Ce qui éclaire = émission.
- Modificateurs paramétriques dans le `.blend` (Bevel, Array, Mirror...), appliqués à l'export.
- Aléatoire toujours via `random.Random(seed)`, jamais le module global : même script, même résultat.
- Remplissage statique d'une zone : fusionné par matériau avant export (draw calls). Héros et
  avatar restent des objets séparés (animables).
- L'avatar est **le rover** (STORYTELLING §3.3) : Empty racine `Z0_Avatar_Rover`, caisse, quatre
  roues, bras de suspension et antenne en objets parentés séparés (animés dans three.js), couleurs
  du bloc `avatar` de `palette.json`.

## 6. Budgets (résumé ; détail ART_DIRECTION §9)

| Quoi | Budget |
|---|---|
| Asset héro / moyen / remplissage | ≤ 12 k / 4 k / 800 triangles (modificateurs évalués) |
| Zone / monde | ≤ 60 k / 300 k triangles |
| `.glb` par zone / total | ≤ 2 Mo / 10 Mo (Draco) |
| Textures (si un bake est validé) | une par zone, ≤ 1024² (2048² exceptionnel) |
| Draw calls par vue | ≤ 150 |

`lib.mesh.finalize(obj, role=...)` avertit quand un asset dépasse, `lib.export` quand un `.glb` dépasse.

## 7. Intégration Next (décidé par Pierre, en trois phases ; détail STORYTELLING §3.7)

- **Phase 1** : prototype sur `/journey` (hors nav, `noindex`) : canvas R3F **fixe derrière des
  sections HTML réelles** (SEO, accessibilité, `⌘K` existant), scroll synchronisé sur la spline ; le
  rover suit la même spline. La home actuelle et les pages `/work` ne bougent pas.
- **Phase 2** : l'ascension devient **la home** (les sections actuelles = les carnets des haltes).
- **Phase 3** : le canvas vit dans le **layout racine** et persiste entre les pages ; chaque route est
  une halte (la caméra et le rover vont au bâtiment du projet). Un seul contexte WebGL à la fois :
  le sort du hero LaserFlow des pages `/work` se décide alors, au vu du prototype.
- On ne passe pas à la phase suivante sans le verdict de Pierre sur la précédente.
- Stack déjà installée : `@react-three/fiber` 9, `@react-three/drei` 10, `three` 0.171. Pas de
  nouvelle dépendance sans demander.
- Mobile / `prefers-reduced-motion` : même scène, `dpr ≤ 1.5`, pas d'ombres portées hors contact,
  poses fixes par station si mouvement réduit.
- Couleurs three.js (ciel, brume, lumières) : générées depuis `palette.json` (module TS produit
  par script, pas de copie manuelle).

## 8. Pièges connus (Blender 5.1 + MCP, appris sur la scène précédente)

- **Ne jamais déplacer/supprimer des objets de Pierre par des noms devinés** (`Circle`, `Circle.001`...) :
  lire `get_scene_info`, regrouper par proximité de boîte englobante, ou parenter à un Empty
  (`XxxRoot`) et transformer l'Empty.
- Le **brouillard volumétrique du World tue toute lumière en EEVEE** dès 0.006 de densité :
  brume = fond dégradé + plans (ou côté three.js), pas de volumétrique.
- Les **maillages émissifs n'éclairent pas** en EEVEE : ajouter une lampe point (`use_shadow=False`)
  dans le halo.
- Compositor 5.1 : `scene.compositing_node_group` + `NodeGroupOutput` ; les réglages du Glare sont
  des sockets d'entrée (menu `Type`, ex. `Fog Glow`).
- Cadrage : vérifier le frustum avant de placer des objets proches (à 74 mm et y≈-15, seul x≈±4
  est dans le champ).
- Cratères hexagonaux propres = Goldberg (dual d'icosphère subdiv 3) + `bmesh.ops.inset_individual` ;
  `inset_region` sur des régions irrégulières fait des entailles.
- Nom de l'enum EEVEE variable selon la version : `lib.render.set_eevee()` gère.
- Paramètres de l'exporteur glTF variables selon la version : `lib.export._call_exporter` retire
  les mots-clés inconnus et le signale.
- Le pane navigateur de Claude gèle rAF / IntersectionObserver : pour vérifier une scène R3F,
  viewports hauts, vérifs DOM, captures headless Chrome (voir `CLAUDE.md` racine).
- Un canvas `fixed -z-10` passe **sous le fond de page** si son conteneur ne crée pas de contexte
  d'empilement (`isolate`) : la page paraît vide alors que la scène tourne (vu le 2026-09-06 sur
  `/journey`). Une capture du canvas seul ne le montre pas : seule une capture composée de la page
  (CDP `Page.captureScreenshot`) prouve que la scène est visible. Chrome headless : joindre CDP par
  `127.0.0.1`, pas `localhost` (Node 24 le résout d'abord en IPv6, où Chrome n'écoute pas).
- **`bmesh.ops.recalc_face_normals` peut orienter une nappe ouverte (heightfield) vers le bas** :
  Blender rend quand même (double face), three.js aussi mais éclairé à l'envers dès qu'on coupe les
  faces arrière. `zx_terrain_mountain._grid` retourne la nappe si la normale moyenne pointe vers le
  bas ; garder ce contrôle pour toute nappe ouverte. Les matières du sol sont à faces arrière
  coupées (`use_backface_culling`, glTF `doubleSided=false`) : c'est ce qui rend l'intérieur du tunnel
  visible depuis la voûte.
- **Un tunnel dans un heightfield** (2026-09-07) : la nappe ne peut pas avoir de trou, la face qui
  ferme le portail existe toujours. Recette qui marche : voûte à normales intérieures prolongée de 3 m
  hors du portail, demi-disque sombre presque opaque (alpha .86, une seule face vers l'extérieur) à 1 m
  du bord qui masque cette face vue de dehors ; la décision « couvert ici » se prend sur l'axe de la
  route (couverture > 4,8 m au droit de l'échantillon), jamais sommet par sommet (une rive reste haute,
  l'autre creusée : pan diagonal dans le tunnel) ; dans l'emprise de la voûte le sol est relevé à
  `route + 5` ; la caméra de poursuite ne teste plus les obstacles dans le tunnel et se recentre sous
  la voûte ; phares du rover allumés dedans. Sonde : `scratchpad/cdp-probe.mjs` (rayon depuis la
  caméra, normales, enroulement des faces).
- **Sous un pont, plafonner le sol** (`route - 1,5 m`, fondu 3 m) plutôt que seulement sauter
  l'empreinte : au massif le pont était enterré et la caméra se bloquait contre le sol.
- **Un attribut couleur n'est exporté en COLOR_0 que si le matériau le référence** (nœud Color
  Attribute dans l'arbre) : sinon l'exporteur écrit un COLOR_0 blanc et l'attribut en COLOR_1, que
  le shader du site ne lit pas (vu sur l'eau, 2026-09-07). `materials.water_material` s'appuie sur
  `vertex_tinted_material(mix=0)` avec le facteur du Mix à 0 (Blender ne teinte pas), et
  `_paint_water` supprime les autres attributs couleur avant d'écrire `Col`.
- **Tout ce qui se pose au sol lit `lib.probe.height`** (BVH de la nappe construite), jamais
  `route.ground_z` seul : la grille de 2 m et l'empreinte de la route s'écartent du relief analytique
  de plusieurs dizaines de centimètres (arbres qui flottaient).
- **`npm install` pendant que `next dev` tourne** fait paniquer Turbopack (FATAL sur globals.css,
  /journey en 500) : tuer node sur 3010, `rm -rf .next`, relancer.

## 9. Interdits

- Assembler des primitives et appeler ça un asset (déjà refusé : « archi naze »).
- Importer des modèles Sketchfab / Poly Pizza / générés (Hyper3D, Hunyuan) dans la scène finale :
  cohérence de style et licence. Références d'échelle uniquement, supprimées ensuite.
- Textures photo, matériaux « réalistes », micro-détails, volumétriques lourds, DOF marquée, texte 3D.
- Renommer / supprimer en masse, écraser un `.blend` de Pierre sans accord (`Save As` incrémenté si doute).
- Modifier la home, les pages `/work`, `globals.css` ou `package.json` sans accord explicite.
- Commit sans demande ; **jamais de push/merge `master`** sans OK explicite (Vercel déploie la prod).
- Boucler en silence, ou montrer un rendu qui n'a pas passé la checklist.

## 10. Communication

- Français avec Pierre ; identifiants, code et copy du site en anglais. Pas de tirets cadratins.
- Rendus : `renders/YYYY-MM-DD_<sujet>_v<nn>.png` (auto via `render.preview`), envoyés avec
  `SendUserFile`, la référence à côté quand c'est possible.
- Une décision de DA ou de storytelling non tranchée = une question courte à Pierre, pas une
  hypothèse silencieuse.
