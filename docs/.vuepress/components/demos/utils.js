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
var panelSwitcher = {
  id: 'panel-switcher',
  buttons: [
    {
      id: 'show-layers',
      active: true,
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
    }, {
      id: 'show-style',
      label: 'Styles',
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
    }
  ],
};

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
});

module.exports = {
  gjsConfigStart,
  gjsConfigBlocks,
  gjsConfigPanels,
  gjsConfigLayers,
  gjsConfigStyle,
  panelTop,
  panelBasicActions,
  panelSidebar,
  panelSwitcher,
};
