require(['src/config/require-config.js'], function() {

	require(['editor/main'],function (Grapes){
		var grapes	= new Grapes(

		{

			container	: '#wte-app',

			storageType: 'local',

			remoteStorage: {
				urlStore	: 'http://test.localhost/wte/index.php',
				urlLoad		: 'http://test.localhost/wte/read.php',
				paramsStore	: {	type:'homeTemplate',},
				paramsLoad	: {	type:'homeTemplate',},
			},
			assetManager: {
				storageType			: '',
				storeOnChange		: true,
				storeAfterUpload	: true,
				assets				: [
					      				   { type: 'image', src : 'http://placehold.it/350x250/78c5d6/fff/image1.jpg', date: '2015-01-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/459ba8/fff/image2.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/79c267/fff/image3.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/c5d647/fff/image4.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/f28c33/fff/image5.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/e868a2/fff/image6.jpg', date: '2015-02-01',height:350, width:250},
					      				   { type: 'image', src : 'http://placehold.it/350x250/cc4360/fff/image7.jpg', date: '2015-02-01',height:350, width:250},
				      				   ]
			},

			panels: {
				defaults		: [{
					id		: 'commands',
					buttons	: [{
								id			: 'select',
								className	: 'fa fa-mouse-pointer',
								command		: 'select-comp',
								attributes	: { title	: 'Select' }
							},{
								id			: 'create',
								className	: 'fa fa-plus-square-o',
								command		: 'create-comp',
								attributes	: { title	: 'Create' },
					       	   	buttons		: [
					       	   	       		   { id: 'create2', 	className: 'fa fa-plus-square-o',	command: 'create-comp', attributes: { title: 'Create' },},
					       	   	       		   { id: 'box100',		className: 'fa fa-square-o',		command: 'insert-custom',
					       	   	       			   attributes	: { title	: 'Create all-width box' },
					       	   	       			   options:  {
									       			   	content					: { style: { width: '100%', 'min-height': '75px', 'padding': '7px'}},
									       			   	terminateAfterInsert	: false,
									       			},},
					       	   	]
							},
								{ id: 'remove', 	className: 'fa fa-trash-o', 		command: 'delete-comp', attributes	: { title: 'Remove' },	},
					       	   	{ id: 'move', 		className: 'fa fa-arrows',			command: 'move-comp',	attributes	: { title: 'Move' }, 	},
					       	   	//{ id: 'resize', 	className: 'fa fa-arrows-alt', 		command: 'resize-comp',	attributes	: { title: 'Resize' }, 	},
					       	   	{ id: 'text', 		className: 'fa fa-font' ,			command: 'text-comp',	attributes	: { title: 'Text' }, 	},
					       	   	{ id: 'image', 		className: 'fa fa-picture-o',		command: 'image-comp',	attributes	: { title: 'Image' }, 	},
					       	   	{ id: 'var',		className: 'fa fa-hashtag',			command: 'insert-custom',attributes	: { title: 'Some variable' },
					       		  options:  {  content: '{{ VAR11 }}', terminateAfterInsert: true, },
					       		},
					       	   ],
				},{
					id	: 'options',
					buttons	: [
					       	   { id: 'visibility', 	className: 'fa fa-eye', 	command: 'sw-visibility', 	active: true, context: 'sw-visibility', attributes: { title: 'View components' }, },
					       	   { id: 'export', 		className: 'fa fa-code', 	command: 'export-template', attributes: { title: 'View code' }, },
					],
				},{
					id	: 'views',
					buttons	: [{ id: 'open-sm', 	className: 'fa fa-paint-brush', command: 'open-sm', 	active: true, attributes: { title: 'Open Style Manager' },},
					       	   { id: 'open-layers', className: 'fa fa-bars', 		command: 'open-layers',	attributes	: { title: 'Open Layer Manager' }, },],
				}],
			},

			styleManager : {
				sectors: [{
					name: 'General',
					properties:[{
							name		: 'Alignament',
							property	: 'float',
							type		: 'radio',
							defaults 	: 'none',
							list		:	[{
												value 		: 'none',
												title		: 'None',
												className 	: 'fa fa-times',
											},{
												value 		: 'left',
												className 	: 'fa fa-align-left',
												title		: 'Float element to the left',
											},{
												value 		: 'right',
												className 	: 'fa fa-align-right',
												title		: 'Float element to the right',
											}],
						},{
							name		: 'Display',
							property	: 'display',
							type		: 'radio',
							defaults 	: 'block',
							list		:	[{
												value 		: 'block',
												title		: 'Block',
											},{
												value 		: 'inline',
												title		: 'Inline',
											},{
												value 		: 'inline-block',
												title		: 'Inline-block',
											},{
												value 		: 'none',
												title		: 'None',
												className 	: 'fa fa-eye-slash',
											}],
						},{
							name		: 'Position',
							property	: 'position',
							type		: 'radio',
							defaults 	: 'static',
							list		:	[{
												value 	: 'static',
												title	: 'Static',
											},{
												value 	: 'relative',
												title	: 'Relative',
											},{
												value 	: 'absolute',
												title	: 'Absolute',
											},{
												value 	: 'fixed',
												title	: 'fixed',
											}],
						},{
							name		: 'Top',
							property	: 'top',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: '0',
						},{
							name		: 'Right',
							property	: 'right',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: '0',
						},{
							name		: 'Left',
							property	: 'left',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: '0',
						},{
							name		: 'Bottom',
							property	: 'bottom',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: '0',
						}],
					},{
						name: 'Dimension',
						open: false,
						properties:[{
							name		: 'Width',
							property	: 'width',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: 'auto',
							min			: 0,
						},{
							name		: 'Height',
							property	: 'height',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: 'auto',
							min			: 0,
						},{
							name		: 'Max width',
							property	: 'max-width',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: 'auto',
							min			: 0,
						},{
							name		: 'Min height',
							property	: 'min-height',
							type		: 'integer',
							units		: ['px','%'],
							defaults 	: 'auto',
							min			: 0,
						},{
							name		: 'Margin',
							property	: 'margin',
							type		: 'composite',
							properties:[{
											name		: 'Top',
											property	: 'margin-top',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
										},{
											name		: 'Right',
											property	: 'margin-right',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
										},{
											name		: 'Bottom',
											property	: 'margin-bottom',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
										},{
											name		: 'Left',
											property	: 'margin-Left',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
										},],
						},{
							name		: 'Center block',
							property	: 'margin',
							type		: 'select',
							defaults 	: '0',
							list		:	[{
												value 		: '0',
												name			: 'Normal',
											},{
												value 		: '0 auto',
												name			: 'Center',
											}],
						},{
							name		: 'Padding',
							property	: 'padding',
							type		: 'composite',
							properties:[{
											name		: 'Top',
											property	: 'padding-top',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
											min			: 0,
										},{
											name		: 'Right',
											property	: 'padding-right',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
											min			: 0,
										},{
											name		: 'Bottom',
											property	: 'padding-bottom',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
											min			: 0,
										},{
											name		: 'Left',
											property	: 'padding-Left',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
											min			: 0,
										},],
						},],
					},{
						name: 'Typography',
						open: false,
						properties:[{
							name		: 'Font',
							property	: 'font-family',
							type		: 'select',
							defaults 	: 'Arial, Helvetica, sans-serif',
							list		: [{
											value 		: 'Arial, Helvetica, sans-serif',
											name 		: 'Arial',
											style		: 'font-family: Arial, Helvetica, sans-serif',
										},{
											value 		: '"Arial Black", Gadget, sans-serif',
											style		: 'font-family: "Arial Black", Gadget, sans-serif',
											name 		: 'Arial Black',
										},{
											value 		: '"Brush Script MT", sans-serif',
											style		: 'font-family: "Brush Script MT", sans-serif',
											name 		: 'Brush Script MT',
										},{
											value 		: '"Comic Sans MS", cursive, sans-serif',
											style		: 'font-family: "Comic Sans MS", cursive, sans-serif',
											name 		: 'Comica Sans',
										},{
											value 		: '"Courier New", Courier, monospace',
											style		: 'font-family: "Courier New", Courier, monospace',
											name 		: 'Courier New',
										},{
											value 		: 'Georgia, serif',
											style		: 'font-family: Georgia, serif',
											name 		: 'Georgia',
										},{
											value 		: 'Helvetica, serif',
											style		: 'font-family: Helvetica, serif',
											name 		: 'Helvetica',
										},{
											value 		: 'Impact, Charcoal, sans-serif',
											style		: 'font-family: Impact, Charcoal, sans-serif',
											name 		: 'Impact',
										},{
											value 		: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
											style		: 'font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif',
											name 		: 'Lucida Sans',
										},{
											value 		: 'Tahoma, Geneva, sans-serif',
											style		: 'font-family: Tahoma, Geneva, sans-serif',
											name 		: 'Tahoma',
										},{
											value 		: '"Times New Roman", Times, serif',
											style		: 'font-family: "Times New Roman", Times, serif',
											name 		: 'Times New Roman',
										},{
											value 		: '"Trebuchet MS", Helvetica, sans-serif',
											style		: 'font-family: "Trebuchet MS", Helvetica, sans-serif',
											name 		: 'Trebuchet',
										},{
											value 		: 'Verdana, Geneva, sans-serif',
											style		: 'font-family: Verdana, Geneva, sans-serif',
											name 		: 'Verdana',
										}],
						},{
							name		: 'Font size',
							property	: 'font-size',
							type		: 'integer',
							units		: ['px','em'],
							defaults 	: '12',
							min			: 0,
						},{
							name		: 'Weight',
							property	: 'font-weight',
							type		: 'select',
							defaults 	: '400',
							list:		[{ value : '100', name : 'Thin', },
								     	 { value : '200', name : 'Extra-Light', },
								     	 { value : '300', name : 'Light', },
								     	 { value : '400', name : 'Normal', },
								     	 { value : '500', name : 'Medium',},
								     	 { value : '600', name : 'Semi-Bold',},
								     	 { value : '700', name : 'Bold', },
								     	 { value : '800', name : 'Extra-Bold',},
								     	 { value : '900', name : 'Ultra-Bold', }],
						},{
							name		: 'Letter spacing',
							property	: 'letter-spacing',
							type		: 'integer',
							units		: ['px'],
							defaults 	: 'normal',
						},{
							name: 		'Font color',
							property: 	'color',
							type: 		'color',
							defaults: 	'black',
						},{
							name		: 'Line height',
							property	: 'line-height',
							type		: 'integer',
							units		: ['px'],
							defaults 	: 'normal',
						},{
							name		: 'Text align',
							property	: 'text-align',
							type		: 'radio',
							defaults 	: 'left',
							list		: [{ value : 'left', 	name : 'Left', 		className: 'fa fa-align-left'},
							    		   { value : 'center', 	name : 'Center',	className: 'fa fa-align-center' },
							    		   { value : 'right', 	name : 'Right', 	className: 'fa fa-align-right'},
							    		   { value : 'justify', name : 'Justify', 	className: 'fa fa-align-justify'},],
						}],
					},{
						name: 'Decorations',
						open: false,
						properties: [{
							name		: 'Border radius',
							property	: 'border-radius',
							type		: 'integer',
							units		: ['px'],
							defaults 	: '0',
							min			: 0,
						},{
							name			: 'Background',
							property	: 'background-color',
							type			: 'color',
							defaults: 	'none'
						},{
							name		: 'Border radius',
							property	: 'border-radius',
							type		: 'composite',
							properties	: [{
											name		: 'Top',
											property	: 'b-top',
											type		: 'integer',
											units		: ['px','%'],
											defaults 	: 0,
											min			: 0,
										},{
											name		: 'Right',
											property	: 'b-right',
											type		: 'integer',
											units		: ['px','%'],
											min			: 0,
											defaults 	: 0,
										},{
											name		: 'Bottom',
											property	: 'b-bot',
											type		: 'integer',
											units		: ['px','%'],
											min			: 0,
											defaults 	: 0,
										},{
											name		: 'Left',
											property	: 'b-left',
											type		: 'integer',
											units		: ['px'],
											min			: 0,
											defaults 	: 0,
										},],
						},{
							name		: 'Border',
							property	: 'border',
							type		: 'composite',
							properties	: [{
											name		: 'Width',
											property	: 'br-width',
											type		: 'integer',
											units		: ['px','em'],
											defaults 	: 0,
											min			: 0,
										},{
											name		: 'Style',
											property	: 'br-style',
											type		: 'select',
											defaults 	: 'solid',
											list:		[{ value : 'none', 		name : 'None', },
											     		 { value : 'solid', 	name : 'Solid', },
												     	 { value : 'dashed', 	name : 'Dashed', },
												     	 { value : 'dotted',	name : 'Dotted', },],
										},{
											name: 		'Color',
											property: 	'color',
											type: 		'color',
											defaults: 	'black',
										}],
						},{
							name		: 'Box shadow',
							property	: 'box-shadow',
							type		: 'stack',
							preview		: true,
							properties	: [{
											name: 		'Shadow type',
											property: 	'shadow-type',
											type: 		'select',
											defaults: 	'',
											list:		[ { value : '', name : 'Outside', },
											        	  { value : 'inset', name : 'Inside', }],
										},{
											name: 		'X position',
											property: 	'shadow-x',
											type: 		'integer',
											units: 		['px','%'],
											defaults : 	0,
										},{
											name: 		'Y position',
											property: 	'shadow-y',
											type: 		'integer',
											units: 		['px','%'],
											defaults : 	0,
										},{
											name: 		'Blur',
											property: 	'shadow-blur',
											type: 		'integer',
											units: 		['px'],
											defaults : 	5,
											min: 		0,
										},{
											name: 		'Spread',
											property: 	'shadow-spread',
											type: 		'integer',
											units: 		['px'],
											defaults : 	0,
										},{
											name: 		'Color',
											property: 	'shadow-color',
											type: 		'color',
											defaults: 	'black',
										},],
						},{
							name		: 'Background',
							property	: 'background',
							type		: 'stack',
							preview		: true,
							properties	: [{
											name: 		'Image',
											property: 	'background-image',
											type: 		'file',
											defaults: 	'none',
										},
										{
											name: 		'Repeat',
											property: 	'background-repeat',
											type: 		'select',
											defaults: 	'repeat',
											list:		[{ value : 'repeat', name : 'Repeat', },
											     		 { value : 'repeat-x', name : 'Repeat X', },
											     		 { value : 'repeat-y', name : 'Repeat Y', },
											     		 { value : 'no-repeat', name : 'No repeat', }],
										},
										{
											name: 		'Position X',
											property: 	'background-position',
											type: 		'select',
											defaults: 	'left',
											list:		[ { value : 'left', 	name : 'Left', },
											        	  { value : 'center',	name : 'Center', },
											        	  { value : 'right', 	name : 'Right', }],
										},{
											name: 		'Position Y',
											property: 	'background-position',
											type: 		'select',
											defaults: 	'top',
											list:		[ { value : 'top', 		name : 'Top', },
											        	  { value : 'center', 	name : 'Center', },
											        	  { value : 'bottom', 	name : 'Bottom', }],
										},{
											name: 		'Attach',
											property: 	'background-attachment',
											type: 		'select',
											defaults: 	'scroll',
											list:		[{ value : 'scroll', name : 'Scroll', },
											     		 { value : 'fixed', name : 'Fixed', },
											     		 { value : 'local', name : 'Local', }],
										},],
						},],
					},{
						name: 'Extra',
						open: false,
						properties: [{
							name: 'Transition',
							property: 'transition',
							type: 'stack',
							preview: false,
							properties:[{
											name: 		'Property',
											property: 	'transition-property',
											type: 		'select',
											defaults: 	'',
											list:		[{ value : 'width', name : 'Width', },
											     		 { value : 'height', name : 'Height', },
											     		 { value : 'background-color', name : 'Background', }],
										},{
											name: 'Duration',
											property: 'transition-duration',
											type: 'integer',
											units: ['s'],
											defaults : '2',
											min: 0,
										},{
											name: 		'Easing',
											property: 	'transition-timing-function',
											type: 		'select',
											defaults: 	'ease',
											list:		[{ value : 'linear', name : 'Linear', },
											     		 { value : 'ease', name : 'Ease', },
											     		 { value : 'ease-in', name : 'Ease-in', },
											     		 { value : 'ease-out', name : 'Ease-out', },
											     		 { value : 'ease-in-out', name : 'Ease-in-out', }],
										}],
						},{
							name: 'Perspective',
							property: 'perspective',
							type: 'integer',
							units: ['px'],
							defaults : '0',
							min:	0,
						},{
							name: 'Transform',
							property: 'transform',
							type: 'composite',
							properties:[{
											name: 'Rotate X',
											property: 'transform-rotate-x',
											type: 'integer',
											units: ['deg'],
											defaults : '0',
											functionName: 'rotateX',
										},{
											name: 'Rotate Y',
											property: 'transform-rotate-y',
											type: 'integer',
											units: ['deg'],
											defaults : '0',
											functionName: 'rotateY',
										},{
											name: 'Rotate Z',
											property: 'transform-rotate-z',
											type: 'integer',
											units: ['deg'],
											defaults : '0',
											functionName: 'rotateZ',
										}],
						}]
					}
				],

			},
		}

		);

		grapes.render();

	});
});

