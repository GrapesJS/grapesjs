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
		jquery: 			'../node_modules/jquery/dist/jquery',
		underscore: 	'../node_modules/underscore/underscore',
		backbone: 		'../node_modules/backbone/backbone',
		backboneUndo: '../node_modules/backbone-undo/Backbone.Undo',
		keymaster:		'../node_modules/keymaster/keymaster',
		text: 				'../node_modules/requirejs-text/text',
		Spectrum: 		'../node_modules/spectrum-colorpicker/spectrum',
		codemirror: 	'../node_modules/codemirror',
		formatting: 	'../node_modules/codemirror-formatting/formatting',
	},

	packages : 	[
								{  name: 'GrapesJS', 				location: 'grapesjs'					},
								{  name: 'Abstract', 				location: 'domain_abstract'		},
								{  name: 'Editor', 					location: 'editor', 					},
		            {  name: 'AssetManager', 		location: 'asset_manager', 		},
		            {  name: 'BlockManager', 		location: 'block_manager', 		},
								{  name: 'TraitManager', 		location: 'trait_manager', 		},
		            {  name: 'StyleManager', 		location: 'style_manager', 		},
		            {  name: 'DeviceManager', 	location: 'device_manager', 	},
		            {  name: 'StorageManager', 	location: 'storage_manager', 	},
		            {  name: 'PluginManager',		location: 'plugin_manager',		},
		            {  name: 'Navigator', 			location: 'navigator', 				},
		            {  name: 'DomComponents', 	location: 'dom_components', 	},
		            {  name: 'RichTextEditor', 	location: 'rich_text_editor', },
		            {  name: 'SelectorManager', location: 'selector_manager', },
		            {  name: 'ModalDialog', 		location: 'modal_dialog', 		},
		            {  name: 'CodeManager', 		location: 'code_manager', 		},
		            {  name: 'CssComposer',			location: 'css_composer',			},
		            {  name: 'Commands',				location: 'commands',					},
		            {  name: 'Canvas',					location: 'canvas',						},
		            {  name: 'Panels',					location: 'panels',						},
		            {  name: 'Parser',					location: 'parser',						},
		            {  name: 'Utils', 					location: 'utils', 						}
	]
});
