# Maison 52 · Site web

Site one-page pour **Maison 52** — coloc de six chambres pour jeunes entrepreneurs à Court-Saint-Étienne (Brabant wallon, Belgique), à dix minutes de Louvain-la-Neuve. Le site est une seule page HTML avec une scène Three.js interactive (maison 3D qui tourne, puis zoome dans les fenêtres au scroll pour révéler chaque section de contenu).

Le projet vit dans le "projet coloc CSE" (Claude.ai). Les conversations précédentes ont itéré ~15 fois sur le design.

## Fichiers

- `index.html` — le site complet, self-contained (Three.js inliné, fonts via CDN, tout le CSS/JS dans le fichier)
- `RESUME_20260817.md` — résumé de session historique (état v13, décisions initiales)
- `CLAUDE.md` — ce fichier (contexte pour reprendre le travail)

Aucun build step. Aucun package. Un seul fichier HTML.

## Hébergement & déploiement

- **Repo GitHub** : `ulensseb/maison52` (public)
- **Branche** : `main` — chaque push déclenche GitHub Pages
- **URL live** : https://ulensseb.github.io/maison52/
- **Domaine custom** : `maison52.be` pas encore réservé (à faire chez dnsbelgium.be, ~10 €/an)
- **Cache GitHub Pages** : 10 min (utiliser `?v=<sha>` en query string pour bypasser côté navigateur)

Pour pousser une modif, si tu as `git` configuré localement : `git add . && git commit -m "..." && git push origin main`. Sinon utiliser l'API GitHub Contents avec le PAT de Sébastien (à demander, ne pas hardcoder dans un fichier commité — GitHub secret scanning bloque le push).

Déploiement en ~30-60s après push. Vérifier avec `curl -sI https://ulensseb.github.io/maison52/` (attendre HTTP/2 200).

## Stack technique

- **HTML** : single-file, ~665KB (dont ~500KB pour Three.js r128 inliné)
- **3D** : Three.js — maison paramétrique construite en code (BoxGeometry pour murs/socle/cheminées, ConeGeometry pour toits pavillon, PlaneGeometry pour vitres), rotation idle au repos, keyframes de caméra alignées sur le scroll pour zoomer dans chaque fenêtre
- **Fonts** : `Bricolage Grotesque` variable (Google Fonts) pour display + `JetBrains Mono` (Google Fonts) pour UI/labels/numéros
- **Pas** : de build, de framework, de bundler, de package.json, de node_modules

## État actuel du design

**Style** : dark studio, inspiré directement de [lusion.co](https://lusion.co) après refonte complète en août 2026.

**Palette (variables CSS `:root`)**
- `--craie` : `#0A0A0A` (fond noir profond)
- `--encre` : `#F0EBE0` (texte crème chaud)
- `--laiton` : `#C9A96A` (unique accent, utilisé avec parcimonie sur bordures et détails)
- `--gris` : `#8A8580` (texte muted)
- `--hairline` : `rgba(240,235,224,0.10)` (filets et bordures 1px)

**Couleurs maison 3D (objet `COL` dans le script principal)**
- `wall` : `#F0EBE0` (crème, pop sur fond noir)
- `wallEdge` / `frame` / `paneOff` / `door` : `#0A0A0A` (noir uni pour arêtes, encadrements, panneaux, porte)
- `roof` / plinth / cheminées : `#3A3D42` (ardoise foncée)
- `paneOn` : `#E6B160` (ambre chaud pour fenêtres allumées quand la caméra zoome)
- `laiton` : `#C9A96A` (accents fins sur arêtes de toit, sphère au faîtage)

**Composants clés**
- Preloader : compteur mono `000→100` bottom-left, barre de progression laiton fine, failsafe unlock à 3s si Three.js traîne
- Nav : `MAISON 52 / 1490 COURT-SAINT-ÉTIENNE` mono top-left, CTA `● LET'S TALK` rectangulaire top-right, hover-inverse
- Hero : titre Bricolage Grotesque énorme (jusqu'à 9.4vw), kicker mono avec dash prefix `— RÉSIDENCE D'ENTREPRENEURS`, baseline mono, `.hero-text` en bloc solide `var(--craie)` avec `z-index:20` pour que la maison 3D reste visible mais derrière (pas de bavure)
- Sections in-scroll : gros numéro `01`/`02`/... en background 12% opacity, kicker mono avec dash, h2 Bricolage massif, blurb, CTA `CONTINUE À DÉFILER`
- Fullpages (fenêtres zoomées) : full-bleed dark, typo massive, FAQ accordion minimaliste (hairline + `+`/`×` laiton)
- Corners : compteur `NNN / 007` bottom-right avec label section, `— DÉFILER POUR EXPLORER` bottom-left
- Marquees : bandes défilantes entre sections, `M A I S O N 5 2` à 15vw en signature footer
- Cursor custom : point laiton qui gonfle en anneau 52px sur liens/boutons (desktop uniquement)

## Structure DOM critique (à préserver pour la logique 3D)

Le script principal Three.js (dans `<script>` en bas du body) attend ces IDs et classes. **Ne pas les renommer ni supprimer** :

- `#stage` — conteneur du canvas Three.js (position fixed inset:0)
- `#experience` — wrapper des 7 panels scrollables (drive la progression scroll → keyframes de caméra K[0..6])
- `#hero`, `#p-vie`, `#p-fit`, `#p-faq`, `#p-photos`, `#p-porte` — les 6 panels (+ hero) qui matchent les keyframes
- `#fullpages` avec 5 enfants `.fullpage[data-stop="2"..."6"]` — les pages plein écran qui apparaissent à l'arrivée dans chaque fenêtre
- `.hero-text` dans `#hero` — le bloc solide qui masque la maison au hero
- `.fade` — classe utilitaire, éléments deviennent visibles au scroll via IntersectionObserver
- `#applyForm` avec `#f-name`, `#f-email`, `#f-msg` — formulaire de candidature (validation JS + mailto)
- `#nav` — la nav sticky (recoit `.scrolled` après 60% de viewport)
- `<body>` reçoit `.has3d` si Three.js OK, `.no3d` sinon, `.ready` après le preloader, `.scrolled` dès qu'on scrolle un peu

Les COL et les paramètres de caméra sont modifiables librement, mais les IDs/classes ci-dessus sont load-bearing.

## Historique des décisions design (ce qu'on a essayé et pourquoi on a arrêté)

- **v13 originale** : palette crème + toit sapin vert + typos Schibsted Grotesk. Rejeté après itérations — trop "générique Claude" (Schibsted rappelle la font Anthropic).
- **Fonts essayées et rejetées** : Cormorant, Inter, Syne, Space Mono, Fraunces, Work Sans, Instrument, Schibsted Grotesk, Cabinet Grotesk, Sentient, Boska, Migra (Migra n'existe pas sur Fontshare et retournait Satoshi en fallback silencieux).
- **Couleurs maison rejetées** : sapin vert (toit + châssis), bordeaux (porte), zinc parisien (trop pâle), palette full-brique.
- **Dark theme "premium classique"** essayé (bg noir chaud + laiton) : rejeté car "les couleurs marchent pas ensemble" — la maison beige + toit vert originale ne dialoguait pas avec le fond noir.
- **Reduction 3 couleurs maison** (crème + pierre + noir) : rejeté (revert) — trop plat.
- **État final validé** : refonte totale style Lusion.co, dark studio, Bricolage Grotesque + JetBrains Mono, maison en 3 tons (crème murs, ardoise toit/socle/cheminées, noir arêtes/châssis/porte).

Ne PAS re-proposer les fonts / palettes rejetées sauf demande explicite.

## Contenu (à ne pas modifier sans validation)

Tout est en français. Ne pas traduire, ne pas reformuler.

- **Hero** : "Vis avec un entourage qui te ressemble" · baseline "Six chambres pour jeunes entrepreneurs, à deux pas de Louvain-la-Neuve. Fais défiler pour visiter." · kicker "Résidence d'entrepreneurs · Court-Saint-Étienne"
- **01 · La maison** : "Une maison de maître rénovée" — 310 m², 6 chambres, 1 grand bureau, 2 SdE, jardin 4 ares, 10 min du campus LLN
- **02 · La vie au 52** : "Tout pour vivre et travailler" — 4 blocs (Ta chambre / Le bureau / La grande table / Le groupe) + facts (310 m² · 6 chambres · **550 €/mois hors charges** — loyer hypothèse à confirmer par Sébastien)
- **03 · Pour qui** : liste 4 bullets (entourage qui tire vers le haut / entrepreneur ou indépendant / progresser plus vite / vrai chez-soi près LLN)
- **04 · Questions** : FAQ 6 questions (loyer, bail, meubles, sélection, adresse, disponibilité)
- **05 · Photos** : 6 placeholders à remplir après travaux (façade, chambre, bureau, grande table, jardin, quartier)
- **06 · Rejoindre** : "Six chambres seulement" + CTA candidater (formulaire 2 étapes : formulaire puis visite)

## Points d'attention & pièges connus

- **`.hero-text` doit rester en fond solide `var(--craie)`** (pas transparent, pas de backdrop-filter) sinon la maison bave à travers le texte sur mobile
- **Preloader failsafes** : 3 setTimeout (3.2s, 5s, on `load`) + `error` listener global — ne pas les retirer, ils garantissent que le site s'affiche même si Three.js plante
- **Cache GitHub Pages** : toujours donner à Sébastien une URL avec `?v=<sha>` sinon Safari lui sert la vieille version pendant 10 min
- **Migra ne fonctionne pas sur Fontshare** (renvoie Satoshi en fallback) — utiliser Bricolage Grotesque ou tester avec `curl` avant d'annoncer une font
- **Le loyer de 550 €/mois est une hypothèse**, pas confirmé. Les variantes envisagées : 5 chambres × 550 €, 6 chambres × 500 €. À valider avant impression / vraie mise en ligne publique
- **L'adresse exacte ne doit jamais apparaître** sur le site — Sébastien n'est pas encore propriétaire, l'adresse est communiquée à la visite uniquement
- **`hello@maison52.be`** est utilisé dans le mailto du formulaire mais l'email n'existe pas encore (à créer après achat du domaine)

## Travaux en cours / à faire (par Sébastien)

1. Vérifier et réserver `maison52.be` sur dnsbelgium.be (~10 €/an)
2. Bloquer le handle Instagram `@maison52`
3. Créer `hello@maison52.be` (redirection ou boîte, chez le registrar ou en externe)
4. Une fois le domaine réservé, brancher sur GitHub Pages : ajouter un fichier `CNAME` avec `maison52.be` à la racine du repo, et configurer les DNS chez dnsbelgium (CNAME `www` → `ulensseb.github.io`, A records pour l'apex vers les IPs GitHub Pages)
5. Confirmer le loyer affiché et le nombre de chambres commercialisées (5 vs 6)
6. Fournir les vraies photos après travaux, à intégrer dans la fenêtre 05
7. Kit Instagram (pas commencé) — même règles de ton que le site, direct EDC-style, pas de contenu poétique

## Conventions

- Répondre au user en **français** (Sébastien est belge francophone)
- Ne pas utiliser d'em-dashes dans les textes finaux (préférence utilisateur, cf. RESUME_20260817.md section 5)
- Ne pas insérer de contenu poétique / "storytelling gadget" (journée type, résidents fondateurs, etc.) — ton direct, bénéfices concrets
- Ne pas centrer les contenus des pages d'étapes (utiliser text-align:left)
- Pas de blocs verts ou jaunes en aplat, pas de mots dorés isolés dans les titres, pas de grilles de 3 cartes générique-Claude
- Toujours pousser sur `main`, jamais créer de branches (le site est un one-page perso, pas besoin de review workflow)
