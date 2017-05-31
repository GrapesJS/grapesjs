define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var Panel = require('./Panel');

		module.exports = Backbone.Collection.extend({

			model: Panel,

		});
});