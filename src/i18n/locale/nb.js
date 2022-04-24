const traitInputAttr = { placeholder: 'f.eks. Tekst her' };

export default {
  assetManager: {
    addButton: 'Legg til bilde',
    inputPlh: 'http://vei/til/bilde.jpg',
    modalTitle: 'Velg bilde',
    uploadTitle: 'Slipp filer her eller trykk for å laste opp',
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'Block Label',
    },
    categories: {
      // 'category-id': 'Category Label',
    },
  },
  domComponents: {
    names: {
      '': 'Boks',
      wrapper: 'Innhold',
      text: 'Tekst',
      comment: 'Kommentar',
      image: 'Bilde',
      video: 'Video',
      label: 'Etikett',
      link: 'Lenke',
      map: 'Kart',
      tfoot: 'Tabellfot',
      tbody: 'Tabellinnhold',
      thead: 'Tabellhode',
      table: 'Tabell',
      row: 'Tabellrad',
      cell: 'Tabellcelle',
    },
  },
  deviceManager: {
    device: 'Enhet',
    devices: {
      desktop: 'Skrivebord',
      tablet: 'Nettbrett',
      mobileLandscape: 'Mobil landskapsmodus',
      mobilePortrait: 'Mobil portrettmodus',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Forhåndsvisning',
        fullscreen: 'Fullskjerm',
        'sw-visibility': 'Vis komponenter',
        'export-template': 'Vis kode',
        'open-sm': 'Åpne stiladministrator',
        'open-tm': 'Innstillinger',
        'open-layers': 'Åpne lagadministrator',
        'open-blocks': 'Åpne blokker',
      },
    },
  },
  selectorManager: {
    label: 'Klasser',
    selected: 'Valgt',
    emptyState: '- Tilstand -',
    states: {
      hover: 'Hover',
      active: 'Trykk',
      'nth-of-type(2n)': 'Partall/Oddetall',
    },
  },
  styleManager: {
    empty: 'Velg et element før du bruker stiladministrator',
    layer: 'Lag',
    fileButton: 'Bilder',
    sectors: {
      general: 'Generelt',
      layout: 'Utforming',
      typography: 'Typografi',
      decorations: 'Dekorasjoner',
      extra: 'Ekstra',
      flex: 'Flex',
      dimension: 'Dimensjon',
    },
    // Default names for sub properties in Composite and Stack types.
    // Other labels are generated directly from their property names (eg. 'font-size' will be 'Font size').
    properties: {
      'text-shadow-h': 'X',
      'text-shadow-v': 'Y',
      'text-shadow-blur': 'Uklarhet',
      'text-shadow-color': 'Farge',
      'box-shadow-h': 'X',
      'box-shadow-v': 'Y',
      'box-shadow-blur': 'Uklarhet',
      'box-shadow-spread': 'Spredning',
      'box-shadow-color': 'Farge',
      'box-shadow-type': 'Type',
      'margin-top-sub': 'Topp',
      'margin-right-sub': 'Høyre',
      'margin-bottom-sub': 'Bunn',
      'margin-left-sub': 'Venstre',
      'padding-top-sub': 'Topp',
      'padding-right-sub': 'Høyre',
      'padding-bottom-sub': 'Bunn',
      'padding-left-sub': 'Venstre',
      'border-width-sub': 'Bredde',
      'border-style-sub': 'Stil',
      'border-color-sub': 'Farge',
      'border-top-left-radius-sub': 'Venstre topp',
      'border-top-right-radius-sub': 'Høyre topp',
      'border-bottom-right-radius-sub': 'Høyre bunn',
      'border-bottom-left-radius-sub': 'Venstre bunn',
      'transform-rotate-x': 'Roter X',
      'transform-rotate-y': 'Roter Y',
      'transform-rotate-z': 'Roter Z',
      'transform-scale-x': 'Skaler X',
      'transform-scale-y': 'Skaler Y',
      'transform-scale-z': 'Skaler Z',
      'transition-property-sub': 'Egenskap',
      'transition-duration-sub': 'Varighet',
      'transition-timing-function-sub': 'Timing',
      'background-image-sub': 'Bilde',
      'background-repeat-sub': 'Gjenta',
      'background-position-sub': 'Posisjon',
      'background-attachment-sub': 'Vedlegg',
      'background-size-sub': 'Størrelse',
    },
    // Translate options in style properties
    // options: {
    //   float: { // Id of the property
    //     ...
    //     left: 'Left', // {option id}: {Option label}
    //   }
    // }
  },
  traitManager: {
    empty: 'Velg et element før du bruker egenskapsadministrator',
    label: 'Komponentinnstillinger',
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        // id: 'Id',
        // alt: 'Alt',
        // title: 'Title',
        // href: 'Href',
      },
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'f.eks. https://google.com' },
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'Dette vinduet',
          _blank: 'Nytt vindu',
        },
      },
    },
  },
  storageManager: {
    recover: 'Vil du gjenopprette ulagrede endringer?',
  },
};
