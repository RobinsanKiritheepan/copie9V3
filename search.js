// Script de barre de recherche pour filtrer les éléments en temps réel
// Ce script insère des champs de recherche sur les pages contenant des
// conteneurs de services ou de produits et filtre les cartes en fonction du
// texte saisi par l'utilisateur.

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    /**
     * Insère une barre de recherche au-dessus du conteneur ciblé et filtre les
     * cartes enfant en fonction du texte saisi.
     * @param {HTMLElement} container Le conteneur dont les éléments doivent être filtrés
     * @param {string} itemSelector Sélecteur CSS pour cibler les éléments à filtrer
     * @param {string} placeholder Texte à afficher dans la barre de recherche
     */
    function createSearchFor(container, itemSelector, placeholder) {
      if (!container) return;
      // Créer l'élément input
      const input = document.createElement('input');
      input.type = 'text';
      input.className = 'form-control mb-3';
      input.placeholder = placeholder;
      // Insérer avant le conteneur
      container.parentNode.insertBefore(input, container);
      input.addEventListener('input', () => {
        const query = input.value.trim().toLowerCase();
        const items = container.querySelectorAll(itemSelector);
        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          // Afficher ou masquer en fonction de la présence de la chaîne
          item.style.display = text.includes(query) ? '' : 'none';
        });
      });
    }

    // Filtrer les services sur la page d'accueil
    const servicesContainer = document.getElementById('servicesContainer');
    if (servicesContainer) {
      createSearchFor(servicesContainer, '.service-card', 'Rechercher un service...');
    }
    // Filtrer les produits sur la page Nos Produits ou autres pages
    const productCategoriesContainer = document.getElementById('productCategoriesContainer');
    if (productCategoriesContainer) {
      createSearchFor(productCategoriesContainer, '.product-category', 'Rechercher un produit...');
    }
    // Filtrer les cartes dans la page d'impression numérique & offset si nécessaire
    const impressionProductsContainer = document.getElementById('impressionProductsContainer');
    if (impressionProductsContainer) {
      createSearchFor(impressionProductsContainer, '.product-card', 'Rechercher un produit...');
    }
  });
})();