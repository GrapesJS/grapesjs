define(['backbone'],
	function (Backbone) {
		return Backbone.Model.extend({

			defaults: {
        label:  '',
				name:	  '',
        active: true,
			},

			initialize: function(){
				  this.set('name', this.escapeName(this.get('name')));
			},

			/**
       * Escape string
       * @param {string} name
       *
       * @return {string}
       */
      escapeName: function(name) {
        return name.toLowerCase().replace(/([^a-z0-9\w]+)/gi, '-');
      },

		});
});
