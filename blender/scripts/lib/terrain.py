"""Le relief de Z0, partagé entre le terrain et tout ce qui se pose dessus (props, épaves, phare).

Repère monde : le hangar est à l'origine, porte vers +X. Le quai est une plateforme de pierre à
z = 0 entre le mur (y = -8, côté mer) et le pied de la falaise (y = 8). Le sable du fond marin
ondule à z ≈ -2,6 pour y < -8. L'ancienne ligne d'eau est à z = 1,5 partout (marques de marée sur
le hangar, le quai, la falaise et le phare).
"""
import math

QUAY_EDGE_Y = -8.0          # face du mur de quai (côté mer)
QUAY_BACK_Y = 8.0           # pied de la falaise
QUAY_X = (-20.0, 50.0)      # étendue du quai le long de la piste
QUAY_DEPTH = 5.0            # hauteur du mur de quai (z de 0 à -5 : le sable est loin dessous)
SEABED_Z = -3.6             # niveau moyen du sable (3,6 m sous le quai, les crêtes restent sous 0)
TIDE_Z = 1.5                # ancienne ligne d'eau

# Paliers de marque de marée (z monde, t) pour mesh.paint_stops : très taché en bas, plus clair en
# montant, ligne d'écume sombre, coupure nette. Couper les maillages aux z de TIDE_CUTS.
TIDE_STOPS = [(-2.0, 0.0), (1.25, 0.55), (1.36, 0.0), (1.46, 0.0), (1.52, 1.0)]
TIDE_CUTS = (1.25, 1.36, 1.46, 1.52)


# Deux familles de crêtes de directions différentes, chacune modulée par une enveloppe (des champs
# de dunes et des zones plus calmes), gauchies pour se courber et se rompre : rien n'est parallèle.
DUNES = (
    # (direction, longueur d'onde, amplitude, gauchissement x, gauchissement y, phase)
    (math.radians(28.0), 24.0, 1.0, 5.0, 3.0, 0.8),
    (math.radians(112.0), 31.0, 0.7, 4.0, 3.5, 1.7),
)


def dune(x: float, y: float) -> float:
    """Sable en dunes : crêtes asymétriques (harmonique double) de deux directions, enveloppes qui
    les font naître et mourir, houle large, rides. Déterministe. S'aplanit contre le mur de quai."""
    h = 1.0 * math.sin(0.07 * x + 0.7) * math.cos(0.055 * y - 0.4)  # houle large
    for i, (a, wavelength, amp, wx, wy, phase) in enumerate(DUNES):
        k = 2 * math.pi / wavelength
        u = x * math.cos(a) + y * math.sin(a) + wx * math.sin(0.05 * y + 1.0 + i) + wy * math.sin(0.07 * x - 0.5 * i)
        envelope = 0.5 + 0.5 * math.sin(0.045 * x + 0.3 + 1.3 * i) * math.cos(0.05 * y - 1.2 + 0.7 * i)
        h += amp * envelope * (math.sin(k * u) + 0.35 * math.sin(2 * k * u + phase))
    h += 0.12 * math.sin(0.7 * x + 0.5) * math.cos(0.55 * y)  # rides
    fade = max(0.0, min(1.0, (QUAY_EDGE_Y - y) / 6.0))
    return SEABED_Z + h * fade


def ground_z(x: float, y: float) -> float:
    """z du sol : le quai (0) entre le mur et la falaise, le sable ailleurs."""
    return 0.0 if y >= QUAY_EDGE_Y else dune(x, y)
