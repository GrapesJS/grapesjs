export const loadScript = url => new Promise((resolve, reject) => {
  const script = document.createElement('script');
  script.onload = resolve;
  script.onerror = reject;
  script.src = url;
  document.head.appendChild(script);
});

export const loadStyle = url => new Promise((resolve) => {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.type = 'text/css';
  link.href = url;
  document.head.appendChild(link);
  resolve();
});


// Don't know yet why but can't use ES6

var blockManager = {
  appendTo: '#blocks2',
  blocks: [
    {
      id: 'section', // id is mandatory
      label: '<b>Section</b>',
      attributes: { class:'gjs-block-section' },
      content: `<section>
        <h1>This is a simple title</h1>
        <div>This is just a Lorem text: Lorem ipsum dolor sit amet, consectetur adipiscing elit</div>
      </section>`,
    }, {
      id: 'text',
      label: 'Text',
      content: '<div data-gjs-type="text">Insert your text here</div>',
    }, {
      id: 'image',
      label: 'Image',
      // Select the component once dropped in canavas
      select: true,
      // You can pass components as a JSON instead of a simple HTML string,
      // in this case we also use a defined component type `image`
      content: { type: 'image' },
      // This triggers `active` on dropped components
      activate: true,
    }
  ]
};

var blockManagerIcons = Object.assign({}, blockManager, {
  blocks: [
    Object.assign({}, blockManager.blocks[0], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3H5c-1.11 0-2 .89-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5a2 2 0 0 0-2-2m0 2v14H5V5h14z"></path></svg>',
    }),
    Object.assign({}, blockManager.blocks[1], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.5 4l1.16 4.35-.96.26c-.45-.87-.91-1.74-1.44-2.18C16.73 6 16.11 6 15.5 6H13v10.5c0 .5 0 1 .33 1.25.34.25 1 .25 1.67.25v1H9v-1c.67 0 1.33 0 1.67-.25.33-.25.33-.75.33-1.25V6H8.5c-.61 0-1.23 0-1.76.43-.53.44-.99 1.31-1.44 2.18l-.96-.26L5.5 4h13z"></path></svg>',
    }),
    Object.assign({}, blockManager.blocks[2], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M20 5c1.1 0 2 .9 2 2v10c0 1.1-.9 2-2 2H4a2 2 0 0 1-2-2V7c0-1.11.89-2 2-2h16M5 16h14l-4.5-6-3.5 4.5-2.5-3L5 16z"></path></svg>',
    }),
  ]
});

var styleManager = {
  sectors: [{
      name: 'Dimension',
      open: false,
      // Use built-in properties
      buildProps: ['width', 'min-height', 'padding'],
      // Use `properties` to define/override single property
      properties: [
        {
          // Type of the input,
          // options: integer | radio | select | color | slider | file | composite | stack
          type: 'integer',
          name: 'The width', // Label for the property
          property: 'width', // CSS property (if buildProps contains it will be extended)
          units: ['px', '%'], // Units, available only for 'integer' types
          defaults: 'auto', // Default value
          min: 0, // Min value, available only for 'integer' types
        }
      ]
    },{
      name: 'Extra',
      open: false,
      buildProps: ['background-color', 'box-shadow', 'custom-prop'],
      properties: [
        {
          id: 'custom-prop',
          name: 'Custom Label',
          property: 'font-size',
          type: 'select',
          defaults: '32px',
          // List of options, available only for 'select' and 'radio'  types
          options: [
            { value: '12px', name: 'Tiny' },
            { value: '18px', name: 'Medium' },
            { value: '32px', name: 'Big' },
          ],
       }
      ]
    }]
};

var layerManager = { scrollLayers: 0 };
var selectorManager = {};
var traitManager = {};
var deviceManager = {
  devices: [{
      name: 'Desktop',
      width: '', // default size
    }, {
      name: 'Mobile',
      width: '320px', // this value will be used on canvas width
      widthMedia: '480px', // this value will be used in CSS @media
  }]
};

var panelTop = { id: 'panel-top' };
var panelBasicActions = {
  id: 'panel-basic',
  buttons: [
    {
      id: 'visibility',
      // active by default
      active: true,
      className: 'btn-toggle-borders',
      label: '<u>B</u>',
      // Built-in command
      command: 'sw-visibility',
    }, {
      id: 'export',
      className: 'btn-open-export',
      label: 'Exp',
      command: 'export-template',
      // For grouping context of buttons in the same panel
      context: 'export-template',
    }, {
      id: 'show-json',
      className: 'btn-show-json',
      label: 'JSON',
      context: 'show-json',
      command(editor) {
        editor.Modal.setTitle('Components JSON')
          .setContent(`<textarea style="width:100%; height: 250px;">
            ${JSON.stringify(editor.getComponents())}
          </textarea>`)
          .open();
      },
    }
  ],
};
var panelBasicActionsIcons = Object.assign({}, panelBasicActions, {
  buttons: [
    Object.assign({}, panelBasicActions.buttons[0], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15 5h2V3h-2m0 18h2v-2h-2M11 5h2V3h-2m8 2h2V3h-2m0 6h2V7h-2m0 14h2v-2h-2m0-6h2v-2h-2m0 6h2v-2h-2M3 5h2V3H3m0 6h2V7H3m0 6h2v-2H3m0 6h2v-2H3m0 6h2v-2H3m8 2h2v-2h-2m-4 2h2v-2H7M7 5h2V3H7v2z"></path></svg>',
    }),
    Object.assign({}, panelBasicActions.buttons[1], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 20h14v-2H5m14-9h-4V3H9v6H5l7 7 7-7z"></path></svg>',
    }),
    Object.assign({}, panelBasicActions.buttons[2], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M8 3c-1.1 0-2 .9-2 2v4c0 1.1-.9 2-2 2H3v2h1c1.1 0 2 .9 2 2v4c0 1.1.9 2 2 2h2v-2H8v-5c0-1.1-.9-2-2-2 1.1 0 2-.9 2-2V5h2V3m6 0c1.1 0 2 .9 2 2v4c0 1.1.9 2 2 2h1v2h-1c-1.1 0-2 .9-2 2v4c0 1.1-.9 2-2 2h-2v-2h2v-5c0-1.1.9-2 2-2-1.1 0-2-.9-2-2V5h-2V3h2z"></path></svg>',
    }),
  ]
});
var panelSidebar = {
  el: '#panel__right4',
  id: 'layers',
  // Make the panel resizable
  resizable: {
    maxDim: 350,
    minDim: 200,
    tc: 0, // Top handler
    cl: 1, // Left handler
    cr: 0, // Right handler
    bc: 0, // Bottom handler
    // Being a flex child we need to change `flex-basis` property
    // instead of the `width` (default)
    keyWidth: 'flex-basis',
  },
};

var buttonShowLayers = {
  id: 'show-layers',
  active: true,
  togglable: false,
  label: 'Layers',
  command: {
    getRowEl(editor) { return editor.getContainer().parentNode.parentNode; },
    getLayersEl(row) { return row.querySelector('.layers-container') },
    getStyleEl(row) { return row.querySelector('.styles-container') },

    run(editor, sender) {
      const row = this.getRowEl(editor);
      const lmEl = this.getLayersEl(row);
      lmEl.style.display = '';
    },
    stop(editor, sender) {
      const row = this.getRowEl(editor);
      const lmEl = this.getLayersEl(row);
      lmEl.style.display = 'none';
    },
  },
};
var buttonShowStyle = {
  id: 'show-style',
  label: 'Styles',
  togglable: false,
  active: true,
  command: {
    getRowEl(editor) { return editor.getContainer().parentNode.parentNode; },
    getLayersEl(row) { return row.querySelector('.layers-container') },
    getStyleEl(row) { return row.querySelector('.styles-container') },

    run(editor, sender) {
      const row = this.getRowEl(editor);
      const smEl = this.getStyleEl(row);
      smEl.style.display = '';
    },
    stop(editor, sender) {
      const row = this.getRowEl(editor);
      const smEl = this.getStyleEl(row);
      smEl.style.display = 'none';
    },
  },
};
var buttonShowTraits = {
  id: 'show-traits',
  label: 'Traits',
  togglable: false,
  active: true,
  command: {
    getTraitsEl(editor) {
      const row = editor.getContainer().closest('.editor-row');
      return row.querySelector('.traits-container');
    },
    run(editor, sender) {
      this.getTraitsEl(editor).style.display = '';
    },
    stop(editor, sender) {
      this.getTraitsEl(editor).style.display = 'none';
    },
  },
};

var panelSwitcher = {
  id: 'panel-switcher',
  buttons: [
    buttonShowLayers,
    buttonShowStyle,
  ],
};

var panelSwitcherTraits = {
  id: 'panel-switcher',
  buttons: [
    buttonShowLayers,
    buttonShowStyle,
    buttonShowTraits,
  ],
};

var panelSwitcherTraitsIcons = {
  id: 'panel-switcher',
  buttons: [
    Object.assign({}, buttonShowLayers, {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 16l7.36-5.73L21 9l-9-7-9 7 1.63 1.27M12 18.54l-7.38-5.73L3 14.07l9 7 9-7-1.63-1.27L12 18.54z"></path></svg>',
    }),
    Object.assign({}, buttonShowStyle, {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M17.5 12c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5m-3-4c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8m-5 0C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8m-3 4c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12M12 3a9 9 0 0 0 0 18c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1-.23-.27-.38-.62-.38-1 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z"></path></svg>',
    }),
    Object.assign({}, buttonShowTraits, {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 15.5c-1.93 0-3.5-1.57-3.5-3.5s1.57-3.5 3.5-3.5 3.5 1.57 3.5 3.5-1.57 3.5-3.5 3.5m7.43-2.53c.04-.32.07-.64.07-.97 0-.33-.03-.66-.07-1l2.11-1.63c.19-.15.24-.42.12-.64l-2-3.46c-.12-.22-.39-.31-.61-.22l-2.49 1c-.52-.39-1.06-.73-1.69-.98l-.37-2.65A.506.506 0 0 0 14 2h-4c-.25 0-.46.18-.5.42l-.37 2.65c-.63.25-1.17.59-1.69.98l-2.49-1c-.22-.09-.49 0-.61.22l-2 3.46c-.13.22-.07.49.12.64L4.57 11c-.04.34-.07.67-.07 1 0 .33.03.65.07.97l-2.11 1.66c-.19.15-.25.42-.12.64l2 3.46c.12.22.39.3.61.22l2.49-1.01c.52.4 1.06.74 1.69.99l.37 2.65c.04.24.25.42.5.42h4c.25 0 .46-.18.5-.42l.37-2.65c.63-.26 1.17-.59 1.69-.99l2.49 1.01c.22.08.49 0 .61-.22l2-3.46c.12-.22.07-.49-.12-.64l-2.11-1.66z"></path></svg>',
    }),
  ],
};

var panelDevices = {
  id: 'panel-devices',
  buttons: [{
      id: 'device-desktop',
      label: 'D',
      command: { run: editor => editor.setDevice('Desktop') },
      active: true,
      togglable: false,
    }, {
      id: 'device-mobile',
      label: 'M',
      command: { run: editor => editor.setDevice('Mobile') },
      togglable: false,
  }],
};

var panelDevicesIcons = Object.assign({}, panelDevices, {
  buttons: [
    Object.assign({}, panelDevices.buttons[0], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M21 14H3V4h18m0-2H3c-1.11 0-2 .89-2 2v12c0 1.1.9 2 2 2h7l-2 3v1h8v-1l-2-3h7c1.1 0 2-.9 2-2V4a2 2 0 0 0-2-2z"></path></svg>',
    }),
    Object.assign({}, panelDevices.buttons[1], {
      label: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M16 18H7V4h9m-4.5 18c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5m4-21h-8A2.5 2.5 0 0 0 5 3.5v17A2.5 2.5 0 0 0 7.5 23h8a2.5 2.5 0 0 0 2.5-2.5v-17A2.5 2.5 0 0 0 15.5 1z"></path></svg>',
    }),
  ]
});

var gjsConfigStart = {
  // Indicate where to init the editor. It's also possible to pass an HTMLElement
  container: '#gjs',
  // Get the content for the canvas direectly from the element
  // As an alternative we could use: `components: '<h1>Hello World Component!</h1>'`,
  fromElement: true,
  // Size of the editor
  height: '300px',
  width: 'auto',
  // Disable the storage manager for the moment
  storageManager: { type: null },
  // Avoid any default panel
  panels: { defaults: [] },
};

var gjsConfigBlocks = Object.assign({}, gjsConfigStart, {
  container: '#gjs2',
  blockManager,
});

var gjsConfigPanels = Object.assign({}, gjsConfigBlocks, {
  container: '#gjs3',
  blockManager: Object.assign({}, blockManager, { appendTo: '#blocks3' }),
});

var gjsConfigLayers = Object.assign({}, gjsConfigBlocks, {
  container: '#gjs4',
  blockManager: Object.assign({}, blockManager, { appendTo: '#blocks4' }),
  layerManager: { appendTo: '#layers-container', scrollLayers: 0 },
  panels: { defaults: [panelSidebar] }
});

var gjsConfigStyle = Object.assign({}, gjsConfigBlocks, {
  container: '#gjs5',
  blockManager: Object.assign({}, blockManager, { appendTo: '#blocks5' }),
  layerManager: { appendTo: '#layers-container5', scrollLayers: 0 },
  styleManager: Object.assign({}, styleManager, { appendTo: '#styles-container5' }),
  selectorManager: Object.assign({}, selectorManager, { appendTo: '#styles-container5' }),
});

var gjsConfigTraits = Object.assign({}, gjsConfigBlocks, {
  container: '#gjs6',
  blockManager: Object.assign({}, blockManager, { appendTo: '#blocks6' }),
  layerManager: Object.assign({}, layerManager, { appendTo: '#layers-container6' }),
  styleManager: Object.assign({}, styleManager, { appendTo: '#styles-container6' }),
  traitManager: Object.assign({}, traitManager, { appendTo: '#traits-container6' }),
  selectorManager: Object.assign({}, selectorManager, { appendTo: '#styles-container6' }),
});

var gjsConfigDevices = Object.assign({}, gjsConfigBlocks, {
  container: '#gjs7',
  blockManager: Object.assign({}, blockManager, { appendTo: '#blocks7' }),
  layerManager: Object.assign({}, layerManager, { appendTo: '#layers-container7' }),
  styleManager: Object.assign({}, styleManager, { appendTo: '#styles-container7' }),
  traitManager: Object.assign({}, traitManager, { appendTo: '#traits-container7' }),
  selectorManager: Object.assign({}, selectorManager, { appendTo: '#styles-container7' }),
  deviceManager,
});

var gjsConfigTheme = Object.assign({}, gjsConfigBlocks, {
  container: '#gjs8',
  blockManager: Object.assign({}, blockManagerIcons, { appendTo: '#blocks8' }),
  layerManager: Object.assign({}, layerManager, { appendTo: '#layers-container8' }),
  styleManager: Object.assign({}, styleManager, { appendTo: '#styles-container8' }),
  traitManager: Object.assign({}, traitManager, { appendTo: '#traits-container8' }),
  selectorManager: Object.assign({}, selectorManager, { appendTo: '#styles-container8' }),
  deviceManager,
});

export default {
  gjsConfigStart,
  gjsConfigBlocks,
  gjsConfigPanels,
  gjsConfigLayers,
  gjsConfigStyle,
  gjsConfigTraits,
  gjsConfigDevices,
  gjsConfigTheme,
  panelTop,
  panelBasicActions,
  panelBasicActionsIcons,
  panelSidebar,
  panelSwitcher,
  panelSwitcherTraits,
  panelSwitcherTraitsIcons,
  panelDevices,
  panelDevicesIcons,
};
