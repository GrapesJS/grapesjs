define(['backbone'],
	function(Backbone) {

		return Backbone.Model.extend({

			defaults: {
        type: 'text', // text, number, range, select
				label: '',
        name: '',
        value: '',
        options: [],
			},

			initialize: function(){
      },

    });
	});
