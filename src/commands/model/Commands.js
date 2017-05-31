define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var Command = require('./Command');
		/**
		 * @class Commands
		 * */
		module.exports = Backbone.Collection.extend({
			
			model: Command,
			
		});
});