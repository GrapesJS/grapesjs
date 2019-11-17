const traitInputAttr = { placeholder: 'eg. Text here' };

export default {
  assetManager: {
    addButton: 'Add image',
    inputPlh: 'http://path/to/the/image.jpg',
    modalTitle: 'Select Image',
    uploadTitle: 'Drop files here or click to upload'
  },
  // Here just as a reference, GrapesJS core doesn't contain any block,
  // so this should be omitted from other local files
  blockManager: {
    labels: {
      // 'block-id': 'Block Label',
    },
    categories: {
      // 'category-id': 'Category Label',
    }
  },
  domComponents: {
    names: {
      '': 'Box',
      wrapper: 'Body',
      text: 'Text',
      comment: 'Comment',
      image: 'Image',
      video: 'Video',
      label: 'Label',
      link: 'Link',
      map: 'Map',
      tfoot: 'Table foot',
      tbody: 'Table body',
      thead: 'Table head',
      table: 'Table',
      row: 'Table row',
      cell: 'Table cell'
    }
  },
  deviceManager: {
    device: 'Device',
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
        preview: 'Preview',
        fullscreen: 'Fullscreen',
        'sw-visibility': 'View components',
        'export-template': 'View code',
        'open-sm': 'Open Style Manager',
        'open-tm': 'Settings',
        'open-layers': 'Open Layer Manager',
        'open-blocks': 'Open Blocks'
      }
    }
  },
  selectorManager: {
    label: 'Classes',
    selected: 'Selected',
    emptyState: '- State -',
    states: {
      hover: 'Hover',
      active: 'Click',
      'nth-of-type(2n)': 'Even/Odd'
    }
  },
  styleManager: {
    empty: 'Select an element before using Style Manager',
    layer: 'Layer',
    fileButton: 'Images',
    sectors: {
      general: 'General',
      layout: 'Layout',
      typography: 'Typography',
      decorations: 'Decorations',
      extra: 'Extra',
      flex: 'Flex',
      dimension: 'Dimension'
    },
    // The core library generates the name by their `property` name
    properties: {
      // float: 'Float',
    }
  },
  traitManager: {
    empty: 'Select an element before using Trait Manager',
    label: 'Component settings',
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
        href: { placeholder: 'eg. https://google.com' }
      },
      // In a trait like select, these are used to translate option names
      options: {
        target: {
          false: 'This window',
          _blank: 'New window'
        }
      }
    }
  }
};
