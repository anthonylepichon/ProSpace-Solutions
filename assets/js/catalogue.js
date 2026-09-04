/*
 * ---------------------------------------------------------
 * Fichier : assets/js/catalogue.js
 * Rôle : Gérer le catalogue dynamique de la page d’accueil.
 * Tâches :
 * - Charger, filtrer et afficher les espaces disponibles.
 * - Construire les cartes et synchroniser leurs boutons de favoris.
 * Liens avec les autres fichiers :
 * - index.html fournit les conteneurs et les filtres.
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
  const formulaireFiltres = document.getElementById("formulaire-filtres");
  const filtreVille = document.getElementById("filtre-ville");
  const filtreCapacite = document.getElementById("filtre-capacite");
  const listeEspaces = document.getElementById("liste-espaces");
  const titreResultats = document.getElementById("titre-resultats");
  const resumeResultats = document.getElementById("resume-resultats");
  const chargement = document.getElementById("chargement-catalogue");
  const erreurChargement = document.getElementById("erreur-catalogue");
  const aucunResultat = document.getElementById("aucun-resultat");
  const boutonReessayer = document.getElementById("reessayer-catalogue");
  let espaces = [];

  const libellesEquipements = {
    wifi: { libelle: "Fibre", icone: "wifi" },
    pmr: { libelle: "PMR", icone: "accessibilite" },
    screen4k: { libelle: "4K", icone: "ecran" }
  };

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
   * Rôle : Vérifier si une capacité respecte le filtre sélectionné.
   * Paramètres :
   * - capacite : Capacité de l’espace à contrôler.
   * - filtre : Valeur du filtre de capacité.
   * Retour : Vrai si la capacité correspond, sinon faux.
   * ---------------------------------------------------------
   */
  function correspondCapacite(capacite, filtre) {
    if (!filtre) {
      return true;
    }

    if (filtre === "1-5") {
      return capacite <= 5;
    }

    if (filtre === "6-10") {
      return capacite >= 6 && capacite <= 10;
    }

    if (filtre === "11-20") {
      return capacite >= 11 && capacite <= 20;
    }

    if (filtre === "20-plus") {
      return capacite >= 20;
    }

    return true;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Récupérer les équipements cochés dans le formulaire.
   * Paramètres :
   * - Aucun.
   * Retour : Un tableau contenant les équipements sélectionnés.
   * ---------------------------------------------------------
   */
  function lireEquipementsSelectionnes() {
    const equipements = [];

    formulaireFiltres.querySelectorAll(".filtre-equipement:checked").forEach(function (caseCochee) {
      equipements.push(caseCochee.value);
    });

    return equipements;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Ajouter au filtre les villes présentes dans les données.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherVilles() {
    const villes = [];

    while (filtreVille.options.length > 1) {
      filtreVille.remove(1);
    }

    espaces.forEach(function (espace) {
      if (!villes.includes(espace.city)) {
        villes.push(espace.city);
      }
    });

    villes.forEach(function (ville) {
      const option = document.createElement("option");
      option.value = ville;
      option.textContent = ville;
      filtreVille.appendChild(option);
    });
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Filtrer les espaces selon les critères du formulaire.
   * Paramètres :
   * - Aucun.
   * Retour : Un tableau des espaces conformes aux filtres.
   * ---------------------------------------------------------
   */
  function filtrerEspaces() {
    const ville = filtreVille.value;
    const capacite = filtreCapacite.value;
    const equipements = lireEquipementsSelectionnes();
    const resultat = [];

    espaces.forEach(function (espace) {
      let correspond = true;

      if (ville && espace.city !== ville) {
        correspond = false;
      }

      if (correspond && !correspondCapacite(espace.capacity, capacite)) {
        correspond = false;
      }

      equipements.forEach(function (equipement) {
        if (!espace.amenities.includes(equipement)) {
          correspond = false;
        }
      });

      if (correspond) {
        resultat.push(espace);
      }
    });

    return resultat;
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
    const etoiles = creerElement("span", "evaluation__etoiles");

    for (let index = 1; index <= 5; index += 1) {
      const estPleine = index <= Math.round(note);
      const icone = ProSpace.creerIcone(
        estPleine ? "etoile-pleine" : "etoile",
        estPleine ? "icone--etoile" : "icone--etoile-vide"
      );

      etoiles.appendChild(icone);
    }

    groupe.appendChild(etoiles);
    return groupe;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Mettre à jour le libellé et l’apparence d’un bouton favori.
   * Paramètres :
   * - bouton : Bouton de favori à actualiser.
   * - espace : Objet contenant les données de l’espace.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function mettreAJourBoutonFavori(bouton, espace) {
    const estFavori = ProSpace.lireFavoris().includes(espace.id);
    const icone = bouton.querySelector("img");
    bouton.classList.toggle("bouton-favori--actif", estFavori);
    bouton.setAttribute(
      "aria-label",
      (estFavori ? "Retirer " : "Ajouter ") + espace.title + (estFavori ? " des favoris" : " aux favoris")
    );

    if (icone) {
      icone.src = ProSpace.cheminRessource(
        "assets/icons/icone-favori" + (estFavori ? "-plein" : "") + ".svg"
      );
    }
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
    const carte = creerElement("article", "carte-espace");
    const visuel = creerElement("div", "carte-espace__visuel");
    const image = document.createElement("img");
    image.src = ProSpace.cheminRessource("assets/images/" + espace.image);
    image.alt = espace.imageAlt;
    image.loading = "lazy";
    image.decoding = "async";

    const boutonFavori = creerElement("button", "bouton-favori");
    boutonFavori.type = "button";
    boutonFavori.appendChild(ProSpace.creerIcone("favori"));
    mettreAJourBoutonFavori(boutonFavori, espace);
    boutonFavori.addEventListener("click", function () {
      ProSpace.basculerFavori(espace.id);
      mettreAJourBoutonFavori(boutonFavori, espace);
    });

    visuel.appendChild(image);
    visuel.appendChild(boutonFavori);

    const contenu = creerElement("div", "carte-espace__contenu");
    const titre = creerElement("h3", "carte-espace__titre", espace.title);
    const ville = creerElement("p", "carte-espace__localisation");
    ville.appendChild(ProSpace.creerIcone("localisation", "icone--primaire"));
    ville.appendChild(document.createTextNode(espace.city));

    const avis = creerElement("div", "carte-espace__evaluation");
    avis.appendChild(creerEtoiles(espace.rating));
    avis.appendChild(creerElement("strong", "", String(espace.rating)));
    avis.appendChild(creerElement("span", "", "(" + espace.reviews + " avis)"));

    const caracteristiques = creerElement("div", "carte-espace__caracteristiques");
    const capacite = creerElement("span", "carte-espace__capacite");
    capacite.appendChild(ProSpace.creerIcone("utilisateurs"));
    capacite.appendChild(document.createTextNode(espace.capacity + " pers."));
    caracteristiques.appendChild(capacite);

    const separateur = creerElement("span", "carte-espace__separateur");
    caracteristiques.appendChild(separateur);

    espace.amenities.forEach(function (equipement) {
      const information = libellesEquipements[equipement];

      if (!information) {
        return;
      }

      const pastille = creerElement("span", "pastille-equipement");
      pastille.appendChild(ProSpace.creerIcone(information.icone));
      pastille.appendChild(document.createTextNode(information.libelle));
      caracteristiques.appendChild(pastille);
    });

    const pied = creerElement("div", "carte-espace__pied");
    const prix = creerElement("p", "carte-espace__prix");
    prix.appendChild(creerElement("strong", "", espace.priceHour + "€"));
    prix.appendChild(creerElement("span", "", "/heure"));

    const lien = creerElement("a", "bouton bouton--primaire", "Voir la fiche");
    lien.href = ProSpace.cheminRessource("pages/espace.html?id=" + encodeURIComponent(espace.id));
    lien.setAttribute("aria-label", "Voir la fiche de " + espace.title);

    pied.appendChild(prix);
    pied.appendChild(lien);
    contenu.appendChild(titre);
    contenu.appendChild(ville);
    contenu.appendChild(avis);
    contenu.appendChild(caracteristiques);
    contenu.appendChild(pied);
    carte.appendChild(visuel);
    carte.appendChild(contenu);
    return carte;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Afficher la liste des espaces correspondant aux filtres.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function afficherResultats() {
    const espacesFiltres = filtrerEspaces();
    const nombre = espacesFiltres.length;
    listeEspaces.textContent = "";
    aucunResultat.hidden = nombre !== 0;

    espacesFiltres.forEach(function (espace) {
      listeEspaces.appendChild(creerCarteEspace(espace));
    });

    const libelleResultats =
      nombre + " espace" + (nombre !== 1 ? "s" : "") + " disponible" + (nombre !== 1 ? "s" : "");
    const filtresActifs = Boolean(
      filtreVille.value || filtreCapacite.value || lireEquipementsSelectionnes().length
    );

    titreResultats.textContent = libelleResultats;
    resumeResultats.textContent = filtresActifs ? libelleResultats : "";
    resumeResultats.hidden = !filtresActifs;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Appliquer au filtre la ville présente dans l’adresse.
   * Paramètres :
   * - Aucun.
   * Retour : Aucune valeur.
   * ---------------------------------------------------------
   */
  function appliquerVilleDepuisUrl() {
    const parametres = new URLSearchParams(window.location.search);
    const ville = parametres.get("ville");
    let villeValide = false;

    filtreVille.querySelectorAll("option").forEach(function (option) {
      if (option.value === ville) {
        villeValide = true;
      }
    });

    if (ville && villeValide) {
      filtreVille.value = ville;
    }
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Charger les données et initialiser le catalogue.
   * Paramètres :
   * - Aucun.
   * Retour : Une promesse résolue après l’initialisation.
   * ---------------------------------------------------------
   */
  async function initialiserCatalogue() {
    chargement.hidden = false;
    erreurChargement.hidden = true;
    aucunResultat.hidden = true;
    resumeResultats.hidden = true;
    listeEspaces.textContent = "";

    try {
      espaces = await ProSpace.chargerEspaces();
      afficherVilles();
      appliquerVilleDepuisUrl();
      afficherResultats();
    } catch (erreur) {
      erreurChargement.hidden = false;
      resumeResultats.textContent = "Chargement impossible";
      resumeResultats.hidden = false;
    } finally {
      chargement.hidden = true;
    }
  }

  formulaireFiltres.addEventListener("change", afficherResultats);
  boutonReessayer.addEventListener("click", initialiserCatalogue);

  /*
   * ---------------------------------------------------------
   * Zone : EXPOSITION ET INITIALISATION
   * Cette zone rend les services partagés disponibles et lance les comportements de la page.
   * ---------------------------------------------------------
   */
  initialiserCatalogue();
})();
