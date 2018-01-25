let Backbone = require('backbone');
let DomainViews = require('domain_abstract/view/DomainViews');
let ToolbarButtonView = require('./ToolbarButtonView');

module.exports = DomainViews.extend({
  itemView: ToolbarButtonView,

  initialize(opts) {
    this.config = { editor: opts.editor || '' };
    this.listenTo(this.collection, 'reset', this.render);
  }
});
