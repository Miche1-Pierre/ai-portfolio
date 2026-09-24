"""Chemins du projet, derives de l'emplacement de ce fichier (aucun chemin en dur)."""
from pathlib import Path

SCRIPTS = Path(__file__).resolve().parents[1]  # blender/scripts
BLENDER_DIR = SCRIPTS.parent                    # blender/
REPO = BLENDER_DIR.parent                       # racine du portfolio

REFERENCES = BLENDER_DIR / "references"
SCENES = BLENDER_DIR / "scenes"
EXPORTS = BLENDER_DIR / "exports"
RENDERS = BLENDER_DIR / "renders"
PALETTE = BLENDER_DIR / "palette.json"
PUBLIC_MODELS = REPO / "public" / "models"


def ensure_dirs() -> None:
    for d in (SCENES, EXPORTS, RENDERS, PUBLIC_MODELS):
        d.mkdir(parents=True, exist_ok=True)
