define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
        type: 'text', // text, number, range, select
				label: '',
        name: '',
				min: '',
				max: '',
        value: '',
				target: '',
				default: '',
				placeholder: '',
				changeProp: 0,
        options: [],
			},

			initialize: function(){
				if(!this.get('target'))
          throw new Error('Target not found');
      },

			/**
			 * Need to remove target from it otherwise with toJSON
			 * creates an infinite loop
			 * @return {Object}
			 * @private
			 */
			toJSON: function(){
				var obj = this.attributes;
				delete obj.target;
				return obj;
			}

    });
	});
