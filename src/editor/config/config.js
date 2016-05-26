define(function () {
	var config = {

		//TEMP
		components: '',

		// Style prefix
		stylePrefix: 'wte-',

		// Prefix to use inside local storage name (!)
		storagePrefix: 'wte-',

		// Editor ID. Useful in case of multiple editors on the same page (!)
		id: '',

		// Where render the editor
		container: '',

		idCanvas					: 'canvas', //(!)

		idCanvasOverlay		: 'canvas-overlay', //(!)

		idWrapper 				: 'wrapper', //(!)

		// Enable/Disable possibility to copy(ctrl + c) & paste(ctrl + v) components
		copyPaste: true,

		// Enable/Disable undo manager
		undoManager: true,

		//Indicates which storage to use. Available: local | remote | none (!)
		storageType: 'local',

		//Configurations for Asset Manager
		assetManager			: {},

		//Configurations for Canvas
		canvas						: {},

		//Configurations for Style Manager
		styleManager			: {},

		//Configurations for Layers
		layers						: {},

		//Configurations for Storage Manager
		storageManager		: {},

		//Configurations for Rich Text Editor
		rte								: {},

		//Configurations for DomComponents
		domComponents			: {},

		//Configurations for Modal Dialog
		modal							: {},

		//Configurations for Code Manager
		codeManager				: {},

		//Configurations for Panels
		panels						: {},

		//Configurations for Commands
		commands					: {},

		//Configurations for Class Manager
		classManager			: {},

		//Configurations for Css Composer
		cssComposer				: {},

	};
	return config;
});