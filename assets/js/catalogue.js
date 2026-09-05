/*
 * ---------------------------------------------------------
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
   * DONNÉES ET ÉLÉMENTS DE LA PAGE
   * Cette zone prépare les variables, l’état et les éléments HTML utilisés par le script.
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

    if (filtre === "21-plus") {
      return capacite >= 21;
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
    const casesEquipements = document.querySelectorAll(".filtre-equipement");

    for (let index = 0; index < casesEquipements.length; index++) {
      const caseEquipement = casesEquipements[index];

      if (caseEquipement.checked) {
        equipements.push(caseEquipement.value);
      }
    }

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

    for (let index = 0; index < espaces.length; index++) {
      const espace = espaces[index];

      if (villes.indexOf(espace.city) === -1) {
        villes.push(espace.city);
      }
    }

    for (let index = 0; index < villes.length; index++) {
      const ville = villes[index];
      const option = document.createElement("option");
      option.value = ville;
      option.textContent = ville;
      filtreVille.appendChild(option);
    }
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

    for (let indexEspace = 0; indexEspace < espaces.length; indexEspace++) {
      const espace = espaces[indexEspace];
      let correspond = true;

      if (ville && espace.city !== ville) {
        correspond = false;
      }

      if (correspond && !correspondCapacite(espace.capacity, capacite)) {
        correspond = false;
      }

      for (let indexEquipement = 0; indexEquipement < equipements.length; indexEquipement++) {
        const equipement = equipements[indexEquipement];

        if (espace.amenities.indexOf(equipement) === -1) {
          correspond = false;
        }
      }

      if (correspond) {
        resultat.push(espace);
      }
    }

    return resultat;
  }

  /*
   * ---------------------------------------------------------
   * Rôle : Construire la carte HTML correspondant à un espace.
   * Paramètres :
   * - espace : Objet contenant les données de l’espace.
   * Retour : La carte HTML créée.
   * ---------------------------------------------------------
   */
  function creerCarteCatalogue(espace) {
    const carte = ProSpace.creerElement("article", "carte-espace");
    const visuel = ProSpace.creerElement("div", "carte-espace__visuel");
    const image = document.createElement("img");
    image.src = ProSpace.cheminRessource("assets/images/" + espace.cardImage.src);
    image.alt = espace.cardImage.alt;
    image.width = espace.cardImage.width;
    image.height = espace.cardImage.height;
    image.loading = "lazy";

    const boutonFavori = ProSpace.creerElement("button", "bouton-favori");
    boutonFavori.type = "button";
    boutonFavori.appendChild(ProSpace.creerIcone("favori", "", true));
    ProSpace.mettreAJourBoutonFavori(boutonFavori, espace, "bouton-favori--actif");
    boutonFavori.addEventListener("click", function () {
      ProSpace.basculerFavori(espace.id);
      ProSpace.mettreAJourBoutonFavori(boutonFavori, espace, "bouton-favori--actif");
    });

    visuel.appendChild(image);
    visuel.appendChild(boutonFavori);

    const contenu = ProSpace.creerElement("div", "carte-espace__contenu");
    const titre = ProSpace.creerElement("h3", "carte-espace__titre", espace.title);
    const ville = ProSpace.creerElement("p", "carte-espace__localisation");
    ville.appendChild(ProSpace.creerIcone("localisation", "icone--primaire"));
    ville.appendChild(document.createTextNode(espace.displayCity));

    const avis = ProSpace.creerElement("div", "carte-espace__evaluation");
    avis.appendChild(ProSpace.creerEtoiles(espace.rating, false));
    avis.appendChild(ProSpace.creerElement("strong", "", String(espace.rating)));
    avis.appendChild(ProSpace.creerElement("span", "", "(" + espace.reviews + " avis)"));

    const caracteristiques = ProSpace.creerElement("div", "carte-espace__caracteristiques");
    const capacite = ProSpace.creerElement("span", "carte-espace__capacite");
    capacite.appendChild(ProSpace.creerIcone("utilisateurs"));
    capacite.appendChild(document.createTextNode(espace.capacity + " pers."));
    caracteristiques.appendChild(capacite);

    const separateur = ProSpace.creerElement("span", "carte-espace__separateur");
    caracteristiques.appendChild(separateur);

    for (let index = 0; index < espace.amenities.length; index++) {
      const equipement = espace.amenities[index];
      const information = libellesEquipements[equipement];

      if (information) {
        const pastille = ProSpace.creerElement("span", "pastille-equipement");
        pastille.appendChild(ProSpace.creerIcone(information.icone, "", true));
        pastille.appendChild(document.createTextNode(information.libelle));
        caracteristiques.appendChild(pastille);
      }
    }

    const pied = ProSpace.creerElement("div", "carte-espace__pied");
    const prix = ProSpace.creerElement("p", "carte-espace__prix");
    prix.appendChild(ProSpace.creerElement("strong", "", espace.priceHour + "€"));
    prix.appendChild(ProSpace.creerElement("span", "", "/heure"));

    const lien = ProSpace.creerElement("a", "bouton bouton--primaire", "Voir la fiche");
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

    for (let index = 0; index < espacesFiltres.length; index++) {
      const espace = espacesFiltres[index];
      listeEspaces.appendChild(creerCarteCatalogue(espace));
    }

    let libelleResultats = nombre + " espace disponible";

    if (nombre !== 1) {
      libelleResultats = nombre + " espaces disponibles";
    }

    let filtresActifs = false;

    if (filtreVille.value || filtreCapacite.value || lireEquipementsSelectionnes().length > 0) {
      filtresActifs = true;
    }

    titreResultats.textContent = libelleResultats;

    if (filtresActifs) {
      resumeResultats.textContent = libelleResultats;
    } else {
      resumeResultats.textContent = "";
    }

    resumeResultats.hidden = !filtresActifs;
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
      afficherResultats();
    } catch (erreur) {
      erreurChargement.hidden = false;
      resumeResultats.textContent = "Chargement impossible";
      resumeResultats.hidden = false;
    }

    chargement.hidden = true;
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
