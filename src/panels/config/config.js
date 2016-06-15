define(function () {
	var slc = 'select-comp';
	var crc = 'create-comp';
	var mvc = 'move-comp';
	var txc = 'text-comp';
	var imc = 'image-comp';
	var swv = 'sw-visibility';
	var expt = 'export-template';

	return {
		stylePrefix: 'pn-',

		// Default panels
		defaults: [{
			id: 'commands',
			buttons: [{
				id: slc,
				command: slc,
				className: 'fa fa-mouse-pointer',
				attributes: { title	: 'Select element' },
			},{
				id: crc,
				command: crc,
				className: 'fa fa-plus-square-o',
				attributes: { title	: 'Create element' },
			},{
				id: mvc,
				command: mvc,
				className: 'fa fa-arrows',
				attributes: { title: 'Move elements' },
			},{
				id: txc,
				command: txc,
				className: 'fa fa-font',
				attributes: { title: 'Create text element' },
			},{
				id: imc,
				command: imc,
				className: 'fa fa-picture-o',
				attributes: { title: 'Create image element' },
			}],
		},{
			id: 'options',
			buttons: [{
				active: true,
				id: swv,
				className: 'fa fa-eye',
				command: swv,
				context: swv,
				attributes: { title: 'View components' },
			},{
				id: expt,
				className: 'fa fa-code',
				command: expt,
				attributes: { title: 'View code' },
			}],
		}],

		// Editor model
		em : null,

		// Delay before show children buttons (in milliseconds)
		delayBtnsShow	: 300,
	};
});