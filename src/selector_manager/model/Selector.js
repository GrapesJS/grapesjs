define(['backbone'],
	function (Backbone) {
		return Backbone.Model.extend({

      idAttribute: 'name',

			defaults: {
				name: '',
        label: '',
        type: 'class',
        active: true,
			},

			initialize: function() {
			  this.set('name', this.escapeName(this.get('name')));
        var label = this.get('label').trim();
        if(!label)
          this.set('label', this.get('name'));
			},

			/**
       * Escape string
       * @param {string} name
       * @return {string}
       * @private
       */
      escapeName: function(name) {
        return name.toLowerCase().replace(/([^a-z0-9\w]+)/gi, '-');
      },

		});
});
