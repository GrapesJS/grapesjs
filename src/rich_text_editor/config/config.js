define(function () {
	return {
		stylePrefix	: 'rte-',
		toolbarId	: 'toolbar',
		containerId	: 'wrapper',
		commands	: [{
			command: 	'bold',
			title: 		'Bold',
			class:		'fa fa-bold',
		},{
			command: 	'italic',
			title: 		'Italic',
			class:		'fa fa-italic',
		},{
			command: 	'underline',
			title: 		'Underline',
			class:		'fa fa-underline',
	 	},{
			command: 	'strikethrough',
			title: 		'Strikethrough',
			class:		'fa fa-strikethrough',
			group:		'format'
	 	}/*,{
	 		command: 	'fontSize',
	 		options: [
	 			{name: 'Huge', value: '100px'},
	 			{name: 'Normal', value: '14px'},
	 			{value: '5px'}
	 		]
	 }*/],
	};
});