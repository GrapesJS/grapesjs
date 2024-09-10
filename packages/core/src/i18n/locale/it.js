const traitInputAttr = { placeholder: 'es. Testo' };

export default {
  assetManager: {
    addButton: 'Aggiungi immagine',
    inputPlh: 'http://percorso/immagine.jpg',
    modalTitle: 'Seleziona immagine',
    uploadTitle: 'Trascina qui i tuoi file o clicca per caricarli',
  },
  domComponents: {
    names: {
      '': 'Elemento',
      wrapper: 'Contenitore',
      text: 'Testo',
      comment: 'Commento',
      image: 'Immagine',
      video: 'Video',
      label: 'Label',
      link: 'Link',
      map: 'Mappa',
      tfoot: 'Tabella piede',
      tbody: 'Tabella corpo',
      thead: 'Tabella testa',
      table: 'Tabella',
      row: 'Tabella riga',
      cell: 'Tabella colonna',
    },
  },
  deviceManager: {
    device: 'Dispositivo',
    devices: {
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobileLandscape: 'Mobile panoramica',
      mobilePortrait: 'Mobile',
    },
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Anteprima',
        fullscreen: 'Schermo intero',
        'sw-visibility': 'Mostra componenti',
        'export-template': 'Mostra codice',
        'open-sm': 'Mostra Style Manager',
        'open-tm': 'Configurazioni',
        'open-layers': 'Mostra Livelli',
        'open-blocks': 'Mostra Blocchi',
      },
    },
  },
  selectorManager: {
    label: 'Classi',
    selected: 'Selezionato',
    emptyState: '- Stati -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': 'Pari/Dispari',
    },
  },
  styleManager: {
    empty: 'Seleziona un elemento prima di usare il Style Manager',
    layer: 'Livello',
    fileButton: 'Immagini',
    sectors: {
      general: 'Generale',
      layout: 'Layout',
      typography: 'Tipografia',
      decorations: 'Decorazioni',
      extra: 'Extra',
      flex: 'Flex',
      dimension: 'Dimensioni',
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    },
  },
  traitManager: {
    empty: 'Seleziona un elemento prima di usare il Trait Manager',
    label: 'Configurazione componente',
    traits: {
      labels: {
        id: 'Id',
        alt: 'Alt',
        title: 'Titolo',
      },
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'es. https://google.com' },
      },
      options: {
        target: {
          false: 'Questa finestra',
          _blank: 'Nuova finestra',
        },
      },
    },
  },
};
