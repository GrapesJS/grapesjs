define(function () {
	return {
		stylePrefix		: 'pn-',
		
		defaults		: [{
								id	: 'commands',
								buttons	: [{ id: 'select', 	className: 'fa fa-mouse-pointer', 	command: 'select-comp', attributes: {title:'Create'}}, 
								       	   { id: 'create', 	className: 'fa fa-plus-square-o', 	command: 'create-comp',
								       	   		buttons: [
								       	   		          { id: 'image2', 	className: 'fa fa-picture-o',		command: 'image-comp' 	},
								       	   		          { id: 'move2', 		className: 'fa fa-arrows',			command: 'move-comp' 	},
								       	   		          { id: 'text2', 	className: 'fa fa-font' ,			command: 'text-comp' 	},
								       	   		          { id: 'var',		className: 'fa fa-hashtag',			command: 'insert-var',
												       		   options:  {  content: '{{ VAR22 }}', terminateAfterInsert: false, },		},
								       	   		] },
								       	   { id: 'remove', 	className: 'fa fa-minus-square-o', 	command: 'delete-comp' 	},
								       	   { id: 'move', 	className: 'fa fa-arrows',			command: 'move-comp' 	},
								       	   { id: 'resize', 	className: 'fa fa-arrows-alt', 		command: 'resize-comp' 	},
								       	   { id: 'text', 	className: 'fa fa-font' ,			command: 'text-comp' 	},
								       	   { id: 'image', 	className: 'fa fa-picture-o',		command: 'image-comp' 	},
								       	   { id: 'var',		className: 'fa fa-hashtag',			command: 'insert-var',
								       		   options:  {  content: '{{ VAR11 }}', terminateAfterInsert: true, },		
									       		buttons: [
								       	   		          { id: 'image2', 	className: 'fa fa-picture-o',		command: 'image-comp' 	},
								       	   		          { id: 'move2', 		className: 'fa fa-arrows',			command: 'move-comp' 	},
								       	   		          { id: 'text2', 	className: 'fa fa-font' ,			command: 'text-comp' 	},
								       	   		          { id: 'var',		className: 'fa fa-hashtag',			command: 'insert-var',
												       		   options:  {  content: '{{ VAR22 }}', terminateAfterInsert: false, },		},
								       	   		]},
								       	   ],
							},{
								id	: 'options',
								buttons	: [{ id: 'visibility', 	className: 'fa fa-eye', 	command: 'sw-visibility', active: true, context: 'sw-visibility' }, 
								       	   //{ id: 'select2', className: 'fa fa-mouse-pointer', 	command: 'select-comp' 	}, 
								       	   { id: 'export', 	className: 'fa fa-code', 	command: 'export-template'	},],
							},{
								id	: 'views',
								buttons	: [{ id: 'open-sm', 	className: 'fa fa-paint-brush', command: 'open-sm'}, 
								       	   { id: 'open-layers', className: 'fa fa-bars', 	command: 'open-layers'	},],
							}],
		
		// Editor model
		em				: null,
		
		// Delay before show children buttons (in milliseconds)
		delayBtnsShow	: 300,			
	};
});