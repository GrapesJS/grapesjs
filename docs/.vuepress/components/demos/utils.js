module.exports = {
  gjsConfig: {
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
  },
};
