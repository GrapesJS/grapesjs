define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
		/**
		 * @class HtmlGenerator
		 * */
		module.exports = Backbone.Model.extend({

			/** @inheritdoc */
			build: function(model, cssc){
				var coll = model.get('components') || model,
					code = '';

				coll.each(function(m){
					code += m.toHTML({
						cssc: cssc
					});
				}, this);

				return code;
			},

		});
});