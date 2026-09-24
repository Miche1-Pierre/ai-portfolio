# STORYTELLING.md, le monde du portfolio

> v0.7 (2026-09-07), « peaufiner » : sur la liste de Pierre (arbres qui flottent, tunnel pas creusé,
> eau qui n'est pas de l'eau, neige, herbe, fleurs, nuages, soleil, traces, maisons, détails). Côté
> Blender : tout ce qui se pose au sol interroge le sol CONSTRUIT (`lib/probe`, BVH de la nappe) ;
> relief en bruit fractal et côte irrégulière (`route._fbm`) ; de vrais bâtiments (`assets/zx_stations.py` :
> maisons à toits débordants, cheminées, fenêtres éclairées, jardins et clôtures, gare et son auvent,
> auberge à balcon, moulin à ailes de toile, champs labourés clôturés et bottes, cabane de rondins avec
> porche, ponton et barque, poste de contrôle à barrière levée, atelier à conteneurs nervurés et grue,
> observatoire à dôme, lunette et parabole sur un replat du sommet, grue du quai) ; tunnel = voûte
> prolongée + bouche sombre + bandeau d'arc en roche et clé de voûte, nervures et lampes ; congères le
> long de la route enneigée, panneaux indicateurs avant chaque halte, buissons, calottes de neige sur
> les rochers (`mesh.paint_normal_fn`) ; mer et lac creusés (bancs de sable rares), attribut de rivage et
> de profondeur sur les eaux. Côté site (`journey-nature.tsx`) : shader d'eau (vaguelettes, fresnel,
> reflet du soleil, écume au rivage), prairie instanciée (9 000 touffes, fleurs, vent), nuages qui
> dérivent, disque du soleil et de la lune, paillettes sur la neige, lampes du tunnel, traces de roues
> sur le sable et la terre, bloom et vignettage (`@react-three/postprocessing`, ordinateur seulement).

> v0.6 (2026-09-07), « une vraie carte » : sur la référence de Pierre (une île low-poly avec ses
> biomes), le voyage n'est plus une ascension mais **le tour d'une île**. Le relief est composé par
> plaques (`lib/route.landform`) : la plaine côtière, les collines boisées, le bassin du lac, la
> terrasse du village et ses champs, la mesa du désert, le massif enneigé, la crête du phare. Une
> vraie mer (plan à -2 m, bancs de sable à marée basse), une rivière qui descend du massif à la
> mer par la forêt, un lac. La route (987 m) : le port → la plage et sa crique (épave, récif,
> ossements) → un pont sur l'embouchure → les collines boisées et leurs raccourcis → le lac et la
> cabane → le village, ses champs, son moulin → le canyon creusé à travers la mesa (l'atelier) → le
> pied du massif, un pont sur la rivière, un tunnel → les lacets jusqu'à l'observatoire du sommet →
> la descente vers la crête du phare, au-dessus du port : le bout, où le phare se rallume. Huit
> ambiances lumineuses. Les collections Blender gardent leurs anciens noms (voir `naming.ZONES`).
>
> v0.5 (2026-09-07), « Jusant » : demande de Pierre, on ne monte pas tout de suite. Depuis le quai,
> la route **descend sur le fond de la mer** et le traverse en S entre les dunes (l'épave, un récif,
> les ossements d'une baleine), rejoint le rivage d'en face, entre dans **une forêt de conifères**
> qu'elle grimpe en trois tronçons et deux épingles, avec **trois chemins secondaires** qui coupent
> à travers bois, arrive sur le plateau (l'atelier), puis la rampe, le col, la combe et la crête.
> 906 m de route, sept ambiances lumineuses (aube au port, matin clair sur le sable, fin de matinée
> dans la forêt, midi, hiver, coucher, nuit). Le rover roule sans secousse simulée, pneus lisses,
> posé sur la chaussée ; aucun décor à portée de la route (distance mesurée avec le rayon de chaque
> arbre, rocher, galet). Zones : Z0 port · Z1 sable · Z2 forêt · Z3 plateau · Z4 col et combe ·
> Z5 crête · Z6 ciel (les collections Blender gardent leurs anciens noms, voir `naming.ZONES`).
>
> v0.4 (2026-09-07), « montage » : le relief est **dessiné** (`lib/route.landform`) et la route
> le suit au lieu de le fabriquer : pente frontale au-dessus du port, **plateau** où l'on arrive
> (l'atelier), **longue rampe en corniche** vers un **col**, **descente** dans une **combe** derrière la
> crête (la gare, le hameau, l'auberge, des sapins), remontée, **route de crête** jusqu'à l'observatoire.
> Matières progressives par couleurs de sommets (sable → roche, lichen sur les plats, neige tachetée
> de 46 à 58 m, roche froide qui affleure), rochers auto-placés. Sur le site : **lumière par zone**
> (aube, matin, midi, après-midi d'hiver, coucher, nuit) qui glisse le long de la route, ombres douces,
> et une « physique » de sols sans moteur : suspension qui tremble et se cabre, **traces de roues dans
> la neige** révélées derrière le rover, poussière sur la terre et poudrerie sur la neige, neige qui
> s'accumule sur le capot et la bâche. Demande de Pierre du 2026-09-06 (« plus réaliste en termes de
> montage, diversifier, de la vraie neige avec physique, progressif »).
>
> v0.3 (2026-09-06). Nouveau depuis v0.2 : **le voyage commence dans le hangar** (le garage du rover ;
> la sortie est la révélation du port, §3.8) et **la carte complète du parcours** (§3.9, figure
> `STORYTELLING-carte.svg`) : chaque zone raconte une partie du CV et reprend une section du site
> actuel, du port (Metz, 2023) au col enneigé (Montréal, 2026) et au sommet. C'est une **proposition à
> valider avant de construire** (§6, §7). Décisions v0.2 conservées : rover sans passager, sur rails
> au scroll, l'espace n'est pas un lieu, cible = la home puis chaque page (§3.7).
> Nom de travail : **« Marée basse »** (EN : *Low Tide*).

## 1. Le pitch

> La mer s'est retirée. Ce qu'elle cachait, c'est un chemin qui monte.

Le visiteur démarre **dans un garage** : un rover, une lampe, un établi, une porte ouverte sur la
lumière. Il scrolle, le rover sort, et le monde se découvre d'un coup : un port à sec au pied d'une
montagne côtière, un phare éteint, une piste qui grimpe. Le rover la remonte, halte après halte :
chaque halte est un chapitre du parcours de Pierre, dans l'ordre où il l'a vécu (l'école et les
premières missions en Lorraine, l'atelier où il s'est outillé, le col enneigé du Canada et ses
clients, l'observatoire où il construit ses propres outils), et chaque chapitre ouvre un **carnet**
(la carte HTML : expérience, étude de cas). L'ascension dure une journée : aube au port, midi à
l'atelier, après-midi d'hiver dans la neige, coucher de soleil à l'observatoire, nuit au sommet, où
l'on peut « envoyer un signal » (contact) pendant que le phare du port se rallume.

Pourquoi ça tient : **un axe** (vertical), **une ligne** (la piste, visible partout), **un avatar**,
**une chronologie** (bas = 2023, haut = 2026), **une journée**, **une famille de couleurs** (celle du
site, décalée par zone), **un langage de formes**, **une échelle**. Le texte reste dans le HTML.

## 2. Structure retenue, et celles écartées

| | A. L'Ascension (« Marée basse ») **retenue** | B. L'Archipel | C. La Traversée |
|---|---|---|---|
| Idée | une montagne côtière, la mer retirée, une piste en lacets du port au sommet | des îles sur une mer retirée, un bateau va d'île en île | une ligne de crête horizontale |
| Navigation | scroll = progression sur la piste, le rover la suit, haltes = sections | conduite libre (Bruno Simon), projets = îles | scroll = distance |
| Cohérence | très forte (un axe, une ligne, une chronologie) | moyenne (éparpillé) | forte |
| Faisabilité | spline = chemin caméra et chemin du rover, pas de physique, pas de rig | physique + exploration libre = lourd, mobile difficile | proche de A, sans la progression |

Référence assumée : le portfolio de Bruno Simon pour la présence d'un véhicule et d'un monde, **en
plus simple** : ici on voit où l'on va, le point de vue reste celui de la poursuite, le scroll reste
le seul contrôle (décision Pierre, 2026-09-06). B reste une idée de « mode libre », bien plus tard.

## 3. Le concept en détail

### 3.1 Le monde

Une île, vue comme une carte (la référence de Pierre, 2026-09-07) : au sud le vieux port échoué et
sa plage de marée basse, à l'est les collines de conifères et le lac, au nord-est la terrasse du
village et ses champs, au nord la mesa désertique fendue par un canyon, au nord-ouest le massif
enneigé et son sommet, à l'ouest la crête du second phare, au-dessus du port. La route (987 m) en
fait le tour dans l'ordre du CV : chaque biome est un chapitre, chaque biome a son heure du jour
(huit ambiances, §3.6). Le relief est composé par plaques (`lib/route.landform`) et la route le
lit : elle prend sa hauteur au terrain, sauf dans le canyon et sur le massif où son profil est
fixé. Ce que la route croise n'est jamais posé dessus : rochers, arbres, récifs, haltes gardent une
distance mesurée avec leur rayon (« pas d'obstacle sur la route », Pierre, 2026-09-06).

### 3.2 Les zones (dans l'ordre de la route)

| Zone (collection) | s (m) | Section du site | CV raconté | Ce qu'on voit | Asset héro | Heure |
|---|---|---|---|---|---|---|
| **Le hangar et le port** (`Z0_PORT`) | 0-45 | Hero, About | nom, titre, disponibilité ; d'où ça part | on démarre **dans le garage**, la porte relevée ; on sort : le quai, les bateaux échoués, le phare éteint | le **rover** + le hangar | aube |
| **La plage et la crique** (`Z1_SABLE`, route `Z1_VOIE`) | 45-120 | Experience 2023-2024 | MNS 2023 (bachelor, Admin MNS), LORIA 2024 | le sable de marée basse, les bancs, **l'épave**, un récif, les ossements d'une baleine ; **bornes** 2023 et 2024 ; un pont sur l'embouchure de la rivière | l'épave | matin clair |
| **La forêt et le lac** (`Z2_FORET`) | 120-330 | Experience 2025 | SYNAPSIA 2025 (SpeedReporting), Nancyclotep 2025 (LIMS réglementé), PeeL déc. 2025 | les collines de conifères, la rivière, **deux raccourcis** qui coupent à travers bois ; **borne 2025** ; **le poste de contrôle** (portique et guichet) ; **le lac**, la cabane du cantonnier, son mât, le ponton | le poste de contrôle + la cabane | fin de matinée, puis midi |
| **Le village** (`Z3_COL`, haltes) | 330-390 | Experience 2026, Work | TechGuys (février 2026), Safex, Communauto, Groupe Laplante, Plania | la terrasse plate, **les champs** et **le moulin** ; **la gare** et son quai (plus tard les passagers) ; **trois maisons** ; **l'auberge**, la grande bâtisse | la gare + l'auberge | midi |
| **La mesa et l'atelier** (`Z2_ATELIER`) | 390-560 | Skills, Approach | les quatre familles de compétences | le désert : la mesa, ses cactus, **le canyon** creusé à travers (route à profil fixé, déblai jusqu'à 20 m) ; **la terrasse-atelier**, ses conteneurs, sa grue | la terrasse | après-midi de désert |
| **Le massif** (`Z3_COL`) | 560-800 | Experience 2026 (la neige, c'est Montréal), Work | le Canada : l'hiver ; au sommet Taskforce et Brain OS | le pied du massif, **un pont sur la gorge** de la rivière, **le tunnel** dans la crête (phares du rover allumés), les sapins enneigés, le panneau du col, **les lacets**, **l'observatoire** au sommet | le tunnel + l'observatoire | hiver bleu, puis coucher de soleil |
| **La crête du phare** (`Z4_OBSERVATOIRE`) | 800-987 | Contact | disponible en octobre 2026, Montréal | la descente sur la crête au-dessus du port, **le second phare**, le bout de la route ; le phare du port se rallume | le phare | nuit claire, lune |

L'espace n'est **pas un lieu** (décision Pierre) : le ciel nocturne de la crête suffit.

**Pourquoi la neige est le Canada** : la chronologie suit la route. 2023-2025, c'est la Lorraine :
le port, la plage, la forêt, le lac. 2026, c'est Montréal : le village d'abord (les clients
rencontrés là-bas), puis l'hiver du massif et les gens (les stagiaires) qui deviendront, plus tard,
les passagers de la gare. Le sommet, c'est ce que Pierre construit en propre, et la crête du phare,
la suite (octobre 2026).

### 3.3 L'avatar : le rover (décidé, sans passager)

Un corps rigide sur une spline (pas de rig), et toute la vie vient de la mécanique : les roues
tournent, le tangage suit la pente, l'antenne fouette, les phares s'allument au crépuscule.

- **Gabarit** : 3,2 × 1,9 × 1,7 m, quatre roues de 0,8 m, suspension visible, garde au sol généreuse.
- **Couleurs** : carrosserie **rouge brique de la marque** (`avatar.body` : le rover EST la marque),
  garnitures plâtre, châssis et roues fonte sombre, accents laiton, phares `avatar.headlight`.
- **Détails** : galerie de toit (rouleau de bâche, caisse, roue de secours), antenne fouet, deux
  phares ronds, pare-chocs cabossé, échelle d'un côté, bidon de l'autre, treuil, snorkel, poussière
  sur le bas de caisse. Depuis le 2026-09-06 (retouche de Pierre, reprise dans le script) : **la
  cabine est une coque percée aux vitres, le verre est transparent, et l'intérieur existe**
  (banquette, dossier, tableau de bord, volant).
- **Animation** : roues proportionnelles au scroll, tangage et roulis légers, antenne à ressort,
  phares qui s'allument (Z4), moteur coupé à l'arrêt (Z5).
- **Structure Blender** : un Empty racine `Z0_Avatar_Rover`, chaque pièce en objet enfant.

### 3.4 Les carnets (les lettres de Jusant)

À chaque halte, un **carnet** s'ouvre : la carte HTML existante (expérience, étude de cas,
compétences), posée à côté de la scène dans la zone laissée calme par la composition. Papier crème,
Poppins, un filet ambre. En 3D, seul un objet-carnet symbolique (sans texte) signale la halte.

### 3.5 Caméra et interaction (sur rails, décidé)

- **Scroll = progression** le long de la piste (0 → 1), amorti ; remonter le scroll = redescendre.
- **Dans le garage**, la caméra suit son propre chemin (exporté par Blender avec la spline) : de
  l'arrière-droit du rover, elle sort par la porte derrière lui et rejoint la poursuite (§3.8).
- En trajet, caméra trois quarts arrière au-dessus du rover, côté mer ; elle se rapproche quand le
  terrain se met entre elle et le rover.
- **Plus tard** (idées de Pierre, 2026-09-06, à faire après la carte complète) : aux haltes, un
  léger **aimant** (soft-snap) et une caméra « carte postale » ; **flèches gauche / droite** pour
  avancer et reculer en plus du scroll ; **des gares où l'on s'arrête pour prendre des passagers**
  (les rencontres au Canada), sur le modèle du site au train.
- Le HTML reste des **sections réelles** ; le canvas est fixe derrière et se synchronise.
- Mobile : même scène, `dpr ≤ 1.5`, pas d'ombres portées, carnets en bas d'écran.
  `prefers-reduced-motion` : suivi immédiat, pas d'amortissement.
- Son : aucun par défaut.

### 3.6 La lumière raconte le temps

Voir ART_DIRECTION §7 : un seul soleil, avant-gauche, dont la couleur et la hauteur suivent
l'altitude ; dans le col, lumière froide et bleue d'un après-midi d'hiver, neige rosée par le soleil
bas ; les phares du rover prennent le relais au crépuscule. Dans le garage, une lampe suspendue.

### 3.7 Où ça vit (décision Pierre : la home, et à terme chaque page)

1. **Phase 1, prototype** : route `/journey` hors navigation (`noindex`). En cours.
2. **Phase 2, la home** : l'ascension devient la home ; les sections actuelles deviennent les carnets
   des haltes ; la nav et le `⌘K` ancrent sur les haltes.
3. **Phase 3, chaque page** : le canvas vit dans le **layout racine**, persiste entre les pages, et
   **chaque route est une halte** (`/work/safex` conduit le rover devant la maison Safex du hameau,
   `/work/taskforce` devant le phare de l'observatoire). Le sort du hero LaserFlow des pages `/work`
   se décide alors.

### 3.8 Le départ dans le hangar (2026-09-06)

Le rover est **garé sur le plancher du hangar** (plinthe de 0,5 m), dans l'axe de la porte, qui a
été relevée pour le laisser passer avec sa galerie. La spline part de là : deux mètres jusqu'à la
porte, la rampe, le quai, et la route (surface de terre, ornières) ne commence qu'au pied de la
rampe. La caméra démarre à l'intérieur, arrière-droit du rover, un peu en hauteur, sous la lampe :
on voit la cabine, le chargement, et la porte lumineuse devant. Au scroll, le rover sort ; la caméra
le suit **par la porte**, et le port se découvre d'un coup : le sable, les épaves, le phare, la
falaise. Neuf mètres après la rampe, la caméra de poursuite prend le relais, sans à-coup (son
chemin d'intro se termine exactement sur la pose de poursuite).

### 3.9 La carte complète (construite, v0.6)

**987 m de route**, 25 écrans de scroll (environ 40 m par écran). Abscisses exportées par Blender
(`src/data/journey-path.json`, haltes `STATIONS` de `lib/route.py`). Un seul carnet à l'écran, celui
de la halte courante (deux haltes proches se chevauchaient).

| s (m) | Zone | Halte | Section | Le carnet dit | On voit |
|---|---|---|---|---|---|
| 0 | port | Le garage | Hero | nom, titre, disponibilité, « scroll to start the engine » | le rover sous la lampe, la porte ouverte |
| 4 | port | La sortie | (aucun carnet) | | la révélation du port |
| 42 | port | Le phare éteint | teaser | « il se rallume au bout de la route » | le phare, le quai, la plage devant |
| 68 | plage | Borne 2023 · MNS | Experience | bachelor, Admin MNS | la borne sur le sable, l'épave |
| 95 | plage | Borne 2024 · LORIA | Experience | stage full-stack, Nancy | la borne, le récif, le pont sur l'embouchure |
| 187 | forêt | Borne 2025 · SYNAPSIA | Experience, Work | SpeedReporting | la borne, les sapins, le premier raccourci |
| 215 | forêt | Le poste de contrôle | Experience, Work | Nancyclotep : LIMS, 21 CFR Part 11, GAMP 5 | portique, guichet : la route passe le contrôle |
| 323 | lac | Borne déc. 2025 · PeeL | Experience | étudiant-entrepreneur, Taskforce et Brain OS | la cabane du cantonnier, le mât, le ponton sur le lac |
| 341 | village | La gare | Experience | TechGuys, trois comptes en sept mois | la gare et son quai ; à terme les passagers |
| 359 | village | Les trois maisons | Work | Safex, Communauto, Groupe Laplante | trois maisons, les champs, le moulin |
| 377 | village | L'auberge Plania | Experience, Work | Head of Engineering, 13 000 utilisateurs | la grande bâtisse |
| 473 | mesa | L'atelier | Skills, Approach | les quatre familles de compétences | la terrasse dans le canyon, conteneurs, grue, cactus sur la mesa |
| 653 | massif | Le col : la neige | (transition) | le Canada, février 2026 | la ligne de neige, le panneau du col ; puis le pont, le tunnel (694-710 m), les lacets |
| 804 | sommet | L'observatoire | Work | Taskforce, Brain OS | la tour, la lanterne, le dôme, l'antenne, au coucher du soleil |
| 987 | crête | Le bout de la route | Contact | « Send a signal », octobre 2026, Montréal | le second phare, la nuit claire, le port en bas |

## 4. Assets (par zone)

| Zone | Héros (≤ 12 k tris) | Moyens (≤ 4 k) | Remplissage (≤ 800, variantes A/B/C) |
|---|---|---|---|
| Z0 | le rover, le hangar (porte relevée, établi, intérieur) | bateau de pêche, bateau à bulbe, phare, escalier de quai | bittes, bouées, filets, caisses, tonneaux, coquillages, mares |
| Z1 | la piste (flanc, lacets), le poste de contrôle | bornes datées, cabane de cantonnier, lisses, borne kilométrique | rochers, éboulis, herbes sèches, cairns |
| Z2 | terrasse-atelier | convoyeur, station météo, porte de coffre, bibliothèque, conteneurs | caisses, outils, tuyaux, cônes, bidons |
| Z3 | la gare, l'auberge Plania | trois maisons, quai de gare, réverbères, sapins | congères, rochers enneigés, piquets, traces dans la neige |
| Z4 | dôme + phare + antenne | terrasse sommitale, table à plans | drapeaux, bancs, jumelles, lichen |
| Z5 | satellite | balises lointaines | étoiles (points), nuages bas (puffs plats) |

## 5. Ce que le monde ne fait pas

Pas de faune détaillée, pas d'eau simulée, pas de météo dynamique, pas de conduite libre, pas
d'espace visitable, pas de texte 3D, pas de mini-jeu. **Pas de personnage pour l'instant** : les
passagers de la gare sont une idée retenue pour plus tard (§3.5, §7). Tout ce qui n'est ni ici ni
dans §4 est une idée à discuter, pas une tâche.

## 6. Ordre de construction (une étape = un rendu montré = un verdict)

1. **Fait** : la tranche verticale (rover, hangar, port, phare, première montée, lacet) et le
   prototype `/journey` ; le départ dans le hangar (2026-09-06).
2. **Fait (2026-09-06, à valider)** : le squelette complet. Une seule route (`lib/route.py`, 605 m,
   quinze haltes), une seule montagne construite depuis elle (`assets/zx_terrain_mountain.py`,
   neige au-dessus de 60 m), la piste sur toute la route (`assets/z1_track.py`), les masses des
   haltes (`assets/zx_stations_blockout.py`), un .glb par zone, tous les carnets branchés sur le
   contenu du site : on scrolle le voyage de bout en bout, en blockout.
   **v0.4 (2026-09-07, à valider)** : relief dessiné et route qui le suit (671 m, plateau, rampe,
   col, combe, crête), matières progressives, sapins, rochers ; lumière par zone et physique de sols
   sur le site (voir l'en-tête).
3. Z1 en détails : bornes datées, poste de contrôle, cabane de cantonnier.
4. Z2 : la terrasse-atelier.
5. Z3 : la ligne de neige (couleurs par sommet blanches sur le flanc), la gare, les trois maisons,
   l'auberge, la lumière d'hiver.
6. Z4 : l'observatoire, le faisceau, la constellation, les phares du rover.
7. Z5 : la nuit, les étoiles, le satellite, le phare du port qui se rallume, le contact.
8. Ensuite : aimant aux haltes et caméras carte postale, flèches, gares et passagers, puis les
   phases 2 et 3 (§3.7).

## 7. Décisions

**Tranchées** : avatar = rover, sans passager (2026-09-05) · sur rails au scroll · l'espace n'est pas
un lieu · cible = la home à terme, prototype `/journey` d'abord, monde persistant sur chaque page en
phase 3 · **on démarre dans le hangar** (2026-09-06) · **la carte raconte le CV dans l'ordre, chaque
zone = une section du site** (2026-09-06) · le point de vue reste la poursuite, plus simple que
Bruno Simon (2026-09-06).

**Restent à trancher (Pierre)** :

1. **La carte §3.9** : l'ordre des haltes, la neige = le Canada, le hameau des clients dans la neige
   plutôt que sur la falaise (v0.2) · longueur totale (520 m proposés) ?
2. **Le poste de contrôle** pour Nancyclotep et **la cabane de cantonnier** pour PeeL : ces images
   te parlent ?
3. **Les gens** : qui monte dans le rover à la gare (les stagiaires, l'équipe TechGuys) ; sous quelle
   forme (silhouettes low-poly sans visage) ; et quand (après la carte complète).
4. **Son** : aucun · ambiance muette par défaut ?
5. **Nom** : « Low Tide » · « Ebb » · autre ?
6. **Phase 3, pages `/work`** : le beam LaserFlow devient la lumière du bâtiment · ou le monde se
   met en pause derrière le hero actuel ?
7. **La home actuelle** : disparaît · reste accessible (ex. `/classic`) ?
