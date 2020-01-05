const traitInputAttr = { placeholder: 'ex. Votre texte ici' };

export default {
  assetManager: {
    addButton: 'Ajouter image',
    inputPlh: 'http://chemin/vers/image.jpg',
    modalTitle: 'Sélectionner une image',
    uploadTitle: 'Déposez des fichiers ici ou cliquez pour envoyer des fichiers'
  },
  blockManager: {
    labels: {
      // 'block-id': 'Identifiant du bloc',
    },
    categories: {
      // 'category-id': 'Identifiant de la catégorie',
    }
  },
  domComponents: {
    names: {
      '': 'Boîte',
      wrapper: 'Corps',
      text: 'Texte',
      comment: 'Commentaire',
      image: 'Image',
      video: 'Vidéo',
      label: 'Libellé',
      link: 'Lien',
      map: 'Carte',
      tfoot: 'Pied de tableau',
      tbody: 'Corps de tableau',
      thead: 'En-tête de tableau',
      table: 'Tableau',
      row: 'Ligne tableau',
      cell: 'Cellule tableau'
    }
  },
  deviceManager: {
    device: 'Appareil',
    devices: {
      desktop: 'Ordinateur de bureau',
      tablet: 'Tablette',
      mobileLandscape: 'Mobile format paysage',
      mobilePortrait: 'Mobile format portrait'
    }
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Prévisualisation',
        fullscreen: 'Plein écran',
        'sw-visibility': 'Voir les composants',
        'export-template': 'Voir le code',
        'open-sm': 'Ouvrir le gestionnaire de style',
        'open-tm': 'Paramètres',
        'open-layers': 'Ouvrir le gestionnaire de calques',
        'open-blocks': 'Ouvrir le gestionnaire de blocs'
      }
    }
  },
  selectorManager: {
    label: 'Classes',
    selected: 'Sélectionné',
    emptyState: '- État -',
    states: {
      hover: 'Survol',
      active: 'Clic',
      'nth-of-type(2n)': 'Paire/Impaire'
    }
  },
  styleManager: {
    empty:
      "Veuillez sélectionner un élément avant d'utiliser le gestionnaire de style",
    layer: 'Calque',
    fileButton: 'Images',
    sectors: {
      general: 'Général',
      layout: 'Disposition',
      typography: 'Typographie',
      decorations: 'Décorations',
      extra: 'Extra',
      flex: 'Flex',
      dimension: 'Dimension'
    },
    // The core library generates the name by their `property` name
    properties: {
      float: 'Flottant',
      display: 'Affichage',
      position: 'Position',
      top: 'Supérieur',
      right: 'Droite',
      left: 'Gauche',
      bottom: 'Inférieur',
      width: 'Largeur',
      height: 'Hauteur',
      'max-width': 'Largeur max.',
      'max-height': 'Hauteur max.',
      margin: 'Marge',
      'margin-top': 'Marge supérieure',
      'margin-right': 'Marge droite',
      'margin-left': 'Marge gauche',
      'margin-bottom': 'Marge inférieure',
      padding: 'Padding',
      'padding-top': 'Padding supérieur',
      'padding-left': 'Padding gauche',
      'padding-right': 'Padding droite',
      'padding-bottom': 'Padding inférieur',
      'font-family': 'Police de caractères',
      'font-size': 'Taille de police',
      'font-weight': 'Épaisseur de police',
      'letter-spacing': 'Espacement entre les lettres',
      color: 'Couleur',
      'line-height': 'Espacement des lignes',
      'text-align': 'Alignement de texte',
      'text-shadow': 'Ombre de texte',
      'text-shadow-h': 'Ombre de texte: horizontale',
      'text-shadow-v': 'Ombre de texte: verticale',
      'text-shadow-blur': 'Flou ombre de texte',
      'text-shadow-color': 'Couleur ombre de texte',
      'border-top-left': 'Bord supérieur gauche',
      'border-top-right': 'Bord supérieur droit',
      'border-bottom-left': 'Bord inférieur gauche',
      'border-bottom-right': 'Bord inférieur droit',
      'border-radius-top-left': 'Bord supérieur arrondi gauche',
      'border-radius-top-right': 'Bord supérieur arrondi droit',
      'border-radius-bottom-left': 'Bord arrondi inférieur gauche',
      'border-radius-bottom-right': 'Bord arrondi inférieur droit',
      'border-radius': 'Bord arrondi',
      border: 'Bordure',
      'border-width': 'Largeur de bordure',
      'border-style': 'Style de bordure',
      'border-color': 'Couleur de bordure',
      'box-shadow': 'Ombre de boîte',
      'box-shadow-h': 'Ombre de boîte: horizontale',
      'box-shadow-v': 'Ombre de boîte: verticale',
      'box-shadow-blur': 'Flou ombre de boîte',
      'box-shadow-spread': "Extension d'ombre de boîte",
      'box-shadow-color': "Couleur d'ombre de boîte",
      'box-shadow-type': "Type d'ombre de boîte",
      background: 'Fond',
      'background-image': 'Image de fond',
      'background-repeat': 'Répéter fond',
      'background-position': 'Position du fond',
      'background-attachment': 'Plugin de fond',
      'background-size': 'Taille du fond',
      'background-color': 'Couleur de fond',
      transition: 'Transition',
      'transition-property': 'Type de transition',
      'transition-duration': 'Durée de la transition',
      'transition-timing-function': 'Timing transition',
      perspective: 'Perspective',
      transform: 'Transformation',
      'transform-rotate-x': 'Rotation horizontale',
      'transform-rotate-y': 'Rotation verticale',
      'transform-rotate-z': 'Rotation profondeur',
      'transform-scale-x': 'Échelle horizontale',
      'transform-scale-y': 'Échelle verticale',
      'transform-scale-z': 'Échelle profondeur',
      'flex-direction': 'Direction Flex',
      'flex-wrap': 'Flex wrap',
      'justify-content': 'Ajuster contenu',
      'align-items': 'Aligner éléments',
      'align-content': 'Aligner contenu',
      order: 'Ordre',
      'flex-basis': 'Base Flex',
      'flex-grow': 'Flex grow',
      'flex-shrink': 'Flex shrink',
      'align-self': 'Aligner'
    }
  },
  traitManager: {
    empty:
      'Veuillez sélectionner un élément pour modifier les paramètres de cet élément',
    label: 'Paramètres composant',
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        id: 'Identifiant',
        alt: 'Texte alternatif',
        title: 'Titre',
        href: 'Source lien'
      },
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'eg. https://google.com' }
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'Cette fenêtre',
          _blank: 'Nouvelle fenêtre'
        }
      }
    }
  }
};
