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
		protectedCss: '*{box-sizing: border-box;}body{margin:0;height:100%}#wrapper{min-height:100%; overflow:auto}',

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

		//Configurations for Css Composer
		cssComposer				: {},

		//Configurations for Selector Manager
		selectorManager: {},

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
	        content: '<div class="blk-row"><div class="blk1"></div></div>',
	        attributes: {class:'wte-fonts wte-f-b1'}
	      },{
					id: 'b2',
	        label: '2 Blocks',
	        content: '<div class="blk-row"><div class="blk2"></div><div class="blk2"></div></div>',
	        attributes: {class:'wte-fonts wte-f-b2'}
	      },{
					id: 'b3',
	        label: '3 Blocks',
	        content: '<div class="blk-row"><div class="blk3"></div><div class="blk3"></div><div class="blk3"></div></div>',
	        attributes: {class:'wte-fonts wte-f-b3'}
	      },{
					id: 'b4',
	        label: '3/7 Block',
	        content: '<div class="blk-row"><div class="blk37l"></div><div class="blk37r"></div></div></div>',
	        attributes: {class:'wte-fonts wte-f-b37'}
	      },{
					id: 'hero',
	        label: 'Hero section',
	        content: '<header class="header-banner"> <div class="container-width">'+
							'<div class="logo-container"><div class="logo">GrapesJS</div></div>'+
							'<nav class="navbar">'+
								'<div class="menu-item">BUILDER</div><div class="menu-item">TEMPLATE</div><div class="menu-item">WEB</div>'+
							'</nav><div class="clearfix"></div>'+
							'<div class="lead-title">Build your templates without coding</div>'+
							'<div class="lead-btn">Try it now</div></div></header>',
	        attributes: {class:'wte-fonts wte-f-hero'}
	      },{
					id: 'h1p',
	        label: 'Text section',
	        content: '<h1 class="heading">Insert title here</h1><p class="paragraph">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>',
	        attributes: {class:'wte-fonts wte-f-h1p'}
	      },{
					id: '3ba',
	        label: 'Badges',
	        content: '<div class="badges">'+
	        	'<div class="badge">'+
							'<div class="badge-header"></div>'+
							'<img class="badge-avatar" src="img/team1.jpg">'+
							'<div class="badge-body">'+
								'<div class="badge-name">Adam Smith</div><div class="badge-role">CEO</div><div class="badge-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit</div>'+
							'</div>'+
							'<div class="badge-foot"><span class="badge-link">f</span><span class="badge-link">t</span><span class="badge-link">ln</span></div>'+
						'</div>'+
						'<div class="badge">'+
							'<div class="badge-header"></div>'+
							'<img class="badge-avatar" src="img/team2.jpg">'+
							'<div class="badge-body">'+
								'<div class="badge-name">John Black</div><div class="badge-role">Software Engineer</div><div class="badge-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit</div>'+
							'</div>'+
							'<div class="badge-foot"><span class="badge-link">f</span><span class="badge-link">t</span><span class="badge-link">ln</span></div>'+
						'</div>'+
						'<div class="badge">'+
							'<div class="badge-header"></div>'+
							'<img class="badge-avatar" src="img/team3.jpg">'+
							'<div class="badge-body">'+
								'<div class="badge-name">Jessica White</div><div class="badge-role">Web Designer</div><div class="badge-desc">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit</div>'+
							'</div>'+
							'<div class="badge-foot"><span class="badge-link">f</span><span class="badge-link">t</span><span class="badge-link">ln</span>'+
							'</div>'+
						'</div></div>',
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
	        content: '<blockquote class="quote">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit</blockquote>',
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