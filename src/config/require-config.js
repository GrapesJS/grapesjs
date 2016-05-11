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
		jquery: 			'../vendor/jquery/jquery',
		underscore: 	'../vendor/underscore/underscore',
		backbone: 		'../vendor/backbone/backbone',
		backboneUndo: '../vendor/backbone-undo/backbone-undo',
		keymaster:		'../vendor/keymaster/keymaster',
		text: 				'../vendor/require-text/text',
		Spectrum: 		'../vendor/spectrum/spectrum',
		codemirror: 	'../vendor/codemirror',
		formatting: 	'../vendor/codemirror-formatting/formatting',
	},

	packages : 	[
		            {  name: 'AssetManager', 		location: 'asset_manager', 		},
		            {  name: 'StyleManager', 		location: 'style_manager', 		},
		            {  name: 'ClassManager', 		location: 'class_manager', 		},
		            {  name: 'StorageManager', 	location: 'storage_manager', 	},
		            {  name: 'Navigator', 			location: 'navigator', 				},
		            {  name: 'DomComponents', 	location: 'dom_components', 	},
		            {  name: 'RichTextEditor', 	location: 'rich_text_editor', },
		            {  name: 'ModalDialog', 		location: 'modal_dialog', 		},
		            {  name: 'CodeManager', 		location: 'code_manager', 		},
		            {  name: 'CssComposer',			location: 'css_composer',			},
		            {  name: 'Commands',				location: 'commands',					},
		            {  name: 'Canvas',					location: 'canvas',						},
		            {  name: 'Panels',					location: 'panels',						},
		            {  name: 'Utils', 					location: 'utils', 						}
	]
});