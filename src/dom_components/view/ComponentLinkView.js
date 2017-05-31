define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var ComponentView = require('./ComponentTextView');

	module.exports = ComponentView.extend({

		events: {
			'dblclick': 'enableEditing',
		},

		render: function() {
			ComponentView.prototype.render.apply(this, arguments);

			// I need capturing instead of bubbling as bubbled clicks from other
			// children will execute the link event
			this.el.addEventListener('click', this.prevDef, true);

			return this;
		},

	});
});