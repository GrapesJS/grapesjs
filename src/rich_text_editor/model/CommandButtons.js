define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var CommandButton = require('./CommandButton');
		module.exports = Backbone.Collection.extend({

			model: CommandButton,

		});
});