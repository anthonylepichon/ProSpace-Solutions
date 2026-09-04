/*
 * ---------------------------------------------------------
 * Fichier : assets/js/contact.js
 * Rôle : Gérer le formulaire de contact et le carrousel de l’équipe.
 * Tâches :
 * - Valider les champs et afficher la confirmation d’envoi.
 * - Préremplir une demande liée à un espace et piloter le carrousel.
 * Liens avec les autres fichiers :
 * - pages/contact.html fournit le formulaire et les conteneurs.
 * - assets/js/commun.js fournit les chemins vers les ressources.
 * ---------------------------------------------------------
 */

(function () {
  /*
   * ---------------------------------------------------------
   * Zone : DONNÉES ET ÉLÉMENTS DE LA PAGE
   * Cette zone prépare les constantes, l’état et les éléments HTML utilisés par le script.
   * ---------------------------------------------------------
   */
  const formulaire = document.getElementById("formulaire-contact");
  const contenuFormulaire = document.getElementById("contenu-formulaire");
  const confirmation = document.getElementById("confirmation-contact");
  const confirmationNom = document.getElementById("confirmation-nom");
  const confirmationEmail = document.getElementById("confirmation-courriel");
  const boutonNouveauMessage = document.getElementById("nouveau-message");
  const resumeErreurs = document.getElementById("resume-erreurs");
  const statutPreremplissage = document.getElementById("statut-preremplissage");

  const champsObligatoires = [
    document.getElementById("nom"),
    document.getElementById("courriel"),
    document.getElementById("entreprise"),
    document.getElementById("sujet"),
    document.getElementById("message"),
    document.getElementById("consentement")
  ];

  const equipe = [
    {
      nom: "Alexandre Moreau",
      fonction: "CEO & Co-fondateur",
      photo: "alexandre-moreau-ceo-prospace.webp",
      email: "alexandre.moreau@prospace-solutions.fr"
    },
    {
      nom: "Sophie Leclerc",
      fonction: "Directrice Commerciale",
      photo: "sophie-leclerc-directrice-commerciale.webp",
      email: "sophie.leclerc@prospace-solutions.fr"
    },
    {
      nom: "Thomas Bergeron",
      fonction: "Responsable Partenariats",
      photo: "thomas-bergeron-responsable-partenariats.webp",
      email: "thomas.bergeron@prospace-solutions.fr"
    },
    {
      nom: "Marine Dubois",
      fonction: "Chargée de Clientèle Senior",
      photo: "marine-dubois-chargee-clientele.webp",
      email: "marine.dubois@prospace-solutions.fr"
    },
    {
      nom: "Julien Fontaine",
      fonction: "Directeur Technique",
      photo: "julien-fontaine-directeur-technique.webp",
      email: "julien.fontaine@prospace-solutions.fr"
    },
    {
      nom: "Camille Roux",
      fonction: "Responsable Marketing",
      photo: "camille-roux-responsable-marketing.webp",
      email: "camille.roux@prospace-solutions.fr"
    },
    {
      nom: "Élodie Garnier",
      fonction: "Chargée des Opérations",
      photo: "elodie-garnier-chargee-operations.webp",
      email: "elodie.garnier@prospace-solutions.fr"
    },
    {
      nom: "Nicolas Vidal",
      fonction: "Responsable Support",
      photo: "nicolas-vidal-responsable-support.webp",
      email: "nicolas.vidal@prospace-solutions.fr"
    }
  ];

  /*
   * ---------------------------------------------------------
   * Rôle : Déterminer le message d’erreur correspondant à un champ.
   * Paramètres :
   * - champ : Champ de formulaire à contrôler.
   * Retour : Le message d’erreur à afficher, ou une chaîne vide.
   * ---------------------------------------------------------
   */
  function obtenirMessageErreur(champ) {
    const valeur = champ.type === "checkbox" ? "" : champ.value.trim();

    if (champ.id === "nom" && valeur === "") {
      return "Le nom complet est requis.";
    }

    if (champ.id === "courriel") {
      if (valeur === "") {
        return "L'adresse email est requise.";
      }

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valeur)) {
        return "Saisissez une adresse email valide.";
      }
    }

    if (champ.id === "entreprise" && valeur === "") {
      return "Le nom de l'entreprise est requis.";
    }

    if (champ.id === "sujet" && valeur === "") {
      return "Sélectionnez un sujet.";
    }

    if (champ.id === "message" && valeur === "") {
      return "Le message est requis.";
    }

    if (champ.id === "consentement" && !champ.checked) {
      return "Vous devez accepter la politique de confidentialité.";
    }

    return "";
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Afficher ou retirer l’erreur associée à un champ.
   * Paramètres :
   * - champ : Champ de formulaire à contrôler.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourErreur(champ) {
    const message = obtenirMessageErreur(champ);
    const elementErreur = document.getElementById("erreur-" + champ.id);

    if (!elementErreur) {
      return message === "";
    }

    elementErreur.textContent = message;
    elementErreur.hidden = message === "";
    champ.setAttribute("aria-invalid", String(message !== ""));

    return message === "";
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Masquer le résumé général des erreurs du formulaire.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function masquerResumeErreurs() {
    resumeErreurs.textContent = "";
    resumeErreurs.hidden = true;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Contrôler tous les champs obligatoires du formulaire.
   * Paramètres :
   * - Aucun.
   * Retour : Vrai si le formulaire est valide, sinon faux.
   * ---------------------------------------------------------
   */
  function validerFormulaire() {
    let premierChampInvalide = null;
    let nombreErreurs = 0;

    champsObligatoires.forEach(function (champ) {
      if (!mettreAJourErreur(champ)) {
        nombreErreurs += 1;

        if (!premierChampInvalide) {
          premierChampInvalide = champ;
        }
      }
    });

    if (nombreErreurs > 0) {
      resumeErreurs.textContent =
        "Le formulaire contient " +
        nombreErreurs +
        " erreur" +
        (nombreErreurs > 1 ? "s" : "") +
        ". Corrigez les champs indiqués.";
      resumeErreurs.hidden = false;
      premierChampInvalide.focus();
      return false;
    }

    masquerResumeErreurs();
    return true;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Installer la validation sur les champs du formulaire.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function initialiserValidation() {
    champsObligatoires.forEach(function (champ) {
      const evenementPrincipal = champ.type === "checkbox" || champ.tagName === "SELECT" ? "change" : "input";

      champ.addEventListener("blur", function () {
        mettreAJourErreur(champ);
      });

      champ.addEventListener(evenementPrincipal, function () {
        if (champ.getAttribute("aria-invalid") === "true") {
          mettreAJourErreur(champ);
        }
      });
    });
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Remplacer le formulaire par le message de confirmation.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherConfirmation() {
    confirmationNom.textContent = document.getElementById("nom").value.trim();
    confirmationEmail.textContent = document.getElementById("courriel").value.trim();
    contenuFormulaire.hidden = true;
    confirmation.hidden = false;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Réinitialiser le formulaire pour un nouveau message.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function reinitialiserFormulaire() {
    formulaire.reset();

    champsObligatoires.forEach(function (champ) {
      champ.removeAttribute("aria-invalid");
      const elementErreur = document.getElementById("erreur-" + champ.id);

      if (elementErreur) {
        elementErreur.textContent = "";
        elementErreur.hidden = true;
      }
    });

    masquerResumeErreurs();
    confirmation.hidden = true;
    contenuFormulaire.hidden = false;
    document.getElementById("nom").focus();
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Préremplir le formulaire depuis une fiche d’espace.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse résolue à la fin du traitement.
   * ---------------------------------------------------------
   */
  async function preremplirDepuisEspace() {
    const parametres = new URLSearchParams(window.location.search);
    const identifiantEspace = parametres.get("espace");

    if (!identifiantEspace) {
      return;
    }

    try {
      const espaces = await window.ProSpace.chargerEspaces();
      const espace = espaces.find(function (element) {
        return element.id === identifiantEspace;
      });

      if (!espace) {
        statutPreremplissage.textContent = "L'espace demandé n'a pas été trouvé. Le formulaire reste disponible.";
        return;
      }

      const sujet = document.getElementById("sujet");
      const optionEspace = document.createElement("option");
      const valeurSujet = "Demande concernant : " + espace.title;

      optionEspace.value = valeurSujet;
      optionEspace.textContent = valeurSujet;
      sujet.insertBefore(optionEspace, sujet.options[1]);
      sujet.value = valeurSujet;
      document.getElementById("message").value =
        "Bonjour,\n\nJe souhaite obtenir des informations sur l'espace \"" + espace.title + "\".\n\n";
      statutPreremplissage.textContent = "Le formulaire a été prérempli pour l'espace " + espace.title + ".";
    } catch (erreur) {
      statutPreremplissage.textContent = "Le préremplissage n'a pas pu être effectué. Le formulaire reste disponible.";
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Installer les comportements du formulaire de contact.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function initialiserFormulaire() {
    if (!formulaire) {
      return;
    }

    initialiserValidation();

    formulaire.addEventListener("submit", function (event) {
      event.preventDefault();

      if (validerFormulaire()) {
        afficherConfirmation();
      }
    });

    boutonNouveauMessage.addEventListener("click", reinitialiserFormulaire);
    preremplirDepuisEspace();
  }

  const listeEquipe = document.getElementById("liste-equipe");
  const navigationEquipe = document.getElementById("navigation-equipe");
  const statutEquipe = document.getElementById("statut-equipe");
  const boutonPrecedent = document.getElementById("equipe-precedente");
  const boutonSuivant = document.getElementById("equipe-suivante");
  let indexEquipe = 0;
  const nombreVisible = 4;
  let animationEnCours = false;

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
    photo.width = 400;
    photo.height = 400;
    photo.loading = "lazy";
    photo.decoding = "async";

    nom.textContent = membre.nom;
    fonction.textContent = membre.fonction;
    fonction.className = "carte-membre__fonction";
    lienEmail.className = "carte-membre__email";
    lienEmail.href = "mailto:" + membre.email;
    lienEmail.appendChild(window.ProSpace.creerIcone("email"));
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
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
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

    points.forEach(function (point, index) {
      const estActif = index === indexEquipe;
      point.classList.toggle("carrousel-equipe__point--actif", estActif);

      if (estActif) {
        point.setAttribute("aria-current", "true");
      } else {
        point.removeAttribute("aria-current");
      }
    });
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
    const fragment = document.createDocumentFragment();
    const nomsVisibles = [];

    viderElement(listeEquipe);

    for (let positionAffichee = 0; positionAffichee < nombreVisible; positionAffichee += 1) {
      const positionEquipe = (indexEquipe + positionAffichee) % equipe.length;
      const membre = equipe[positionEquipe];
      fragment.appendChild(creerCarteMembre(membre, positionEquipe));
      nomsVisibles.push(membre.nom);
    }

    listeEquipe.appendChild(fragment);
    statutEquipe.textContent = "Membres affichés : " + nomsVisibles.join(", ") + ".";
    mettreAJourPoints();
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Changer la position du carrousel avec une transition.
   * Paramètres :
   * - nouvelIndex : Nouvelle position de départ du carrousel.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherEquipeAvecTransition(nouvelIndex) {
    if (animationEnCours) {
      return;
    }

    animationEnCours = true;
    listeEquipe.classList.add("carrousel-equipe__liste--en-animation");
    indexEquipe = nouvelIndex;
    afficherEquipe();

    window.setTimeout(function () {
      listeEquipe.classList.remove("carrousel-equipe__liste--en-animation");
      animationEnCours = false;
    }, 400);
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
    equipe.forEach(function (membre, index) {
      const point = document.createElement("button");
      point.type = "button";
      point.className = "carrousel-equipe__point";
      point.setAttribute("aria-label", "Afficher " + membre.nom + " en premier");

      point.addEventListener("click", function () {
        afficherEquipeAvecTransition(index);
      });

      navigationEquipe.appendChild(point);
    });
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Préparer et démarrer le carrousel de l’équipe.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function initialiserCarousel() {
    if (!listeEquipe || !navigationEquipe || !boutonPrecedent || !boutonSuivant) {
      return;
    }

    creerNavigationEquipe();
    afficherEquipe();

    boutonPrecedent.addEventListener("click", function () {
      afficherEquipeAvecTransition((indexEquipe - 1 + equipe.length) % equipe.length);
    });

    boutonSuivant.addEventListener("click", function () {
      afficherEquipeAvecTransition((indexEquipe + 1) % equipe.length);
    });

    listeEquipe.parentElement.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        afficherEquipeAvecTransition((indexEquipe - 1 + equipe.length) % equipe.length);
      }

      if (event.key === "ArrowRight") {
        event.preventDefault();
        afficherEquipeAvecTransition((indexEquipe + 1) % equipe.length);
      }
    });
  }

  /*
   * ---------------------------------------------------------
   * Zone : EXPOSITION ET INITIALISATION
   * Cette zone rend les services partagés disponibles et lance les comportements de la page.
   * ---------------------------------------------------------
   */
  initialiserFormulaire();
  initialiserCarousel();
})();
