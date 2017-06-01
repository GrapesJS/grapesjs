var Backbone = require('backbone');
var ButtonsView = require('./ButtonsView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.buttons = this.model.get('buttons');
    this.className = this.pfx + 'panel';
    this.id = this.pfx + this.model.get('id');
    this.listenTo(this.model, 'change:appendContent', this.appendContent);
    this.listenTo(this.model, 'change:content', this.updateContent);
  },

  /**
   * Append content of the panel
   * */
  appendContent() {
    this.$el.append(this.model.get('appendContent'));
  },

  /**
   * Update content
   * */
  updateContent() {
    this.$el.html(this.model.get('content'));
  },


  render() {
    this.$el.attr('class', _.result(this, 'className'));

    if(this.id)
      this.$el.attr('id', this.id);

    if(this.buttons.length){
      var buttons  = new ButtonsView({
        collection: this.buttons,
        config: this.config,
      });
      this.$el.append(buttons.render().el);
    }
    this.$el.append(this.model.get('content'));
    return this;
  },

});
