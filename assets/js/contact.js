/*
 * ---------------------------------------------------------
 * Fichier : assets/js/contact.js
 * Rôle : Gérer le formulaire de contact.
 * Tâches :
 * - Valider les champs et afficher la confirmation d’envoi.
 * - Préremplir une demande liée à un espace.
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

  /*
   * ---------------------------------------------------------
   * Rôle : Déterminer le message d’erreur correspondant à un champ.
   * Paramètres :
   * - champ : Champ de formulaire à contrôler.
   * Retour : Le message d’erreur à afficher, ou une chaîne vide.
   * ---------------------------------------------------------
   */
  function obtenirMessageErreur(champ) {
    let valeur = "";

    if (champ.type !== "checkbox") {
      valeur = champ.value.trim();
    }

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

    for (let index = 0; index < champsObligatoires.length; index++) {
      const champ = champsObligatoires[index];

      if (!mettreAJourErreur(champ)) {
        nombreErreurs++;

        if (!premierChampInvalide) {
          premierChampInvalide = champ;
        }
      }
    }

    if (nombreErreurs > 0) {
      resumeErreurs.textContent =
        "Le formulaire contient " + nombreErreurs + " erreur. Corrigez le champ indiqué.";

      if (nombreErreurs > 1) {
        resumeErreurs.textContent =
          "Le formulaire contient " + nombreErreurs + " erreurs. Corrigez les champs indiqués.";
      }
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
    for (let index = 0; index < champsObligatoires.length; index++) {
      const champ = champsObligatoires[index];
      let evenementPrincipal = "input";

      if (champ.type === "checkbox" || champ.tagName === "SELECT") {
        evenementPrincipal = "change";
      }

      champ.addEventListener("blur", function () {
        mettreAJourErreur(champ);
      });

      champ.addEventListener(evenementPrincipal, function () {
        if (champ.getAttribute("aria-invalid") === "true") {
          mettreAJourErreur(champ);
        }
      });
    }
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

    for (let index = 0; index < champsObligatoires.length; index++) {
      const champ = champsObligatoires[index];
      champ.removeAttribute("aria-invalid");
      const elementErreur = document.getElementById("erreur-" + champ.id);

      if (elementErreur) {
        elementErreur.textContent = "";
        elementErreur.hidden = true;
      }
    }

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
      let espace = null;

      for (let index = 0; index < espaces.length; index++) {
        if (espaces[index].id === identifiantEspace) {
          espace = espaces[index];
        }
      }

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

  initialiserFormulaire();
})();
