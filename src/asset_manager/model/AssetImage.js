define(['backbone', './Asset'],
	function (Backbone, Asset) {
		return Asset.extend({

			defaults: _.extend({}, Asset.prototype.defaults, {
				type: 		'image',
				unitDim:	'px',
				height:		0,
				width:		0,
			}),

		});
});
