define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
				index: '',
				active: true,
				value: '',
				values: {},
				preview: false,
			},

			initialize: function(){
				var value = this.get('value');

				// If there is no value I'll try to get it from values
				// I need value setted to make preview working
				if(!value){
					var val = '';
					var values = this.get('values');

					for(var prop in values)
						val += ' ' + values[prop];

					this.set('value', val.trim());
				}
      },

    });
	});