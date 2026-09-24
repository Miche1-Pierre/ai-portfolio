# ART_DIRECTION.md, le contrat artistique

> Version 0.1 (2026-09-05), à valider avec Pierre. Les images de `references/` priment sur ce texte ;
> ce texte prime sur les idées de Claude. Toute modification de ce fichier est une décision de Pierre.

## 1. En une phrase

**Une illustration 3D animée, « low-poly lisse » : peu de polygones, un ombrage doux sans facettes,
des aplats chauds et désaturés, des silhouettes lisibles, beaucoup de petites histoires. Sophistiqué,
jamais enfantin. Le détail vient des formes, pas des textures.**

## 2. Références, et ce qu'on en prend

| Référence | On prend | On laisse |
|---|---|---|
| **Jusant** (Don't Nod, 2023) | la verticalité, les biomes empilés, la mer retirée, le low-poly lisse aux dégradés doux, la lumière qui change avec l'altitude, le récit par l'environnement (les lettres) | l'escalade jouable, les mains réalistes |
| **Bruno Simon** (bruno-simon.com) et son cours *Three.js Journey* | l'avatar qui traverse un monde Blender → three.js, l'humour des petits détails, le pipeline glTF (import, optimisation, bake, scroll → caméra) | le bac à sable plat, la physique de conduite libre |
| **Monument Valley** (ustwo), **Alto's Odyssey** (Snowman) | silhouettes lisibles d'un coup d'œil, une palette réduite par zone, les ciels dégradés | l'isométrie stricte |
| **Sable** (Shedworks), **Firewatch** (Campo Santo) | aplats + dégradés d'heure du jour, brume par plans, chaleur des couchers de soleil | le cel-shading marqué de Sable |
| Notre scène « base de lancement » ([`docs/08`](../docs/08-scene-brief-launch-base.md)) | la petite machine détaillée, la caméra près du sol, le ciel dégradé uniforme | l'espace comme lieu, la palette froide unique |
| Le site lui-même (`globals.css`) | la palette éditoriale chaude (rouge brique, ambre, crème, brun), Poppins pour le texte HTML | rien : le monde 3D est la même marque, en volume |

Les références de Pierre (Pinterest, captures) vont dans `references/<catégorie>/` avec une ligne
dans `references/INDEX.md` (ce qu'on en prend). **Pas d'image de référence, pas de modélisation.**

## 3. Le style, précisément : « low-poly lisse »

- **Peu de polygones, ombrage lisse.** Aucune facette visible sur les volumes arrondis (coques,
  toits bombés, rochers ronds, cabine) : ombrage lisse partout, arêtes nettes seulement au-delà
  de ~30°. Des facettes larges restent acceptables, discrètes, sur la roche anguleuse.
- **Arêtes adoucies.** Un léger bevel (1 à 2 segments) sur toutes les arêtes dures : les bords
  attrapent la lumière, l'objet lit comme un jouet en bois peint ou une illustration, pas comme un mesh.
- **Aplats de couleur, dégradés doux.** La couleur vient d'une palette fermée (`palette.json`) ;
  le modelé vient de la lumière, de l'occlusion et, au besoin, d'un dégradé vertical dans le
  matériau. Pas de texture détaillée, pas de grain, pas de photo.
- **Silhouettes lisibles à 30 m.** On reconnaît l'objet à sa forme seule, avant toute couleur.
- **Sophistiqué.** Palette désaturée et chaude, usure, asymétrie, une petite histoire par asset
  (une corde qui pend, une caisse ouverte, une trace de marée). Jamais « jeu mobile pour enfants ».
- **Graphique et cinématique.** Cadrages travaillés, plans de profondeur, brume qui éclaircit et
  refroidit les plans lointains, très peu de profondeur de champ.

### À faire

- Perspective douce (35 mm équivalent), point de vue légèrement au-dessus de l'avatar, comme une
  maquette regardée à quelques mètres.
- Formes organiques et irrégulières, jamais parfaitement symétriques ; détails fonctionnels
  (tuyaux, trappes, échelles, câbles, poulies, rivets) plutôt que décoratifs.
- Trois niveaux de détail par asset : la masse, les détails fonctionnels, les imperfections.
- Environnement riche avec une géométrie simple : profondeur par plans, répétition avec variation
  (échelle, rotation, teinte), pas de copier-coller visible.
- Matériaux simples mais variés : bois, pierre, plâtre, laiton, acier, verre, toile, corde, lichen,
  neige. Chaque matière a sa rugosité.
- Lumière douce et cinématique, ombres douces mais présentes, un rim light quand l'heure le justifie.

### À ne pas faire

- Une succession de cubes / sphères / cylindres, des primitives Blender laissées intactes, « la
  forme géométrique à la place du détail ».
- Le low-poly générique facetté, les couleurs primaires saturées, les dégradés arc-en-ciel.
- Des objets qui flottent sans environnement, des arbres-cônes, des rochers-icosphères nus.
- Le photoréalisme, les textures image, les micro-détails, les volumétriques lourds, la DOF marquée.
- Du texte dans la 3D (hors plaques symboliques) : le texte vit dans le HTML.

## 4. Formes et silhouettes

- Blockout d'abord (masses, proportions, à l'échelle, dans la caméra), validation, puis détail.
- Asymétrie et fonction : un bâtiment a une entrée, une évacuation, une cheminée ; une machine a
  un moteur, un accès, des câbles.
- Répétition avec variation : trois variantes d'un remplissage (A/B/C) + variation d'échelle ±15 %
  et de teinte ±5 % à la dispersion. Jamais deux clones côte à côte.
- Usure : coins écornés, planches décalées, rouille aux jonctions, herbes dans les fissures.
- Une petite histoire par asset héro et par zone (voir STORYTELLING).

## 5. Palette

Source de vérité : [`palette.json`](./palette.json). Résumé :

**Marque (depuis `globals.css`)** : rouge brique `#9b2c2c` / `#b91c1c`, ambre `#b45309` / `#fbbf24`,
crème `#faf7f5` / `#fdf2d6`, brun profond `#1c1917` / `#17120e`, scène `#f2ede6` / `#17120e`.

**Accents projet (fixes, intouchables)** : Taskforce blanc `#f7f4ee` (bleu `#2f6bf6` en thème clair),
Brain OS `#2dd4bf`, Plania `#10b981`, Safex `#fb923c`, Communauto `#39f06a`, Laplante `#3450d4`,
Nancyclotep `#10e6c0`, SynapsIA `#f97316`, Admin MNS `#b3261e`. Ils ne servent qu'à **la lumière de
l'élément qui représente le projet** (fenêtre, lanterne, faisceau), jamais à peindre des murs.

**Avatar (le rover)** : carrosserie **rouge brique `#9b2c2c`** (le `--primary` du site : le rover EST
la marque), garnitures plâtre `#f3e6d3`, châssis et roues fonte `#2b241f`, accents laiton `#d6a516`,
phares `#ffd2a1` en émission (allumés à partir de Z4). Bloc `avatar` de `palette.json`. C'est le
seul objet rouge vif du monde : il doit se lire d'un coup d'œil dans chaque carte postale.

**Par zone** (l'ascension dure une journée, la palette suit) :

| Zone | Heure | Ciel → horizon | Sol | Principal | Secondaire | Sombre |
|---|---|---|---|---|---|---|
| Z0 Port à sec | aube | `#f6d9b8` → `#f2b98a` | `#e8d5b5` sable | `#c2703e` terre cuite | `#7fb2a8` coque sarcelle | `#4a3226` |
| Z1 La Voie | matin | `#dfe7ea` → `#f0cfae` | `#c9a67c` | `#b9865a` roche chaude | `#8b9b7e` lichen | `#5a3f2e` |
| Z2 Village | midi | `#cfe0e6` → `#e8e0d0` | `#b9865a` | `#f3e6d3` plâtre | `#9b2c2c` toits | `#8a5a3b` |
| Z3 Atelier | après-midi | `#c4d2d8` → `#e0d3bf` | `#8d7c6c` | `#2b241f` fonte | `#b45309` cuivre | `#1f1a16` |
| Z4 Observatoire | coucher de soleil | `#6f6484` → `#f0a06a` | `#d9cfc1` pierre pâle | `#f2ede6` neige, dôme | `#8b9b7e` lichen | `#3b3340` |
| Z5 Le Ciel | nuit | `#17120e` → `#2a2f4f` | `#1d2340` | `#f7f4ee` étoiles | `#fbbf24` feux | `#0f0c0a` |

Règle des proportions : 60 % de la zone dans ses deux neutres (sol + principal), 30 % de secondaire,
10 % d'accents (lumières). Une couleur hors palette = une question à Pierre + une entrée dans
`palette.json`, jamais un hex en dur dans un script.

## 6. Matériaux

- Un Principled BSDF par couleur (`lib.materials.palette_material`), réutilisé partout.
- Rugosité : mat par défaut (0.8 à 0.95) ; laiton / cuivre `metallic 1, roughness 0.35` ; acier
  `metallic 0.8, roughness 0.5` ; mares et éclats de lumière = teinte `glass`, roughness 0.15,
  opaque.
- Émission : uniquement pour ce qui éclaire (lampes, fenêtres, faisceau du phare, feux du satellite),
  couleur = accent projet quand l'élément représente un projet, force 2 à 6.
- Vitres de véhicule, hublots, lanterne : `lib.materials.glass_material()` = teinte `glass_clear`
  (gris clair), roughness 0.05, **transmission 1.0, IOR 1.1** (réglage de Pierre, 2026-09-06) : on
  voit l'intérieur, donc les caisses vitrées sont des coques percées (rover). Sur le site, le glTF
  sort en `KHR_materials_transmission` et `journey-scene.tsx` le remplace par un mélange alpha
  (même lecture, sans passe de rendu supplémentaire). `glass` clair reste pour les mares.
- **Poussière, usure, dégradé vertical** : uniquement par **couleurs par sommet** (attribut `Col`,
  `lib.materials.vertex_tinted_material` + `lib.mesh.paint_gradient`), parce que c'est la seule forme
  qui s'exporte en glTF (`COLOR_0` × `baseColorFactor`) et que three.js rend telle quelle. Jamais de
  dégradé par nœuds Blender seuls : il serait faux sur le site.
- Pas de texture image. Exceptions à valider avec Pierre : un atlas « palette » (bandes de couleurs,
  UV pointés dessus) si le nombre de matériaux pèse sur les draw calls ; un bake AO / lumière par
  zone si le rendu three.js manque de modelé.
- Eau : la mer s'est retirée, donc **pas d'eau** en Z0 (sable craquelé, mares résiduelles = disques
  plats `glass`). Éventuel réservoir en Z2-Z3 : plan plat dégradé, pas de simulation.

## 7. Lumière : une journée en une ascension

- **Un seul soleil** (directionnel), direction fixe **avant-gauche, un peu au-dessus** (les ombres
  partent vers l'arrière-droite), dont la couleur et la hauteur suivent l'altitude : `key_dawn`
  `#ffd2a1` bas et rasant en Z0, `key_noon` `#fff4e6` haut en Z2, `key_sunset` `#ffb070` rasant en
  Z4, `fill_night` `#4a5a8a` en Z5.
- **Un fill ciel** (hémisphérique) `fill_sky` `#b9cfe0`, faible : il donne la couleur des ombres.
- **Brume par zone** = la couleur `fog` de la zone, en distance (three.js `Fog`) et par plans (le
  lointain plus clair et plus froid). Pas de volumétrique World en EEVEE (piège connu).
- Ombres douces, présentes, jamais noires (elles prennent la couleur du ciel).
- Rim light seulement quand l'heure le justifie (Z4 : contre-jour orange sur les silhouettes).
- **Les phares du rover** (`avatar.headlight`) s'allument en Z4 et deviennent la lumière principale
  de la piste en Z5 : deux spots dans three.js, émission dans Blender.
- Dans Blender ces lampes vivent dans `Z<n>_<ZONE>/Lights` (rendus de contrôle) et ne s'exportent
  pas ; three.js les recrée depuis `palette.json`.

## 8. Caméra, composition, échelle

- **Caméra** : 35 mm équivalent, derrière et au-dessus de l'avatar (3/4 arrière, 6 à 8 m, inclinée
  de 10 à 15° vers le bas) pendant le trajet. Aux stations, elle se pose sur une **carte postale** :
  l'avatar dans le tiers bas, l'asset héro sur une ligne de force, et **40 % de la largeur laissés
  calmes** (à gauche ou à droite selon la zone) pour le texte HTML sur desktop. Sur mobile, le texte
  passe en bas, sur un dégradé doux.
- **Trois plans** : premier plan (silhouettes sombres qui cadrent), plan moyen (l'histoire),
  arrière-plan (masses de montagne, ciel). Perspective atmosphérique entre chaque plan.
- **Échelles de référence** (1 unité = 1 m) : personnage 1,75 · porte 2,1 · marche 0,17 ·
  garde-corps 1,0 · rover 3,2 × 1,9 × 1,7 (roues 0,8) · borne 1,1 · barrière 1,0 · hangar 6 × 5 × 4 ·
  maison de falaise 5 à 7 de haut · bateau de pêche 7 à 9 · phare 12 à 18 · lanterne 0,4 ·
  caisse 0,6 · bitte d'amarrage 0,9.
  Un objet hors échelle casse toute la maquette.
- Blender : `Camera` 35 mm, capteur 36 mm, 16:9 pour les rendus de contrôle ; la caméra du site est
  recréée dans three.js sur la spline.

## 9. Budgets

| Élément | Budget |
|---|---|
| Asset héro | ≤ 12 000 triangles |
| Asset moyen | ≤ 4 000 |
| Remplissage | ≤ 800 |
| Zone | ≤ 60 000 |
| Monde | ≤ 300 000 |
| `.glb` par zone / total | ≤ 2 Mo / 10 Mo (Draco) |
| Textures (si bake validé) | 1 par zone, ≤ 1024² (2048² exceptionnel) |
| Draw calls par vue | ≤ 150 (fusionner le remplissage statique par matériau) |
| Cible perf | 60 fps desktop, 30 fps mobile milieu de gamme, `dpr ≤ 1.5` |

## 10. Checklist « fait par un artiste » (avant tout rendu montré)

1. À 30 m, la silhouette seule suffit à reconnaître l'objet ?
2. Aucune primitive nue (cube, cylindre, sphère, cône non retravaillés) ?
3. Ombrage lisse sans facettes parasites, bevel sur les arêtes dures ?
4. Trois niveaux de détail (masse, détails fonctionnels, imperfections) ?
5. Asymétrie, usure, une petite histoire ?
6. Couleurs 100 % `palette.json`, rugosités cohérentes, émission seulement pour ce qui éclaire ?
7. Origine à la base, échelle appliquée, nommé et rangé dans la bonne collection ?
8. Budget de triangles respecté (`lib.mesh.tri_count`) ?
9. Même échelle et même langage de formes que les assets déjà validés ?
10. Cadré comme la référence et comparé côte à côte ?

## 11. Processus de validation

`référence → blockout (masses, échelle, caméra) → validation Pierre → détails → matériaux → lumière →
composition → rendu → validation → export`. Un rendu montré toutes les 1 à 2 itérations, une
correction par itération, la tranche verticale avant la fabrique d'assets.
