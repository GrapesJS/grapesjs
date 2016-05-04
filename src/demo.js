require(['config/require-config'], function() {

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

			components: {
				defaults		: [
					{
						style: {'width':'100%', 'min-height':'550px', 'background':'url("./img/bg-gr-v.png") repeat left top scroll, url("http://www.freewhd.com/wp-content/uploads/2014/01/work-desk-14949.jpg") no-repeat center center scroll'},
						components: [
							{
								style: {'width':'90%', 'max-width':'1100px', 'min-height':'75px', 'padding':'7px 7px 7px 7px', 'margin':'0 auto'},
								components: [
									{
										style: {'width':'100%','padding':'25px 7px 7px 7px'},
										components: [
											{
												style: {'width':'50%','min-height':'75px','padding':'7px 7px 7px 7px','float':'left'},
												components:[
													{ type: 'text', content: 'GrapesJS', style:{'padding':'10px 10px 10px 10px', 'width':'130px', 'min-height':'50px', 'background-color':'#ffffff', 'border-radius':'5px', 'color':'#4d114f', 'font-size':'23px', 'text-align':'center', 'line-height':'30px'}}
												]
											},
											{
												style: {'width':'50%','min-height':'75px','padding':'7px 7px 7px 7px','float':'left'},
												components: [
													{
														style: {'float':'right', 'padding':'7px 7px 7px 7px'},
														components: [
															{ type: 'text', content: 'WEB', style:{'padding': '10px 10px 10px 10px', 'width': '130px', 'min-height': '50px', 'float': 'left', 'color': '#ffffff', 'text-align': 'center', 'font-size': '15px', 'line-height':'30px'} },
															{ type: 'text', content: 'TEMPLATE', style:{'padding': '10px 10px 10px 10px', 'width': '130px', 'min-height': '50px', 'float': 'left', 'color': '#ffffff', 'text-align': 'center', 'font-size': '15px', 'line-height':'30px'} },
															{ type: 'text', content: 'EDITOR', style:{'padding': '10px 10px 10px 10px', 'width': '130px', 'min-height': '50px', 'float': 'left', 'color': '#ffffff', 'text-align': 'center', 'font-size': '15px', 'line-height':'30px'} },
														]
													},
												]
											},
											{style: {'clear':'both'}}
										]
									},
									{
										type: 'text',
										content: 'Build your templates without coding',
										style: { 'padding': '7px 7px 7px 7px', 'width':'670px', 'min-height':'57px', 'font-size':'40px', 'color':'#ffffff', 'font-family':'Helvetica, serif', 'font-weight':100, 'margin':'100px 0px 0px 0px'}
									},
									{
										type: 'text',
										content: 'All text blocks could be edited easily with double clicking on it. You can create new text blocks with the command from the left panel',
										style: { 'padding':'10px 10px 10px 10px', 'width':'599px', 'min-height':'80px', 'color':'#c6c6c6', 'font-family':'Helvetica, serif', 'font-weight':100, 'line-height':'26px'}
									},
									{
										type: 'text',
										content: 'Try it now',
										style: {'padding':'10px 10px 10px 10px', 'width':'190px', 'min-height':'50px', 'font-weight':100, 'color':'#ffffff', 'font-size':'20px', 'text-align':'center', 'letter-spacing':'3px', 'line-height':'30px', 'background-color':'#d983a6', 'border-radius':'5px', 'margin':'15px 0px 0px 0px'}
									}
								]
							},
						]
					},
					{
						style: {'min-height': '200px', 'background-color':'#ffffff'},
						components:[
							{
								style: {'width':'90%', 'max-width':'1100px', 'min-height':'75px', 'padding':'100px 7px 7px 7px', 'margin':'0 auto'},
								components: [
									{ type: 'image', src: './img/phone-app.png', attributes: {'onmousedown': 'return false'}, style: { 'float': 'left'}},
									{
										style: { 'float': 'left', 'margin':'150px 0px 0px 100px', 'padding':'7px 7px 7px 7px' },
										components: [
											{
												type: 'text', content: 'ASSET MANAGER',
												style: {'padding':'7px 7px 7px 7px', 'min-height':'35px', 'color':'#b1b1b1', 'font-size':'15px'}
											},
											{
												type: 'text', content: 'Manage your images with Asset Manager',
												style: {'padding':'7px 7px 7px 7px', 'min-height':'35px', 'color':'#444444', 'font-size':'25px'}
											},
											{
												type: 'text', content: 'You can create image blocks with the command from the left panel and edit them with double click',
												style: {'padding':'7px 7px 7px 7px', 'min-height':'35px', 'color':'#444444', 'font-size':'17px', 'line-height':'25px','font-weight':100, 'width':'450px'}
											},
											{
												type: 'text', content: 'At the moment uploading of new images is not allowed in demo, so there is only some random images.',
												style: {'padding':'7px 7px 7px 7px', 'min-height':'35px', 'color':'#444444', 'font-size':'13px', 'line-height':'20px','font-weight':100, 'width':'450px'}
											}
										]
									},
									{style: {'clear':'both'}}
								]
							}
						]
					},
					{
						style: {'min-height': '500px', 'background-color':'#222222'},
						components: [
								{
									style: {'width':'90%', 'max-width':'1100px', 'min-height':'75px', 'padding':'70px 7px 70px 7px', 'margin':'0 auto'},
									components: [
											{
												type: 'text', content: 'Blocks',
												style: {'padding':'7px 7px 7px 7px', 'min-height':'35px', 'color':'#fff', 'font-size':'25px','text-align':'center'}
											},
											{
												type: 'text', content: 'Each element of the HTML page could be seen as a block. On the left panel you could find different kind of blocks that you can create, move and style',
												style: {'padding':'7px 7px 7px 7px', 'min-height':'35px', 'color':'#b1b1b1', 'font-size':'15px', 'text-align':'center', 'width':'700px', 'margin':'0 auto', 'font-weight':100	}
											},
											{
												style: {'margin':'70px 0 0 0','padding':'7px 7px 7px 7px'},
												components: [
													{
														style: {'width':'33.333%','min-height':'75px','padding':'7px 7px 7px 7px','float':'left'},
														components:[
															{
																style: {'margin': '0 auto', 'width':'300px', 'min-height':'350px','padding':'0 20px 0 20px','background-color':'#d983a6','border-radius':'5px'},
																components: [
																	{ type: 'text', content:'Small', style:{ 'font-weight':100, 'color':'#ffffff', 'letter-spacing':'3px', 'text-align':'center', 'font-size':'25px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'20px 20px 20px 20px'}},
																	{ type: 'text', content:'Some random list', style:{ 'font-weight':100, 'color':'#ffffff', 'letter-spacing':'3px', 'text-align':'center', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'50px 20px 50px 20px'}},
																	{ type: 'text', content:'+ Small feature 1', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Small feature 2', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Small feature 3', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Small feature 4', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'Price 1', style:{ 'font-weight':100, 'color':'#ffffff', 'text-align':'center', 'font-size':'30px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.2)','padding':'40px 20px 40px 20px'}},
																]
															}
														]
													},
													{
														style: {'width':'33.333%','min-height':'75px','padding':'7px 7px 7px 7px','float':'left'},
														components:[
															{
																style: {'margin': '0 auto', 'width':'300px', 'min-height':'350px','padding':'0 20px 0 20px','background-color':'#da78a0','border-radius':'5px'},
																components: [
																	{ type: 'text', content:'Medium', style:{ 'font-weight':100, 'color':'#ffffff', 'letter-spacing':'3px', 'text-align':'center', 'font-size':'25px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'20px 20px 20px 20px'}},
																	{ type: 'text', content:'Some random list', style:{ 'font-weight':100, 'color':'#ffffff', 'letter-spacing':'3px', 'text-align':'center', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'50px 20px 50px 20px'}},
																	{ type: 'text', content:'+ Medium feature 1', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Medium feature 2', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Medium feature 3', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Medium feature 4', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'Price 2', style:{ 'font-weight':100, 'color':'#ffffff', 'text-align':'center', 'font-size':'30px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.2)','padding':'40px 20px 40px 20px'}},
																]
															}
														]
													},
													{
														style: {'width':'33.333%','min-height':'75px','padding':'7px 7px 7px 7px','float':'left'},
														components:[
															{
																style: {'margin': '0 auto', 'width':'300px', 'min-height':'350px','padding':'0 20px 0 20px','background-color':'#d66a96','border-radius':'5px'},
																components: [
																	{ type: 'text', content:'Large', style:{ 'font-weight':100, 'color':'#ffffff', 'letter-spacing':'3px', 'text-align':'center', 'font-size':'25px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'20px 20px 20px 20px'}},
																	{ type: 'text', content:'Some random list', style:{ 'font-weight':100, 'color':'#ffffff', 'letter-spacing':'3px', 'text-align':'center', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'50px 20px 50px 20px'}},
																	{ type: 'text', content:'+ Large feature 1', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Large feature 2', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Large feature 3', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.1)','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'+ Large feature 4', style:{ 'font-weight':100, 'color':'rgba(255,255,255,0.5)', 'letter-spacing':'2px', 'font-size':'15px', 'margin':'0 -20px 0 -20px','padding':'10px 20px 10px 20px'}},
																	{ type: 'text', content:'Price 3', style:{ 'font-weight':100, 'color':'#ffffff', 'text-align':'center', 'font-size':'30px', 'margin':'0 -20px 0 -20px', 'background-color': 'rgba(0, 0, 0, 0.2)','padding':'40px 20px 40px 20px'}},
																]
															}
														]
													},//#d8779e #d86895
													{style: {'clear':'both'}}
												]
											},


									]
								}
						]
					}
				],
			},

			commands: 		{
					defaults		: [{
													id: 	'open-github',
													run: 	function(em, sender){
														sender.set('active',false);
														window.open('https://github.com/artf/grapesjs','_blank');
													},
													stop: function(){}
												},{
													id: 	'undo',
													run: 	function(em, sender){
														sender.set('active',false);
														em.get('UndoManager').undo();
													},
													stop: function(){}
												},{
													id: 	'redo',
													run: 	function(em, sender){
														sender.set('active',false);
														em.get('UndoManager').redo();
													},
													stop: function(){}
												},{
													id: 	'clean-all',
													run: 	function(em, sender){
														sender.set('active',false);
														if(confirm('Are you sure to clean the canvas?')){
															var comps = em.get('Components').getComponents();
															var len = comps.length;
															for(var i = 0; i < len; i++){
																comps.pop();
															}
														}
													},
													stop: function(){}
												}],
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
					      				   { type: 'image', src : 'http://www.freewhd.com/wp-content/uploads/2014/01/work-desk-14949.jpg', date: '2015-02-01',height:1080, width:1728},
					      				   { type: 'image', src : './img/phone-app.png', date: '2015-02-01',height:650, width:320},
					      				   { type: 'image', src : './img/bg-gr-v.png', date: '2015-02-01',height:1, width:1728},
				      				   ]
			},

			panels: {
				defaults		: [{
					id		: 'commands',
					buttons	: [{
								id			: 'select',
								className	: 'fa fa-mouse-pointer',
								command		: 'select-comp',
								attributes	: { title	: 'Select element' }
							},{
								id				: 'create',
								className	: 'fa fa-plus-square-o icon-add-comp',
								command		: 'create-comp',
								attributes	: { title	: 'Create element' },
					      buttons			: [
					       	   	       		   { id: 'create2', 	className: 'fa fa-plus-square-o icon-add-comp',	command: 'create-comp', attributes: { title: 'Create element' },},
					       	   	       		   { id: 'comp100',		className: 'fa fa-square-o icon-comp100',		command: 'insert-custom',
					       	   	       			   attributes	: { title	: 'Create all-width element' },
					       	   	       			   options:  {
												       			   	content					: { style: { width: '100%', 'min-height': '75px', 'padding': '7px'}},
												       			   	terminateAfterInsert	: false,
												       			  },
												       			},{ id: 'comp50',		className: 'fa fa-square-o icon-comp50',		command: 'insert-custom',
					       	   	       			   attributes	: { title	: 'Create 2 columns element' },
					       	   	       			   options:  {
												       			   	content					: { style: { width: '100%', 'padding': '7px'},//, 'display': 'table'
												       			   											components: [
												       			   																		{style: {width: '50%', 'min-height': '75px', 'padding': '7px', 'float':'left' }},
												       			   																		{style: {width: '50%', 'min-height': '75px', 'padding': '7px', 'float':'left'  }},
												       			   																		{style: {clear:'both'}},
												       			   																]
												       			   										},
												       			  },
												       			},{ id: 'comp30',		className: 'fa fa-square-o icon-comp30',		command: 'insert-custom',
					       	   	       			   attributes	: { title	: 'Create 3 columns element' },
					       	   	       			   options:  {
												       			   	content					: { style: { width: '100%', 'padding': '7px'},//, 'display': 'table'
												       			   											components: [
												       			   																		{style: {width: '33.333%', 'min-height': '75px', 'padding': '7px', 'float':'left' }},
												       			   																		{style: {width: '33.333%', 'min-height': '75px', 'padding': '7px', 'float':'left'  }},
												       			   																		{style: {width: '33.333%', 'min-height': '75px', 'padding': '7px', 'float':'left'  }},
												       			   																		{style: {clear:'both'}},
												       			   																]
												       			   										},
												       			  },
												       			},
					      ]
							},
											{ id: 'remove', 	className: 'fa fa-trash-o icon-rm', 		command: 'delete-comp', attributes	: { title: 'Remove element' },	},
					       	   	{ id: 'move', 		className: 'fa fa-arrows',			command: 'move-comp',	attributes	: { title: 'Move elements' }, 	},
					       	   	//{ id: 'resize', 	className: 'fa fa-arrows-alt', 		command: 'resize-comp',	attributes	: { title: 'Resize' }, 	},
					       	   	{ id: 'text', 		className: 'fa fa-font' ,			command: 'text-comp',	attributes	: { title: 'Create text element' }, 	},
					       	   	{ id: 'image', 		className: 'fa fa-picture-o',		command: 'image-comp',	attributes	: { title: 'Create image element' }, 	},
					       	   	/*{ id: 'var',		className: 'fa fa-hashtag',			command: 'insert-custom',attributes	: { title: 'Some variable' },
					       		 	 	options:  {  content: '{{ VAR11 }}', terminateAfterInsert: true, },
					       			},*/
					       	   ],
				},{
					id	: 'options',
					buttons	: [
					       	   { id: 'visibility', 	className: 'fa fa-eye', 	command: 'sw-visibility', 	active: true, context: 'sw-visibility', attributes: { title: 'View components' }, },
					       	   { id: 'export', 		className: 'fa fa-code', 	command: 'export-template', attributes: { title: 'View code' }, },
					       	   { id: 'view-github', className: 'fa fa-github', 	command: 'open-github', attributes: { title: 'View on Github' }, },
					],
				},{
					id	: 'options2',
					buttons	: [
					       	   { id: 'undo', 	className: 'fa fa-undo icon-undo', 	command: 'undo', attributes: { title: 'Undo (CTRL/CMD + Z)' }, },
					       	   { id: 'redo', 		className: 'fa fa-repeat icon-redo', 	command: 'redo', attributes: { title: 'Redo (CTRL/CMD + SHIFT + Z)' }, },
					       	   { id: 'clean-all', className: 'fa fa-trash icon-blank', 	command: 'clean-all', attributes: { title: 'Empty canvas' }, },
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
							name		: 'Test',
							property	: 'test',
							defaults 	: 'testDef',
						},{
							name		: 'Alignment',
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
											style		: 'font-family: Arial, Helvetica, sans-serif; font-size:15px;',
										},{
											value 		: '"Arial Black", Gadget, sans-serif',
											style		: 'font-family: "Arial Black", Gadget, sans-serif; font-size:15px;',
											name 		: 'Arial Black',
										},{
											value 		: '"Brush Script MT", sans-serif',
											style		: 'font-family: "Brush Script MT", sans-serif; font-size:15px;',
											name 		: 'Brush Script MT',
										},{
											value 		: '"Comic Sans MS", cursive, sans-serif',
											style		: 'font-family: "Comic Sans MS", cursive, sans-serif; font-size:15px;',
											name 		: 'Comica Sans',
										},{
											value 		: '"Courier New", Courier, monospace',
											style		: 'font-family: "Courier New", Courier, monospace; font-size:15px;',
											name 		: 'Courier New',
										},{
											value 		: 'Georgia, serif',
											style		: 'font-family: Georgia, serif; font-size:15px;',
											name 		: 'Georgia',
										},{
											value 		: 'Helvetica, serif',
											style		: 'font-family: Helvetica, serif; font-size:15px;',
											name 		: 'Helvetica',
										},{
											value 		: 'Impact, Charcoal, sans-serif',
											style		: 'font-family: Impact, Charcoal, sans-serif; font-size:15px;',
											name 		: 'Impact',
										},{
											value 		: '"Lucida Sans Unicode", "Lucida Grande", sans-serif',
											style		: 'font-family: "Lucida Sans Unicode", "Lucida Grande", sans-serif; font-size:15px;',
											name 		: 'Lucida Sans',
										},{
											value 		: 'Tahoma, Geneva, sans-serif',
											style		: 'font-family: Tahoma, Geneva, sans-serif; font-size:15px;',
											name 		: 'Tahoma',
										},{
											value 		: '"Times New Roman", Times, serif',
											style		: 'font-family: "Times New Roman", Times, serif; font-size:15px;',
											name 		: 'Times New Roman',
										},{
											value 		: '"Trebuchet MS", Helvetica, sans-serif',
											style		: 'font-family: "Trebuchet MS", Helvetica, sans-serif; font-size:15px;',
											name 		: 'Trebuchet',
										},{
											value 		: 'Verdana, Geneva, sans-serif',
											style		: 'font-family: Verdana, Geneva, sans-serif; font-size:15px;',
											name 		: 'Verdana',
										}],
						},{
							name		: 'Font size',
							property	: 'font-size',
							type		: 'integer',
							units		: ['px','em', 'rem', '%'],
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
							units		: ['px','em','%'],
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
							units		: ['px','em','%'],
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
						},{
							name		: 'Text shadow',
							property	: 'text-shadow',
							type		: 'stack',
							preview		: true,
							properties	: [{
											name: 		'X position',
											property: 	'h-shadow',
											type: 		'integer',
											units: 		['px','%'],
											defaults : 	0,
										},{
											name: 		'Y position',
											property: 	'v-shadow',
											type: 		'integer',
											units: 		['px','%'],
											defaults : 	0,
										},{
											name: 		'Blur',
											property: 	'blur-radius',
											type: 		'integer',
											units: 		['px'],
											defaults : 	0,
											min: 0,
										},{
											name: 		'Color',
											property: 	'shadow-color',
											type: 		'color',
											defaults: 	'black',
										},],
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
											     		 { value : 'background-color', name : 'Background', },
											     		 { value : 'transform', name : 'Transform', },
											     		 { value : 'box-shadow', name : 'Box shadow', },
											     		 { value : 'opacity', name : 'Opacity', }],
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
										},{
											name: 'Scale X',
											property: 'transform-scale-x',
											type: 'integer',
											defaults : '1',
											functionName: 'scaleX',
										},{
											name: 'Scale Y',
											property: 'transform-scale-y',
											type: 'integer',
											defaults : '1',
											functionName: 'scaleY',
										},{
											name: 'Scale Z',
											property: 'transform-scale-z',
											type: 'integer',
											defaults : '1',
											functionName: 'scaleZ',
										}],
						}]
					},{
            name: 'Flex',
            open: false,
            properties: [{
              name    : 'Flex Container',
              property  : 'display',
              type    : 'select',
              defaults  : 'block',
              list    : [{
                        value     : 'block',
                        name   : 'Disable',
                      },{
                        value   : 'flex',
                        name   : 'Enable',
                      }],
            },{
              name: 'Flex Parent',
              property: 'label-parent-flex',
              type: 'integer',
            },{
              name      : 'Direction',
              property  : 'flex-direction',
              type    : 'radio',
              defaults  : 'row',
              list    : [{
                        value   : 'row',
                        name    : 'Row',
                        className : 'icons-flex icon-dir-row',
                        title   : 'Row',
                      },{
                        value   : 'row-reverse',
                        name    : 'Row reverse',
                        className : 'icons-flex icon-dir-row-rev',
                        title   : 'Row reverse',
                      },{
                        value   : 'column',
                        name    : 'Column',
                        title   : 'Column',
                        className : 'icons-flex icon-dir-col',
                      },{
                        value   : 'column-reverse',
                        name    : 'Column reverse',
                        title   : 'Column reverse',
                        className : 'icons-flex icon-dir-col-rev',
                      }],
            },{
              name      : 'Justify',
              property  : 'justify-content',
              type    : 'radio',
              defaults  : 'flex-start',
              list    : [{
                        value   : 'flex-start',
                        className : 'icons-flex icon-just-start',
                        title   : 'Start',
                      },{
                        value   : 'flex-end',
                        title    : 'End',
                        className : 'icons-flex icon-just-end',
                      },{
                        value   : 'space-between',
                        title    : 'Space between',
                        className : 'icons-flex icon-just-sp-bet',
                      },{
                        value   : 'space-around',
                        title    : 'Space around',
                        className : 'icons-flex icon-just-sp-ar',
                      },{
                        value   : 'center',
                        title    : 'Center',
                        className : 'icons-flex icon-just-sp-cent',
                      }],
            },{
              name      : 'Align',
              property  : 'align-items',
              type    : 'radio',
              defaults  : 'center',
              list    : [{
                        value   : 'flex-start',
                        title    : 'Start',
                        className : 'icons-flex icon-al-start',
                      },{
                        value   : 'flex-end',
                        title    : 'End',
                        className : 'icons-flex icon-al-end',
                      },{
                        value   : 'stretch',
                        title    : 'Stretch',
                        className : 'icons-flex icon-al-str',
                      },{
                        value   : 'center',
                        title    : 'Center',
                        className : 'icons-flex icon-al-center',
                      }],
            },{
              name: 'Flex Children',
              property: 'label-parent-flex',
              type: 'integer',
            },{
              name:     'Order',
              property:   'order',
              type:     'integer',
              defaults :  0,
              min: 0
            },{
              name    : 'Flex',
              property  : 'flex',
              type    : 'composite',
              properties  : [{
                      name:     'Grow',
                      property:   'flex-grow',
                      type:     'integer',
                      defaults :  0,
                      min: 0
                    },{
                      name:     'Shrink',
                      property:   'flex-shrink',
                      type:     'integer',
                      defaults :  0,
                      min: 0
                    },{
                      name:     'Basis',
                      property:   'flex-basis',
                      type:     'integer',
                      units:    ['px','%',''],
                      unit: '',
                      defaults :  'auto',
                    }],
            },{
              name      : 'Align',
              property  : 'align-self',
              type      : 'radio',
              defaults  : 'auto',
              list    : [{
                        value   : 'auto',
                        name    : 'Auto',
                      },{
                        value   : 'flex-start',
                        title    : 'Start',
                        className : 'icons-flex icon-al-start',
                      },{
                        value   : 'flex-end',
                        title    : 'End',
                        className : 'icons-flex icon-al-end',
                      },{
                        value   : 'stretch',
                        title    : 'Stretch',
                        className : 'icons-flex icon-al-str',
                      },{
                        value   : 'center',
                        title    : 'Center',
                        className : 'icons-flex icon-al-center',
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

