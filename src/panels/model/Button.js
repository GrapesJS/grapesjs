define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
	/**
	 * @class Button
	 * */
	module.exports = Backbone.Model.extend({

		defaults :{
			id: '',
			className: '',
			command: '',
			context: '',
			buttons: [],
			attributes: {},
			options: {},
			active: false,
			dragDrop: false,
			runDefaultCommand: true,
			stopDefaultCommand: false,
		},

		initialize: function(options) {
			if(this.get('buttons').length){
				var Buttons	= require('./Buttons');
				this.set('buttons', new Buttons(this.get('buttons')) );
			}
		},

	});
});
