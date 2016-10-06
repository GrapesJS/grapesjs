define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
        type: 'text', // text, number, range, select
				label: '',
        name: '',
        value: '',
				target: '',
        options: [],
			},

			initialize: function(){
				if(!this.get('target'))
          throw new Error('Target not found');
      },

    });
	});
