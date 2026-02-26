// Script du chatbot simple
// Ce module injecte un bouton de chat et une fenêtre de conversation dans les
// pages du site. Les réponses sont basées sur des phrases clés pour offrir
// une aide rapide aux visiteurs. Aucune requête vers un service externe n'est effectuée.

(function() {
  document.addEventListener('DOMContentLoaded', function() {
    // Création du bouton de bascule du chat
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'chatToggleBtn';
    toggleBtn.setAttribute('aria-label', 'Ouvrir le chat d\'assistance');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'chatWindow');
    toggleBtn.innerHTML = '💬';
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
      fontSize: '1.4rem',
      cursor: 'pointer',
      boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
      transition: 'transform .2s ease, box-shadow .2s ease'
    });
    toggleBtn.addEventListener('mouseenter', function() {
      toggleBtn.style.transform = 'scale(1.1)';
      toggleBtn.style.boxShadow = '0 6px 18px rgba(0,0,0,0.3)';
    });
    toggleBtn.addEventListener('mouseleave', function() {
      toggleBtn.style.transform = 'scale(1)';
      toggleBtn.style.boxShadow = '0 4px 12px rgba(0,0,0,0.25)';
    });
    document.body.appendChild(toggleBtn);

    // Création de la fenêtre de chat
    var chatWindow = document.createElement('div');
    chatWindow.id = 'chatWindow';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-modal', 'false');
    chatWindow.setAttribute('aria-label', 'Chat d\'assistance Copie Courneuve9');
    Object.assign(chatWindow.style, {
      position: 'fixed',
      bottom: '100px',
      right: '20px',
      width: '350px',
      height: '450px',
      backgroundColor: '#fff',
      border: 'none',
      borderRadius: '12px',
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
      display: 'none',
      flexDirection: 'column',
      overflow: 'hidden',
      zIndex: '1060'
    });

    // En-tête du chat
    var header = document.createElement('div');
    Object.assign(header.style, {
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '12px 14px',
      fontWeight: 'bold',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      fontSize: '1rem'
    });
    var headerTitle = document.createElement('span');
    headerTitle.textContent = '💬 Assistance Copie Courneuve9';
    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Fermer le chat');
    closeBtn.textContent = '×';
    Object.assign(closeBtn.style, {
      background: 'none',
      border: 'none',
      color: '#fff',
      fontSize: '1.4rem',
      cursor: 'pointer',
      lineHeight: '1',
      padding: '0 2px'
    });
    closeBtn.addEventListener('click', function() {
      chatWindow.style.display = 'none';
      toggleBtn.setAttribute('aria-expanded', 'false');
    });
    header.appendChild(headerTitle);
    header.appendChild(closeBtn);
    chatWindow.appendChild(header);

    // Conteneur des messages
    var messagesDiv = document.createElement('div');
    messagesDiv.id = 'chatMessages';
    messagesDiv.setAttribute('aria-live', 'polite');
    messagesDiv.setAttribute('aria-atomic', 'false');
    Object.assign(messagesDiv.style, {
      padding: '10px',
      overflowY: 'auto',
      flex: '1',
      fontSize: '0.88rem',
      backgroundColor: '#f4f6f8'
    });
    chatWindow.appendChild(messagesDiv);

    // Zone de saisie
    var inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      display: 'flex',
      borderTop: '1px solid #e9ecef',
      padding: '8px',
      backgroundColor: '#fff'
    });
    var inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Posez votre question…';
    inputField.setAttribute('aria-label', 'Votre message');
    Object.assign(inputField.style, {
      flex: '1',
      border: '1.5px solid #dee2e6',
      borderRadius: '20px',
      padding: '7px 14px',
      marginRight: '8px',
      fontSize: '0.88rem',
      outline: 'none'
    });
    inputField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
    });
    var sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.textContent = 'Envoyer';
    sendBtn.setAttribute('aria-label', 'Envoyer le message');
    Object.assign(sendBtn.style, {
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      padding: '7px 14px',
      borderRadius: '20px',
      cursor: 'pointer',
      fontSize: '0.88rem',
      fontWeight: '600',
      transition: 'background .2s'
    });
    sendBtn.addEventListener('mouseenter', function() { sendBtn.style.backgroundColor = '#0a58ca'; });
    sendBtn.addEventListener('mouseleave', function() { sendBtn.style.backgroundColor = '#007bff'; });
    sendBtn.addEventListener('click', sendMessage);
    inputContainer.appendChild(inputField);
    inputContainer.appendChild(sendBtn);
    chatWindow.appendChild(inputContainer);
    document.body.appendChild(chatWindow);

    // Responsive
    function updateChatLayout() {
      var isMobile = window.innerWidth < 600;
      if (isMobile) {
        chatWindow.style.width = '90vw';
        chatWindow.style.height = '60vh';
        chatWindow.style.right = '5vw';
        chatWindow.style.bottom = '85px';
        toggleBtn.style.width = '52px';
        toggleBtn.style.height = '52px';
      } else {
        chatWindow.style.width = '350px';
        chatWindow.style.height = '450px';
        chatWindow.style.right = '20px';
        chatWindow.style.bottom = '100px';
        toggleBtn.style.width = '60px';
        toggleBtn.style.height = '60px';
      }
    }
    updateChatLayout();
    window.addEventListener('resize', updateChatLayout);

    // Bascule d'affichage
    toggleBtn.addEventListener('click', function() {
      var isOpen = chatWindow.style.display !== 'none';
      chatWindow.style.display = isOpen ? 'none' : 'flex';
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (!isOpen) {
        inputField.focus();
        if (messagesDiv.children.length === 0) {
          addMessage('Bonjour ! Comment puis-je vous aider ? 😊', false);
          addOptions([
            { label: 'Nos services', keyword: 'service' },
            { label: 'Tarifs', keyword: 'prix' },
            { label: 'Horaires', keyword: 'horaire' },
            { label: 'Contact', keyword: 'contact' }
          ]);
        }
      }
    });

    /**
     * Ajoute un message dans la fenêtre de chat
     * @param {string} text Contenu du message
     * @param {boolean} isUser true = message utilisateur, false = réponse du bot
     */
    function addMessage(text, isUser) {
      var msg = document.createElement('div');
      msg.textContent = text;
      Object.assign(msg.style, {
        backgroundColor: isUser ? '#007bff' : '#fff',
        color: isUser ? '#fff' : '#212529',
        padding: '8px 12px',
        marginBottom: '6px',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
        maxWidth: '85%',
        wordWrap: 'break-word',
        boxShadow: '0 1px 3px rgba(0,0,0,.1)',
        display: 'block'
      });
      messagesDiv.appendChild(msg);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /**
     * Ajoute des boutons d'options cliquables
     * @param {Array<{label:string, keyword:string}>} options
     */
    function addOptions(options) {
      var container = document.createElement('div');
      Object.assign(container.style, {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '6px',
        marginBottom: '8px',
        paddingLeft: '4px'
      });
      options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt.label;
        Object.assign(btn.style, {
          border: '1.5px solid #007bff',
          borderRadius: '20px',
          background: '#fff',
          color: '#007bff',
          padding: '5px 12px',
          fontSize: '0.82rem',
          cursor: 'pointer',
          transition: 'background .2s, color .2s'
        });
        btn.addEventListener('mouseenter', function() {
          btn.style.background = '#007bff';
          btn.style.color = '#fff';
        });
        btn.addEventListener('mouseleave', function() {
          btn.style.background = '#fff';
          btn.style.color = '#007bff';
        });
        btn.addEventListener('click', function() {
          addMessage(opt.label, true);
          setTimeout(function() {
            var resp = getBotResponse(opt.keyword || opt.label);
            if (typeof resp === 'string') {
              addMessage(resp, false);
            } else if (resp && resp.text) {
              addMessage(resp.text, false);
              if (Array.isArray(resp.options)) addOptions(resp.options);
            }
          }, 300);
        });
        container.appendChild(btn);
      });
      messagesDiv.appendChild(container);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    /** Envoie le message de l'utilisateur */
    function sendMessage() {
      var text = inputField.value.trim();
      if (!text) return;
      addMessage(text, true);
      inputField.value = '';
      var response = getBotResponse(text);
      setTimeout(function() {
        if (typeof response === 'string') {
          addMessage(response, false);
        } else if (response && response.text) {
          addMessage(response.text, false);
          if (Array.isArray(response.options)) addOptions(response.options);
        }
      }, 500);
    }

    /** Retourne une réponse selon le message de l'utilisateur */
    function getBotResponse(msg) {
      var lower = msg.toLowerCase();
      if (lower.includes('bonjour') || lower.includes('salut') || lower.includes('hello') || lower.includes('bonsoir')) {
        return 'Bonjour ! Bienvenue chez Copie Courneuve9 😊 Comment puis-je vous aider ?';
      }
      if (lower.includes('horaire') || lower.includes('ouvert') || lower.includes('ferme')) {
        return 'Nous sommes ouverts du lundi au vendredi de 9h à 18h et le samedi de 10h à 14h. Fermé le dimanche.';
      }
      if (lower.includes('prix') || lower.includes('tarif') || lower.includes('cout') || lower.includes('coût') || lower.includes('combien')) {
        return {
          text: 'Voici nos tarifs principaux :',
          options: [
            { label: 'Photocopie N&B : 0,10€', keyword: 'photocopie' },
            { label: 'Impression couleur : 0,20€', keyword: 'impression' },
            { label: 'Numérisation : 0,15€', keyword: 'numerisation' },
            { label: 'Chemise à rabat : 20€', keyword: 'chemise' }
          ]
        };
      }
      if (lower.includes('service') || lower.includes('offre') || lower.includes('propose')) {
        return 'Nous proposons : photocopie (N&B et couleur), impression numérique et offset, numérisation de documents, et chemises à rabat personnalisées.';
      }
      if (lower.includes('photocopi')) {
        return 'Photocopie noir & blanc à partir de 0,10€/page et couleur à 0,20€/page. Qualité laser garantie !';
      }
      if (lower.includes('numeris') || lower.includes('scan')) {
        return 'Service de numérisation à 0,15€/page. Vos documents numérisés en haute résolution et envoyés par email rapidement.';
      }
      if (lower.includes('produit')) {
        return {
          text: 'Nous proposons plusieurs catégories de produits :',
          options: [
            { label: 'Impression Numérique & Offset', keyword: 'impression' },
            { label: 'Chemise à Rabat', keyword: 'chemise' },
            { label: 'Photocopie', keyword: 'photocopie' }
          ]
        };
      }
      if (lower.includes('impression')) {
        return 'Notre service d\'impression numérique et offset offre des rendus professionnels. Retrouvez tous les détails sur la page Impression.';
      }
      if (lower.includes('chemise')) {
        return 'Nos chemises à rabat personnalisées sont disponibles à partir de 20€. Elles peuvent être personnalisées avec vos couleurs et votre logo !';
      }
      if (lower.includes('contact') || lower.includes('telephone') || lower.includes('téléphone') || lower.includes('appel') || lower.includes('mail') || lower.includes('email')) {
        return 'Contactez-nous par téléphone au 07 73 00 66 63, par email à copie93120@gmail.com, ou via WhatsApp au même numéro.';
      }
      if (lower.includes('devis') || lower.includes('commande') || lower.includes('commander')) {
        return 'Pour un devis personnalisé, rendez-vous sur la page « Demande de Devis » ou contactez-nous directement sur WhatsApp !';
      }
      if (lower.includes('merci') || lower.includes('super') || lower.includes('parfait')) {
        return 'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions 😊';
      }
      return {
        text: 'Je ne suis pas sûr de comprendre. Voici ce que je peux vous renseigner :',
        options: [
          { label: 'Nos services', keyword: 'service' },
          { label: 'Tarifs', keyword: 'prix' },
          { label: 'Horaires', keyword: 'horaire' },
          { label: 'Contact', keyword: 'contact' },
          { label: 'Demander un devis', keyword: 'devis' }
        ]
      };
    }
  });
})();
