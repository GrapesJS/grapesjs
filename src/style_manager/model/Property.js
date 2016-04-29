define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
				name : '',
				property: '',
				type: '',
				units: [],
				unit: '',
				defaults: '',
				info: '',
				value: '', //Selected value of the property (?)
				icon: '',
				preview: false,
				functionName:	'',
				properties: [],
				layers: [],
				list: [],
			}

    });
	});