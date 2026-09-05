/*
 * ---------------------------------------------------------
 * Fichier : assets/js/equipe.js
 * Rôle : Gérer l’affichage et le carrousel de l’équipe.
 * Tâches :
 * - Charger les membres depuis le fichier JSON.
 * - Construire les cartes et piloter la navigation du carrousel.
 * Liens avec les autres fichiers :
 * - pages/contact.html fournit les conteneurs et les commandes.
 * - assets/js/commun.js fournit les chemins et les icônes.
 * - assets/data/equipe.json fournit les informations des membres.
 * ---------------------------------------------------------
 */

(function () {
  const listeEquipe = document.getElementById("liste-equipe");
  const navigationEquipe = document.getElementById("navigation-equipe");
  const statutEquipe = document.getElementById("statut-equipe");
  const boutonPrecedent = document.getElementById("equipe-precedente");
  const boutonSuivant = document.getElementById("equipe-suivante");
  const commandesEquipe = document.getElementById("commandes-equipe");
  let equipe = [];
  let dimensionsPhoto = null;
  let indexEquipe = 0;
  const nombreVisible = 4;

  /*
   * ---------------------------------------------------------
   * Rôle : Charger les membres de l'équipe depuis le fichier JSON.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse contenant la liste des membres.
   * ---------------------------------------------------------
   */
  async function chargerEquipe() {
    const reponse = await fetch(
      window.ProSpace.cheminRessource("assets/data/equipe.json")
    );

    if (!reponse.ok) {
      throw new Error("Impossible de charger les membres de l'équipe.");
    }

    const donnees = await reponse.json();

    if (!Array.isArray(donnees.membres) || donnees.membres.length === 0) {
      throw new Error("La liste des membres de l'équipe est vide ou invalide.");
    }

    if (!donnees.dimensionsPhoto) {
      throw new Error("Les dimensions des portraits sont manquantes.");
    }

    return donnees;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Afficher un message si les membres ne peuvent pas être chargés.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherErreurEquipe() {
    const message = document.createElement("li");
    message.className = "panneau-etat";
    message.textContent = "L'équipe ne peut pas être affichée pour le moment.";

    viderElement(listeEquipe);
    listeEquipe.appendChild(message);
    commandesEquipe.hidden = true;
    statutEquipe.textContent = message.textContent;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Construire la carte HTML d’un membre de l’équipe.
   * Paramètres :
   * - membre : Objet contenant les informations du membre.
   * - position : Position du membre dans l’équipe.
   * Retour : La carte HTML du membre.
   * ---------------------------------------------------------
   */
  function creerCarteMembre(membre, position) {
    const elementListe = document.createElement("li");
    const carte = document.createElement("article");
    const portrait = document.createElement("div");
    const photo = document.createElement("img");
    const nom = document.createElement("h3");
    const fonction = document.createElement("p");
    const lienEmail = document.createElement("a");

    elementListe.className = "carrousel-equipe__element";
    elementListe.setAttribute("aria-posinset", String(position + 1));
    elementListe.setAttribute("aria-setsize", String(equipe.length));
    carte.className = "carte-membre";
    portrait.className = "carte-membre__portrait";

    photo.src = window.ProSpace.cheminRessource("assets/images/" + membre.photo);
    photo.alt = "Portrait de " + membre.nom;
    photo.width = dimensionsPhoto.largeur;
    photo.height = dimensionsPhoto.hauteur;
    photo.loading = "lazy";

    nom.textContent = membre.nom;
    fonction.textContent = membre.fonction;
    fonction.className = "carte-membre__fonction";
    lienEmail.className = "carte-membre__email";
    lienEmail.href = "mailto:" + membre.email;
    lienEmail.appendChild(window.ProSpace.creerIcone("email", "", true));
    lienEmail.appendChild(document.createTextNode("Envoyer un email"));

    portrait.appendChild(photo);
    carte.appendChild(portrait);
    carte.appendChild(nom);
    carte.appendChild(fonction);
    carte.appendChild(lienEmail);
    elementListe.appendChild(carte);

    return elementListe;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Supprimer tous les enfants d’un élément HTML.
   * Paramètres :
   * - element : Élément HTML à vider.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function viderElement(element) {
    element.textContent = "";
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Actualiser les indicateurs du carrousel.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourPoints() {
    const points = navigationEquipe.querySelectorAll("button");

    for (let index = 0; index < points.length; index++) {
      const point = points[index];
      const estActif = index === indexEquipe;

      if (estActif) {
        point.classList.add("carrousel-equipe__point--actif");
        point.setAttribute("aria-current", "true");
      } else {
        point.classList.remove("carrousel-equipe__point--actif");
        point.removeAttribute("aria-current");
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Afficher les membres visibles dans le carrousel.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherEquipe() {
    const nomsVisibles = [];
    let nombreAAfficher = nombreVisible;

    if (equipe.length < nombreVisible) {
      nombreAAfficher = equipe.length;
    }

    viderElement(listeEquipe);

    for (let positionAffichee = 0; positionAffichee < nombreAAfficher; positionAffichee++) {
      const positionEquipe = (indexEquipe + positionAffichee) % equipe.length;
      const membre = equipe[positionEquipe];
      listeEquipe.appendChild(creerCarteMembre(membre, positionEquipe));
      nomsVisibles.push(membre.nom);
    }

    statutEquipe.textContent = "Membres affichés : " + nomsVisibles.join(", ") + ".";
    mettreAJourPoints();
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Changer la position du carrousel.
   * Paramètres :
   * - nouvelIndex : Nouvelle position de départ du carrousel.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function changerPositionEquipe(nouvelIndex) {
    indexEquipe = nouvelIndex;
    afficherEquipe();
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Construire les boutons de position du carrousel.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function creerNavigationEquipe() {
    for (let index = 0; index < equipe.length; index++) {
      const membre = equipe[index];
      const point = document.createElement("button");
      point.type = "button";
      point.className = "carrousel-equipe__point";
      point.setAttribute("aria-label", "Afficher " + membre.nom + " en premier");

      point.addEventListener("click", function () {
        changerPositionEquipe(index);
      });

      navigationEquipe.appendChild(point);
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Préparer et démarrer le carrousel de l’équipe.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  async function initialiserCarousel() {
    if (!listeEquipe || !navigationEquipe || !boutonPrecedent || !boutonSuivant || !commandesEquipe) {
      return;
    }

    try {
      const donneesEquipe = await chargerEquipe();
      equipe = donneesEquipe.membres;
      dimensionsPhoto = donneesEquipe.dimensionsPhoto;
      creerNavigationEquipe();
      afficherEquipe();
      commandesEquipe.hidden = false;
    } catch (erreur) {
      afficherErreurEquipe();
      return;
    }

    boutonPrecedent.addEventListener("click", function () {
      changerPositionEquipe((indexEquipe - 1 + equipe.length) % equipe.length);
    });

    boutonSuivant.addEventListener("click", function () {
      changerPositionEquipe((indexEquipe + 1) % equipe.length);
    });
  }

  initialiserCarousel();
})();
