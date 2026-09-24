"""Bibliotheque de l'atelier 3D (Blender 5.x).

Modules :
- paths      : chemins du projet, derives de l'emplacement des fichiers (rien en dur)
- palette    : lecture de blender/palette.json, conversion hex -> lineaire
- naming     : zones, categories, collections imbriquees, nommage des assets
- materials  : materiaux "palette" (Principled BSDF) reutilises
- mesh       : finalisation d'un asset (transforms, origine, ombrage lisse par angle, bevel, budget)
- export     : export glTF binaire (.glb, Draco) vers blender/exports et public/models
- render     : rendu de previsualisation dans blender/renders
- runner     : execution d'un script de scripts/ avec des parametres

Convention : toute fonction qui touche a la scene est deterministe (aleatoire seede) et
ne s'appuie jamais sur la selection ou le contexte UI, pour marcher aussi en headless.
"""
