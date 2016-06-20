require(['config/require-config'], function() {

	require(['grapesjs/main'],function (grapesjs){

		var editor	= grapesjs.init(


		{
			container	: '#gjs',
			height: '100%',
			fromElement: true,
			//components: '<div id="c63" >   <div id="c64" >     <div id="c65" >       <div id="c66" >         <div id="c67" >GrapesJS         </div>       </div>       <div id="c68" >         <div id="c69" >           <div id="c70" >WEB           </div>           <div id="c71" >TEMPLATE           </div>           <div id="c72" >EDITOR           </div>         </div>       </div>       <div id="c73" >       </div>     </div>     <div id="c74" >Build your templates without coding     </div>     <div id="c75" >All text blocks could be edited easily with double clicking on it. You can create new text blocks with the command from the left panel     </div>     <div id="c76" >Try it now     </div>   </div> </div> <div id="c77" >   <div id="c78" >     <img id="c79" src="./img/phone-app.png"/>     <div id="c80" >       <div id="c81" >ASSET MANAGER       </div>       <div id="c82" >Manage your images with Asset Manager       </div>       <div id="c83" >You can create image blocks with the command from the left panel and edit them with double click       </div>       <div id="c84" >At the moment uploading of new images is not allowed in demo, so there is only some random images.       </div>     </div>     <div id="c85" >     </div>   </div> </div> <div id="c86" >   <div id="c87" >     <div id="c88" >Blocks     </div>     <div id="c89" >Each element of the HTML page could be seen as a block. On the left panel you could find different kind of blocks that you can create, move and style     </div>     <div id="c90" >       <div id="c91" >         <div id="c92" >           <div id="c93" >Small           </div>           <div id="c94" >Some random list           </div>           <div id="c95" >+ Small feature 1           </div>           <div id="c96" >+ Small feature 2           </div>           <div id="c97" >+ Small feature 3           </div>           <div id="c98" >+ Small feature 4           </div>           <div id="c99" >Price 1           </div>         </div>       </div>       <div id="c100" >         <div id="c101" >           <div id="c102" >Medium           </div>           <div id="c103" >Some random list           </div>           <div id="c104" >+ Medium feature 1           </div>           <div id="c105" >+ Medium feature 2           </div>           <div id="c106" >+ Medium feature 3           </div>           <div id="c107" >+ Medium feature 4           </div>           <div id="c108" >Price 2           </div>         </div>       </div>       <div id="c109" >         <div id="c110" >           <div id="c111" >Large           </div>           <div id="c112" >Some random list           </div>           <div id="c113" >+ Large feature 1           </div>           <div id="c114" >+ Large feature 2           </div>           <div id="c115" >+ Large feature 3           </div>           <div id="c116" >+ Large feature 4           </div>           <div id="c117" >Price 3           </div>         </div>       </div>       <div id="c118" >       </div>     </div>   </div> </div>',
			//style: '#c63{width:100%;min-height:550px;background:url("./img/bg-gr-v.png") repeat left top scroll, url("http://www.freewhd.com/wp-content/uploads/2014/01/work-desk-14949.jpg") no-repeat center center scroll;}#c64{width:90%;max-width:1100px;min-height:75px;padding:7px 7px 7px 7px;margin:0 auto;}#c65{width:100%;padding:25px 7px 7px 7px;}#c66{width:50%;min-height:75px;padding:7px 7px 7px 7px;float:left;}#c67{padding:10px 10px 10px 10px;width:130px;min-height:50px;background-color:#ffffff;border-radius:5px;color:#4d114f;font-size:23px;text-align:center;line-height:30px;}#c68{width:50%;min-height:75px;padding:7px 7px 7px 7px;float:left;}#c69{float:right;padding:7px 7px 7px 7px;}#c70{padding:10px 10px 10px 10px;width:130px;min-height:50px;float:left;color:#ffffff;text-align:center;font-size:15px;line-height:30px;}#c71{padding:10px 10px 10px 10px;width:130px;min-height:50px;float:left;color:#ffffff;text-align:center;font-size:15px;line-height:30px;}#c72{padding:10px 10px 10px 10px;width:130px;min-height:50px;float:left;color:#ffffff;text-align:center;font-size:15px;line-height:30px;}#c73{clear:both;}#c74{padding:7px 7px 7px 7px;width:670px;min-height:57px;font-size:40px;color:#ffffff;font-family:Helvetica, serif;font-weight:100;margin:100px 0px 0px 0px;}#c75{padding:10px 10px 10px 10px;width:599px;min-height:80px;color:#c6c6c6;font-family:Helvetica, serif;font-weight:100;line-height:26px;}#c76{padding:10px 10px 10px 10px;width:190px;min-height:50px;font-weight:100;color:#ffffff;font-size:20px;text-align:center;letter-spacing:3px;line-height:30px;background-color:#d983a6;border-radius:5px;margin:15px 0px 0px 0px;}#c77{min-height:200px;background-color:#ffffff;}#c78{width:90%;max-width:1100px;min-height:75px;padding:100px 7px 7px 7px;margin:0 auto;}#c79{float:left;}#c80{float:left;margin:150px 0px 0px 100px;padding:7px 7px 7px 7px;}#c81{padding:7px 7px 7px 7px;min-height:35px;color:#b1b1b1;font-size:15px;}#c82{padding:7px 7px 7px 7px;min-height:35px;color:#444444;font-size:25px;}#c83{padding:7px 7px 7px 7px;min-height:35px;color:#444444;font-size:17px;line-height:25px;font-weight:100;width:450px;}#c84{padding:7px 7px 7px 7px;min-height:35px;color:#444444;font-size:13px;line-height:20px;font-weight:100;width:450px;}#c85{clear:both;}#c86{min-height:500px;background-color:#222222;}#c87{width:90%;max-width:1100px;min-height:75px;padding:70px 7px 70px 7px;margin:0 auto;}#c88{padding:7px 7px 7px 7px;min-height:35px;color:#fff;font-size:25px;text-align:center;}#c89{padding:7px 7px 7px 7px;min-height:35px;color:#b1b1b1;font-size:15px;text-align:center;width:700px;margin:0 auto;font-weight:100;}#c90{margin:70px 0 0 0;padding:7px 7px 7px 7px;}#c91{width:33.333%;min-height:75px;padding:7px 7px 7px 7px;float:left;}#c92{margin:0 auto;width:300px;min-height:350px;padding:0 20px 0 20px;background-color:#d983a6;border-radius:5px;}#c93{font-weight:100;color:#ffffff;letter-spacing:3px;text-align:center;font-size:25px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:20px 20px 20px 20px;}#c94{font-weight:100;color:#ffffff;letter-spacing:3px;text-align:center;font-size:15px;margin:0 -20px 0 -20px;padding:50px 20px 50px 20px;}#c95{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:10px 20px 10px 20px;}#c96{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;padding:10px 20px 10px 20px;}#c97{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:10px 20px 10px 20px;}#c98{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;padding:10px 20px 10px 20px;}#c99{font-weight:100;color:#ffffff;text-align:center;font-size:30px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.2);padding:40px 20px 40px 20px;}#c100{width:33.333%;min-height:75px;padding:7px 7px 7px 7px;float:left;}#c101{margin:0 auto;width:300px;min-height:350px;padding:0 20px 0 20px;background-color:#da78a0;border-radius:5px;}#c102{font-weight:100;color:#ffffff;letter-spacing:3px;text-align:center;font-size:25px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:20px 20px 20px 20px;}#c103{font-weight:100;color:#ffffff;letter-spacing:3px;text-align:center;font-size:15px;margin:0 -20px 0 -20px;padding:50px 20px 50px 20px;}#c104{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:10px 20px 10px 20px;}#c105{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;padding:10px 20px 10px 20px;}#c106{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:10px 20px 10px 20px;}#c107{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;padding:10px 20px 10px 20px;}#c108{font-weight:100;color:#ffffff;text-align:center;font-size:30px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.2);padding:40px 20px 40px 20px;}#c109{width:33.333%;min-height:75px;padding:7px 7px 7px 7px;float:left;}#c110{margin:0 auto;width:300px;min-height:350px;padding:0 20px 0 20px;background-color:#d66a96;border-radius:5px;}#c111{font-weight:100;color:#ffffff;letter-spacing:3px;text-align:center;font-size:25px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:20px 20px 20px 20px;}#c112{font-weight:100;color:#ffffff;letter-spacing:3px;text-align:center;font-size:15px;margin:0 -20px 0 -20px;padding:50px 20px 50px 20px;}#c113{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:10px 20px 10px 20px;}#c114{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;padding:10px 20px 10px 20px;}#c115{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.1);padding:10px 20px 10px 20px;}#c116{font-weight:100;color:rgba(255,255,255,0.5);letter-spacing:2px;font-size:15px;margin:0 -20px 0 -20px;padding:10px 20px 10px 20px;}#c117{font-weight:100;color:#ffffff;text-align:center;font-size:30px;margin:0 -20px 0 -20px;background-color:rgba(0, 0, 0, 0.2);padding:40px 20px 40px 20px;}#c118{clear:both;}',

			storage:{ autoload: 0 },
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
														em.UndoManager.undo();
													},
													stop: function(){}
												},{
													id: 	'redo',
													run: 	function(em, sender){
														sender.set('active',false);
														em.UndoManager.redo();
													},
													stop: function(){}
												},{
													id: 	'clean-all',
													run: 	function(em, sender){
														sender.set('active',false);
														if(confirm('Are you sure to clean the canvas?')){
															var comps = em.DomComponents.clear();
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
/*
			panels: {
				defaults		: [{
					id		: 'commands',
					buttons	: [{
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
	       	   	//{ id: 'remove', 	className: 'fa fa-trash-o icon-rm', 		command: 'delete-comp', attributes	: { title: 'Remove element' },	},
	       	   	//{ id: 'resize', 	className: 'fa fa-arrows-alt', 		command: 'resize-comp',	attributes	: { title: 'Resize' }, 	},
	       	   	/*{
	       	   	  id: 'var',		className: 'fa fa-hashtag',			command: 'insert-custom',attributes	: { title: 'Some variable' },
	       		 	 	options:  {  content: '{{ VAR11 }}', terminateAfterInsert: true, },
	       			},*/

	       			/*
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
*/

			styleManager : {
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
						list		: [
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
				},{
						name: 'Dimension',
						open: false,
						properties:[{
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
						}],
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

	});
});

