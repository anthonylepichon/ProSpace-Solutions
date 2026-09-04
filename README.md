# ProSpace Solutions

ProSpace Solutions est une application web Front-End B2B permettant de rechercher, consulter et sauvegarder des espaces de travail disponibles en France. Le projet a été réalisé en HTML5, SCSS modulaire et JavaScript natif dans le cadre de l'examen Front-End 2026.

Le dépôt GitHub du projet est disponible à l'adresse suivante : [anthonylepichon/ProSpace-Solutions](https://github.com/anthonylepichon/ProSpace-Solutions).

Le site publié peut être consulté à cette adresse : [ProSpace Solutions sur GitHub Pages](https://anthonylepichon.github.io/ProSpace-Solutions/).

## Fonctionnalités

- recherche des espaces par ville, capacité et équipements ;
- chargement du catalogue avec `fetch` et affichage d'un état de chargement ou d'erreur ;
- génération dynamique des cartes à partir d'un fichier JSON ;
- fiche détaillée déterminée par l'identifiant présent dans l'URL ;
- galerie, équipements, capacité et grille tarifaire de chaque espace ;
- ajout, retrait et conservation des favoris avec `localStorage` ;
- formulaire de contact avec validation JavaScript et messages accessibles ;
- préremplissage du sujet du formulaire depuis une fiche espace ;
- carrousel accessible présentant l'équipe ;
- interface adaptée aux ordinateurs, tablettes et smartphones.

## Pages de l'application

| Page | Fichier | Rôle |
| --- | --- | --- |
| Accueil et recherche | `index.html` | Affiche les filtres et le catalogue dynamique. |
| Fiche espace | `pages/espace.html` | Affiche les informations de l'espace demandé dans l'URL. |
| Mes espaces | `pages/mes-espaces.html` | Affiche et gère les espaces sauvegardés. |
| Contact | `pages/contact.html` | Affiche le formulaire, les coordonnées et le carrousel de l'équipe. |

## Architecture du projet

```text
prospace/
├── index.html
├── pages/
│   ├── espace.html
│   ├── mes-espaces.html
│   └── contact.html
├── assets/
│   ├── css/
│   │   └── main.css
│   ├── favicon/
│   ├── fonts/
│   ├── html/
│   │   ├── header.html
│   │   └── footer.html
│   ├── icons/
│   ├── images/
│   └── js/
│       ├── commun.js
│       ├── catalogue.js
│       ├── espace.js
│       ├── mes-espaces.js
│       ├── contact.js
│       ├── equipe.json
│       └── espaces.json
├── resources/
│   ├── main.scss
│   └── scss/
│       ├── abstracts/
│       ├── base/
│       ├── components/
│       ├── layout/
│       └── pages/
└── documents/
```

Les fragments `header.html` et `footer.html` sont chargés sur chaque page par `commun.js`. Le repère personnalisé `{{racine}}` est remplacé par `.` ou `..` selon l'emplacement de la page. Cela permet de partager le même en-tête et le même pied de page sans casser les chemins relatifs.

## Installation et utilisation

Cloner le dépôt :

```bash
git clone https://github.com/anthonylepichon/ProSpace-Solutions.git
cd ProSpace-Solutions
```

Le chargement du JSON utilise `fetch`. Le projet doit donc être ouvert avec un serveur local, par exemple avec l'extension **Live Server** de Visual Studio Code, et non directement avec le protocole `file://`.

Pour compiler le SCSS avec une commande simple :

```bash
npx sass resources/main.scss assets/css/main.css
```

Pour recompiler automatiquement les styles pendant le développement :

```bash
npx sass --watch resources/main.scss:assets/css/main.css
```

## Publication avec GitHub Pages

La version destinée à la publication est conservée sur la branche `main`. Les nouvelles fonctionnalités sont d'abord réalisées sur `develop`, puis intégrées à `main` avec une Pull Request :

```text
develop → Pull Request → main → GitHub Pages
```

Avant la fusion, les modifications doivent être enregistrées et envoyées sur GitHub :

```bash
git switch develop
git add .
git commit -m "Finaliser la version de publication"
git push origin develop
```

Sur GitHub, créer ensuite une Pull Request avec `main` comme branche de base et `develop` comme branche à comparer. Après vérification, fusionner la Pull Request, puis actualiser la branche locale :

```bash
git switch main
git pull origin main
```

Avec l'offre gratuite de GitHub, le dépôt doit être public pour utiliser GitHub Pages. La visibilité se modifie dans **Settings → General → Danger Zone → Change repository visibility**. Il faut vérifier avant cette opération qu'aucun secret, fichier `.env` ou document privé n'est présent dans le dépôt ou son historique.

La publication se configure ensuite dans **Settings → Pages → Build and deployment** avec les valeurs suivantes :

- **Source :** `Deploy from a branch` ;
- **Branch :** `main` ;
- **Folder :** `/(root)`.

Le fichier `index.html` se trouvant à la racine, le dossier `/docs` ne doit pas être choisi comme source. Après l'enregistrement de la configuration, GitHub construit et publie automatiquement le site. L'adresse attendue est :

```text
https://anthonylepichon.github.io/ProSpace-Solutions/
```

Une fiche dynamique peut être contrôlée directement avec :

```text
https://anthonylepichon.github.io/ProSpace-Solutions/pages/espace.html?id=wagram-opera
```

Après chaque nouvelle fusion dans `main`, GitHub Pages publie automatiquement la version mise à jour. Il faut alors vérifier le catalogue, les favoris, le formulaire, le carrousel de l'équipe, les images et l'absence d'erreurs dans la console du navigateur.

## Source de données

Le projet ne consomme pas d'API distante. Ses données sont réparties dans deux fichiers JSON locaux chargés avec `fetch` :

- `assets/js/espaces.json`, chargé depuis `commun.js`, contient les espaces, les favoris initiaux et les destinations du pied de page ;
- `assets/js/equipe.json`, chargé uniquement depuis `contact.js`, contient les membres affichés dans le carrousel de l'équipe.

Chaque espace contient notamment :

- un identifiant unique utilisé dans les URL ;
- un titre, une ville et une adresse ;
- une capacité et une liste d'équipements ;
- les prix à l'heure, à la demi-journée et à la journée ;
- une description, une note et un nombre d'avis ;
- les noms, descriptions et dimensions des images.

Chaque membre de l'équipe possède un nom, une fonction, une photographie et une adresse électronique professionnelle. Cette séparation permet de modifier le contenu du carrousel sans intervenir dans sa logique JavaScript.

## Paramètres d'URL avec `URLSearchParams`

`URLSearchParams` permet à JavaScript de lire les informations placées après le caractère `?` dans une adresse.

### Affichage d'une fiche espace

```text
pages/espace.html?id=wagram-opera
```

`espace.js` lit le paramètre `id`, recherche l'espace correspondant dans le JSON, puis renseigne la page. Si l'identifiant est absent ou inconnu, l'utilisateur est redirigé vers le catalogue.

### Préremplissage du formulaire de contact

```text
pages/contact.html?espace=wagram-opera
```

`contact.js` lit le paramètre `espace` et présélectionne le sujet associé à la demande.

### Préfiltrage facultatif par ville

```text
index.html?ville=Bordeaux
```

`catalogue.js` lit le paramètre `ville` et applique le filtre lorsqu'il correspond à une option existante. Ce comportement facilite l'accès au catalogue depuis les destinations du pied de page.

## Stockage local

Les identifiants des espaces sauvegardés sont conservés dans `localStorage` avec la clé `prospace-favoris`. La sélection reste ainsi disponible après la fermeture du navigateur.

Le choix facultatif de la police adaptée est mémorisé avec la clé `prospace-police-adaptee`. Cette fonction est un ajout de confort et ne constitue pas à elle seule une exigence WCAG.

## Référencement naturel

- chaque page possède un titre et une métadescription spécifiques ;
- le titre et la métadescription de la fiche sont adaptés en JavaScript à l'espace affiché ;
- la structure utilise des balises HTML sémantiques et une hiérarchie de titres ;
- les fichiers d'images portent des noms descriptifs et utilisent le format WebP ;
- les images de contenu possèdent un texte alternatif et des dimensions explicites ;
- les images des cartes, de la galerie et de l'équipe utilisent le chargement différé avec `loading="lazy"`.

Aucune URL canonique n'est actuellement déclarée, car le domaine définitif du projet n'est pas encore connu. Elle devra être ajoutée après le déploiement sur le domaine final.

## Accessibilité

Le projet vise le niveau WCAG 2.1 AA et comprend notamment :

- une navigation utilisable au clavier ;
- des liens d'évitement vers le contenu principal ;
- des libellés de formulaires reliés à leurs champs ;
- des messages d'erreur associés avec `aria-describedby` ;
- des zones `aria-live` pour annoncer les résultats, les confirmations et les changements du carrousel ;
- `aria-atomic="true"` lorsque l'annonce doit restituer un message complet ;
- des boutons de favoris dont le libellé accessible évolue selon leur état ;
- des tableaux tarifaires structurés avec des en-têtes de ligne et de colonne ;
- des navigations principales, de destinations et de services nommées ;
- des informations qui ne reposent pas uniquement sur la couleur.

L'entité HTML `&amp;` est utilisée pour représenter correctement le caractère `&` dans le contenu et dans les adresses possédant plusieurs paramètres.

## Tests Lighthouse

Le cahier des charges fixe un objectif supérieur à 90 pour le SEO et l'accessibilité. Aucun rapport Lighthouse mesuré n'est actuellement enregistré dans le dépôt ; les valeurs ne sont donc pas inventées dans ce document.

| Page | Accessibilité | SEO | Capture |
| --- | ---: | ---: | --- |
| Accueil | À mesurer | À mesurer | À ajouter |
| Fiche espace | À mesurer | À mesurer | À ajouter |
| Mes espaces | À mesurer | À mesurer | À ajouter |
| Contact | À mesurer | À mesurer | À ajouter |

Les audits doivent être lancés depuis Chrome DevTools sur un serveur local ou sur la version déployée. Les scores et les captures devront ensuite remplacer les mentions « À mesurer » et « À ajouter ».

## Technologies utilisées

- HTML5 sémantique ;
- SCSS modulaire ;
- JavaScript ES6+ natif ;
- Fetch API ;
- Web Storage API (`localStorage`) ;
- `URLSearchParams` ;
- JSON ;
- Git et GitHub.
