define(function () {
	var blkStyle = '.blk-row::after{ content: ""; clear: both; display: block;} .blk-row{padding: 10px;}';
	return {

		// Style prefix
		stylePrefix: 'gjs-',

		//TEMP
		components: '',

		// Enable/Disable possibility to copy(ctrl + c) & paste(ctrl + v) components
		copyPaste: true,

		// Enable/Disable undo manager
		undoManager: true,

		// Height for the editor container
		height: '900px',

		// Width for the editor container
		width: '100%',

		// The css that could only be seen (for instance, inside the code viewer)
		protectedCss: '*{box-sizing: border-box;}body{margin:0;height:100%}#wrapper{min-height:100%; overflow:auto}',

		// Default command
		defaultCommand: 'select-comp',

		// Show a toolbar when the component is selected
		showToolbar: 0,

		// Allow script tag importing
		allowScripts: 0,

		// If true render a select of available devices
		showDevices: 1,

		// When enabled, on device change media rules won't be created
		devicePreviewMode: 0,

		// Dom element
		el: '',

		//Configurations for Asset Manager
		assetManager: {},

		//Configurations for Canvas
		canvas: {},

		//Configurations for Layers
		layers: {},

		//Configurations for Storage Manager
		storageManager: {},

		//Configurations for Rich Text Editor
		rte: {},

		//Configurations for DomComponents
		domComponents: {},

		//Configurations for Modal Dialog
		modal: {},

		//Configurations for Code Manager
		codeManager: {},

		//Configurations for Panels
		panels: {},

		//Configurations for Commands
		commands: {},

		//Configurations for Css Composer
		cssComposer: {},

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

		//Configurations for Style Manager
		styleManager: {

			sectors: [{
					name: 'General',
					open: false,
					buildProps: ['float', 'display', 'position', 'top', 'right', 'left', 'bottom'],
		    },{
					name: 'Dimension',
					open: false,
					buildProps: ['width', 'height', 'max-width', 'min-height', 'margin', 'padding'],
		    },{
					name: 'Typography',
					open: false,
					buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align', 'text-shadow'],
					properties: [{
					    property: 'text-align',
					    list        : [
					        {value: 'left', className: 'fa fa-align-left'},
					        {value: 'center', className: 'fa fa-align-center' },
					        {value: 'right', className: 'fa fa-align-right'},
					        {value: 'justify', className: 'fa fa-align-justify'}
					    ],
					}]
		    },{
					name: 'Decorations',
					open: false,
					buildProps: ['border-radius-c', 'background-color', 'border-radius', 'border', 'box-shadow', 'background'],
		    },{
					name: 'Extra',
					open: false,
					buildProps: ['transition', 'perspective', 'transform'],
		    }],

		},

		//Configurations for Block Manager
		blockManager: {
			'blocks': [{
					id: 'b1',
	        label: '1 Block',
	        content: '<div class="blk-row"><div class="blk1"></div></div><style>'+ blkStyle +'.blk1{width: 100%;padding: 10px;min-height: 75px;}</style>',
	        attributes: {class:'gjs-fonts gjs-f-b1'}
	      },{
					id: 'b2',
	        label: '2 Blocks',
	        content: '<div class="blk-row"><div class="blk2"></div><div class="blk2"></div></div><style>'+ blkStyle +'.blk2{float: left;width: 50%;padding: 10px;min-height: 75px;}</style>',
	        attributes: {class:'gjs-fonts gjs-f-b2'}
	      },{
					id: 'b3',
	        label: '3 Blocks',
	        content: '<div class="blk-row"><div class="blk3"></div><div class="blk3"></div><div class="blk3"></div></div><style>'+ blkStyle +'.blk3{float: left;width: 33.3333%;padding: 10px;min-height: 75px;}</style>',
	        attributes: {class:'gjs-fonts gjs-f-b3'}
	      },{
					id: 'b4',
	        label: '3/7 Block',
	        content: '<div class="blk-row"><div class="blk37l"></div><div class="blk37r"></div></div></div><style>'+ blkStyle +'.blk37l{float: left;width: 30%;padding: 10px;min-height: 75px;}.blk37r{float: left;width: 70%;padding: 10px;min-height: 75px;}</style>',
	        attributes: {class:'gjs-fonts gjs-f-b37'}
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
	        attributes: {class:'gjs-fonts gjs-f-hero'}
	      },{
					id: 'h1p',
	        label: 'Text section',
	        content: '<h1 class="heading">Insert title here</h1><p class="paragraph">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua</p>',
	        attributes: {class:'gjs-fonts gjs-f-h1p'}
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
	        attributes: {class:'gjs-fonts gjs-f-3ba'}
	      },{
					id: 'text',
	        label: 'Text',
	        attributes: {class:'gjs-fonts gjs-f-text'},
	        content: {
	        	type:'text',
	        	content:'Insert your text here',
	        	style: {padding: '10px' },
	        	activeOnRender: 1
	        },
	      },{
					id: 'image',
	        label: 'Image',
	        attributes: {class:'gjs-fonts gjs-f-image'},
	        content: {
						style: {color: 'black'},
						type:'image',
						activeOnRender: 1
					},
	      },{
					id: 'quo',
	        label: 'Quote',
	        content: '<blockquote class="quote">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore ipsum dolor sit</blockquote>',
	        attributes: {class:'fa fa-quote-right'}
	      },{
					id: 'link',
	        label: 'Link',
	        attributes: {class:'fa fa-link'},
	        content: {
						type:'link',
						content:'Link',
						style:{color: '#d983a6'}
					},
	      },{
					id: 'map',
	        label: 'Map',
	        attributes: {class:'fa fa-map-o'},
	        content: {
						type: 'map',
						style: {height: '350px'}
					},
	      },{
					id: 'video',
	        label: 'Video',
	        attributes: {class:'fa fa-youtube-play'},
	        content: {
						type: 'video',
						src: 'img/video2.webm',
						style: {
							height: '350px',
							width: '615px',
						}
					},
	      }/*,{
					id: 'table',
	        label: 'Table',
	        attributes: {class:'fa fa-table'},
	        content: {
						type: 'table',
						columns: 3,
						rows: 5,
						style: {height: '150px', width: '100%'}
					},
	      }*/],
		},

	};
});
