/*
 * ---------------------------------------------------------
 * Fichier : assets/js/commun.js
 * Rôle : Regrouper les services JavaScript partagés par toutes les pages.
 * Tâches :
 * - Charger l’en-tête, le pied de page et les données des espaces.
 * - Gérer la navigation, les favoris, les destinations et la police adaptée.
 * Liens avec les autres fichiers :
 * - partials/header.html et partials/footer.html pour les fragments communs.
 * - assets/data/espaces.json pour les données.
 * - Tous les autres scripts de page utilisent l’objet global ProSpace.
 * ---------------------------------------------------------
 */

(function () {
  /*
   * ---------------------------------------------------------
   * Zone : DONNÉES ET ÉLÉMENTS DE LA PAGE
   * Cette zone prépare les constantes, l’état et les éléments HTML utilisés par le script.
   * ---------------------------------------------------------
   */
  let racineProjet = ".";

  if (window.location.pathname.includes("/pages/")) {
    racineProjet = "..";
  }
  const cleFavoris = "prospace-favoris";
  const clePoliceAdaptee = "prospace-police-adaptee";
  let promesseDonnees = null;

  /*
   * ---------------------------------------------------------
   * Rôle : Construire un chemin de ressource adapté à la page courante.
   * Paramètres :
   * - chemin : Chemin relatif de la ressource.
   * Retour : Le chemin relatif utilisable depuis la page courante.
   * ---------------------------------------------------------
   */
  function cheminRessource(chemin) {
    const cheminNettoye = String(chemin).replace(/^\/+/, "");
    return racineProjet + "/" + cheminNettoye;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Charger un fragment HTML dans le conteneur indiqué.
   * Paramètres :
   * - identifiantConteneur : Identifiant du conteneur recevant le fragment.
   * - cheminFichier : Chemin du fragment HTML à charger.
   * Retour : Une promesse résolue après l’injection du fragment.
   * ---------------------------------------------------------
   */
  async function chargerFragment(identifiantConteneur, cheminFichier) {
    const reponse = await fetch(cheminRessource(cheminFichier));

    if (!reponse.ok) {
      throw new Error("Impossible de charger " + cheminFichier + ".");
    }

    let contenuHtml = await reponse.text();
    contenuHtml = contenuHtml.split("{{racine}}").join(racineProjet);
    document.getElementById(identifiantConteneur).innerHTML = contenuHtml;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Signaler dans la navigation le lien de la page courante.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourNavigation() {
    const adresse = window.location.pathname;
    let lienActif = null;

    if (!adresse.includes("/pages/") || adresse.endsWith("/index.html")) {
      lienActif = document.getElementById("navigation-accueil");
    }

    if (adresse.endsWith("/pages/mes-espaces.html")) {
      lienActif = document.getElementById("navigation-mes-espaces");
    }

    if (adresse.endsWith("/pages/contact.html")) {
      lienActif = document.getElementById("navigation-contact");
    }

    if (lienActif) {
      lienActif.classList.add("navigation-site__lien--actif");
      lienActif.setAttribute("aria-current", "page");
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Charger l’en-tête et le pied de page partagés.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse résolue après le chargement de la structure commune.
   * ---------------------------------------------------------
   */
  async function chargerStructureCommune() {
    try {
      await chargerFragment("conteneur-header", "partials/header.html");
      mettreAJourNavigation();
      mettreAJourCompteursFavoris();
      initialiserPoliceAdaptee();
    } catch (erreurEntete) {
      console.error("L’en-tête ne peut pas être chargé.", erreurEntete);
    }

    try {
      await chargerFragment("conteneur-footer", "partials/footer.html");
      await initialiserDestinations();
    } catch (erreurPiedPage) {
      console.error("Le pied de page ne peut pas être chargé.", erreurPiedPage);
    }
  }

  function estTexteNonVide(valeur) {
    return typeof valeur === "string" && valeur.trim() !== "";
  }

  function estNombrePositif(valeur) {
    return typeof valeur === "number" && Number.isFinite(valeur) && valeur > 0;
  }

  function imageEstValide(image) {
    if (!image) {
      return false;
    }

    if (!estTexteNonVide(image.src) || !estTexteNonVide(image.alt)) {
      return false;
    }

    if (!Number.isInteger(image.width) || image.width <= 0) {
      return false;
    }

    if (!Number.isInteger(image.height) || image.height <= 0) {
      return false;
    }

    return true;
  }

  function tableauTextesEstValide(tableau, tableauObligatoire) {
    if (!Array.isArray(tableau)) {
      return false;
    }

    if (tableauObligatoire && tableau.length === 0) {
      return false;
    }

    for (let index = 0; index < tableau.length; index++) {
      if (!estTexteNonVide(tableau[index])) {
        return false;
      }
    }

    return true;
  }

  function espaceEstValide(espace) {
    if (!espace) {
      return false;
    }

    if (!estTexteNonVide(espace.id) || !estTexteNonVide(espace.title)) {
      return false;
    }

    if (!estTexteNonVide(espace.city) || !estTexteNonVide(espace.displayCity)) {
      return false;
    }

    if (!estTexteNonVide(espace.address) || !estTexteNonVide(espace.description)) {
      return false;
    }

    if (!Number.isInteger(espace.capacity) || espace.capacity <= 0) {
      return false;
    }

    if (!estNombrePositif(espace.priceHour)) {
      return false;
    }

    if (!estNombrePositif(espace.priceHalfDay)) {
      return false;
    }

    if (!estNombrePositif(espace.priceDay)) {
      return false;
    }

    if (typeof espace.rating !== "number" || espace.rating < 0 || espace.rating > 5) {
      return false;
    }

    if (!Number.isInteger(espace.reviews) || espace.reviews < 0) {
      return false;
    }

    if (!tableauTextesEstValide(espace.amenities, false)) {
      return false;
    }

    if (!imageEstValide(espace.cardImage)) {
      return false;
    }

    if (!Array.isArray(espace.gallery) || espace.gallery.length === 0) {
      return false;
    }

    for (let index = 0; index < espace.gallery.length; index++) {
      if (!imageEstValide(espace.gallery[index])) {
        return false;
      }
    }

    if (!tableauTextesEstValide(espace.equipment, true)) {
      return false;
    }

    return true;
  }

  function donneesCatalogueSontValides(donnees) {
    if (!donnees) {
      return false;
    }

    if (!Array.isArray(donnees.spaces) || donnees.spaces.length === 0) {
      return false;
    }

    if (!Array.isArray(donnees.destinations) || !Array.isArray(donnees.defaultFavorites)) {
      return false;
    }

    const identifiants = [];

    for (let index = 0; index < donnees.spaces.length; index++) {
      const espace = donnees.spaces[index];

      if (!espaceEstValide(espace)) {
        return false;
      }

      if (identifiants.indexOf(espace.id) !== -1) {
        return false;
      }

      identifiants.push(espace.id);
    }

    for (let index = 0; index < donnees.defaultFavorites.length; index++) {
      const identifiant = donnees.defaultFavorites[index];

      if (!estTexteNonVide(identifiant) || identifiants.indexOf(identifiant) === -1) {
        return false;
      }
    }

    for (let index = 0; index < donnees.destinations.length; index++) {
      const destination = donnees.destinations[index];

      if (!destination || !estTexteNonVide(destination.label)) {
        return false;
      }

      if (typeof destination.city !== "string") {
        return false;
      }
    }

    return true;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Garantir la présence d’une liste de favoris exploitable.
   * Paramètres :
   * - favoris : Tableau des identifiants sauvegardés.
   * Retour : La liste de favoris validée.
   * ---------------------------------------------------------
   */
  function initialiserFavorisParDefaut(favoris) {
    try {
      if (localStorage.getItem(cleFavoris) === null) {
        localStorage.setItem(cleFavoris, JSON.stringify(favoris));
      }
    } catch (erreur) {
      return;
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Récupérer et valider les données JSON des espaces.
   * Paramètres :
   * - Aucun.
   * Retour : Les données JSON validées.
   * ---------------------------------------------------------
   */
  async function recupererDonnees() {
    const reponse = await fetch(cheminRessource("assets/data/espaces.json"));

    if (!reponse.ok) {
      throw new Error("Impossible de charger les espaces de travail.");
    }

    const donnees = await reponse.json();

    if (!donneesCatalogueSontValides(donnees)) {
      throw new Error("Le format du catalogue est invalide.");
    }

    initialiserFavorisParDefaut(donnees.defaultFavorites);
    nettoyerFavorisInconnus(donnees.spaces);
    mettreAJourCompteursFavoris();
    return donnees;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Charger une seule fois les données JSON des espaces.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse contenant les données JSON.
   * ---------------------------------------------------------
   */
  async function chargerDonnees() {
    if (!promesseDonnees) {
      promesseDonnees = recupererDonnees();
    }

    try {
      return await promesseDonnees;
    } catch (erreur) {
      promesseDonnees = null;
      throw erreur;
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Fournir les données complètes des espaces.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse contenant le tableau des espaces.
   * ---------------------------------------------------------
   */
  async function chargerEspaces() {
    const donnees = await chargerDonnees();
    return donnees.spaces;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Lire et sécuriser la liste des favoris enregistrés localement.
   * Paramètres :
   * - Aucun.
   * Retour : Un tableau d’identifiants d’espaces sauvegardés.
   * ---------------------------------------------------------
   */
  function lireFavoris() {
    try {
      const valeurStockee = localStorage.getItem(cleFavoris);

      if (valeurStockee === null) {
        return [];
      }

      const valeurParse = JSON.parse(valeurStockee);
      const favorisValides = [];

      if (!Array.isArray(valeurParse)) {
        return favorisValides;
      }

      for (let index = 0; index < valeurParse.length; index++) {
        const identifiant = valeurParse[index];

        if (typeof identifiant === "string" && favorisValides.indexOf(identifiant) === -1) {
          favorisValides.push(identifiant);
        }
      }

      return favorisValides;
    } catch (erreur) {
      return [];
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Actualiser le compteur de favoris visible.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourCompteursFavoris() {
    const nombreFavoris = lireFavoris().length;
    const compteur = document.getElementById("compteur-favoris");

    if (!compteur) {
      return;
    }

    let texteCompteur = "aucun espace sauvegardé";

    if (nombreFavoris === 1) {
      texteCompteur = "1 espace sauvegardé";
    }

    if (nombreFavoris > 1) {
      texteCompteur = nombreFavoris + " espaces sauvegardés";
    }

    compteur.textContent = String(nombreFavoris);
    compteur.hidden = nombreFavoris === 0;
    compteur.parentElement.setAttribute(
      "aria-label",
      "Mes espaces, " + texteCompteur
    );
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Enregistrer la liste des favoris et actualiser leur compteur.
   * Paramètres :
   * - favoris : Tableau des identifiants sauvegardés.
   * Retour : La liste des favoris enregistrée.
   * ---------------------------------------------------------
   */
  function enregistrerFavoris(favoris) {
    try {
      localStorage.setItem(cleFavoris, JSON.stringify(favoris));
    } catch (erreur) {
      return false;
    }

    mettreAJourCompteursFavoris();
    return true;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Retirer les favoris qui ne correspondent plus au catalogue.
   * Paramètres :
   * - espaces : Tableau des espaces actuellement disponibles.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function nettoyerFavorisInconnus(espaces) {
    const favoris = lireFavoris();
    const favorisValides = [];

    for (let indexFavori = 0; indexFavori < favoris.length; indexFavori++) {
      const identifiant = favoris[indexFavori];
      let favoriConnu = false;

      for (let indexEspace = 0; indexEspace < espaces.length; indexEspace++) {
        const espace = espaces[indexEspace];

        if (espace.id === identifiant) {
          favoriConnu = true;
        }
      }

      if (favoriConnu) {
        favorisValides.push(identifiant);
      }
    }

    if (favorisValides.length !== favoris.length) {
      enregistrerFavoris(favorisValides);
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Ajouter ou retirer un espace de la liste des favoris.
   * Paramètres :
   * - identifiant : Identifiant unique de l’espace.
   * Retour : Vrai si l’espace est sauvegardé après l’action, sinon faux.
   * ---------------------------------------------------------
   */
  function basculerFavori(identifiant) {
    const favoris = lireFavoris();
    const position = favoris.indexOf(identifiant);

    if (position === -1) {
      favoris.push(identifiant);
    } else {
      favoris.splice(position, 1);
    }

    enregistrerFavoris(favoris);
    return position === -1;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Supprimer tous les espaces sauvegardés.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function viderFavoris() {
    enregistrerFavoris([]);
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Créer une image d’icône à partir de son nom de fichier.
   * Paramètres :
   * - nom : Nom de l’icône à créer.
   * - classeSupplementaire : Classe CSS facultative ajoutée à l’icône.
   * - estDecorative : Indique si l’icône répète une information déjà visible.
   * Retour : L’image HTML de l’icône.
   * ---------------------------------------------------------
   */
  function creerIcone(nom, classeSupplementaire, estDecorative) {
    const textesAlternatifs = {
      accessibilite: "Accès PMR",
      ecran: "Écran 4K",
      email: "E-mail",
      etoile: "Étoile vide",
      "etoile-pleine": "Étoile pleine",
      favori: "Favori",
      localisation: "Localisation",
      supprimer: "Supprimer",
      utilisateurs: "Capacité d'accueil",
      validation: "Validation",
      wifi: "Fibre"
    };
    const icone = document.createElement("img");
    icone.src = cheminRessource("assets/icons/icone-" + nom + ".svg");
    if (estDecorative) {
      icone.alt = "";
    } else if (textesAlternatifs[nom]) {
      icone.alt = textesAlternatifs[nom];
    } else {
      icone.alt = nom.split("-").join(" ");
    }

    icone.width = 20;
    icone.height = 20;
    icone.className = "icone";

    if (classeSupplementaire) {
      icone.className = "icone " + classeSupplementaire;
    }

    return icone;
  }

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

  function remplirEtoiles(conteneur, note) {
    conteneur.setAttribute("aria-hidden", "true");

    for (let index = 1; index <= 5; index++) {
      const estPleine = index <= Math.round(note);
      let nomIcone = "etoile";
      let classeIcone = "icone--etoile-vide";

      if (estPleine) {
        nomIcone = "etoile-pleine";
        classeIcone = "icone--etoile";
      }

      const icone = creerIcone(nomIcone, classeIcone, true);
      conteneur.appendChild(icone);
    }
  }

  function creerEtoiles(note, inclureLibelleAccessible) {
    const groupe = creerElement("span", "evaluation");
    const etoiles = creerElement("span", "evaluation__etoiles");

    if (inclureLibelleAccessible) {
      groupe.appendChild(
        creerElement(
          "span",
          "visuellement-cache",
          "Note : " + String(note).replace(".", ",") + " sur 5"
        )
      );
    }

    remplirEtoiles(etoiles, note);

    groupe.appendChild(etoiles);
    return groupe;
  }

  function mettreAJourBoutonFavori(bouton, espace, classeActive, libelleVisible) {
    const favoris = lireFavoris();
    const estFavori = favoris.indexOf(espace.id) !== -1;
    const icone = bouton.querySelector("img");
    let libelleAccessible = "Ajouter " + espace.title + " aux favoris";

    if (estFavori) {
      bouton.classList.add(classeActive);
      libelleAccessible = "Retirer " + espace.title + " des favoris";
    } else {
      bouton.classList.remove(classeActive);
    }

    bouton.setAttribute("aria-label", libelleAccessible);

    if (icone) {
      let nomFichierIcone = "icone-favori.svg";

      if (estFavori) {
        nomFichierIcone = "icone-favori-plein.svg";
      }

      icone.src = cheminRessource("assets/icons/" + nomFichierIcone);
    }

    if (libelleVisible) {
      libelleVisible.textContent = "Sauvegarder en Favoris";

      if (estFavori) {
        libelleVisible.textContent = "Sauvegardé en Favoris";
      }
    }

    return estFavori;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Construire la liste des destinations du pied de page.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse résolue à la fin du traitement.
   * ---------------------------------------------------------
   */
  async function initialiserDestinations() {
    const listeDestinations = document.getElementById("liste-destinations");

    if (!listeDestinations) {
      return;
    }

    try {
      const donnees = await chargerDonnees();

      listeDestinations.textContent = "";

      for (let index = 0; index < donnees.destinations.length; index++) {
        const destination = donnees.destinations[index];
        const elementListe = document.createElement("li");
        let elementDestination;

        if (destination.city) {
          elementDestination = document.createElement("a");
          elementDestination.href = cheminRessource(
            "index.html?ville=" + encodeURIComponent(destination.city) + "#espaces-disponibles"
          );
        } else {
          elementDestination = document.createElement("span");
        }

        elementDestination.textContent = "Espaces à " + destination.label;
        elementListe.appendChild(elementDestination);
        listeDestinations.appendChild(elementListe);
      }
    } catch (erreur) {
      console.error("Les destinations ne peuvent pas être chargées.", erreur);
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Activer ou désactiver la police adaptée.
   * Paramètres :
   * - active : Indique si la police adaptée doit être activée.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function appliquerPoliceAdaptee(active) {
    if (active) {
      document.body.classList.add("police-adaptee");
    } else {
      document.body.classList.remove("police-adaptee");
    }

    const bouton = document.getElementById("bouton-police-adaptee");

    if (bouton) {
      let libelleBouton = "Activer la police adaptée";

      if (active) {
        libelleBouton = "Désactiver la police adaptée";
      }

      bouton.setAttribute("aria-label", libelleBouton);
      const statut = document.getElementById("statut-police-adaptee");

      if (statut) {
        statut.textContent = " — activer la police adaptée";

        if (active) {
          statut.textContent = " — police adaptée activée";
        }
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Restaurer le choix de police et installer sa commande.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function initialiserPoliceAdaptee() {
    let policeActive = false;

    try {
      policeActive = localStorage.getItem(clePoliceAdaptee) === "true";
    } catch (erreur) {
      policeActive = false;
    }

    appliquerPoliceAdaptee(policeActive);

    const bouton = document.getElementById("bouton-police-adaptee");

    if (bouton) {
      bouton.addEventListener("click", function () {
        policeActive = !document.body.classList.contains("police-adaptee");
        appliquerPoliceAdaptee(policeActive);

        try {
          localStorage.setItem(clePoliceAdaptee, String(policeActive));
        } catch (erreur) {
          return;
        }
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * Zone : EXPOSITION ET INITIALISATION
   * Cette zone rend les services partagés disponibles et lance les comportements de la page.
   * ---------------------------------------------------------
   */
  window.ProSpace = {
    cheminRessource: cheminRessource,
    chargerEspaces: chargerEspaces,
    lireFavoris: lireFavoris,
    enregistrerFavoris: enregistrerFavoris,
    basculerFavori: basculerFavori,
    viderFavoris: viderFavoris,
    creerIcone: creerIcone,
    creerElement: creerElement,
    remplirEtoiles: remplirEtoiles,
    creerEtoiles: creerEtoiles,
    mettreAJourBoutonFavori: mettreAJourBoutonFavori
  };

  chargerStructureCommune();
})();
