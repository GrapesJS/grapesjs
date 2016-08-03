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
		protectedCss: 'body{margin:0;height:100%}#wrapper{min-height:100%; overflow:auto}',

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
	        label: '1 Block',
	        content: '<h1>Block 1</h1>',
	        attributes: {class:'wte-fonts wte-f-b1'}
	      },{
					id: 'b2',
	        label: '2 Blocks',
	        content: '<h2>Block 2</h2>',
	        attributes: {class:'wte-fonts wte-f-b2'}
	      },{
					id: 'b3',
	        label: '3 Blocks',
	        content: '<div>Block 3</div>',
	        attributes: {class:'wte-fonts wte-f-b3'}
	      },{
					id: 'b4',
	        label: '3/7 Block',
	        content: '<div>Block 4</div>',
	        attributes: {class:'wte-fonts wte-f-b37'}
	      },{
					id: 'hero',
	        label: 'Hero section',
	        content: '<div>Hero here</div>',
	        attributes: {class:'wte-fonts wte-f-hero'}
	      },{
					id: 'h1p',
	        label: 'Text section',
	        content: '<div>Text text text</div>',
	        attributes: {class:'wte-fonts wte-f-h1p'}
	      },{
					id: '3ba',
	        label: 'Badges',
	        content: '<div>Badges</div>',
	        attributes: {class:'wte-fonts wte-f-3ba'}
	      },{
					id: 'text',
	        label: 'Text',
	        attributes: {class:'wte-fonts wte-f-text'},
	        content: {
	        	type:'text',
	        	content:'Insert your text here',
	        	style: {padding: '10px' },
	        	activeOnRender: 1
	        },
	      },{
					id: 'image',
	        label: 'Image',
	        attributes: {class:'wte-fonts wte-f-image'},
	        content: { type:'image',  activeOnRender: 1},
	      },{
					id: 'quo',
	        label: 'Quote',
	        content: '<quoteTag>Quote</quoteTag>',
	        attributes: {class:'wte-fonts wte-f-quo'}
	      }],
		},

		// Default command
		defaultCommand: 'select-comp',

		// If true render a select of available devices
		showDevices: 1,

		// Dom element
		el: '',

	};
	return config;
});