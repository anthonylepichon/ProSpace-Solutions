/*
 * ---------------------------------------------------------
 * Fichier : assets/js/commun.js
 * Rôle : Regrouper les services JavaScript partagés par toutes les pages.
 * Tâches :
 * - Charger l’en-tête, le pied de page et les données des espaces.
 * - Gérer la navigation, les favoris, les destinations et la police adaptée.
 * Liens avec les autres fichiers :
 * - assets/html/header.html et assets/html/footer.html pour les fragments communs.
 * - assets/js/espaces.json pour les données.
 * - Tous les autres scripts de page utilisent l’objet global ProSpace.
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
      await Promise.all([
        chargerFragment("conteneur-header", "assets/html/header.html"),
        chargerFragment("conteneur-footer", "assets/html/footer.html")
      ]);

      mettreAJourNavigation();
      mettreAJourCompteursFavoris();
      initialiserPoliceAdaptee();
      await initialiserDestinations();
    } catch (erreur) {
      console.error("La structure commune ne peut pas être chargée.", erreur);
    }
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
   * Rôle : Charger une seule fois les données JSON des espaces.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse contenant les données JSON.
   * ---------------------------------------------------------
   */
  async function chargerDonnees() {
    if (promesseDonnees) {
      return promesseDonnees;
    }

    promesseDonnees = (async function () {
      const reponse = await fetch(cheminRessource("assets/js/espaces.json"));

      if (!reponse.ok) {
        throw new Error("Impossible de charger les espaces de travail.");
      }

      const donnees = await reponse.json();

      if (
        !donnees ||
        !Array.isArray(donnees.spaces) ||
        !Array.isArray(donnees.destinations) ||
        !Array.isArray(donnees.defaultFavorites)
      ) {
        throw new Error("Le format du catalogue est invalide.");
      }

      initialiserFavorisParDefaut(donnees.defaultFavorites);
      mettreAJourCompteursFavoris();
      return donnees;
    })();

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

      valeurParse.forEach(function (identifiant) {
        if (typeof identifiant === "string" && !favorisValides.includes(identifiant)) {
          favorisValides.push(identifiant);
        }
      });

      return favorisValides;
    } catch (erreur) {
      return [];
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Actualiser tous les compteurs de favoris visibles.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourCompteursFavoris() {
    const nombreFavoris = lireFavoris().length;
    const compteurs = document.querySelectorAll("[data-favorites-count]");

    compteurs.forEach(function (compteur) {
      let texteCompteur = "aucun espace sauvegardé";

      if (nombreFavoris > 0) {
        texteCompteur = nombreFavoris + " espace" + (nombreFavoris > 1 ? "s" : "") + " sauvegardé" + (nombreFavoris > 1 ? "s" : "");
      }

      compteur.textContent = String(nombreFavoris);
      compteur.hidden = nombreFavoris === 0;
      compteur.parentElement.setAttribute(
        "aria-label",
        "Mes espaces, " + texteCompteur
      );
    });
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Enregistrer la liste des favoris et informer les pages.
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
    window.dispatchEvent(
      new CustomEvent("prospace:favoris-modifies", {
        detail: { favoris: favoris }
      })
    );
    return true;
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
   * Retour : L’image HTML de l’icône.
   * ---------------------------------------------------------
   */
  function creerIcone(nom, classeSupplementaire) {
    const icone = document.createElement("img");
    icone.src = cheminRessource("assets/images/icone-" + nom + ".svg");
    icone.alt = "";
    icone.width = 20;
    icone.height = 20;
    icone.className = "icone" + (classeSupplementaire ? " " + classeSupplementaire : "");
    return icone;
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
    const listesDestinations = document.querySelectorAll("[data-destinations]");

    if (listesDestinations.length === 0) {
      return;
    }

    try {
      const donnees = await chargerDonnees();

      listesDestinations.forEach(function (liste) {
        liste.textContent = "";

        donnees.destinations.forEach(function (destination) {
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
          liste.appendChild(elementListe);
        });
      });
    } catch (erreur) {
      return;
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
    document.body.classList.toggle("police-adaptee", active);

    document.querySelectorAll("[data-font-toggle]").forEach(function (bouton) {
      bouton.setAttribute(
        "aria-label",
        active ? "Désactiver la police adaptée" : "Activer la police adaptée"
      );
      const statut = bouton.querySelector("[data-font-toggle-status]");

      if (statut) {
        statut.textContent = active
          ? " — police adaptée activée"
          : " — activer la police adaptée";
      }
    });
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

    document.querySelectorAll("[data-font-toggle]").forEach(function (bouton) {
      bouton.addEventListener("click", function () {
        policeActive = !document.body.classList.contains("police-adaptee");
        appliquerPoliceAdaptee(policeActive);

        try {
          localStorage.setItem(clePoliceAdaptee, String(policeActive));
        } catch (erreur) {
          return;
        }
      });
    });
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
    creerIcone: creerIcone
  };

  chargerStructureCommune();
})();
