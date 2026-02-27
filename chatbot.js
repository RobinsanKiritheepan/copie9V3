// Chatbot intelligent – Copie Courneuve9
// Système de conversation avancé avec :
// - Matching flou (fuzzy) pour comprendre les fautes de frappe
// - Mémoire de contexte conversationnel
// - Réponses personnalisées selon la page courante
// - Suggestions intelligentes basées sur l'historique
// - Indicateur de frappe (typing)
// - Réponses multi-étapes avec suivi

(function() {
  'use strict';

  document.addEventListener('DOMContentLoaded', function() {

    // ─── Configuration ───
    var CONFIG = {
      botName: 'Copie Courneuve9',
      primaryColor: '#2563eb',
      primaryHover: '#1d4ed8',
      typingDelay: 800,
      maxHistory: 20
    };

    // ─── État de la conversation ───
    var state = {
      history: [],
      context: null,
      userName: null,
      questionsAsked: 0,
      lastTopic: null,
      visitedTopics: [],
      currentPage: detectCurrentPage()
    };

    function detectCurrentPage() {
      var path = window.location.pathname.toLowerCase();
      if (path.indexOf('decouverte') !== -1) return 'decouverte';
      if (path.indexOf('devis') !== -1) return 'devis';
      if (path.indexOf('copie') !== -1) return 'copie';
      if (path.indexOf('impression_chemise') !== -1) return 'chemise';
      if (path.indexOf('impression') !== -1) return 'impression';
      if (path.indexOf('nos_produits') !== -1) return 'produits';
      if (path.indexOf('admin') !== -1) return 'admin';
      return 'accueil';
    }

    // ─── Base de connaissances enrichie ───
    var knowledge = {
      services: {
        photocopie: {
          nom: 'Photocopie',
          prixNB: '0,10 €/page',
          prixCouleur: '0,20 €/page',
          formats: 'A4, A3',
          options: 'Recto-verso, agrafage, reliure',
          delai: 'Immédiat (quelques minutes)',
          description: 'Service de photocopie laser haute qualité, noir & blanc et couleur.'
        },
        impression: {
          nom: 'Impression Numérique & Offset',
          prixNum: 'dès 0,20 €/page',
          prixOffset: 'Sur devis (grandes quantités)',
          formats: 'A4, A3, formats spéciaux',
          delai: 'Express disponible',
          description: 'Impression professionnelle pour tous volumes. Couleurs fidèles et rendu impeccable.'
        },
        numerisation: {
          nom: 'Numérisation',
          prix: '0,15 €/page',
          formats: 'PDF, JPEG',
          delai: 'Moins d\'1h',
          description: 'Numérisation haute résolution avec envoi par email rapide.'
        },
        chemise: {
          nom: 'Chemise à Rabat',
          prix: 'À partir de 20 €',
          details: 'Carton rigide, personnalisation couleur & logo, format A4, pochettes intérieures, élastique',
          delai: '2-3 jours',
          description: 'Chemises à rabat personnalisées pour une présentation professionnelle de vos documents.'
        }
      },
      horaires: {
        semaine: 'Lundi – Vendredi : 9h00 à 18h00',
        samedi: 'Samedi : 10h00 à 14h00',
        dimanche: 'Fermé le dimanche et jours fériés'
      },
      contact: {
        telephone: '07 73 00 66 63',
        email: 'copie93120@gmail.com',
        whatsapp: 'https://wa.me/33773006663',
        adresse: 'La Courneuve, 93120'
      },
      paiement: 'Espèces, carte bancaire. Facture disponible sur demande.',
      livraison: 'Retrait en boutique. Pour les grandes commandes, possibilité d\'arrangement sur demande.'
    };

    // ─── Synonymes et mots-clés pour matching flou ───
    var synonyms = {
      bonjour: ['bonjour', 'salut', 'hello', 'bonsoir', 'hey', 'coucou', 'bjr', 'bsr', 'yo', 'hi', 'slt'],
      horaire: ['horaire', 'heure', 'ouvert', 'ouverture', 'ferme', 'fermeture', 'quand', 'disponible', 'horraire', 'horaires', 'ouvre'],
      prix: ['prix', 'tarif', 'cout', 'coût', 'combien', 'cher', 'tarifs', 'coute', 'coûte', 'payer', 'montant', 'budget', 'gratuit'],
      service: ['service', 'offre', 'propose', 'proposez', 'faire', 'faites', 'disponible', 'activite', 'activité', 'prestation'],
      photocopie: ['photocopie', 'photocopi', 'copie', 'copies', 'photocopies', 'fotocopi', 'fotocopie', 'xerox'],
      impression: ['impression', 'imprime', 'imprimer', 'print', 'imprimante', 'imprimer', 'offset', 'numerique', 'numérique'],
      numerisation: ['numerisation', 'numérisation', 'scan', 'scanner', 'scanne', 'numerise', 'numérise', 'numériser'],
      chemise: ['chemise', 'rabat', 'dossier', 'classeur', 'pochette', 'couverture'],
      contact: ['contact', 'telephone', 'téléphone', 'appel', 'appeler', 'mail', 'email', 'e-mail', 'joindre', 'contacter', 'adresse', 'tel', 'numero', 'numéro'],
      devis: ['devis', 'commande', 'commander', 'demande', 'estimation', 'chiffrage', 'demander'],
      merci: ['merci', 'super', 'parfait', 'genial', 'génial', 'cool', 'top', 'excellent', 'bravo', 'nickel', 'impeccable'],
      aurevoir: ['aurevoir', 'au revoir', 'bye', 'bonne journée', 'a bientot', 'à bientôt', 'adieu', 'ciao', 'bonne soirée'],
      aide: ['aide', 'aider', 'help', 'besoin', 'question', 'renseignement', 'info', 'information', 'comment'],
      produit: ['produit', 'produits', 'catalogue', 'gamme', 'article', 'articles'],
      format: ['format', 'taille', 'dimension', 'a4', 'a3', 'recto', 'verso', 'rectoverso', 'recto-verso'],
      qualite: ['qualite', 'qualité', 'resolution', 'résolution', 'hd', 'haute', 'pro', 'professionnel', 'professionnelle'],
      delai: ['delai', 'délai', 'temps', 'rapide', 'express', 'urgent', 'urgence', 'vite', 'rapidement', 'combien de temps', 'durée', 'duree'],
      paiement: ['paiement', 'payer', 'carte', 'espece', 'espèce', 'cb', 'liquide', 'cheque', 'chèque', 'mode de paiement'],
      livraison: ['livraison', 'livrer', 'envoyer', 'envoi', 'retrait', 'recuperer', 'récupérer', 'expedition', 'expédition'],
      localisation: ['ou', 'où', 'adresse', 'localisation', 'situe', 'situé', 'emplacement', 'lieu', 'trouver', 'venir'],
      quantite: ['quantite', 'quantité', 'nombre', 'beaucoup', 'lot', 'lots', 'volume', 'grande quantité', 'gros']
    };

    // ─── Matching flou ───
    function matchTopic(msg) {
      var lower = msg.toLowerCase()
        .replace(/[éèêë]/g, 'e')
        .replace(/[àâä]/g, 'a')
        .replace(/[ùûü]/g, 'u')
        .replace(/[îï]/g, 'i')
        .replace(/[ôö]/g, 'o')
        .replace(/ç/g, 'c')
        .replace(/['']/g, "'")
        .replace(/[^\w\s']/g, ' ')
        .trim();

      var words = lower.split(/\s+/);
      var scores = {};

      for (var topic in synonyms) {
        scores[topic] = 0;
        for (var i = 0; i < synonyms[topic].length; i++) {
          var syn = synonyms[topic][i];
          if (lower.indexOf(syn) !== -1) {
            scores[topic] += syn.length;
          }
          for (var j = 0; j < words.length; j++) {
            if (levenshtein(words[j], syn) <= 2 && syn.length > 3) {
              scores[topic] += Math.max(0, syn.length - 2);
            }
          }
        }
      }

      var bestTopic = null;
      var bestScore = 0;
      for (var t in scores) {
        if (scores[t] > bestScore) {
          bestScore = scores[t];
          bestTopic = t;
        }
      }

      return bestScore >= 3 ? bestTopic : null;
    }

    function levenshtein(a, b) {
      if (a.length === 0) return b.length;
      if (b.length === 0) return a.length;
      var matrix = [];
      for (var i = 0; i <= b.length; i++) matrix[i] = [i];
      for (var j = 0; j <= a.length; j++) matrix[0][j] = j;
      for (i = 1; i <= b.length; i++) {
        for (j = 1; j <= a.length; j++) {
          if (b.charAt(i - 1) === a.charAt(j - 1)) {
            matrix[i][j] = matrix[i - 1][j - 1];
          } else {
            matrix[i][j] = Math.min(
              matrix[i - 1][j - 1] + 1,
              matrix[i][j - 1] + 1,
              matrix[i - 1][j] + 1
            );
          }
        }
      }
      return matrix[b.length][a.length];
    }

    // ─── Générateur de réponses intelligent ───
    function generateResponse(msg) {
      state.questionsAsked++;
      var topic = matchTopic(msg);
      var lower = msg.toLowerCase();

      // Détection du nom de l'utilisateur
      var nameMatch = lower.match(/(?:je\s+(?:m'appelle|suis|me\s+nomme))\s+(\w+)/);
      if (nameMatch) {
        state.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
        return {
          text: 'Enchanté ' + state.userName + ' ! Comment puis-je vous aider aujourd\'hui ?',
          options: getSmartSuggestions()
        };
      }

      // Si on est dans un contexte de suivi
      if (state.context === 'awaiting_service_choice') {
        state.context = null;
        if (topic === 'photocopie') return getPhotocopieResponse();
        if (topic === 'impression') return getImpressionResponse();
        if (topic === 'numerisation') return getNumerisationResponse();
        if (topic === 'chemise') return getChemiseResponse();
      }

      if (state.context === 'awaiting_price_detail') {
        state.context = null;
        if (topic === 'photocopie') return { text: 'Photocopie N&B : ' + knowledge.services.photocopie.prixNB + '\nPhotocopie couleur : ' + knowledge.services.photocopie.prixCouleur + '\nFormats : ' + knowledge.services.photocopie.formats, options: [{ label: 'Commander', keyword: 'devis' }, { label: 'Autres tarifs', keyword: 'prix' }] };
        if (topic === 'impression') return { text: 'Impression numérique : ' + knowledge.services.impression.prixNum + '\nImpression offset : ' + knowledge.services.impression.prixOffset, options: [{ label: 'Commander', keyword: 'devis' }, { label: 'Autres tarifs', keyword: 'prix' }] };
        if (topic === 'numerisation') return { text: 'Numérisation : ' + knowledge.services.numerisation.prix + '\nFormats de sortie : ' + knowledge.services.numerisation.formats, options: [{ label: 'Commander', keyword: 'devis' }, { label: 'Autres tarifs', keyword: 'prix' }] };
        if (topic === 'chemise') return { text: 'Chemise à rabat : ' + knowledge.services.chemise.prix + '\nPersonnalisation complète incluse (logo, couleurs).', options: [{ label: 'Commander', keyword: 'devis' }, { label: 'Autres tarifs', keyword: 'prix' }] };
      }

      // Réponses par topic
      if (topic) {
        state.lastTopic = topic;
        if (state.visitedTopics.indexOf(topic) === -1) state.visitedTopics.push(topic);
      }

      switch(topic) {
        case 'bonjour':
          var greeting = getTimeGreeting();
          var name = state.userName ? ' ' + state.userName : '';
          return {
            text: greeting + name + ' ! Bienvenue chez ' + CONFIG.botName + '. Comment puis-je vous aider ?',
            options: getContextualSuggestions()
          };

        case 'horaire':
          return {
            text: 'Voici nos horaires d\'ouverture :\n\n' + knowledge.horaires.semaine + '\n' + knowledge.horaires.samedi + '\n' + knowledge.horaires.dimanche,
            options: [
              { label: 'Nous contacter', keyword: 'contact' },
              { label: 'Venir en boutique', keyword: 'localisation' }
            ]
          };

        case 'prix':
          state.context = 'awaiting_price_detail';
          return {
            text: 'Voici nos tarifs principaux :\n\n' +
              '- Photocopie N&B : ' + knowledge.services.photocopie.prixNB + '\n' +
              '- Impression couleur : ' + knowledge.services.photocopie.prixCouleur + '\n' +
              '- Numérisation : ' + knowledge.services.numerisation.prix + '\n' +
              '- Chemise à rabat : ' + knowledge.services.chemise.prix + '\n\n' +
              'Tarifs dégressifs pour les grandes quantités. Quel service vous intéresse ?',
            options: [
              { label: 'Photocopie', keyword: 'photocopie' },
              { label: 'Impression', keyword: 'impression' },
              { label: 'Numérisation', keyword: 'numerisation' },
              { label: 'Demander un devis', keyword: 'devis' }
            ]
          };

        case 'service':
          state.context = 'awaiting_service_choice';
          return {
            text: 'Nous proposons 4 services principaux :\n\n' +
              '1. Photocopie – N&B et couleur, qualité laser\n' +
              '2. Impression – Numérique et offset, tous formats\n' +
              '3. Numérisation – Haute résolution, envoi email\n' +
              '4. Chemise à rabat – Personnalisées avec votre logo\n\n' +
              'Lequel vous intéresse ?',
            options: [
              { label: 'Photocopie', keyword: 'photocopie' },
              { label: 'Impression', keyword: 'impression' },
              { label: 'Numérisation', keyword: 'numerisation' },
              { label: 'Chemise à rabat', keyword: 'chemise' }
            ]
          };

        case 'photocopie': return getPhotocopieResponse();
        case 'impression': return getImpressionResponse();
        case 'numerisation': return getNumerisationResponse();
        case 'chemise': return getChemiseResponse();
        case 'produit': return getProduitsResponse();

        case 'contact':
          return {
            text: 'Voici comment nous joindre :\n\n' +
              'Téléphone : ' + knowledge.contact.telephone + '\n' +
              'Email : ' + knowledge.contact.email + '\n' +
              'WhatsApp : même numéro (' + knowledge.contact.telephone + ')\n' +
              'Adresse : ' + knowledge.contact.adresse,
            options: [
              { label: 'Horaires', keyword: 'horaire' },
              { label: 'Demander un devis', keyword: 'devis' }
            ]
          };

        case 'devis':
          return {
            text: 'Pour obtenir un devis gratuit et personnalisé, vous avez plusieurs options :\n\n' +
              '1. Remplir le formulaire sur notre page Devis\n' +
              '2. Nous contacter sur WhatsApp pour une réponse rapide\n' +
              '3. Nous appeler au ' + knowledge.contact.telephone + '\n' +
              '4. Envoyer un email à ' + knowledge.contact.email + '\n\n' +
              'Le devis est gratuit et la réponse est sous 24h !',
            options: [
              { label: 'Aller au formulaire', keyword: 'formulaire_devis' },
              { label: 'WhatsApp', keyword: 'whatsapp' },
              { label: 'Nos tarifs', keyword: 'prix' }
            ]
          };

        case 'format':
          return {
            text: 'Nous acceptons les formats suivants :\n\n' +
              'Papier : A4, A3, formats spéciaux sur demande\n' +
              'Options : Recto, recto-verso, agrafage, reliure\n' +
              'Fichiers acceptés : PDF, Word, JPG, PNG\n' +
              'Moyens d\'envoi : Clé USB, email, en boutique\n\n' +
              'Besoin d\'un format particulier ? Contactez-nous !',
            options: [
              { label: 'Tarifs', keyword: 'prix' },
              { label: 'Commander', keyword: 'devis' }
            ]
          };

        case 'qualite':
          return {
            text: 'Nous garantissons une qualité professionnelle :\n\n' +
              'Équipements laser de dernière génération\n' +
              'Résolution haute définition\n' +
              'Papier premium disponible\n' +
              'Contrôle qualité sur chaque commande\n\n' +
              'Votre satisfaction est notre priorité !',
            options: [
              { label: 'Nos services', keyword: 'service' },
              { label: 'Commander', keyword: 'devis' }
            ]
          };

        case 'delai':
          return {
            text: 'Nos délais de réalisation :\n\n' +
              'Photocopie : Immédiat (quelques minutes)\n' +
              'Impression numérique : Express disponible\n' +
              'Numérisation : Moins d\'1 heure\n' +
              'Chemise à rabat : 2-3 jours\n\n' +
              'Service urgent disponible sur demande pour la plupart des prestations.',
            options: [
              { label: 'Tarifs', keyword: 'prix' },
              { label: 'Commander', keyword: 'devis' }
            ]
          };

        case 'paiement':
          return {
            text: 'Modes de paiement acceptés :\n\n' + knowledge.paiement + '\n\n' +
              'Pour les professionnels, nous pouvons établir des factures détaillées.',
            options: [
              { label: 'Commander', keyword: 'devis' },
              { label: 'Contact', keyword: 'contact' }
            ]
          };

        case 'livraison':
          return {
            text: knowledge.livraison + '\n\nPour les commandes urgentes ou volumineuses, contactez-nous pour trouver la meilleure solution.',
            options: [
              { label: 'Contact', keyword: 'contact' },
              { label: 'Horaires', keyword: 'horaire' }
            ]
          };

        case 'localisation':
          return {
            text: 'Nous sommes situés à La Courneuve (93120).\n\n' +
              'Passez nous voir en boutique !\n' +
              'Horaires : ' + knowledge.horaires.semaine + '\n' + knowledge.horaires.samedi,
            options: [
              { label: 'Horaires complets', keyword: 'horaire' },
              { label: 'Contact', keyword: 'contact' }
            ]
          };

        case 'quantite':
          return {
            text: 'Nous traitons toutes les quantités :\n\n' +
              'De 1 page à plusieurs milliers d\'exemplaires !\n' +
              'Tarifs dégressifs pour les grandes quantités.\n' +
              'Pour les commandes professionnelles en volume, demandez un devis personnalisé.\n\n' +
              'Quel volume envisagez-vous ?',
            options: [
              { label: 'Demander un devis', keyword: 'devis' },
              { label: 'Voir les tarifs', keyword: 'prix' }
            ]
          };

        case 'merci':
          var responses = [
            'Avec plaisir ! N\'hésitez pas si vous avez d\'autres questions.',
            'Je suis là pour vous aider ! Autre chose ?',
            'Ravi de pouvoir vous aider ! Besoin d\'autre chose ?',
            'De rien ! Je reste disponible si nécessaire.'
          ];
          return {
            text: responses[Math.floor(Math.random() * responses.length)],
            options: getSmartSuggestions()
          };

        case 'aurevoir':
          var name = state.userName ? ' ' + state.userName : '';
          return 'Au revoir' + name + ' ! Bonne journée et à bientôt chez ' + CONFIG.botName + ' !';

        case 'aide':
          return {
            text: 'Je peux vous renseigner sur :\n\n' +
              'Nos services (photocopie, impression, numérisation, chemise à rabat)\n' +
              'Les tarifs et les promotions\n' +
              'Les délais de réalisation\n' +
              'Les formats acceptés\n' +
              'Les horaires et l\'accès\n' +
              'Les modes de paiement\n' +
              'La demande de devis\n\n' +
              'Posez-moi votre question !',
            options: [
              { label: 'Services', keyword: 'service' },
              { label: 'Tarifs', keyword: 'prix' },
              { label: 'Horaires', keyword: 'horaire' },
              { label: 'Contact', keyword: 'contact' }
            ]
          };

        default:
          // Réponses spéciales pour des questions courantes
          if (lower.indexOf('formulaire') !== -1 || lower === 'formulaire_devis') {
            return {
              text: 'Rendez-vous sur notre page Devis pour remplir le formulaire. C\'est gratuit et vous recevrez une réponse sous 24h !',
              options: [{ label: 'Nos tarifs', keyword: 'prix' }, { label: 'Contact', keyword: 'contact' }]
            };
          }

          if (lower === 'whatsapp') {
            return {
              text: 'Vous pouvez nous contacter sur WhatsApp au ' + knowledge.contact.telephone + ' pour une réponse rapide !',
              options: [{ label: 'Autres moyens', keyword: 'contact' }, { label: 'Horaires', keyword: 'horaire' }]
            };
          }

          // Réponse par défaut plus intelligente
          return getSmartFallback(msg);
      }
    }

    function getPhotocopieResponse() {
      var s = knowledge.services.photocopie;
      return {
        text: s.description + '\n\n' +
          'N&B : ' + s.prixNB + '\n' +
          'Couleur : ' + s.prixCouleur + '\n' +
          'Formats : ' + s.formats + '\n' +
          'Options : ' + s.options + '\n' +
          'Délai : ' + s.delai,
        options: [
          { label: 'Commander', keyword: 'devis' },
          { label: 'Autres services', keyword: 'service' },
          { label: 'Formats détaillés', keyword: 'format' }
        ]
      };
    }

    function getImpressionResponse() {
      var s = knowledge.services.impression;
      return {
        text: s.description + '\n\n' +
          'Numérique : ' + s.prixNum + '\n' +
          'Offset : ' + s.prixOffset + '\n' +
          'Formats : ' + s.formats + '\n' +
          'Délai : ' + s.delai,
        options: [
          { label: 'Commander', keyword: 'devis' },
          { label: 'Chemise à rabat', keyword: 'chemise' },
          { label: 'Tous les services', keyword: 'service' }
        ]
      };
    }

    function getNumerisationResponse() {
      var s = knowledge.services.numerisation;
      return {
        text: s.description + '\n\n' +
          'Prix : ' + s.prix + '\n' +
          'Formats de sortie : ' + s.formats + '\n' +
          'Délai : ' + s.delai,
        options: [
          { label: 'Commander', keyword: 'devis' },
          { label: 'Autres services', keyword: 'service' }
        ]
      };
    }

    function getChemiseResponse() {
      var s = knowledge.services.chemise;
      return {
        text: s.description + '\n\n' +
          'Prix : ' + s.prix + '\n' +
          'Inclus : ' + s.details + '\n' +
          'Délai : ' + s.delai,
        options: [
          { label: 'Commander', keyword: 'devis' },
          { label: 'Voir la page produit', keyword: 'produit_chemise' },
          { label: 'Autres services', keyword: 'service' }
        ]
      };
    }

    function getProduitsResponse() {
      return {
        text: 'Notre catalogue complet :\n\n' +
          '1. Impression Numérique & Offset – dès 0,20 €/page\n' +
          '2. Chemise à Rabat – dès 20 €\n' +
          '3. Photocopie N&B & couleur – dès 0,10 €/page\n' +
          '4. Numérisation – 0,15 €/page\n\n' +
          'Visitez notre page Nos Produits pour plus de détails !',
        options: [
          { label: 'Impression', keyword: 'impression' },
          { label: 'Chemise à rabat', keyword: 'chemise' },
          { label: 'Photocopie', keyword: 'photocopie' },
          { label: 'Devis gratuit', keyword: 'devis' }
        ]
      };
    }

    function getTimeGreeting() {
      var h = new Date().getHours();
      if (h < 12) return 'Bonjour';
      if (h < 18) return 'Bon après-midi';
      return 'Bonsoir';
    }

    function getContextualSuggestions() {
      switch(state.currentPage) {
        case 'decouverte':
          return [
            { label: 'Nos services', keyword: 'service' },
            { label: 'Tarifs', keyword: 'prix' },
            { label: 'Comment commander', keyword: 'devis' }
          ];
        case 'devis':
          return [
            { label: 'Aide formulaire', keyword: 'aide' },
            { label: 'Tarifs', keyword: 'prix' },
            { label: 'Contact direct', keyword: 'contact' }
          ];
        case 'copie':
          return [
            { label: 'Tarifs photocopie', keyword: 'photocopie' },
            { label: 'Formats', keyword: 'format' },
            { label: 'Commander', keyword: 'devis' }
          ];
        case 'impression':
          return [
            { label: 'Tarifs impression', keyword: 'impression' },
            { label: 'Délais', keyword: 'delai' },
            { label: 'Commander', keyword: 'devis' }
          ];
        case 'chemise':
          return [
            { label: 'Détails chemise', keyword: 'chemise' },
            { label: 'Personnalisation', keyword: 'qualite' },
            { label: 'Commander', keyword: 'devis' }
          ];
        default:
          return [
            { label: 'Nos services', keyword: 'service' },
            { label: 'Tarifs', keyword: 'prix' },
            { label: 'Horaires', keyword: 'horaire' },
            { label: 'Contact', keyword: 'contact' }
          ];
      }
    }

    function getSmartSuggestions() {
      var suggestions = [];
      var unvisited = ['service', 'prix', 'horaire', 'contact', 'devis', 'format', 'delai'];
      for (var i = 0; i < unvisited.length && suggestions.length < 4; i++) {
        if (state.visitedTopics.indexOf(unvisited[i]) === -1) {
          var labels = { service: 'Nos services', prix: 'Tarifs', horaire: 'Horaires', contact: 'Contact', devis: 'Devis gratuit', format: 'Formats', delai: 'Délais' };
          suggestions.push({ label: labels[unvisited[i]], keyword: unvisited[i] });
        }
      }
      if (suggestions.length === 0) {
        suggestions = [
          { label: 'Nos services', keyword: 'service' },
          { label: 'Demander un devis', keyword: 'devis' }
        ];
      }
      return suggestions;
    }

    function getSmartFallback(msg) {
      var lower = msg.toLowerCase();
      // Essayer de détecter une intention même faible
      if (lower.length < 3) {
        return {
          text: 'Pouvez-vous préciser votre question ? Je suis là pour vous aider !',
          options: getSmartSuggestions()
        };
      }

      // Vérifier si c'est une question (contient un ?)
      if (lower.indexOf('?') !== -1) {
        return {
          text: 'Bonne question ! Je n\'ai pas de réponse exacte pour celle-ci, mais voici ce que je peux faire pour vous :',
          options: [
            { label: 'Nos services', keyword: 'service' },
            { label: 'Tarifs', keyword: 'prix' },
            { label: 'Contacter un conseiller', keyword: 'contact' },
            { label: 'Demander un devis', keyword: 'devis' }
          ]
        };
      }

      // Suggestions intelligentes basées sur le contexte
      if (state.questionsAsked <= 2) {
        return {
          text: 'Je ne suis pas sûr de comprendre. Voici les sujets sur lesquels je peux vous aider :',
          options: [
            { label: 'Services', keyword: 'service' },
            { label: 'Tarifs', keyword: 'prix' },
            { label: 'Horaires', keyword: 'horaire' },
            { label: 'Contact', keyword: 'contact' }
          ]
        };
      }

      return {
        text: 'Pour cette question, je vous recommande de contacter directement notre équipe. Ils pourront vous répondre avec précision !',
        options: [
          { label: 'Appeler', keyword: 'contact' },
          { label: 'WhatsApp', keyword: 'whatsapp' },
          { label: 'Envoyer un email', keyword: 'contact' }
        ]
      };
    }

    // ─── Interface du chat ───

    // Bouton toggle
    var toggleBtn = document.createElement('button');
    toggleBtn.id = 'chatToggleBtn';
    toggleBtn.setAttribute('aria-label', 'Ouvrir le chat d\'assistance');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.setAttribute('aria-controls', 'chatWindow');
    toggleBtn.innerHTML = '<svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>';
    Object.assign(toggleBtn.style, {
      position: 'fixed', bottom: '20px', right: '20px', zIndex: '1060',
      backgroundColor: CONFIG.primaryColor, color: '#fff', border: 'none',
      borderRadius: '50%', width: '56px', height: '56px', fontSize: '1.2rem',
      cursor: 'pointer', boxShadow: '0 4px 20px rgba(37,99,235,.4)',
      transition: 'all .3s cubic-bezier(.4,0,.2,1)', display: 'flex',
      alignItems: 'center', justifyContent: 'center'
    });
    toggleBtn.addEventListener('mouseenter', function() {
      toggleBtn.style.transform = 'scale(1.08)';
      toggleBtn.style.boxShadow = '0 8px 30px rgba(37,99,235,.5)';
    });
    toggleBtn.addEventListener('mouseleave', function() {
      toggleBtn.style.transform = 'scale(1)';
      toggleBtn.style.boxShadow = '0 4px 20px rgba(37,99,235,.4)';
    });
    document.body.appendChild(toggleBtn);

    // Fenêtre de chat
    var chatWindow = document.createElement('div');
    chatWindow.id = 'chatWindow';
    chatWindow.setAttribute('role', 'dialog');
    chatWindow.setAttribute('aria-modal', 'false');
    chatWindow.setAttribute('aria-label', 'Chat d\'assistance Copie Courneuve9');
    Object.assign(chatWindow.style, {
      position: 'fixed', bottom: '90px', right: '20px', width: '380px', height: '520px',
      backgroundColor: '#fff', border: 'none', borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0,0,0,.2)', display: 'none',
      flexDirection: 'column', overflow: 'hidden', zIndex: '1060',
      transition: 'all .3s cubic-bezier(.4,0,.2,1)'
    });

    // En-tête
    var header = document.createElement('div');
    Object.assign(header.style, {
      background: 'linear-gradient(135deg, ' + CONFIG.primaryColor + ', #1e40af)',
      color: '#fff', padding: '16px 18px', display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', fontSize: '.95rem'
    });

    var headerLeft = document.createElement('div');
    headerLeft.style.display = 'flex';
    headerLeft.style.alignItems = 'center';
    headerLeft.style.gap = '10px';

    var avatar = document.createElement('div');
    Object.assign(avatar.style, {
      width: '36px', height: '36px', borderRadius: '50%',
      backgroundColor: 'rgba(255,255,255,.2)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontSize: '.9rem', flexShrink: '0'
    });
    avatar.innerHTML = '<svg width="18" height="18" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>';

    var headerInfo = document.createElement('div');
    var headerTitle = document.createElement('div');
    headerTitle.textContent = 'Assistant Copie Courneuve9';
    headerTitle.style.fontWeight = '700';
    headerTitle.style.fontSize = '.9rem';
    var headerStatus = document.createElement('div');
    headerStatus.style.fontSize = '.7rem';
    headerStatus.style.opacity = '.8';
    headerStatus.style.display = 'flex';
    headerStatus.style.alignItems = 'center';
    headerStatus.style.gap = '4px';
    headerStatus.innerHTML = '<span style="display:inline-block;width:6px;height:6px;background:#4ade80;border-radius:50%"></span> En ligne';
    headerInfo.appendChild(headerTitle);
    headerInfo.appendChild(headerStatus);
    headerLeft.appendChild(avatar);
    headerLeft.appendChild(headerInfo);

    var closeBtn = document.createElement('button');
    closeBtn.setAttribute('aria-label', 'Fermer le chat');
    closeBtn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>';
    Object.assign(closeBtn.style, {
      background: 'rgba(255,255,255,.15)', border: 'none', color: '#fff',
      width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'background .2s'
    });
    closeBtn.addEventListener('mouseenter', function() { closeBtn.style.background = 'rgba(255,255,255,.3)'; });
    closeBtn.addEventListener('mouseleave', function() { closeBtn.style.background = 'rgba(255,255,255,.15)'; });
    closeBtn.addEventListener('click', function() {
      chatWindow.style.display = 'none';
      toggleBtn.setAttribute('aria-expanded', 'false');
    });

    header.appendChild(headerLeft);
    header.appendChild(closeBtn);
    chatWindow.appendChild(header);

    // Messages
    var messagesDiv = document.createElement('div');
    messagesDiv.id = 'chatMessages';
    messagesDiv.setAttribute('aria-live', 'polite');
    messagesDiv.setAttribute('aria-atomic', 'false');
    Object.assign(messagesDiv.style, {
      padding: '16px', overflowY: 'auto', flex: '1',
      fontSize: '.85rem', backgroundColor: '#f8fafc',
      display: 'flex', flexDirection: 'column', gap: '8px'
    });
    chatWindow.appendChild(messagesDiv);

    // Zone de saisie
    var inputContainer = document.createElement('div');
    Object.assign(inputContainer.style, {
      display: 'flex', borderTop: '1px solid #e2e8f0', padding: '12px',
      backgroundColor: '#fff', gap: '8px', alignItems: 'center'
    });

    var inputField = document.createElement('input');
    inputField.type = 'text';
    inputField.placeholder = 'Tapez votre message...';
    inputField.setAttribute('aria-label', 'Votre message');
    Object.assign(inputField.style, {
      flex: '1', border: '1.5px solid #e2e8f0', borderRadius: '12px',
      padding: '10px 16px', fontSize: '.85rem', outline: 'none',
      transition: 'border-color .2s, box-shadow .2s', backgroundColor: '#f8fafc'
    });
    inputField.addEventListener('focus', function() {
      inputField.style.borderColor = CONFIG.primaryColor;
      inputField.style.boxShadow = '0 0 0 3px rgba(37,99,235,.1)';
      inputField.style.backgroundColor = '#fff';
    });
    inputField.addEventListener('blur', function() {
      inputField.style.borderColor = '#e2e8f0';
      inputField.style.boxShadow = 'none';
      inputField.style.backgroundColor = '#f8fafc';
    });
    inputField.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') { e.preventDefault(); sendMessage(); }
    });

    var sendBtn = document.createElement('button');
    sendBtn.type = 'button';
    sendBtn.setAttribute('aria-label', 'Envoyer le message');
    sendBtn.innerHTML = '<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>';
    Object.assign(sendBtn.style, {
      border: 'none', backgroundColor: CONFIG.primaryColor, color: '#fff',
      width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all .2s', flexShrink: '0'
    });
    sendBtn.addEventListener('mouseenter', function() { sendBtn.style.backgroundColor = CONFIG.primaryHover; sendBtn.style.transform = 'scale(1.05)'; });
    sendBtn.addEventListener('mouseleave', function() { sendBtn.style.backgroundColor = CONFIG.primaryColor; sendBtn.style.transform = 'scale(1)'; });
    sendBtn.addEventListener('click', sendMessage);

    inputContainer.appendChild(inputField);
    inputContainer.appendChild(sendBtn);
    chatWindow.appendChild(inputContainer);
    document.body.appendChild(chatWindow);

    // Responsive
    function updateChatLayout() {
      var isMobile = window.innerWidth < 600;
      if (isMobile) {
        chatWindow.style.width = '92vw';
        chatWindow.style.height = '65vh';
        chatWindow.style.right = '4vw';
        chatWindow.style.bottom = '80px';
        chatWindow.style.borderRadius = '16px';
        toggleBtn.style.width = '50px';
        toggleBtn.style.height = '50px';
      } else {
        chatWindow.style.width = '380px';
        chatWindow.style.height = '520px';
        chatWindow.style.right = '20px';
        chatWindow.style.bottom = '90px';
        chatWindow.style.borderRadius = '20px';
        toggleBtn.style.width = '56px';
        toggleBtn.style.height = '56px';
      }
    }
    updateChatLayout();
    window.addEventListener('resize', updateChatLayout);

    // Toggle
    toggleBtn.addEventListener('click', function() {
      var isOpen = chatWindow.style.display !== 'none';
      chatWindow.style.display = isOpen ? 'none' : 'flex';
      toggleBtn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (!isOpen) {
        inputField.focus();
        if (messagesDiv.children.length === 0) {
          var greeting = getTimeGreeting();
          addMessage(greeting + ' ! Je suis l\'assistant de Copie Courneuve9. Comment puis-je vous aider ?', false);
          addOptions(getContextualSuggestions());
        }
      }
    });

    // ─── Fonctions d'affichage ───

    function addMessage(text, isUser) {
      var wrapper = document.createElement('div');
      wrapper.style.display = 'flex';
      wrapper.style.justifyContent = isUser ? 'flex-end' : 'flex-start';
      wrapper.style.alignItems = 'flex-end';
      wrapper.style.gap = '6px';

      if (!isUser) {
        var botAvatar = document.createElement('div');
        Object.assign(botAvatar.style, {
          width: '28px', height: '28px', borderRadius: '50%', flexShrink: '0',
          background: 'linear-gradient(135deg, ' + CONFIG.primaryColor + ', #1e40af)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        });
        botAvatar.innerHTML = '<svg width="14" height="14" fill="white" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>';
        wrapper.appendChild(botAvatar);
      }

      var msg = document.createElement('div');
      msg.style.whiteSpace = 'pre-wrap';
      msg.textContent = text;
      Object.assign(msg.style, {
        backgroundColor: isUser ? CONFIG.primaryColor : '#fff',
        color: isUser ? '#fff' : '#1e293b',
        padding: '10px 14px', marginBottom: '0',
        borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
        maxWidth: '80%', wordWrap: 'break-word',
        boxShadow: isUser ? 'none' : '0 1px 4px rgba(0,0,0,.06)',
        lineHeight: '1.5', fontSize: '.84rem'
      });

      wrapper.appendChild(msg);
      messagesDiv.appendChild(wrapper);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;

      state.history.push({ text: text, isUser: isUser });
      if (state.history.length > CONFIG.maxHistory) state.history.shift();
    }

    function addTypingIndicator() {
      var wrapper = document.createElement('div');
      wrapper.id = 'typingIndicator';
      wrapper.style.display = 'flex';
      wrapper.style.alignItems = 'flex-end';
      wrapper.style.gap = '6px';

      var botAvatar = document.createElement('div');
      Object.assign(botAvatar.style, {
        width: '28px', height: '28px', borderRadius: '50%', flexShrink: '0',
        background: 'linear-gradient(135deg, ' + CONFIG.primaryColor + ', #1e40af)',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      });
      botAvatar.innerHTML = '<svg width="14" height="14" fill="white" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clip-rule="evenodd"/></svg>';
      wrapper.appendChild(botAvatar);

      var dots = document.createElement('div');
      Object.assign(dots.style, {
        backgroundColor: '#fff', borderRadius: '16px 16px 16px 4px',
        padding: '12px 18px', boxShadow: '0 1px 4px rgba(0,0,0,.06)',
        display: 'flex', gap: '4px', alignItems: 'center'
      });
      for (var i = 0; i < 3; i++) {
        var dot = document.createElement('span');
        Object.assign(dot.style, {
          width: '7px', height: '7px', borderRadius: '50%', backgroundColor: '#94a3b8',
          display: 'inline-block',
          animation: 'typingDot 1.2s ease-in-out ' + (i * 0.2) + 's infinite'
        });
        dots.appendChild(dot);
      }
      wrapper.appendChild(dots);
      messagesDiv.appendChild(wrapper);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function removeTypingIndicator() {
      var el = document.getElementById('typingIndicator');
      if (el) el.remove();
    }

    // Inject typing animation CSS
    var styleEl = document.createElement('style');
    styleEl.textContent = '@keyframes typingDot{0%,80%,100%{transform:translateY(0);opacity:.4}40%{transform:translateY(-5px);opacity:1}}';
    document.head.appendChild(styleEl);

    function addOptions(options) {
      var container = document.createElement('div');
      Object.assign(container.style, {
        display: 'flex', flexWrap: 'wrap', gap: '6px',
        marginTop: '4px', paddingLeft: '34px'
      });

      options.forEach(function(opt) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = opt.label;
        Object.assign(btn.style, {
          border: '1.5px solid ' + CONFIG.primaryColor, borderRadius: '10px',
          background: '#fff', color: CONFIG.primaryColor,
          padding: '6px 14px', fontSize: '.78rem', fontWeight: '600',
          cursor: 'pointer', transition: 'all .2s cubic-bezier(.4,0,.2,1)'
        });
        btn.addEventListener('mouseenter', function() {
          btn.style.background = CONFIG.primaryColor;
          btn.style.color = '#fff';
          btn.style.transform = 'translateY(-1px)';
          btn.style.boxShadow = '0 2px 8px rgba(37,99,235,.3)';
        });
        btn.addEventListener('mouseleave', function() {
          btn.style.background = '#fff';
          btn.style.color = CONFIG.primaryColor;
          btn.style.transform = 'translateY(0)';
          btn.style.boxShadow = 'none';
        });
        btn.addEventListener('click', function() {
          addMessage(opt.label, true);
          addTypingIndicator();
          setTimeout(function() {
            removeTypingIndicator();
            var resp = generateResponse(opt.keyword || opt.label);
            if (typeof resp === 'string') {
              addMessage(resp, false);
            } else if (resp && resp.text) {
              addMessage(resp.text, false);
              if (Array.isArray(resp.options)) addOptions(resp.options);
            }
          }, CONFIG.typingDelay);
        });
        container.appendChild(btn);
      });

      messagesDiv.appendChild(container);
      messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    function sendMessage() {
      var text = inputField.value.trim();
      if (!text) return;
      addMessage(text, true);
      inputField.value = '';

      addTypingIndicator();

      var response = generateResponse(text);
      setTimeout(function() {
        removeTypingIndicator();
        if (typeof response === 'string') {
          addMessage(response, false);
        } else if (response && response.text) {
          addMessage(response.text, false);
          if (Array.isArray(response.options)) addOptions(response.options);
        }
      }, CONFIG.typingDelay);
    }

  });
})();
