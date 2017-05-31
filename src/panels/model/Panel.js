define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var Buttons = require('./Buttons');
	/**
	 * @class Panel
	 * */
	module.exports = Backbone.Model.extend({
		
		defaults :{
			id 		: '',
			content : '',
			visible	: true,
			buttons	: [],
		},
	
		initialize: function(options) {
			this.btn 		= this.get('buttons') || [];
			this.buttons	= new Buttons(this.btn);
			this.set('buttons', this.buttons);
		},
	
	});
});