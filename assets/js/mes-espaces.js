/*
 * ---------------------------------------------------------
 * Fichier : assets/js/mes-espaces.js
 * Rôle : Gérer l’affichage dynamique des espaces sauvegardés.
 * Tâches :
 * - Croiser les favoris enregistrés avec les données du catalogue.
 * - Construire les cartes et traiter les suppressions.
 * Liens avec les autres fichiers :
 * - pages/mes-espaces.html fournit les conteneurs de la sélection.
 * - assets/js/commun.js fournit les données et la gestion des favoris.
 * ---------------------------------------------------------
 */

(function () {
  "use strict";

  /*
   * ---------------------------------------------------------
   * Zone : DONNÉES ET ÉLÉMENTS DE LA PAGE
   * Cette zone prépare les constantes, l’état et les éléments HTML utilisés par le script.
   * ---------------------------------------------------------
   */
  const listeSelection = document.getElementById("liste-selection");
  const conteneurSelection = document.getElementById("conteneur-selection");
  const resumeSelection = document.getElementById("resume-selection");
  const selectionVide = document.getElementById("selection-vide");
  const boutonVider = document.getElementById("vider-selection");
  let espaces = [];
  let chargementEnCours = false;
  let actionEnCours = "";

  /*
   * ---------------------------------------------------------
   * Rôle : Créer un élément HTML et renseigner ses propriétés courantes.
   * Paramètres :
   * - type : Nom de la balise HTML à créer.
   * - classe : Classe CSS facultative de l’élément.
   * - texte : Texte facultatif à insérer.
   * Retour : L’élément HTML créé.
   * ---------------------------------------------------------
   */
  function creerElement(type, classe, texte) {
    const element = document.createElement(type);

    if (classe) {
      element.className = classe;
    }

    if (typeof texte === "string") {
      element.textContent = texte;
    }

    return element;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Créer la représentation visuelle et textuelle d’une note.
   * Paramètres :
   * - note : Note numérique à représenter.
   * Retour : Le groupe HTML contenant la note et ses étoiles.
   * ---------------------------------------------------------
   */
  function creerEtoiles(note) {
    const groupe = creerElement("span", "evaluation");
    const libelle = creerElement(
      "span",
      "visuellement-cache",
      "Note : " + String(note).replace(".", ",") + " sur 5"
    );
    const etoiles = creerElement("span", "evaluation__etoiles");

    for (let index = 1; index <= 5; index += 1) {
      const estPleine = index <= Math.round(note);
      const icone = ProSpace.creerIcone(
        estPleine ? "etoile-pleine" : "etoile",
        estPleine ? "icone--etoile" : "icone--etoile-vide"
      );

      etoiles.appendChild(icone);
    }

    groupe.appendChild(libelle);
    groupe.appendChild(etoiles);
    return groupe;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Sélectionner les espaces correspondant aux favoris.
   * Paramètres :
   * - Aucun.
   * Retour : Un tableau des espaces sauvegardés encore disponibles.
   * ---------------------------------------------------------
   */
  function selectionnerEspacesFavoris() {
    const identifiantsFavoris = ProSpace.lireFavoris();
    const espacesFavoris = [];

    espaces.forEach(function (espace) {
      if (identifiantsFavoris.includes(espace.id)) {
        espacesFavoris.push(espace);
      }
    });

    return espacesFavoris;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Construire la carte HTML correspondant à un espace.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : La carte HTML créée.
   * ---------------------------------------------------------
   */
  function creerCarteEspace(espace) {
    const carte = creerElement("article", "carte-espace-sauvegarde");
    const visuel = creerElement("div", "carte-espace-sauvegarde__visuel");
    const image = document.createElement("img");
    image.src = ProSpace.cheminRessource("assets/images/" + espace.image);
    image.alt = espace.imageAlt;
    image.loading = "lazy";
    image.decoding = "async";
    visuel.appendChild(image);

    const contenu = creerElement("div", "carte-espace-sauvegarde__contenu");
    const informations = creerElement("div", "carte-espace-sauvegarde__informations");
    const titre = creerElement("h3", "carte-espace-sauvegarde__titre", espace.title);
    const ville = creerElement("p", "carte-espace-sauvegarde__localisation");
    ville.appendChild(ProSpace.creerIcone("localisation", "icone--primaire"));
    ville.appendChild(document.createTextNode(espace.city));

    const caracteristiques = creerElement("div", "carte-espace-sauvegarde__caracteristiques");
    const capacite = creerElement("span", "carte-espace-sauvegarde__capacite");
    capacite.appendChild(ProSpace.creerIcone("utilisateurs"));
    capacite.appendChild(document.createTextNode(espace.capacity + " pers."));

    const prix = creerElement("span", "carte-espace-sauvegarde__prix");
    prix.appendChild(creerElement("strong", "", espace.priceHour + "€"));
    prix.appendChild(creerElement("span", "", "/h"));

    const avis = creerElement("span", "carte-espace-sauvegarde__evaluation");
    avis.appendChild(creerEtoiles(espace.rating));
    avis.appendChild(creerElement("span", "", "(" + espace.reviews + ")"));

    caracteristiques.appendChild(capacite);
    caracteristiques.appendChild(prix);
    caracteristiques.appendChild(avis);
    informations.appendChild(titre);
    informations.appendChild(ville);
    informations.appendChild(caracteristiques);

    const actions = creerElement("div", "carte-espace-sauvegarde__actions");
    const lienFiche = creerElement("a", "bouton bouton--primaire", "Voir Fiche");
    lienFiche.href = ProSpace.cheminRessource(
      "pages/espace.html?id=" + encodeURIComponent(espace.id)
    );
    lienFiche.setAttribute("aria-label", "Voir la fiche de " + espace.title);

    const boutonRetirer = creerElement("button", "bouton bouton--retirer");
    boutonRetirer.type = "button";
    boutonRetirer.dataset.removeFavorite = espace.id;
    boutonRetirer.setAttribute("aria-label", "Retirer " + espace.title + " de mes espaces");
    boutonRetirer.appendChild(ProSpace.creerIcone("supprimer"));
    boutonRetirer.appendChild(creerElement("span", "", "Retirer"));
    boutonRetirer.addEventListener("click", function () {
      actionEnCours = "retirer";
      ProSpace.basculerFavori(espace.id);
    });

    actions.appendChild(lienFiche);
    actions.appendChild(boutonRetirer);
    contenu.appendChild(informations);
    contenu.appendChild(actions);
    carte.appendChild(visuel);
    carte.appendChild(contenu);
    return carte;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Replacer le focus après la suppression d’un favori.
   * Paramètres :
   * - nombreFavoris : Nombre de favoris restant après l’action.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function deplacerFocusApresAction(nombreFavoris) {
    if (!actionEnCours) {
      return;
    }

    if (nombreFavoris > 0 && actionEnCours === "retirer") {
      const premierBoutonRetirer = listeSelection.querySelector("[data-remove-favorite]");

      if (premierBoutonRetirer) {
        premierBoutonRetirer.focus();
      }
    }

    actionEnCours = "";
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Afficher l’état et les cartes de la sélection sauvegardée.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherSelection() {
    const espacesFavoris = selectionnerEspacesFavoris();
    const nombreFavoris = espacesFavoris.length;

    listeSelection.textContent = "";
    selectionVide.hidden = nombreFavoris !== 0;
    conteneurSelection.hidden = nombreFavoris === 0;
    boutonVider.hidden = nombreFavoris === 0;

    if (nombreFavoris === 0) {
      resumeSelection.textContent = "Votre sélection est vide";
    } else {
      resumeSelection.textContent =
        nombreFavoris +
        " espace" +
        (nombreFavoris > 1 ? "s" : "") +
        " dans votre sélection";
    }

    espacesFavoris.forEach(function (espace) {
      listeSelection.appendChild(creerCarteEspace(espace));
    });

    deplacerFocusApresAction(nombreFavoris);
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Retirer les favoris absents des données actuelles.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function nettoyerFavorisInconnus() {
    const favoris = ProSpace.lireFavoris();
    const favorisValides = favoris.filter(function (identifiant) {
      return espaces.some(function (espace) {
        return espace.id === identifiant;
      });
    });

    if (favorisValides.length !== favoris.length) {
      ProSpace.enregistrerFavoris(favorisValides);
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Charger les données et initialiser la sélection sauvegardée.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse résolue après l’initialisation.
   * ---------------------------------------------------------
   */
  async function initialiserSelection() {
    chargementEnCours = true;
    selectionVide.hidden = true;
    conteneurSelection.hidden = true;
    boutonVider.hidden = true;
    resumeSelection.textContent = "Chargement de votre sélection…";

    try {
      espaces = await ProSpace.chargerEspaces();
      nettoyerFavorisInconnus();
      afficherSelection();
    } catch (erreur) {
      resumeSelection.textContent = "Chargement impossible";
      console.error("Impossible de charger les espaces sauvegardés.", erreur);
    } finally {
      chargementEnCours = false;
    }
  }

  boutonVider.addEventListener("click", function () {
    actionEnCours = "vider";
    ProSpace.viderFavoris();
  });

  window.addEventListener("prospace:favoris-modifies", function () {
    if (!chargementEnCours && espaces.length > 0) {
      afficherSelection();
    }
  });

  /*
   * ---------------------------------------------------------
   * Zone : EXPOSITION ET INITIALISATION
   * Cette zone rend les services partagés disponibles et lance les comportements de la page.
   * ---------------------------------------------------------
   */
  initialiserSelection();
})();
