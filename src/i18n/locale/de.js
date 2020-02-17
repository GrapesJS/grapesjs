const traitInputAttr = { placeholder: 'ex. Votre texte ici' };

export default {
  assetManager: {
    addButton: 'Bild hinzufügen',
    inputPlh: 'http://chemin/vers/image.jpg',
    modalTitle: 'Bild auswählen',
    uploadTitle: 'Ziehe eine Datei hierher oder klicke auf upload'
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'Block Label',
    },
    categories: {
      // 'category-id': 'Kategorie Label',
    }
  },
  domComponents: {
    names: {
      '': 'Box',
      wrapper: 'Body',
      text: 'Text',
      comment: 'Kommentar',
      image: 'Bild',
      video: 'Video',
      label: 'Label',
      link: 'Link',
      map: 'Karte',
      tfoot: 'Tabellen Fußzeile',
      tbody: 'Tabellen Inhalt',
      thead: 'Tabellen Kopf',
      table: 'Tabelle',
      row: 'Zeile',
      cell: 'Zelle'
    }
  },
  deviceManager: {
    device: 'Gerät',
    devices: {
      desktop: 'Desktop',
      tablet: 'Tablet',
      mobileLandscape: 'Mobile Landscape',
      mobilePortrait: 'Mobile Portrait'
    }
  },
  panels: {
    buttons: {
      titles: {
        preview: 'Vorschau',
        fullscreen: 'Vollbild',
        'sw-visibility': 'Komponente anzeigen',
        'export-template': 'Code anzeigen',
        'open-sm': 'Stil Manager öffnen',
        'open-tm': 'Parameter',
        'open-layers': 'Layer Manager öffnen',
        'open-blocks': 'Block öffnen'
      }
    }
  },
  selectorManager: {
    label: 'Klassen',
    selected: 'Ausgewählt',
    emptyState: '- Status -',
    states: {
      hover: 'Hover',
      active: 'Klick',
      'nth-of-type(2n)': 'Gerade/Ungerade'
    }
  },
  styleManager: {
    empty:
      "Wählen sie ein Element aus bevor sie den Stil Manager nutzen",
    layer: 'Evene',
    fileButton: 'Bilder',
    sectors: {
      general: 'Allgemein',
      layout: 'Layout',
      typography: 'Typographie',
      decorations: 'Dekorationen',
      extra: 'Extra',
      flex: 'Flex',
      dimension: 'Dimension'
    },
    // The core library generates the name by their `property` name
    properties: {
      float: 'Ausrichtung',
      display: 'Anzeige',
      position: 'Position',
      top: 'Oben',
      right: 'Rechts',
      left: 'Links',
      bottom: 'Unten',
      width: 'Breite',
      height: 'Höhe',
      'max-width': 'Breite max.',
      'max-height': 'Höhe max.',
      margin: 'Äußerer Abstand',
      'margin-top': 'Äußerer Abstand oben',
      'margin-right': 'Äußerer Abstand rechts',
      'margin-left': 'Äußerer Abstand links',
      'margin-bottom': 'Äußerer Abstand unten',
      padding: 'Innerer Abstand',
      'padding-top': 'Innerer Abstand oben',
      'padding-left': 'Innerer Abstand links',
      'padding-right': 'Innerer Abstand rechts',
      'padding-bottom': 'Innerer Abstand unten',
      'font-family': 'Schrift Familie',
      'font-size': 'Schriftgröße',
      'font-weight': 'Schriftstärke',
      'letter-spacing': 'Buchstaben Abstand',
      color: 'Schriftfarbe',
      'line-height': 'Linien Höhe',
      'text-align': 'Text Ausrichtung',
      'text-shadow': 'Text Schatten',
      'text-shadow-h': 'Text Schatten: horizontal',
      'text-shadow-v': 'Text Schatten: vertikal',
      'text-shadow-blur': 'Text Schatten: unschärfe',
      'text-shadow-color': 'Text Schatten: Farbe',
      'border-top-left': 'Rand oben links',
      'border-top-right': 'Rand oben rechts',
      'border-bottom-left': 'Rand unten links',
      'border-bottom-right': 'Rand unten rechts',
      'border-radius-top-left': 'Rand Radius oben links',
      'border-radius-top-right': 'Rand Radius oben rechts',
      'border-radius-bottom-left': 'Rand Radius unten links',
      'border-radius-bottom-right': 'Rand Radius unten rechts',
      'border-radius': 'Rand Radius',
      border: 'Rand',
      'border-width': 'Rand Breite',
      'border-style': 'Rand Stil',
      'border-color': 'Rand Farbe',
      'box-shadow': 'Box Schatten',
      'box-shadow-h': 'Box Schatten: horizontal',
      'box-shadow-v': 'Box Schatten: vertikal',
      'box-shadow-blur': 'Box Schatten: Unschärfe',
      'box-shadow-spread': "Box Schatten: Streuung",
      'box-shadow-color': "Box Schatten: Farbe",
      'box-shadow-type': "Box Schatten: Typ",
      background: 'Hintergrund',
      'background-image': 'Hintergrund Bild',
      'background-repeat': 'Hintergrund wiederholen',
      'background-position': 'Hintergrund Position',
      'background-attachment': 'Hintergrund Anhang',
      'background-size': 'Hintergrund Größe',
      'background-color': 'Hintergrund Farbe',
      transition: 'Übergang',
      'transition-property': 'Übergang: Typ',
      'transition-duration': 'Übergang: Dauer',
      'transition-timing-function': 'Übergang: Zeitfunktion',
      perspective: 'Perspektive',
      transform: 'Transformation',
      'transform-rotate-x': 'Transformation: Rotation x',
      'transform-rotate-y': 'Transformation: Rotation y',
      'transform-rotate-z': 'Transformation: Rotation z',
      'transform-scale-x': 'Transformation: Skala x',
      'transform-scale-y': 'Transformation: Skala y',
      'transform-scale-z': 'Transformation: Skala z',
      'flex-direction': 'Ausrichtung Flex',
      'flex-wrap': 'Flex wrap',
      'justify-content': 'Content abgleichen',
      'align-items': 'Element Ausrichtung',
      'align-content': 'Contente Ausrichtung',
      order: 'Reihenfolge',
      'flex-basis': 'Flex Basis',
      'flex-grow': 'Flex Wachsen',
      'flex-shrink': 'Flex Schrumpfen',
      'align-self': 'Ausrichtung selbst'
    }
  },
  traitManager: {
    empty:
      "Wählen sie ein Element aus bevor sie den Komponenten Manager nutzen",
    label: 'Komponenten Einstellungen',
    traits: {
      // The core library generates the name by their `name` property
      labels: {
        id: 'ID',
        alt: 'Text Alternative',
        title: 'Titel',
        href: 'Link'
      },
      // In a simple trait, like text input, these are used on input attributes
      attributes: {
        id: traitInputAttr,
        alt: traitInputAttr,
        title: traitInputAttr,
        href: { placeholder: 'z.B. https://google.com' }
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'Dieses Fenster',
          _blank: 'Neues Fenster'
        }
      }
    }
  }
};
