define(function(require, exports, module){
  'use strict';
  var Component = require('./Component');

		module.exports = Component.extend({

			defaults: _.extend({}, Component.prototype.defaults, {
				type: 'text',
				droppable: false,
				editable: true,
			}),

		});
});