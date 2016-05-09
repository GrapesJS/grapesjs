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
				value: '',
				icon: '',
				preview: false,
				functionName:	'',
				properties: [],
				layers: [],
				list: [],
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