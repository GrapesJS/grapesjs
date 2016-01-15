define(function () {
	return {
		stylePrefix	: 'rte-',
		toolbarId	: 'toolbar',
		containerId	: 'wrapper',
		commands	: [{
							command: 	'bold',
							title: 		'Bold',
							class:		'fa fa-bold',
							group:		'format'
						},{
							command: 	'italic',
							title: 		'Italic',
							class:		'fa fa-italic',
							group:		'format'
						},{
							command: 	'underline',
							title: 		'Underline',
							class:		'fa fa-underline',
							group:		'format'
					 },],
	};
});