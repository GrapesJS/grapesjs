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

module.exports = {
  gjsConfigStart,
  gjsConfigBlocks,
  gjsConfigPanels,
};
