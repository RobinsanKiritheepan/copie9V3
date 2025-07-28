// Script du chatbot simple
// Ce module injecte un bouton de chat et une fenêtre de conversation dans les
// pages du site. Les réponses sont basées sur des phrases clés très
// générales pour offrir une aide rapide aux visiteurs. Aucune requête vers
// un service externe n'est effectuée.

(function() {
  document.addEventListener('DOMContentLoaded', () => {
    // Création du bouton de bascule du chat
    const toggleBtn = document.createElement('button');
    toggleBtn.id = 'chatToggleBtn';
    toggleBtn.textContent = 'Chat';
    // Style du bouton: position fixed en bas à droite
    Object.assign(toggleBtn.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      zIndex: '1060',
      backgroundColor: '#007bff',
      color: '#fff',
      border: 'none',
      borderRadius: '50%',
      width: '60px',
      height: '60px',
      fontSize: '14px',
      cursor: 'pointer',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
    });
    document.body.appendChild(toggleBtn);

    // Création de la fenêtre de chat améliorée
    const chatWindow = document.createElement('div');
    chatWindow.id = 'chatWindow';
    Object.assign(chatWindow.style, {
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      width: '350px',
      height: '450px',
      backgroundColor: '#fff',
      border: '1px solid #ccc',
      borderRadius: '8px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
      display: 'none',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: '1060'
    });
    // En‑tête du chat avec titre et bouton de fermeture
    const header = document.createElement('div');
    header.style.backgroundColor = '#007bff';
    header.style.color = '#fff';
    header.style.padding = '8px 12px';
    header.style.fontWeight = 'bold';
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.textContent = 'Chat';
    const closeIcon = document.createElement('span');
    closeIcon.textContent = '×';
    closeIcon.style.cursor = 'pointer';
    closeIcon.style.fontSize = '1.2rem';
    closeIcon.addEventListener('click', () => {
      chatWindow.style.display = 'none';
    });
    header.appendChild(closeIcon);
    chatWindow.appendChild(header);
    // Conteneur des messages
    const messagesDiv = document.createElement('div');
    messagesDiv.id = 'chatMessages';
    Object.assign(messagesDiv.style, {
      padding: '10px',
      overflowY: 'auto',
      flex: '1',
      fontSize: '0.9rem',
      backgroundColor: '#f9f9f9'
    });
    chatWindow.appendChild(messagesDiv);
    // Barre d'entrée
    const inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      display: 'flex',
      borderTop: '1px solid #eee',
      padding: '6px'
    });
    const inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Écrivez votre message...';
    Object.assign(inputField.style, {
      flex: '1',
      border: '1px solid #ccc',
      borderRadius: '4px',
      padding: '6px 8px',
      marginRight: '6px'
    });
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
      }
    });
    const sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.textContent = 'Envoyer';
    Object.assign(sendBtn.style, {
      border: 'none',
      backgroundColor: '#28a745',
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '4px',
      cursor: 'pointer'
    });
    sendBtn.addEventListener('click', () => {
      sendMessage();
    });
    inputContainer.appendChild(inputField);
    inputContainer.appendChild(sendBtn);
    chatWindow.appendChild(inputContainer);
    document.body.appendChild(chatWindow);

    /**
     * Met à jour la taille et la position du chat et du bouton selon la largeur de l'écran.
     * Sur mobile (moins de 600px de largeur), la fenêtre occupe une grande partie de l'écran
     * pour rester lisible et le bouton est plus petit.
     */
    function updateChatLayout() {
      const isMobile = window.innerWidth < 600;
      if (isMobile) {
        // Fenêtre de chat plus large et plus basse sur mobile
        chatWindow.style.width = '90vw';
        chatWindow.style.height = '60vh';
        chatWindow.style.right = '5vw';
        chatWindow.style.bottom = '80px';
        // Bouton plus petit
        toggleBtn.style.width = '50px';
        toggleBtn.style.height = '50px';
      } else {
        chatWindow.style.width = '350px';
        chatWindow.style.height = '450px';
        chatWindow.style.right = '20px';
        chatWindow.style.bottom = '100px';
        toggleBtn.style.width = '60px';
        toggleBtn.style.height = '60px';
      }
    }
    // Mettre à jour immédiatement et lors du redimensionnement
    updateChatLayout();
    window.addEventListener('resize', updateChatLayout);

    // Bascule de visibilité
    toggleBtn.addEventListener('click', () => {
      chatWindow.style.display = chatWindow.style.display === 'none' ? 'flex' : 'none';
    });

    /**
     * Ajoute un message texte dans l'interface et scrolle vers le bas
     * @param {string} text Contenu du message
     * @param {boolean} isUser Indique si le message est celui de l'utilisateur
     */
    function addMessage(text, isUser) {
      const msg = document.createElement('div');
      msg.textContent = text;
      Object.assign(msg.style, {
        backgroundColor: isUser ? '#e9f5ff' : '#f8f9fa',
        padding: '6px 10px',
        marginBottom: '5px',
        borderRadius: '6px',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '100%',
        wordWrap: 'break-word'
      });
      messagesDiv.appendChild(msg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * Ajoute des boutons d'options dans le chat lorsque la question n'est pas comprise.
     * Chaque option déclenche l'envoi automatique de la requête correspondante.
     * @param {Array<{label: string, keyword: string}>} options Liste d'options proposées
     */
    function addOptions(options) {
      const container = document.createElement('div');
      Object.assign(container.style, {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '6px'
      });
      options.forEach(opt => {
        // Crée un élément de liste sobre avec un trait en bas et une case cliquable
        const item = document.createElement('div');
        Object.assign(item.style, {
          width: '100%',
          padding: '8px 6px',
          borderBottom: '1px solid #e0e0e0',
          cursor: 'pointer',
          fontSize: '0.9rem',
          backgroundColor: '#fafafa',
          display: 'flex',
          alignItems: 'center'
        });
        // Case vide (checkbox) avec une coche cachée
        const checkbox = document.createElement('span');
        Object.assign(checkbox.style, {
          display: 'inline-block',
          width: '16px',
          height: '16px',
          border: '1px solid #007bff',
          borderRadius: '3px',
          marginRight: '8px',
          position: 'relative'
        });
        const tick = document.createElement('span');
        tick.textContent = '✓';
        Object.assign(tick.style, {
          position: 'absolute',
          left: '2px',
          top: '-2px',
          fontSize: '16px',
          color: '#007bff',
          opacity: '0',
          transform: 'scale(0.5)',
          transition: 'opacity 0.2s ease, transform 0.2s ease'
        });
        checkbox.appendChild(tick);
        // Texte du choix
        const label = document.createElement('span');
        label.textContent = opt.label;
        // Ajout au conteneur
        item.appendChild(checkbox);
        item.appendChild(label);
        item.addEventListener('click', () => {
          // Anime la coche
          tick.style.opacity = '1';
          tick.style.transform = 'scale(1)';
          // Ajouter la requête de l'utilisateur
          addMessage(opt.label, true);
          const resp = getBotResponse(opt.keyword || opt.label);
          setTimeout(() => {
            if (typeof resp === 'string') {
              addMessage(resp, false);
            } else if (resp && resp.text) {
              addMessage(resp.text, false);
              if (Array.isArray(resp.options)) {
                addOptions(resp.options);
              }
            }
          }, 300);
        });
        container.appendChild(item);
      });
      messagesDiv.appendChild(container);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * Envoie le message de l'utilisateur et gère la réponse du bot
     */
    function sendMessage() {
      const text = inputField.value.trim();
      if (!text) return;
      addMessage(text, true);
      inputField.value = '';
      // Génération de la réponse
      const response = getBotResponse(text);
      setTimeout(() => {
        // Si la réponse est une chaîne simple, l'afficher directement
        if (typeof response === 'string') {
          addMessage(response, false);
        } else if (response && response.text) {
          // Affiche le texte puis les options proposées
          addMessage(response.text, false);
          if (Array.isArray(response.options)) {
            addOptions(response.options);
          }
        }
      }, 500);
    }

    /**
     * Retourne une réponse en fonction du message de l'utilisateur
     * @param {string} msg Message de l'utilisateur
     * @returns {string} Réponse du bot
     */
    function getBotResponse(msg) {
      const lower = msg.toLowerCase();
      // Exemple de réponses basées sur des mots-clés
      if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello')) {
        return 'Bonjour ! Comment puis-je vous aider ?';
      }
      if (lower.includes('horaire') || lower.includes('ouvert')) {
        return 'Nous sommes ouverts du lundi au vendredi de 9h à 18h et le samedi de 10h à 14h.';
      }
      if (lower.includes('prix') || lower.includes('tarif')) {
        return 'Nos tarifs varient selon les services. Vous pouvez consulter la page « Demande Devis » pour obtenir un devis personnalisé.';
      }
      if (lower.includes('service') || lower.includes('offre') || lower.includes('propose')) {
        return 'Nous proposons des services de photocopie, impression numérique et offset, numérisation, et bien plus encore.';
      }
      // Réponse aux demandes sur les produits : proposer des catégories disponibles
      if (lower.includes('produit')) {
        return {
          text: 'Nous proposons plusieurs catégories de produits. Sélectionnez celle qui vous intéresse :',
          options: [
            { label: 'Impression Numérique & Offset', keyword: 'impression' }
            // D'autres catégories pourraient être ajoutées ici
          ]
        };
      }
      // Réponse détaillée pour la catégorie Impression
      if (lower.includes('impression')) {
        return 'Notre catégorie « Impression Numérique & Offset » comprend des impressions de haute qualité pour tous vos besoins professionnels. N\'hésitez pas à consulter la page correspondante pour plus de détails.';
      }
      if (lower.includes('contact') || lower.includes('téléphone') || lower.includes('mail')) {
        return 'Vous pouvez nous contacter par téléphone au 07 73 00 66 63 ou par email à copie93120@gmail.com.';
      }
      // Réponse pour les devis
      if (lower.includes('devis')) {
        return 'Pour recevoir un devis personnalisé, veuillez visiter la page « Demande Devis » et remplir le formulaire.';
      }
      // Lorsque le message n'est pas reconnu, retourner un objet avec texte et options cliquables
      return {
        text: 'Je ne comprends pas votre demande. Voici quelques options utiles :',
        options: [
          { label: 'Services', keyword: 'services' },
          { label: 'Produits', keyword: 'produits' },
          { label: 'Contact', keyword: 'contact' },
          { label: 'Devis', keyword: 'devis' }
        ]
      };
    }
  });
})();