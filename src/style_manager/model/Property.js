define(['backbone', './Layers'],
	function(Backbone, Layers) {

		return Backbone.Model.extend({

			defaults: {
				name : '',
				property: '',
				type: '',
				units: [],
				unit: '',
				defaults: '',
				info: '',
				value: '',
				icon: '',
				preview: false,
				detached: false,
				functionName:	'',
				properties: [],
				layers: [],
				list: [],
			},

			initialize: function(opt) {
				var o = opt || {};
				var type = this.get('type');
				var name = this.get('name');
				var prop = this.get('property');

				if(!name)
					this.set('name', prop.charAt(0).toUpperCase() + prop.slice(1));

				switch(type){
					case 'stack':
						this.set('layers', new Layers());
						break;
				}
			},

			/**
			 * Return value
			 * @return {string} Value
			 * @private
			 */
			getValue: function(){
				var result = '';
				var type = this.get('type');

				switch(type){
					case 'integer':
						result = this.get('value') + this.get('unit');
						break;
					default:
						result = this.get('value');
						break;
				}

				return result;
			},

    });
	});