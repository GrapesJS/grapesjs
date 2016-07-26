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

		// Height for the editor container
		height: '900px',

		// Width for the editor container
		width: '100%',

		//Indicates which storage to use. Available: local | remote | none (!)
		storageType: 'local',

		// The css that could only be seen (for instance, inside the code viewer)
		protectedCss: 'body{margin:0;height:100%}#wrapper{height:100%}',

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

		//Configurations for Device Manager
		deviceManager: {
			'devices': [{
	        name: 'Desktop',
	        width: '',
	      },{
	        name: 'Tablet',
	        width: '992px',
	      },{
	        name: 'Mobile landscape',
	        width: '768px',
	      },{
	        name: 'Mobile portrait',
	        width: '480px',
	    }],
		},

		//Configurations for Block Manager
		blockManager: {
			'blocks': [{
					id: 'b1',
	        label: 'Block1',
	        content: '<h1>Block 1</h1>',
	      },{
					id: 'b2',
	        label: 'Block2',
	        content: '<h1>Block 2</h1>',
	      },{
					id: 'b3',
	        label: 'Block3',
	        content: '<h1>Block 3</h1>',
	      }],
		},

		// If true render a select of available devices
		showDevices: 1,

		// Dom element
		el: '',

	};
	return config;
});