define(function () {
  return {
    // Where init the editor
    container: '',

    // HTML string or object of components
    components: '',

    // CSS string or object of rules
    style: '',

    // If true, will fetch HTML and CSS from selected container
    fromElement: false,

    // Enable/Disable the possibility to copy(ctrl + c) & paste(ctrl + v) components
    copyPaste: true,

    // Enable/Disable undo manager
    undoManager: true,

    storageId: '', // (!)

    //Indicates which storage to use. Available: local | remote | none
    storageType: 'local', // (!)

    // More correct
    storage:{
        id: '',
        type: '',

        // Indicates if load data inside editor after init
        autoload: 1,
    },

    // Array of plugins to init
    plugins: [],
  };
});