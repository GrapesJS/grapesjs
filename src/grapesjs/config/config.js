define(function () {
  return {
    // Where init the editor
    container: '',

    // HTML string or object of components
    components: '',

    // CSS string or object of rules
    style: '',

    // If true, will fetch HTML and CSS from selected element
    fromElement: false,

    // Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components
    copyPaste: true,

    // Enable/Disable undo manager
    undoManager: true,

    storageId: '', // (!)

    //Indicates which storage to use. Available: local | remote | none
    storageType: 'local', // (!)

    storage:{
        id: '',
        type: '',
    },

    // Array of plugins to init
    plugins: [],
  };
});