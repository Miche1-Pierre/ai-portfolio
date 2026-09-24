# Références et assets d'exemple

## Où déposer quoi

| Tu as... | Ça va dans... | Nom |
|---|---|---|
| des **images** (Pinterest, captures de Jusant, photos) | `references/<catégorie>/` | `<zone>-<sujet>-<nn>.<ext>`, ex. `avatar/z0-rover-01.jpg` |
| des **assets 3D d'exemple** (`.glb`, `.gltf`, `.fbx`, `.obj`, `.blend`, packs, Sketchfab, tes propres modèles) | `references/models/` | libre, garder le nom d'origine + la licence dans INDEX |
| des **scripts** Blender / Python | `scripts/_incoming/` | libre, je les adapte aux conventions puis je les range dans `assets/` ou `lib/` |
| des **idées, liens, notes** | le chat, ou un `NOTES.md` libre à la racine de `blender/` | |

Puis une ligne par fichier dans [`INDEX.md`](./INDEX.md) : fichier, source (URL), ce qu'on en prend,
ce qu'on laisse. Les assets 3D d'exemple servent de référence de **style, d'échelle et de
topologie** : ils ne sont **jamais exportés** dans la scène finale (cohérence de style, licence).

## Catégories d'images

| Dossier | Contenu attendu |
|---|---|
| `architecture/` | hangar, maisons de falaise, observatoire, phare, cabanes |
| `terrain/` | falaise, roche, sable craquelé, piste en lacets, sommet, nuages bas |
| `vegetation/` | herbes sèches, lichen, arbres bas, mousse |
| `avatar/` | rovers, buggies, petites machines détaillées (Mars rovers, utilitaires 4×4 stylisés) |
| `materials/` | bois usé, plâtre, laiton, acier, roche, toile, corde, peinture écaillée |
| `lighting/` | aube, midi, coucher de soleil, nuit ; brume par plans, contre-jour, phares |
| `composition/` | cadrages « carte postale », plans de profondeur, caméra derrière le véhicule |

## Ce qui aiderait le plus pour la tranche verticale (10 à 30 images suffisent)

- **Le rover** (le plus important, c'est la marque) : 5 à 8 images de rovers ou buggies dont tu
  aimes la silhouette, réels ou stylisés (Mars rovers, Moon buggy, utilitaires 4×4 de jeu vidéo).
- **Le port à sec** : bateaux échoués, marées basses (baie du Mont-Saint-Michel), cimetières de
  bateaux, un phare, un hangar à bateaux.
- **La piste** : routes de corniche en lacets, bornes, barrières de bois, éboulis.
- **La lumière d'aube** sur une côte : 2 ou 3 images.
- **Jusant** : 3 à 5 captures des zones qui te parlent (port, village, sommet).

## Points de départ (pages officielles)

- Jusant (Don't Nod, 2023) : https://store.steampowered.com/app/1977170/Jusant/
- Bruno Simon : https://bruno-simon.com/ et le cours https://threejs-journey.com/
- Monument Valley (ustwo), Alto's Odyssey (Snowman), Sable (Shedworks), Firewatch (Campo Santo) :
  captures officielles des studios.

Les images et les modèles d'exemple restent **en local** : ce sont des œuvres de tiers et le dépôt
est public, donc `.gitignore` les exclut (décision du 2026-09-24). Seuls ce README et `INDEX.md`
(sources et crédits) sont versionnés.
