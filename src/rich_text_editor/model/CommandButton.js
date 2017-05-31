define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
		module.exports = Backbone.Model.extend({

			idAttribute: 'command',

			defaults: {
				command: '',
				type: '',
				title: '',
				class: '',
        options: [],
			},

			initialize: function() {
				var opts = this.get('options');
				if(opts.length)
					this.set('type', 'select');
			},

		});
});