define(function(require, exports, module){
  'use strict';
  var Backbone = require('backbone');
  var DomainViews = require('Abstract/view/DomainViews');
  var ToolbarButtonView = require('./ToolbarButtonView');

		module.exports = DomainViews.extend({

			itemView: ToolbarButtonView,

			initialize: function(opts) {
				this.config = {editor: opts.editor || ''};
				this.listenTo(this.collection, 'reset', this.render);
			},

		});

});