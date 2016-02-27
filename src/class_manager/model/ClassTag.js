define(['backbone'],
	function (Backbone) {
		/**
		 * @class ClassTag
		 * */
		return Backbone.Model.extend({

			defaults: {
        label:  '',
				name:	  '',
			},

			initialize: function(){
				  this.set('name', this.escapeName(this.get('name')));
			},

			/**
       * Escape string
       * @param {String} name
       *
       * @return {String}
       */
      escapeName: function(name) {
        return name.toLowerCase().replace(/([^a-z0-9\w]+)/gi, '-');
      },

		});
});
