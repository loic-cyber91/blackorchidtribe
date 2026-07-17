# Handoff — Black Orchid Tribe landing page

Contexte pour reprendre ce projet là où il en est.

## Ce que c'est

Landing page statique (pas de build, pas de framework) pour le groupe Black Orchid Tribe.
Site à page unique, en scroll, dans une DA noire/stencil/desert-rock héritée d'un press kit PDF original.

## Structure du projet

```
index.html      → structure de la page (sections, markup)
style.css       → tout le visuel (couleurs, typo, layout, responsive)
script.js       → moteur générique qui va lire content.json et remplit le DOM
content.json    → TOUT le texte, les liens et les chemins d'images éditables
assets/photos/  → images utilisées par la page
LISEZMOI.md     → notes d'édition pour l'utilisateur non-technique
```

**Convention stricte à respecter** : le contenu (textes, liens, dates) vit dans `content.json`.
Le HTML/CSS ne doit changer que pour des raisons de structure/mise en page, pas pour éditer un texte.
Le HTML lie le JSON via des attributs `data-key="chemin.dans.json"`, `data-repeat="chemin.vers.tableau"`,
`data-key-src`, `data-key-href`, `data-key-href-mailto`. `script.js` fait un `fetch("content.json")`
puis résout ces chemins avec une fonction `getPath`. Regarde `script.js` avant de modifier ce mécanisme.

Le site n'a pas de build : ouvrir `index.html` en double-clic ne marche pas (fetch bloqué en `file://`).
Prévisualiser avec `python3 -m http.server` depuis la racine du dossier.

## État actuel (V2 — restructuré le 16/07/2026)

Restructuration complète faite selon les consignes de l'utilisateur (qui remplacent la maquette papier).

Sections d'`index.html`, dans l'ordre : Hero (logo + photo Feelthetribe1 + accroche) →
Bio (« Le récit » : 4 blocs paragraphe/photo alternés, le 4e avec 2 photos) →
Musique (4 clips en cartes carrées : Feel The Tribe, Numb My Beast, Better Run, Better Run Live Session,
puis carte EP Back Home) → Live (intro + 4 photos + chips de dates) →
Presse (3 citations en exergue + 8 liens médias + photo) → Crafter (texte + 3 photos) →
Socials → Contact → Outro (mosaïque de 6 photos) → Footer.

En plus : icônes réseaux (YouTube, Instagram, Spotify, Hyperfollow) tout à gauche de la topnav,
liens pilotés par `content.json` (`socialsNav.*`).

**`candidature.html`** : page séparée NON référencée (meta robots noindex, aucun lien depuis l'index)
pour la note d'intention Concours Circuit 2026 — à partager par lien direct au jury uniquement.
Deadline : 26 juillet 2026, la page pourra être supprimée après.

**Images** : les originaux HD restent dans `assets/` (jusqu'à 45 Mo, jamais servis par le site) ;
le site n'utilise que `assets/web/` (~8,8 Mo, généré avec `sips` : redimensionnement + JPEG q80,
recadrages carrés centrés sur le sujet pour les covers de clips). `assets/photos/` = anciennes
versions basse qualité, plus utilisées (sauf le logo `Logo_BOT_long_blanc.png`).

Background : `assets/web/background.jpg` appliqué via `body::before` fixe (fiable iOS) avec
voile sombre pour la lisibilité.

`script.js` : tous les renderers vérifient l'existence de leur conteneur (index et candidature
partagent le fichier). Node n'est pas installé sur la machine — vérifier la syntaxe avec
`jsc` (/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc) ou en navigateur.

## Passe V2.1 (17/07/2026, retours utilisateur)

Fait : background nettement plus visible (voile allégé), hero resserré (logo/photo/texte remontés),
bio compactée (photos plafonnées à 400px, les 2 photos Black Mirrors côte à côte en carrés),
carte « Inside My Head — Latest Single » sous l'EP (lien Spotify), nav « Crafter » → « Partenaire »,
« (Bourgeois) » retiré des dates live, section Crafter enrichie (bouton vers crafterguitars.com +
4 photos Crafterlive en rangée de 4 + rangée de 3), pictogrammes ronds monochromes dans la section
Socials (dictionnaire SOCIAL_ICONS dans script.js), contact sans noms avec téléphones +32 cliquables
(nouvel attribut `data-key-href-tel`), mosaïque outro portée à 16 photos.

## Passe V2.2 (17/07/2026, seconde série de retours — V2.1 validée par l'utilisateur)

Fait : moteur de mise en forme légère dans script.js (`formatText` : **gras**, *italique*, __souligné__
depuis content.json, texte échappé avant transformation — attention : pas d'italique imbriqué dans du
gras, le parseur ne le gère pas) + emphase ajoutée dans hero/bio/live/crafter/intention ; dates live
sur une seule ligne (chips nowrap + scroll horizontal tactile) ; hiérarchie kicker/titre rééquilibrée
(kicker 0.85rem collé au titre, h2 réduit à clamp 1.7–2.5rem) ; visuels Concours Circuit intégrés à
candidature.html (logo rond CC à côté du titre via `.intention-head`, bannière « Apply now » avant les
boutons, clés `intention.logo/visual`) ; hero recalibré pour tenir dans le premier écran sans scroll
(logo 600px max, photo max-height 54vh) ; « Socials » ajouté à la nav.

Animations (implémentées, validation « go animation » du 17/07) : cascade du hero en CSS pur
(keyframes heroFadeUp, logo → photo → texte), reveal-on-scroll via `setupReveals()` dans script.js
(IntersectionObserver, classes .reveal/.revealed posées uniquement par JS → sans JS tout reste
visible, décalage en cascade dans les grilles via transitionDelay), lightbox en fondu (opacity +
scale au lieu de display:none), élévation des cartes clips au survol. Tout est neutralisé par
`prefers-reduced-motion: reduce`.

Aussi en V2.2 : « Fête Nationale » (sans « Belge ») dans les chips live ; photo Feelthetribe2
(assets/web/bio_2.jpg, clé intention.photo) ajoutée à candidature.html en vis-à-vis des paragraphes
(.intention-grid).

## Passe V2.3 (17/07/2026) : multilingue FR / NL / EN

- **Un fichier de contenu par langue** : `content.json` (FR, référence), `content_nl.json`, `content_en.json`.
  Même structure de clés dans les trois (un script de parité a validé) — **toute nouvelle clé doit être
  ajoutée aux trois fichiers**.
- Sélecteur de langue dans la topnav : un seul point d'entrée (`.lang-current` : **globe SVG** +
  code de la langue active + chevron — globe choisi plutôt qu'un drapeau, convention internationale)
  qui déroule un menu (`.lang-menu` : Français / Nederlands / English, boutons `data-lang`).
  Fermeture au clic extérieur. Langue active en orange. « Nederlands » avec S = orthographe correcte.
  Codes ISO FR/NL/EN (pas « ENG », non standard — vu avec l'utilisateur).
- Résolution de la langue dans script.js (`currentLang()`) : `body[data-lang]` (candidature = fr forcé)
  > `?lang=xx` dans l'URL > choix mémorisé (localStorage `bot-lang`) > langue du navigateur > fr.
  Changer de langue recharge la page. `document.documentElement.lang` est mis à jour.
- Libellés de nav désormais pilotés par `nav.*` dans les JSON (data-key sur les liens).
- La section `intention` reste en français dans les trois fichiers (la page candidature est
  verrouillée en fr pour le jury) ; les citations presse sont traduites en EN/NL (source citée).

## Déploiement (17/07/2026)

- **Site en ligne** : https://loic-cyber91.github.io/blackorchidtribe/ (GitHub Pages, branche main,
  dépôt public `loic-cyber91/blackorchidtribe`). Candidature :
  https://loic-cyber91.github.io/blackorchidtribe/candidature.html
- **Publier une mise à jour** = commit + `git push` (Pages redéploie automatiquement en ~1 min).
- Le dépôt privé `loic-cyber91/black-orchid-tribe-landing` est l'**archive V1 avec les photos
  originales HD** (~600 Mo) — ne pas y toucher, ne pas le supprimer. L'historique local lourd
  correspondant est archivé dans `.git-v1-archive/` (ignoré par git).
- `.gitignore` exclut les originaux (`assets/*` sauf `assets/web/` et le logo) — le dépôt du site
  pèse ~12 Mo. Les originaux ne vivent que sur le Mac + l'archive privée GitHub.
- `gh` (GitHub CLI) n'est pas installé système : binaire téléchargé dans le scratchpad de session,
  auth device-flow sur le compte **loic-cyber91** (token en keychain, credential helper configuré).
- **Domaine blackorchidtribe.com** : appartient à l'utilisateur, chez WordPress.com/Automattic,
  expire le 2026-11-16, pointe encore vers l'ancien WordPress. À brancher sur Pages (CNAME www →
  loic-cyber91.github.io + fichier CNAME + custom domain dans les settings Pages) quand
  l'utilisateur aura accès à son compte WordPress.com.

## Points ouverts

1. Le lien de la « Better Run — Live Session » est l'ancien lien « Feel The Tribe — Live Session »
   (youtube -KjUuR3AufA) — à faire confirmer par l'utilisateur.
2. Lien presse Classic 21 (bababam.com) renvoie une 404 ; Concert Monkey introuvable au fetch.
3. Hébergement pas encore choisi (GitHub Pages vs Netlify) — le domaine blackorchidtribe.com
   semble exister (référencé dans l'ancien content.json). Deadline candidature : 26/07/2026.
4. Vérification rapide après toute modif :

```bash
python3 -c "import json; json.load(open('content.json')); print('JSON OK')"
python3 -m http.server  # puis ouvrir http://localhost:8000
```

## Consignes de travail avec l'utilisateur

- Ne pas régénérer tout le projet à chaque demande : modifier uniquement les fichiers concernés.
- Après chaque modification, dire précisément quels fichiers ont changé (pas de résumé vague).
- Le ton attendu est concis et direct, sans reformulation excessive.
