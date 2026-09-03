# 08 — Scene brief: the launch base (validated direction)

> Pierre's own brief for the first scene (2026-09-03). For this scene it **supersedes** the
> generic art-direction notes in `02` and the plume/lift-off beats in `03`: the rocket is
> **posée** (landed, static), with **no flame, no exhaust, no smoke**. Kept verbatim in French —
> it is the source of truth.

## The brief (verbatim)

Reproduire une scène 3D stylisée en low-poly, avec une esthétique de jeu vidéo minimaliste et géométrique.
La composition est frontale, légèrement en contre-plongée, avec une caméra placée assez près du sol. L'image est centrée autour d'une petite fusée installée dans un paysage extraterrestre glacé.

**Arrière-plan :** Un grand ciel bleu nuit uniforme à bleu pétrole, légèrement dégradé vers le haut. Quelques minuscules étoiles ou particules lumineuses sont dispersées dans le ciel, sans créer un ciel réaliste ou chargé.
Au centre de l'arrière-plan se trouve une énorme structure sphérique métallique, partiellement enterrée ou posée derrière le terrain. Elle ressemble à un module spatial / une capsule / une station extraterrestre. La sphère est gris clair, gris bleuté et légèrement blanc cassé. Sa surface est composée de grands panneaux polygonaux visibles, avec plusieurs formes hexagonales ou trapézoïdales encastrées dans sa coque. La sphère ne doit pas être parfaitement lisse : elle doit avoir une apparence low-poly, constituée de grandes faces géométriques légèrement irrégulières. Plusieurs ouvertures ou panneaux sombres sont répartis sur sa surface, notamment des formes hexagonales et rectangulaires épaisses.

**Paysage :** Le sol est un terrain rocheux extraterrestre glacé. Il est principalement bleu gris, cyan très désaturé et gris sombre. Sur les côtés gauche et droit de l'image se trouvent de grands pics rocheux/cristallins, très anguleux et triangulaires. Ils encadrent naturellement la scène et créent une sorte de canyon ouvert vers le centre. Les rochers sont extrêmement géométriques : grandes faces triangulaires, arêtes nettes, aucune texture réaliste. Les sommets sont irréguliers et pointus. Quelques formations rocheuses sont également visibles derrière la fusée, devant la grande sphère. Le premier plan contient plusieurs rochers et plaques de terrain polygonales, avec une profondeur progressive : rochers très sombres sur les bords et au premier plan, terrain plus clair autour de la fusée.

**Fusée :** Au centre exact de la composition se trouve une petite fusée verticale, posée directement sur le sol. Elle est relativement petite par rapport à l'immense sphère située derrière elle. La fusée possède un corps très simple et élancé, de forme cylindrique légèrement conique. Son nez est rouge/orange foncé, avec une forme conique pointue mais légèrement arrondie. Sous le nez se trouve une partie principale gris très clair/blanc cassé. Au milieu de la fusée, on peut distinguer une petite fenêtre circulaire ou ovale sombre, bleu très foncé, avec éventuellement un léger reflet cyan. De chaque côté du bas de la fusée se trouvent deux petites ailettes latérales, symétriques, de couleur bleu pâle/cyan. La fusée est immobile et posée verticalement sur le sol. Elle ne décolle pas. Il ne doit y avoir aucune flamme, aucun jet de propulsion, aucune fumée et aucune animation de décollage. Elle repose sur une petite zone rocheuse/cristalline légèrement surélevée au centre du terrain.

**Éclairage :** Éclairage doux venant principalement de l'avant et du haut. La scène possède des ombres douces mais suffisamment marquées pour donner du volume aux rochers. La fusée et le sol autour d'elle sont légèrement plus lumineux que les rochers situés sur les côtés. Palette froide : bleu nuit (ciel), bleu pétrole, bleu gris, cyan pâle, gris foncé, blanc cassé ; petite touche de rouge/orange uniquement sur le nez de la fusée.

**Style visuel :** Formes géométriques simples et faces polygonales visibles. Low-poly propre, stylisé, proche d'une illustration 3D de jeu vidéo. Pas de photoréalisme, pas de textures complexes, pas de matériaux métalliques ultra-réalistes, pas de détails microscopiques. Apparence propre, graphique, cinématique et légèrement mystérieuse.

**Composition finale :** Rochers sombres à gauche et à droite, grande sphère au centre de l'arrière-plan, petite fusée parfaitement centrée au premier/moyen plan, verticale, posée au sol — point focal. Ratio 16:9, caméra fixe, vue frontale, profondeur de champ très légère voire inexistante, composition équilibrée et symétrique.

**IMPORTANT :** ne pas reproduire exactement une image existante. Utiliser uniquement sa composition générale comme inspiration et créer une scène originale avec les mêmes principes visuels : low-poly, canyon rocheux, grande structure sphérique en arrière-plan et petite fusée centrale posée au sol.

## Structural rules learned from the reference (keep these)

- The **sphere is embedded, not a moon**: radius ≈ 6, centre ≈ ground level (`z≈0.9`), so its
  lower half is buried and its base is masked by mid-ground rocks. Grey-blue hull with subtle
  per-face variation (colour attribute `facecol`) and a dozen+ dark recessed hex panels on the
  camera-facing side. Not white, not a soccer ball (Goldberg from icosphere subdiv 3).
- **Side rocks are fractured mountain masses** (jittered icospheres, big triangular faces), very
  close to the camera and entering from the extreme edges, asymmetric — never thin regular
  spikes ("sapins/cristaux"). Pierre's original thin spikes are kept hidden in
  `_USER_SPIKES_HIDDEN`.
- **Foreground rises toward the rocket** (terrain z += 0.04·(y+20), capped at y=9), heavy
  Decimate (ratio 0.035) for big faces, shallow bowl under the rocket; the rocket sits IN the
  bowl (`RocketRoot` scale 0.62), no platform.
- **Lighting**: one strong sun from front-upper-**left** (`Key`, crisp 4°) + `CentreFill` point
  above the hollow → centre pale blue/cyan, edges dark navy. World strength ≈ 0.4.
- Camera: `Camera` 74 mm at (0, −29.6, 2.3) aimed at (0, 12, 4.4), 1600×900. At y≈−10 only
  x≈±4.7 is inside the frame — place near objects accordingly.

## Six separable elements → six Blender collections → GLB groups or render layers

| Element            | Blender collection | Contents                                              |
|--------------------|--------------------|-------------------------------------------------------|
| background         | `BG`               | `Stars2` (+ the world sky gradient)                   |
| giant sphere       | `SPHERE`           | `Moon2`                                               |
| left rocks         | `ROCKS_L`          | `CliffL*`, `MidRockL*`                                |
| right rocks        | `ROCKS_R`          | `CliffR*`, `MidRockR*`                                |
| foreground terrain | `TERRAIN`          | `Terrain`, `NearRock*`                                |
| rocket             | `ROCKET`           | `RocketRoot` (Empty) + `Circle`, `Circle.001` (nose), `Circle.002` (fins), `Circle.003` (nozzle), `Porthole_*` |

Two ways to ship it, decision pending (see `docs/05 §5.4` / `07 #3`): **pre-rendered layers**
(render each collection alone with film transparent, fixed camera → PNGs, parallax in React) or
**live R3F** (export each collection as a GLB group and rebuild the same camera in Three.js —
the scene is only a few thousand triangles, so this is cheap and unlocks scroll-driven camera,
rocket, smoke and light animation).
