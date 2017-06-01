module.exports = {
  // If true renders editor on init
  autorender: 1,

  // Where init the editor
  container: '',

  // HTML string or object of components
  components: '',

  // CSS string or object of rules
  style: '',

  // If true, will fetch HTML and CSS from selected container
  fromElement: 0,

  // ---
  // Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components
  copyPaste: true,

  // Enable/Disable undo manager
  undoManager: true,

  // Storage Manager
  storageManager: {},

  // Array of plugins to init
  plugins: [],

  // Custom options for plugins
  pluginsOpts: {}
};
