/*
 * ---------------------------------------------------------
 * Fichier : assets/js/espace.js
 * Rôle : Alimenter la fiche d’un espace à partir des données du catalogue.
 * Tâches :
 * - Identifier l’espace demandé dans l’adresse de la page.
 * - Afficher ses textes, images, équipements et actions.
 * Liens avec les autres fichiers :
 * - pages/espace.html fournit le gabarit de la fiche.
 * - assets/js/commun.js fournit les données, les icônes et la gestion des favoris.
 * ---------------------------------------------------------
 */

(function () {
  /*
   * ---------------------------------------------------------
   * Zone : DONNÉES ET ÉLÉMENTS DE LA PAGE
   * Cette zone prépare les constantes, l’état et les éléments HTML utilisés par le script.
   * ---------------------------------------------------------
   */
  const fiche = document.getElementById("fiche-espace");
  const boutonFavori = document.getElementById("bouton-favori-espace");
  const lienContact = document.getElementById("lien-contact-espace");
  const listeEquipements = document.getElementById("liste-equipements");

  /*
   * ---------------------------------------------------------
   * Rôle : Renseigner un élément à partir de son identifiant.
   * Paramètres :
   * - identifiant : Identifiant de l’élément visé.
   * - valeur : Valeur à afficher.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function renseignerTexte(identifiant, valeur) {
    const element = document.getElementById(identifiant);

    if (element) {
      element.textContent = String(valeur);
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Créer une image et l’ajouter au conteneur indiqué.
   * Paramètres :
   * - conteneur : Élément HTML qui recevra le contenu.
   * - nomFichier : Nom du fichier image.
   * - texteAlternatif : Description alternative de l’image.
   * - largeur : Largeur intrinsèque de l’image.
   * - hauteur : Hauteur intrinsèque de l’image.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function ajouterImage(conteneur, nomFichier, texteAlternatif, largeur, hauteur) {
    const image = document.createElement("img");
    image.src = window.ProSpace.cheminRessource("assets/images/" + nomFichier);
    image.alt = texteAlternatif;
    image.width = largeur;
    image.height = hauteur;
    image.loading = "lazy";

    conteneur.appendChild(image);
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Afficher les étoiles correspondant à la note d’un espace.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherEtoiles(espace) {
    const conteneur = document.getElementById("etoiles-espace");

    for (let index = 1; index <= 5; index += 1) {
      const estPleine = index <= Math.round(espace.rating);
      const icone = window.ProSpace.creerIcone(
        estPleine ? "etoile-pleine" : "etoile",
        estPleine ? "icone--etoile" : "icone--etoile-vide"
      );

      conteneur.appendChild(icone);
    }

    renseignerTexte(
      "libelle-note-espace",
      "Note de " + espace.rating + " sur 5, calculée à partir de " + espace.reviews + " avis vérifiés"
    );
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Construire la liste des équipements d’un espace.
   * Paramètres :
   * - equipements : Liste des équipements à afficher.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherEquipements(equipements) {
    equipements.forEach(function (equipement) {
      const elementListe = document.createElement("li");
      const libelle = document.createElement("span");

      elementListe.appendChild(window.ProSpace.creerIcone("validation"));
      libelle.textContent = equipement;
      elementListe.appendChild(libelle);
      listeEquipements.appendChild(elementListe);
    });
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Vérifier si un espace est actuellement sauvegardé.
   * Paramètres :
   * - identifiant : Identifiant unique de l’espace.
   * Retour : Vrai si l’espace est sauvegardé, sinon faux.
   * ---------------------------------------------------------
   */
  function espaceEstFavori(identifiant) {
    return window.ProSpace.lireFavoris().includes(identifiant);
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Mettre à jour le libellé et l’apparence d’un bouton favori.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourBoutonFavori(espace) {
    const estFavori = espaceEstFavori(espace.id);
    const libelle = document.getElementById("libelle-favori");
    const icone = boutonFavori.querySelector("img");

    boutonFavori.classList.toggle("bouton--favori-actif", estFavori);
    libelle.textContent = estFavori
      ? "Sauvegardé en Favoris"
      : "Sauvegarder en Favoris";

    if (icone) {
      icone.src = window.ProSpace.cheminRessource(
        "assets/icons/icone-favori" + (estFavori ? "-plein" : "") + ".svg"
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Installer l’action de sauvegarde sur la fiche.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function installerFavori(espace) {
    mettreAJourBoutonFavori(espace);

    boutonFavori.addEventListener("click", function () {
      window.ProSpace.basculerFavori(espace.id);
      mettreAJourBoutonFavori(espace);
    });

    window.addEventListener("prospace:favoris-modifies", function () {
      mettreAJourBoutonFavori(espace);
    });
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Adapter le titre et la description de la page à l’espace.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourReferencement(espace) {
    const description =
      "Découvrez " + espace.title + " à " + espace.city +
      ", un espace professionnel équipé pour accueillir jusqu'à " + espace.capacity + " personnes.";
    const metaDescription = document.querySelector('meta[name="description"]');

    document.title =
      espace.title + " - Salle de réunion " + espace.capacity + " personnes | ProSpace Solutions";
    metaDescription.setAttribute("content", description);
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Renseigner l’ensemble de la fiche d’un espace.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherEspace(espace) {
    renseignerTexte("titre-espace", espace.title);
    renseignerTexte("titre-espace-fil-ariane", espace.title);
    renseignerTexte("ville-espace", espace.city);
    renseignerTexte("adresse-espace", espace.address);
    renseignerTexte("note-espace", espace.rating);
    renseignerTexte("nombre-avis-espace", espace.reviews);
    renseignerTexte("description-espace", espace.description);
    renseignerTexte("capacite-espace", espace.capacity);
    renseignerTexte("prix-heure", espace.priceHour + "€");
    renseignerTexte("prix-demi-journee", espace.priceHalfDay + "€");
    renseignerTexte("prix-journee", espace.priceDay + "€");

    ajouterImage(
      document.getElementById("galerie-principale"),
      espace.images[0],
      espace.imageAlts[0],
      espace.imageWidth,
      espace.imageHeight
    );
    ajouterImage(
      document.getElementById("galerie-secondaire"),
      espace.images[1] || espace.images[0],
      espace.imageAlts[1],
      espace.imageWidth,
      espace.imageHeight
    );
    ajouterImage(
      document.getElementById("galerie-secondaire"),
      espace.images[2] || espace.images[0],
      espace.imageAlts[2],
      espace.imageWidth,
      espace.imageHeight
    );

    document.querySelector(".galerie-espace").setAttribute(
      "aria-label",
      "Galerie photos de " + espace.title
    );

    afficherEtoiles(espace);
    afficherEquipements(espace.equipment);
    installerFavori(espace);
    mettreAJourReferencement(espace);
    lienContact.href = "./contact.html?espace=" + encodeURIComponent(espace.id);

    fiche.hidden = false;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Rediriger l’utilisateur vers le catalogue.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function retournerAuCatalogue() {
    window.location.href = "../index.html";
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Charger et afficher l’espace demandé.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse résolue après l’initialisation.
   * ---------------------------------------------------------
   */
  async function initialiserFiche() {
    const parametres = new URLSearchParams(window.location.search);
    const identifiant = parametres.get("id");

    if (!identifiant) {
      retournerAuCatalogue();
      return;
    }

    try {
      const espaces = await window.ProSpace.chargerEspaces();
      const espace = espaces.find(function (element) {
        return element.id === identifiant;
      });

      if (!espace) {
        retournerAuCatalogue();
        return;
      }

      afficherEspace(espace);
    } catch (erreurChargement) {
      retournerAuCatalogue();
    }
  }

  /*
   * ---------------------------------------------------------
   * Zone : EXPOSITION ET INITIALISATION
   * Cette zone rend les services partagés disponibles et lance les comportements de la page.
   * ---------------------------------------------------------
   */
  initialiserFiche();
})();
