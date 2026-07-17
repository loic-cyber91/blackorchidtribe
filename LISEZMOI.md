# Black Orchid Tribe — Landing Page

## Modifier les textes

Tout le contenu (textes, liens, dates, photos utilisées) se trouve dans **`content.json`**.
Ouvre ce fichier avec n'importe quel éditeur de texte (Bloc-notes, TextEdit, VS Code...),
modifie les valeurs entre guillemets, enregistre. Ne touche pas aux fichiers `index.html`,
`style.css` ou `script.js` — c'est le design, il n'a pas besoin d'être modifié pour changer un texte.

Quelques règles à respecter dans le JSON :
- Toujours garder les guillemets `" "` autour des textes.
- Pas de guillemets non échappés à l'intérieur d'un texte (utiliser `'` plutôt que `"`).
- Les virgules séparent les éléments d'une liste — ne pas en laisser après le dernier élément.
- Si tu casses la structure, un validateur JSON en ligne (ex. jsonlint.com) permet de repérer l'erreur.

## Ajouter / remplacer une photo

1. Dépose la nouvelle image dans le dossier `assets/photos/`.
2. Dans `content.json`, remplace le chemin existant par `assets/photos/nom-du-fichier.jpg`.

Pour la galerie, ajoute ou retire simplement des blocs `{ "src": "...", "alt": "..." }`
dans `gallery.images`.

## Voir le résultat en local

Comme la page charge `content.json` via JavaScript, l'ouvrir en double-cliquant sur
`index.html` peut être bloqué par le navigateur (sécurité "file://"). Deux solutions :

- Lancer un petit serveur local depuis ce dossier :
  `python3 -m http.server 8000` puis ouvrir `http://localhost:8000`
- Ou directement déployer le dossier (voir ci-dessous) et prévisualiser en ligne.

## Héberger la page (Netlify ou GitHub Pages)

**Netlify (le plus simple) :**
1. Va sur netlify.com, glisse-dépose ce dossier entier (`site/`) sur la zone de dépôt.
2. La page est en ligne immédiatement avec une URL netlify.app.
3. Pour un nom de domaine perso, ajoute-le dans les réglages du site.

**GitHub Pages :**
1. Crée un repository, mets-y le contenu de ce dossier.
2. Dans les réglages du repo → Pages → source = branche principale, dossier racine.
3. La page sera disponible sur `https://tonpseudo.github.io/nomdurepo/`.

## Structure du dossier

```
site/
  index.html      → structure de la page (ne pas éditer pour les textes)
  style.css       → apparence (couleurs, polices, mise en page)
  script.js       → moteur qui va chercher le contenu dans content.json
  content.json    → TOUS les textes, liens et références de photos à éditer
  assets/photos/  → les images utilisées par la page
```
