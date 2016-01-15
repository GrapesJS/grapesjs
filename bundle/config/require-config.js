require.config({
	shim: {
		underscore: { 
			exports: '_' 
		},
		backbone: {
			deps: [ 'underscore', 'jquery' ],
			exports: 'Backbone'
		},
		rte: {
			deps: [ 'jquery' ],
			exports: 'rte'
		},
		backboneUndo: {
			deps: ['backbone'],
			exports: 'backboneUndo'
		},
		keymaster: {
			exports: 'keymaster'
		},
	},
	
	paths: {
		jquery: 		'../libs/jquery',
		jqueryUi: 		'../libs/jquery-ui.min',
		underscore: 	'../libs/underscore',
		backbone: 		'../libs/backbone',
		backboneUndo: 	'../libs/backbone-undo-min',
		keymaster:		'../node_modules/keymaster/keymaster',
		text: 			'../libs/require-text',
		Spectrum: 		'../libs/spectrum',
		rte: 			'../libs/wysiwyg',
		config: 		'config/config',
	},
	
	packages : 	[
		            {  name: 'AssetManager', 	location: 'asset_manager', 		},
		            {  name: 'StyleManager', 	location: 'style_manager', 		},
		            {  name: 'StorageManager', 	location: 'storage_manager', 	},
		            {  name: 'Navigator', 		location: 'navigator', 			},
		            {  name: 'DomComponents', 	location: 'dom_components', 	},
		            {  name: 'RichTextEditor', 	location: 'rich_text_editor', 	},
		            {  name: 'ModalDialog', 	location: 'modal_dialog', 		},
		            {  name: 'CodeManager', 	location: 'code_manager', 		},
		            {  name: 'Commands',		location: 'commands',			},
		            {  name: 'Canvas',			location: 'canvas',				},
		            {  name: 'Panel',			location: 'panel',				}
	]
});