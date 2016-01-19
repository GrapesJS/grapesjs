define(function () {
	var config = {
			
		// Style prefix
		stylePrefix: 			'wte-',
		
		// Prefix to use inside local storage name
		storagePrefix: 			'wte-',
		
		// Editor ID. Useful in case of multiple editors on the same page
		id						: '',
		
		// Where render the editor
		container 				: '',
		
		idCanvas				: 'canvas',
		
		idCanvasOverlay			: 'canvas-overlay',
		
		idWrapper 				: 'wrapper',
		
		// Enable/Disable undo manager 
		undoManager 			: true,
		
		// Enable/Disable autosaving 
		autosave 				: true,		
		
		//Indicates which storage to use. Available: local | remote | none
		storageType				: 'local',
		
		// If autosave enabled, indicates how many changes (general changes to structure)
		// need to be done before save. Useful with remoteStorage to reduce remote calls
		changesBeforeSave: 1,				
		
		//Enabled only if localStorage is false
		remoteStorage			: {},
		
		//Configurations for Asset Manager
		assetManager			: {},
		
		//Configurations for Canvas
		canvas					: {},
		
		//Configurations for Style Manager
		styleManager			: {},
		
		//Configurations for Layers
		layers					: {},
		
		//Configurations for Storage Manager
		storageManager			: {},
		
		//Configurations for Rich Text Editor
		rte						: {},
		
		//Configurations for Components
		components				: {},
		
		//Configurations for Modal Dialog
		modal					: {},
		
		//Configurations for Code Manager
		codeManager				: {},
		
		//Configurations for Panels
		panels					: {},
		
		//Configurations for Commands
		commands				: {},
		
	};
	return config;
});