// Script d’édition en mode administrateur
// Ce script active des outils d’édition sur toutes les pages lorsque l’utilisateur est connecté
// en tant qu’administrateur. Il permet de modifier du texte, d’ajouter et de supprimer des
// sections personnalisées et des cartes produits, et de gérer la déconnexion.

(() => {
  // Raccourci clavier pour accéder à la page de connexion admin.
  // Si l'utilisateur appuie sur Ctrl+Shift+A (ou Ctrl+Shift+a), il est
  // redirigé vers la page 'admin.html'. Cela permet aux administrateurs de
  // s'authentifier même lorsque le lien « Admin » est masqué dans la barre de
  // navigation. La redirection est effectuée sur toutes les pages où ce
  // script est chargé.
  document.addEventListener('keydown', (e) => {
    // Vérifier la combinaison de touches
    if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
      e.preventDefault();
      // Rediriger uniquement si l'utilisateur n'est pas déjà sur admin.html
      const path = window.location.pathname.split('/').pop();
      if (path !== 'admin.html') {
        window.location.href = 'admin.html';
      }
    }
  });
  document.addEventListener('DOMContentLoaded', () => {
    // Détermine si l'utilisateur est connecté en tant qu'administrateur.
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    /*
     * Masque le lien « Admin » dans la barre de navigation pour les
     * visiteurs qui ne sont pas connectés. Le lien vers la page de connexion
     * reste visible uniquement aux administrateurs afin d'éviter de rendre
     * apparent le mode d'édition lorsqu'il n'est pas autorisé. Cette
     * opération est effectuée avant d'activer les fonctionnalités
     * d'administration pour permettre un retour anticipé en cas d'absence
     * d'authentification.
     */
    document.querySelectorAll('a[href="admin.html"]').forEach(link => {
      if (!isAdmin) {
        link.style.display = 'none';
      } else {
        // S'assurer que le lien est visible en mode administrateur
        link.style.display = '';
      }
    });

    // Si l'utilisateur n'est pas administrateur, on ne poursuit pas
    // l'initialisation de l'interface d'administration.
    if (!isAdmin) return;

    // Identifie le nom de la page (sans l’extension .html) pour différencier les clés de stockage
    const pageName = (() => {
      const path = window.location.pathname.split('/').pop() || 'index.html';
      return path.replace(/\.html$/, '') || 'index';
    })();

    /**
     * Applique un comportement modifiable à un élément donné. Un petit bouton d’édition
     * est inséré après l’élément et un clic dessus affiche un prompt pour modifier le
     * contenu. Le texte saisi est enregistré dans localStorage sous la clé fournie.
     * @param {HTMLElement} el L’élément dont le texte doit être modifiable
     * @param {string} storageKey La clé utilisée pour persister la valeur dans localStorage
     */
    function setupEditable(el, storageKey) {
      // Charge la valeur enregistrée pour cet élément si elle existe
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        el.textContent = saved;
      }
      // Ne créer le bouton d’édition qu’une fois par élément
      if (el.dataset.editBtnAdded) return;
      // Utiliser un élément span simple pour éviter les effets de bord des boutons Bootstrap
      const editBtn = document.createElement('span');
      editBtn.textContent = 'Modifier';
      editBtn.title = 'Modifier ce contenu';
      // Style de lien : couleur et curseur
      editBtn.style.color = '#007bff';
      editBtn.style.cursor = 'pointer';
      editBtn.style.fontSize = '0.75rem';
      editBtn.style.marginLeft = '6px';
      editBtn.style.textDecoration = 'underline';
      editBtn.addEventListener('click', () => {
        // Utiliser une modale pour modifier le contenu de l’élément
        openModal('Modifier le contenu', [
          { label: 'Contenu', value: el.textContent.trim(), type: 'textarea' }
        ], (values) => {
          const newVal = values[0];
          if (newVal !== undefined && newVal !== null) {
            el.textContent = newVal;
            localStorage.setItem(storageKey, newVal);
          }
        });
      });
      el.after(editBtn);
      el.dataset.editBtnAdded = 'true';
    }

    /**
     * Crée et insère la barre d’outils d’administration en haut de la page. Cette barre
     * contient des boutons pour ajouter des sections et des produits, ainsi qu’un bouton
     * pour se déconnecter.
     */
    function initAdminToolbar() {
      const nav = document.querySelector('nav');
      const toolbar = document.createElement('div');
      // Utiliser des classes Bootstrap pour l’apparence
      toolbar.className = 'bg-warning text-dark p-2 d-flex flex-wrap align-items-center justify-content-between';
      toolbar.style.borderBottom = '1px solid #e0a800';
      // Libellé
      const label = document.createElement('span');
      label.innerHTML = '<strong>Mode administrateur</strong>'; 
      toolbar.appendChild(label);
      // Conteneur pour les boutons
      const btnGroup = document.createElement('div');
      btnGroup.className = 'btn-group btn-group-sm';
      btnGroup.role = 'group';

      // Bouton ajouter section
      const addSectionBtn = document.createElement('button');
      addSectionBtn.type = 'button';
      addSectionBtn.className = 'btn btn-outline-dark';
      addSectionBtn.textContent = 'Ajouter une section';
      addSectionBtn.addEventListener('click', () => {
        // Demander le titre, le contenu et une image optionnelle
        openModal('Nouvelle section', [
          { label: 'Titre', value: '', type: 'text' },
          { label: 'Contenu', value: '', type: 'textarea' },
          { label: 'Image (optionnelle)', value: '', type: 'file' }
        ], (values) => {
          const title = values[0];
          const text = values[1];
          const imageData = values[2] || '';
          if (!title) return;
          const id = Date.now().toString();
          const sectionData = { id, title, text };
          if (imageData) {
            sectionData.image = imageData;
          }
          insertCustomSection(sectionData);
          // Persister la nouvelle section dans la liste
          let sections = [];
          try {
            sections = JSON.parse(localStorage.getItem(getSectionsKey())) || [];
          } catch (e) {
            sections = [];
          }
          sections.push(sectionData);
          localStorage.setItem(getSectionsKey(), JSON.stringify(sections));
        });
      });
      btnGroup.appendChild(addSectionBtn);

      // Bouton ajouter produit (uniquement si la page contient un conteneur de produits)
      const productContainer = document.getElementById('productCategoriesContainer') || document.getElementById('impressionProductsContainer');
      const servicesContainer = document.getElementById('servicesContainer');
      if (productContainer || servicesContainer) {
        const addProductBtn = document.createElement('button');
        addProductBtn.type = 'button';
        addProductBtn.className = 'btn btn-outline-dark';
        // Intitulé selon le contexte
        addProductBtn.textContent = servicesContainer ? 'Ajouter un service' : 'Ajouter un produit';
      addProductBtn.addEventListener('click', () => {
          // Utiliser une modale pour saisir les informations du produit ou service
          const itemLabel = servicesContainer ? 'Nouveau service' : 'Nouveau produit';
          // Ajoute un champ de fichier pour permettre l’upload d’une image personnalisée
          openModal(itemLabel, [
            { label: 'Titre', value: '', type: 'text' },
            { label: 'Description', value: '', type: 'textarea' },
            { label: 'Lien (laisser vide si aucun)', value: '', type: 'text' },
            { label: 'Image (optionnelle)', value: '', type: 'file' }
          ], (values) => {
            const title = values[0];
            const description = values[1];
            const link = values[2] || '#';
            const imageData = values[3] || '';
            if (!title) return;
            const id = Date.now().toString();
            const productData = { id, title, description, link };
            if (imageData) {
              productData.image = imageData;
            }
            insertProductCard(productData);
            // Mémoriser le produit
            let products = [];
            try {
              products = JSON.parse(localStorage.getItem(getProductsKey())) || [];
            } catch (e) {
              products = [];
            }
            products.push(productData);
            localStorage.setItem(getProductsKey(), JSON.stringify(products));
          });
        });
        btnGroup.appendChild(addProductBtn);
      }

      // Bouton ajouter image pour la galerie (si un conteneur de galerie est présent)
      const galleryContainer = document.getElementById('galleryContainer');
      if (galleryContainer) {
        const addImageBtn = document.createElement('button');
        addImageBtn.type = 'button';
        addImageBtn.className = 'btn btn-outline-dark';
        addImageBtn.textContent = 'Ajouter une image';
        addImageBtn.addEventListener('click', () => {
          // Ouvrir une modale pour sélectionner l’image et un texte alternatif optionnel
          openModal('Nouvelle image de galerie', [
            { label: 'Image', value: '', type: 'file' },
            { label: 'Texte alternatif (optionnel)', value: '', type: 'text' }
          ], (vals) => {
            const imgData = vals[0];
            const altText = vals[1] || '';
            if (!imgData) return;
            const id = Date.now().toString();
            const data = { id, image: imgData };
            if (altText) data.alt = altText;
            insertGalleryImage(data);
            // Persister la nouvelle image dans localStorage
            let gallery = [];
            try {
              gallery = JSON.parse(localStorage.getItem(getGalleryKey())) || [];
            } catch (e) {
              gallery = [];
            }
            gallery.push(data);
            localStorage.setItem(getGalleryKey(), JSON.stringify(gallery));
          });
        });
        btnGroup.appendChild(addImageBtn);
      }

      // Bouton exporter les modifications sous forme de fichier JSON
      const exportBtn = document.createElement('button');
      exportBtn.type = 'button';
      exportBtn.className = 'btn btn-outline-dark';
      exportBtn.textContent = 'Exporter modifications';
      exportBtn.addEventListener('click', () => {
        // Récupérer les sections, produits et images de galerie sauvegardés
        let sections = [];
        let products = [];
        let gallery = [];
        try {
          sections = JSON.parse(localStorage.getItem(getSectionsKey())) || [];
        } catch (e) {
          sections = [];
        }
        try {
          products = JSON.parse(localStorage.getItem(getProductsKey())) || [];
        } catch (e) {
          products = [];
        }
        try {
          gallery = JSON.parse(localStorage.getItem(getGalleryKey())) || [];
        } catch (e) {
          gallery = [];
        }
        // Récupérer les contenus modifiés des éléments data‑editable de la page
        const editableTexts = {};
        document.querySelectorAll('[data-editable]').forEach(el => {
          const key = el.getAttribute('data-editable');
          const val = localStorage.getItem(key);
          if (val) {
            editableTexts[key] = val;
          }
        });
        const exportData = {
          sections,
          products,
          gallery,
          editableTexts
        };
        // Convertir en JSON et déclencher le téléchargement
        const jsonStr = JSON.stringify(exportData, null, 2);
        downloadFile(jsonStr, `modifications_${pageName}.json`);
      });
      btnGroup.appendChild(exportBtn);

      // Bouton réinitialiser la page (supprimer toutes les sections et produits personnalisés)
      const resetBtn = document.createElement('button');
      resetBtn.type = 'button';
      resetBtn.className = 'btn btn-outline-dark';
      resetBtn.textContent = 'Réinitialiser la page';
      resetBtn.addEventListener('click', () => {
        const ok = confirm('Voulez-vous vraiment réinitialiser cette page ? Toutes les sections et cartes ajoutées seront supprimées.');
        if (!ok) return;
        // Supprimer les listes de sections, produits et images de galerie pour cette page
        localStorage.removeItem(getSectionsKey());
        localStorage.removeItem(getProductsKey());
        localStorage.removeItem(getGalleryKey());
        // Supprimer toutes les clés associées aux éléments personnalisés
        for (const key of Object.keys(localStorage)) {
          if (key.endsWith('_title') || key.endsWith('_text')) {
            localStorage.removeItem(key);
          }
        }
        // Recharger la page pour appliquer les modifications
        location.reload();
      });
      btnGroup.appendChild(resetBtn);

      // Bouton changer le mot de passe administrateur
      const changePwdBtn = document.createElement('button');
      changePwdBtn.type = 'button';
      changePwdBtn.className = 'btn btn-outline-dark';
      changePwdBtn.textContent = 'Changer mot de passe';
      changePwdBtn.addEventListener('click', () => {
        // Demander à l'utilisateur de saisir un nouveau mot de passe. Un prompt est
        // utilisé ici pour rester dans l'esprit du site statique. On pourrait
        // également utiliser la modale d'administration.
        const newPwd = prompt('Entrez le nouveau mot de passe administrateur :');
        if (newPwd && newPwd.trim().length > 0) {
          localStorage.setItem('adminPassword', newPwd.trim());
          alert('Le mot de passe a été mis à jour.');
        } else if (newPwd !== null) {
          alert('Le mot de passe ne peut pas être vide.');
        }
      });
      btnGroup.appendChild(changePwdBtn);

      // Bouton déconnexion
      const logoutBtn = document.createElement('button');
      logoutBtn.type = 'button';
      logoutBtn.className = 'btn btn-outline-dark';
      logoutBtn.textContent = 'Se déconnecter';
      logoutBtn.addEventListener('click', () => {
        // Déconnecte l'administrateur mais ne réinitialise pas le mot de passe modifié
        localStorage.removeItem('isAdmin');
        location.href = 'index.html';
      });
      btnGroup.appendChild(logoutBtn);
      toolbar.appendChild(btnGroup);
      // Insérer après la barre de navigation si elle existe, sinon en haut du body
      if (nav && nav.parentNode) {
        nav.insertAdjacentElement('afterend', toolbar);
      } else {
        document.body.insertBefore(toolbar, document.body.firstChild);
      }
    }

    /**
     * Retourne la clé de stockage pour les sections personnalisées de la page courante
     */
    function getSectionsKey() {
      return `customSections_${pageName}`;
    }
    /**
     * Retourne la clé de stockage pour les produits de la page courante
     */
    function getProductsKey() {
      return `customProducts_${pageName}`;
    }

    /**
     * Retourne la clé de stockage pour les images de galerie de la page courante
     */
    function getGalleryKey() {
      return `customGallery_${pageName}`;
    }

    /**
     * Insère une image dans la galerie et ajoute des contrôles d’édition.
     * @param {{id:string,image:string,alt?:string}} data Informations de l’image
     */
    function insertGalleryImage(data) {
      const container = document.getElementById('galleryContainer');
      if (!container) return;
      const col = document.createElement('div');
      col.className = 'col-md-4';
      col.dataset.galleryKey = data.id;
      const imgEl = document.createElement('img');
      imgEl.src = data.image;
      imgEl.className = 'gallery-img';
      imgEl.alt = data.alt || '';
      col.appendChild(imgEl);
      // Groupe de boutons de contrôle
      const controls = document.createElement('div');
      controls.className = 'mt-2';
      // Bouton monter
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
      upBtn.textContent = '↑';
      upBtn.title = 'Monter cette image';
      upBtn.addEventListener('click', () => {
        moveGallery(data.id, 'up');
      });
      // Bouton descendre
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
      downBtn.textContent = '↓';
      downBtn.title = 'Descendre cette image';
      downBtn.addEventListener('click', () => {
        moveGallery(data.id, 'down');
      });
      // Bouton supprimer
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn-sm btn-danger';
      removeBtn.textContent = 'Supprimer';
      removeBtn.addEventListener('click', () => {
        // Retirer du stockage
        let gallery = [];
        try {
          gallery = JSON.parse(localStorage.getItem(getGalleryKey())) || [];
        } catch (e) {
          gallery = [];
        }
        const idx = gallery.findIndex(img => img.id === data.id);
        if (idx !== -1) {
          gallery.splice(idx, 1);
          localStorage.setItem(getGalleryKey(), JSON.stringify(gallery));
        }
        col.remove();
      });
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(removeBtn);
      col.appendChild(controls);
      container.appendChild(col);
    }

    /**
     * Déplace une image de galerie vers le haut ou le bas dans la liste et le DOM.
     * @param {string} id Identifiant unique de l’image
     * @param {'up'|'down'} direction Direction du déplacement
     */
    function moveGallery(id, direction) {
      let gallery = [];
      try {
        gallery = JSON.parse(localStorage.getItem(getGalleryKey())) || [];
      } catch (e) {
        gallery = [];
      }
      const index = gallery.findIndex(img => img.id === id);
      if (index === -1) return;
      if (direction === 'up' && index > 0) {
        [gallery[index - 1], gallery[index]] = [gallery[index], gallery[index - 1]];
        localStorage.setItem(getGalleryKey(), JSON.stringify(gallery));
        const currentEl = document.querySelector(`[data-gallery-key="${id}"]`);
        const beforeId = gallery[index].id;
        const beforeEl = document.querySelector(`[data-gallery-key="${beforeId}"]`);
        if (currentEl && beforeEl && beforeEl.parentNode) {
          beforeEl.parentNode.insertBefore(currentEl, beforeEl);
        }
      } else if (direction === 'down' && index < gallery.length - 1) {
        [gallery[index], gallery[index + 1]] = [gallery[index + 1], gallery[index]];
        localStorage.setItem(getGalleryKey(), JSON.stringify(gallery));
        const currentEl = document.querySelector(`[data-gallery-key="${id}"]`);
        const afterId = gallery[index].id;
        const afterEl = document.querySelector(`[data-gallery-key="${afterId}"]`);
        if (currentEl && afterEl && afterEl.parentNode) {
          afterEl.parentNode.insertBefore(currentEl, afterEl.nextSibling);
        }
      }
    }

    /**
     * Charge les images de galerie personnalisées et les insère dans le DOM.
     */
    function loadCustomGallery() {
      let gallery = [];
      try {
        gallery = JSON.parse(localStorage.getItem(getGalleryKey())) || [];
      } catch (e) {
        gallery = [];
      }
      gallery.forEach(imgData => {
        insertGalleryImage(imgData);
      });
    }

    /**
     * Déclenche le téléchargement d’un fichier contenant du texte.
     * @param {string} content Le contenu textuel à enregistrer
     * @param {string} fileName Le nom du fichier à télécharger
     */
    function downloadFile(content, fileName) {
      const blob = new Blob([content], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }

    /**
     * Crée le conteneur de fenêtre modale si nécessaire. La modale est utilisée
     * pour saisir des informations (ajout de section/produit) ou modifier du texte.
     */
    function ensureModal() {
      if (document.getElementById('adminModal')) return;
      const modal = document.createElement('div');
      modal.id = 'adminModal';
      modal.style.position = 'fixed';
      modal.style.top = '0';
      modal.style.left = '0';
      modal.style.width = '100%';
      modal.style.height = '100%';
      modal.style.display = 'none';
      modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
      modal.style.zIndex = '1050';
      // Contenu interne
      const content = document.createElement('div');
      content.id = 'adminModalContent';
      content.style.backgroundColor = '#fff';
      content.style.maxWidth = '500px';
      content.style.margin = '10% auto';
      content.style.padding = '20px';
      content.style.borderRadius = '4px';
      content.style.boxShadow = '0 2px 10px rgba(0,0,0,0.3)';
      modal.appendChild(content);
      document.body.appendChild(modal);
    }

    /**
     * Affiche une fenêtre modale avec un formulaire composé de plusieurs champs.
     * Une fois l’utilisateur ayant cliqué sur "Enregistrer", la fonction onSave
     * est appelée avec un tableau de valeurs correspondant aux champs.
     * @param {string} title Titre affiché dans la modale
     * @param {Array<{label:string,value:string,type?:string}>} fields Les champs à afficher
     * @param {function(string[]):void} onSave Callback exécutée après validation
     */
    function openModal(title, fields, onSave) {
      ensureModal();
      const modal = document.getElementById('adminModal');
      const content = document.getElementById('adminModalContent');
      // Nettoyer le contenu
      content.innerHTML = '';
      // Titre
      const titleEl = document.createElement('h5');
      titleEl.textContent = title;
      titleEl.className = 'mb-3';
      content.appendChild(titleEl);
      // Formulaire
      const form = document.createElement('form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
      const inputs = [];
      fields.forEach((field, idx) => {
        const group = document.createElement('div');
        group.className = 'form-group';
        const labelEl = document.createElement('label');
        labelEl.textContent = field.label;
        group.appendChild(labelEl);
        let inputEl;
        if (field.type === 'textarea') {
          inputEl = document.createElement('textarea');
          inputEl.className = 'form-control';
          inputEl.rows = 3;
          inputEl.value = field.value || '';
        } else {
          inputEl = document.createElement('input');
          inputEl.className = 'form-control';
          inputEl.type = field.type || 'text';
          inputEl.value = field.value || '';
        }
        inputs.push(inputEl);
        group.appendChild(inputEl);
        form.appendChild(group);
      });
      content.appendChild(form);
      // Boutons
      const btnGroup = document.createElement('div');
      btnGroup.className = 'mt-3 d-flex justify-content-end';
      const cancelBtn = document.createElement('button');
      cancelBtn.type = 'button';
      cancelBtn.className = 'btn btn-secondary mr-2';
      cancelBtn.textContent = 'Annuler';
      cancelBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
      const saveBtn = document.createElement('button');
      saveBtn.type = 'button';
      saveBtn.className = 'btn btn-primary';
      saveBtn.textContent = 'Enregistrer';
      saveBtn.addEventListener('click', () => {
        // Pour les champs de type fichier, convertir en DataURL
        const promises = inputs.map((inp, idx) => {
          const fieldDef = fields[idx];
          if (fieldDef && fieldDef.type === 'file') {
            const file = inp.files && inp.files[0];
            if (file) {
              return new Promise(resolve => {
                const reader = new FileReader();
                reader.onload = function(ev) {
                  resolve(ev.target.result);
                };
                reader.readAsDataURL(file);
              });
            }
            return Promise.resolve('');
          }
          return Promise.resolve(inp.value);
        });
        Promise.all(promises).then(values => {
          modal.style.display = 'none';
          if (typeof onSave === 'function') onSave(values);
        });
      });
      btnGroup.appendChild(cancelBtn);
      btnGroup.appendChild(saveBtn);
      content.appendChild(btnGroup);
      // Afficher la modale
      modal.style.display = 'block';
    }

    /**
     * Insère une section personnalisée à partir de ses données. Cette fonction crée
     * la structure HTML, applique l’édition sur le titre et le contenu et ajoute
     * un bouton de suppression. La section est insérée juste avant le pied de page.
     * @param {{id:string,title:string,text:string}} data Les informations de la section
     */
    function insertCustomSection(data) {
      const footer = document.querySelector('footer');
      // Crée une section container
      const section = document.createElement('section');
      section.className = 'container my-4';
      section.dataset.sectionKey = data.id;
      // Titre
      const titleEl = document.createElement('h3');
      titleEl.textContent = data.title;
      const titleKey = `${data.id}_title`;
      titleEl.setAttribute('data-editable', titleKey);
      // Paragraphe
      const pEl = document.createElement('p');
      pEl.textContent = data.text;
      const textKey = `${data.id}_text`;
      pEl.setAttribute('data-editable', textKey);
      // Création d’une image si fournie
      let imgEl;
      if (data.image) {
        imgEl = document.createElement('img');
        imgEl.src = data.image;
        imgEl.alt = data.title || '';
        imgEl.className = 'img-fluid mb-2';
      }
      // Groupe de commandes de gestion (déplacement, changement d’image et suppression)
      const controls = document.createElement('div');
      controls.className = 'mb-2';
      // Bouton déplacement vers le haut
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
      upBtn.textContent = '↑';
      upBtn.title = 'Monter cette section';
      upBtn.addEventListener('click', () => {
        moveCustomSection(data.id, 'up');
      });
      // Bouton déplacement vers le bas
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
      downBtn.textContent = '↓';
      downBtn.title = 'Descendre cette section';
      downBtn.addEventListener('click', () => {
        moveCustomSection(data.id, 'down');
      });
      // Bouton de suppression
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      removeBtn.className = 'btn btn-sm btn-danger';
      removeBtn.textContent = 'Supprimer cette section';
      removeBtn.title = 'Supprimer définitivement cette section';
      removeBtn.addEventListener('click', () => {
        // Retirer l’entrée du stockage
        let sections = [];
        try {
          sections = JSON.parse(localStorage.getItem(getSectionsKey())) || [];
        } catch (e) {
          sections = [];
        }
        const index = sections.findIndex(s => s.id === data.id);
        if (index !== -1) {
          sections.splice(index, 1);
          localStorage.setItem(getSectionsKey(), JSON.stringify(sections));
        }
        // Supprimer l’élément et ses clés stockées
        localStorage.removeItem(`${data.id}_title`);
        localStorage.removeItem(`${data.id}_text`);
        // Retirer la propriété image si présente
        // Les données d’image sont stockées dans la liste de sections elle-même
        section.remove();
      });
      // Lien pour ajouter ou changer l’image
      const changeImgLink = document.createElement('span');
      changeImgLink.textContent = data.image ? 'Changer l’image' : 'Ajouter une image';
      changeImgLink.style.color = '#007bff';
      changeImgLink.style.cursor = 'pointer';
      changeImgLink.style.fontSize = '0.75rem';
      changeImgLink.style.textDecoration = 'underline';
      changeImgLink.className = 'mr-2';
      changeImgLink.addEventListener('click', () => {
        openModal('Sélectionnez une image', [
          { label: 'Image', value: '', type: 'file' }
        ], (vals) => {
          const newImg = vals[0];
          if (newImg) {
            if (imgEl) {
              imgEl.src = newImg;
            } else {
              imgEl = document.createElement('img');
              imgEl.src = newImg;
              imgEl.alt = data.title || '';
              imgEl.className = 'img-fluid mb-2';
              // Insérer l’image en haut de la section
              section.insertBefore(imgEl, section.firstChild);
            }
            data.image = newImg;
            // Mettre à jour le libellé du lien
            changeImgLink.textContent = 'Changer l’image';
            // Mettre à jour la liste enregistrée
            let sectionsStored = [];
            try {
              sectionsStored = JSON.parse(localStorage.getItem(getSectionsKey())) || [];
            } catch (e) {
              sectionsStored = [];
            }
            const idx = sectionsStored.findIndex(s => s.id === data.id);
            if (idx !== -1) {
              sectionsStored[idx].image = newImg;
              localStorage.setItem(getSectionsKey(), JSON.stringify(sectionsStored));
            }
          }
        });
      });
      controls.appendChild(changeImgLink);
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(removeBtn);
      section.appendChild(controls);
      // Insérer l’image en haut si existe
      if (imgEl) {
        section.appendChild(imgEl);
      }
      section.appendChild(titleEl);
      section.appendChild(pEl);
      // Insérer avant le pied de page
      if (footer && footer.parentNode) {
        footer.parentNode.insertBefore(section, footer);
      } else {
        document.body.appendChild(section);
      }
      // Appliquer l’édition aux nouveaux éléments
      setupEditable(titleEl, titleKey);
      setupEditable(pEl, textKey);
    }

    /**
     * Déplace une section personnalisée vers le haut ou le bas dans la liste et dans le DOM.
     * @param {string} id Identifiant unique de la section
     * @param {'up'|'down'} direction Direction du déplacement
     */
    function moveCustomSection(id, direction) {
      let sections = [];
      try {
        sections = JSON.parse(localStorage.getItem(getSectionsKey())) || [];
      } catch (e) {
        sections = [];
      }
      const index = sections.findIndex(s => s.id === id);
      if (index === -1) return;
      if (direction === 'up' && index > 0) {
        // Échanger dans le tableau
        [sections[index - 1], sections[index]] = [sections[index], sections[index - 1]];
        localStorage.setItem(getSectionsKey(), JSON.stringify(sections));
        // Déplacer dans le DOM juste avant la section précédente
        const sectionEl = document.querySelector(`[data-section-key="${id}"]`);
        const prevKey = sections[index - 1].id;
        const prevEl = document.querySelector(`[data-section-key="${prevKey}"]`);
        if (sectionEl && prevEl && prevEl.parentNode) {
          prevEl.parentNode.insertBefore(sectionEl, prevEl);
        }
      } else if (direction === 'down' && index < sections.length - 1) {
        [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
        localStorage.setItem(getSectionsKey(), JSON.stringify(sections));
        const sectionEl = document.querySelector(`[data-section-key="${id}"]`);
        const nextKey = sections[index + 1].id;
        const nextEl = document.querySelector(`[data-section-key="${nextKey}"]`);
        if (sectionEl && nextEl && nextEl.parentNode) {
          // Insérer le nextEl avant sectionEl, puis ensuite replacer sectionEl après nextEl
          nextEl.parentNode.insertBefore(sectionEl, nextEl.nextSibling);
        }
      }
    }

    /**
     * Déplace une carte produit personnalisée vers le haut ou le bas dans la liste et dans le DOM.
     * Les produits ajoutés via l’interface admin sont stockés dans localStorage et peuvent
     * être réordonnés indépendamment des produits statiques définis dans le HTML.
     * @param {string} id Identifiant unique du produit à déplacer
     * @param {'up'|'down'} direction Direction du déplacement
     */
    function moveProduct(id, direction) {
      let products = [];
      try {
        products = JSON.parse(localStorage.getItem(getProductsKey())) || [];
      } catch (e) {
        products = [];
      }
      const index = products.findIndex(p => p.id === id);
      if (index === -1) return;
      if (direction === 'up' && index > 0) {
        // Échange la position dans le tableau
        [products[index - 1], products[index]] = [products[index], products[index - 1]];
        localStorage.setItem(getProductsKey(), JSON.stringify(products));
        // Déplacer le nœud dans le DOM : insérer notre élément avant celui qui se trouve maintenant à l’index actuel
        const colEl = document.querySelector(`[data-product-key="${id}"]`);
        const afterId = products[index].id; // après l’échange, l’élément situé à l’index est celui qui précède notre élément
        const afterEl = document.querySelector(`[data-product-key="${afterId}"]`);
        if (colEl && afterEl && afterEl.parentNode) {
          afterEl.parentNode.insertBefore(colEl, afterEl);
        }
      } else if (direction === 'down' && index < products.length - 1) {
        // Échange la position dans le tableau
        [products[index], products[index + 1]] = [products[index + 1], products[index]];
        localStorage.setItem(getProductsKey(), JSON.stringify(products));
        // Déplacer le nœud dans le DOM : insérer notre élément après celui qui se trouve maintenant à l’index
        const colEl = document.querySelector(`[data-product-key="${id}"]`);
        const beforeId = products[index].id; // après l’échange, l’élément situé à l’index est celui qui vient de monter
        const beforeEl = document.querySelector(`[data-product-key="${beforeId}"]`);
        if (colEl && beforeEl && beforeEl.parentNode) {
          beforeEl.parentNode.insertBefore(colEl, beforeEl.nextSibling);
        }
      }
    }

    /**
     * Crée et insère une carte produit ou service selon la page. L’élément est inséré
     * à la fin du conteneur dédié (services, produits ou impression). Un bouton de
     * suppression permet de retirer la carte et d’actualiser le stockage.
     * @param {{id:string,title:string,description:string,link:string}} data Les infos produit
     */
    function insertProductCard(data) {
      const container = document.getElementById('servicesContainer') || document.getElementById('productCategoriesContainer') || document.getElementById('impressionProductsContainer');
      if (!container) return;
      const col = document.createElement('div');
      // Choisir la classe selon le conteneur existant
      if (container.id === 'servicesContainer') {
        col.className = 'col-md-4 service-card';
      } else if (container.id === 'impressionProductsContainer') {
        col.className = 'col-md-4 product-item';
      } else {
        col.className = 'col-md-4 product-category';
      }
      const card = document.createElement('div');
      card.className = 'card h-100';
      const cardBody = document.createElement('div');
      cardBody.className = 'card-body';
      // Ajouter une image en haut de la carte si fournie
      if (data.image) {
        const imgEl = document.createElement('img');
        imgEl.src = data.image;
        imgEl.className = 'card-img-top';
        imgEl.alt = data.title || '';
        card.appendChild(imgEl);
      }
      const h5 = document.createElement('h5');
      h5.className = 'card-title';
      h5.textContent = data.title;
      const titleKey = `${data.id}_title`;
      h5.setAttribute('data-editable', titleKey);
      const p = document.createElement('p');
      p.className = 'card-text';
      p.textContent = data.description;
      const textKey = `${data.id}_text`;
      p.setAttribute('data-editable', textKey);
      cardBody.appendChild(h5);
      cardBody.appendChild(p);
      // Lien vers une page détaillée si fourni
      if (data.link) {
        const linkEl = document.createElement('a');
        linkEl.className = 'btn btn-primary mt-2';
        linkEl.href = data.link;
        linkEl.textContent = 'Voir plus';
        cardBody.appendChild(linkEl);
      }
      // Si la carte est personnalisée et possède une image, ajouter un lien pour la modifier
      if (data.image) {
        const changeImgLink = document.createElement('span');
        changeImgLink.textContent = 'Changer l’image';
        changeImgLink.style.color = '#007bff';
        changeImgLink.style.cursor = 'pointer';
        changeImgLink.style.fontSize = '0.75rem';
        changeImgLink.style.textDecoration = 'underline';
        changeImgLink.className = 'd-block mt-2';
        changeImgLink.addEventListener('click', () => {
          // Ouvrir une modal avec un champ fichier pour sélectionner une nouvelle image
          openModal('Changer l’image', [
            { label: 'Nouvelle image', value: '', type: 'file' }
          ], (vals) => {
            const newImg = vals[0];
            if (newImg) {
              // Mettre à jour l’image dans l’élément
              if (card.querySelector('img')) {
                card.querySelector('img').src = newImg;
              } else {
                const imgTag = document.createElement('img');
                imgTag.src = newImg;
                imgTag.className = 'card-img-top';
                imgTag.alt = data.title || '';
                card.insertBefore(imgTag, card.firstChild);
              }
              data.image = newImg;
              // Mettre à jour le stockage
              let products = [];
              try {
                products = JSON.parse(localStorage.getItem(getProductsKey())) || [];
              } catch (e) {
                products = [];
              }
              const idx = products.findIndex(p => p.id === data.id);
              if (idx !== -1) {
                products[idx].image = newImg;
                localStorage.setItem(getProductsKey(), JSON.stringify(products));
              }
            }
          });
        });
        cardBody.appendChild(changeImgLink);
      }
      // Bouton supprimer
      const removeBtn = document.createElement('button');
      removeBtn.type = 'button';
      // classe btn-danger plus bas, car nous ajouterons dans un groupe de contrôles
      removeBtn.className = 'btn btn-sm btn-danger';
      removeBtn.textContent = 'Supprimer';
      removeBtn.addEventListener('click', () => {
        // Retirer du stockage
        let products = [];
        try {
          products = JSON.parse(localStorage.getItem(getProductsKey())) || [];
        } catch (e) {
          products = [];
        }
        const idx = products.findIndex(p => p.id === data.id);
        if (idx !== -1) {
          products.splice(idx, 1);
          localStorage.setItem(getProductsKey(), JSON.stringify(products));
        }
        // Supprimer les clés éditables
        localStorage.removeItem(titleKey);
        localStorage.removeItem(textKey);
        col.remove();
      });
      // Groupe de contrôles pour le déplacement et la suppression
      const controls = document.createElement('div');
      controls.className = 'mt-2';
      // Bouton monter
      const upBtn = document.createElement('button');
      upBtn.type = 'button';
      upBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
      upBtn.textContent = '↑';
      upBtn.title = 'Monter ce produit';
      upBtn.addEventListener('click', () => {
        moveProduct(data.id, 'up');
      });
      // Bouton descendre
      const downBtn = document.createElement('button');
      downBtn.type = 'button';
      downBtn.className = 'btn btn-sm btn-outline-secondary mr-1';
      downBtn.textContent = '↓';
      downBtn.title = 'Descendre ce produit';
      downBtn.addEventListener('click', () => {
        moveProduct(data.id, 'down');
      });
      controls.appendChild(upBtn);
      controls.appendChild(downBtn);
      controls.appendChild(removeBtn);
      cardBody.appendChild(controls);
      card.appendChild(cardBody);
      col.appendChild(card);
      // Marquer la carte comme personnalisée pour un futur repérage éventuel
      col.dataset.productKey = data.id;
      col.dataset.customProduct = 'true';
      container.appendChild(col);
      // Appliquer l’édition aux nouveaux éléments
      setupEditable(h5, titleKey);
      setupEditable(p, textKey);
    }

    /**
     * Charge les sections personnalisées précédemment ajoutées sur la page et les
     * insère dans le DOM.
     */
    function loadCustomSections() {
      let sections = [];
      try {
        sections = JSON.parse(localStorage.getItem(getSectionsKey())) || [];
      } catch (e) {
        sections = [];
      }
      sections.forEach(data => {
        insertCustomSection(data);
      });
    }

    /**
     * Charge les produits personnalisés enregistrés et insère les cartes
     */
    function loadCustomProducts() {
      let products = [];
      try {
        products = JSON.parse(localStorage.getItem(getProductsKey())) || [];
      } catch (e) {
        products = [];
      }
      // Compatibilité : charger d’anciennes entrées du stockage index_services pour la page d’accueil
      if (pageName === 'index') {
        try {
          const old = JSON.parse(localStorage.getItem('index_services')) || [];
          if (old.length > 0) {
            // Convertir chaque service en produit avec un identifiant unique
            old.forEach(srv => {
              const id = Date.now().toString() + Math.random().toString(36).substring(2, 8);
              const converted = { id, title: srv.title, description: srv.description, link: '#' };
              products.push(converted);
            });
            // Effacer l’ancien stockage pour éviter des doublons ultérieurs
            localStorage.removeItem('index_services');
            localStorage.setItem(getProductsKey(), JSON.stringify(products));
          }
        } catch (e) {
          // ignorer en cas de problème de parse
        }
      }
      products.forEach(data => {
        insertProductCard(data);
      });
    }

    // Initialisation générale du mode admin
    initAdminToolbar();
    // Activer l’édition des éléments existants (définis dans le HTML)
    document.querySelectorAll('[data-editable]').forEach(el => {
      const key = el.getAttribute('data-editable');
      setupEditable(el, key);
    });
    // Charger les sections et produits personnalisés depuis localStorage
    loadCustomSections();
    loadCustomProducts();
    // Charger les images de galerie personnalisées
    loadCustomGallery();
  });
})();