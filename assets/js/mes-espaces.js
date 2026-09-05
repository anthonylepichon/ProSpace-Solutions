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
  const titreSelectionVide = document.getElementById("titre-selection-vide");
  const boutonVider = document.getElementById("vider-selection");
  let espaces = [];
  let actionEnCours = "";

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

    for (let index = 0; index < espaces.length; index++) {
      const espace = espaces[index];

      if (identifiantsFavoris.indexOf(espace.id) !== -1) {
        espacesFavoris.push(espace);
      }
    }

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
  function creerCarteFavori(espace) {
    const carte = ProSpace.creerElement("article", "carte-espace-sauvegarde");
    const visuel = ProSpace.creerElement("div", "carte-espace-sauvegarde__visuel");
    const image = document.createElement("img");
    image.src = ProSpace.cheminRessource("assets/images/" + espace.cardImage.src);
    image.alt = espace.cardImage.alt;
    image.width = espace.cardImage.width;
    image.height = espace.cardImage.height;
    image.loading = "lazy";
    visuel.appendChild(image);

    const contenu = ProSpace.creerElement("div", "carte-espace-sauvegarde__contenu");
    const informations = ProSpace.creerElement("div", "carte-espace-sauvegarde__informations");
    const titre = ProSpace.creerElement("h3", "carte-espace-sauvegarde__titre", espace.title);
    const ville = ProSpace.creerElement("p", "carte-espace-sauvegarde__localisation");
    ville.appendChild(ProSpace.creerIcone("localisation", "icone--primaire"));
    ville.appendChild(document.createTextNode(espace.displayCity));

    const caracteristiques = ProSpace.creerElement("div", "carte-espace-sauvegarde__caracteristiques");
    const capacite = ProSpace.creerElement("span", "carte-espace-sauvegarde__capacite");
    capacite.appendChild(ProSpace.creerIcone("utilisateurs"));
    capacite.appendChild(document.createTextNode(espace.capacity + " pers."));

    const prix = ProSpace.creerElement("span", "carte-espace-sauvegarde__prix");
    prix.appendChild(ProSpace.creerElement("strong", "", espace.priceHour + "€"));
    prix.appendChild(ProSpace.creerElement("span", "", "/h"));

    const avis = ProSpace.creerElement("span", "carte-espace-sauvegarde__evaluation");
    avis.appendChild(ProSpace.creerEtoiles(espace.rating, true));
    avis.appendChild(ProSpace.creerElement("span", "", "(" + espace.reviews + ")"));

    caracteristiques.appendChild(capacite);
    caracteristiques.appendChild(prix);
    caracteristiques.appendChild(avis);
    informations.appendChild(titre);
    informations.appendChild(ville);
    informations.appendChild(caracteristiques);

    const actions = ProSpace.creerElement("div", "carte-espace-sauvegarde__actions");
    const lienFiche = ProSpace.creerElement("a", "bouton bouton--primaire", "Voir Fiche");
    lienFiche.href = ProSpace.cheminRessource(
      "pages/espace.html?id=" + encodeURIComponent(espace.id)
    );
    lienFiche.setAttribute("aria-label", "Voir la fiche de " + espace.title);

    const boutonRetirer = ProSpace.creerElement("button", "bouton bouton--retirer");
    boutonRetirer.type = "button";
    boutonRetirer.value = espace.id;
    boutonRetirer.setAttribute("aria-label", "Retirer " + espace.title + " de mes espaces");
    boutonRetirer.appendChild(ProSpace.creerIcone("supprimer", "", true));
    boutonRetirer.appendChild(ProSpace.creerElement("span", "", "Retirer"));
    boutonRetirer.addEventListener("click", function () {
      actionEnCours = "retirer";
      ProSpace.basculerFavori(boutonRetirer.value);
      afficherSelection();
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

    if (nombreFavoris === 0) {
      titreSelectionVide.focus();
    } else if (actionEnCours === "retirer") {
      const premierBoutonRetirer = listeSelection.querySelector(".bouton--retirer");

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
      resumeSelection.textContent = nombreFavoris + " espace dans votre sélection";

      if (nombreFavoris > 1) {
        resumeSelection.textContent = nombreFavoris + " espaces dans votre sélection";
      }
    }

    for (let index = 0; index < espacesFavoris.length; index++) {
      const espace = espacesFavoris[index];
      listeSelection.appendChild(creerCarteFavori(espace));
    }

    deplacerFocusApresAction(nombreFavoris);
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
    selectionVide.hidden = true;
    conteneurSelection.hidden = true;
    boutonVider.hidden = true;
    resumeSelection.textContent = "Chargement de votre sélection…";

    try {
      espaces = await ProSpace.chargerEspaces();
      afficherSelection();
    } catch (erreur) {
      resumeSelection.textContent = "Chargement impossible";
      console.error("Impossible de charger les espaces sauvegardés.", erreur);
    }
  }

  boutonVider.addEventListener("click", function () {
    actionEnCours = "vider";
    ProSpace.viderFavoris();
    afficherSelection();
  });

  /*
   * ---------------------------------------------------------
   * Zone : EXPOSITION ET INITIALISATION
   * Cette zone rend les services partagés disponibles et lance les comportements de la page.
   * ---------------------------------------------------------
   */
  initialiserSelection();
})();
