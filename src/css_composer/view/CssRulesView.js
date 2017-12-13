var Backbone = require('backbone');
var CssRuleView = require('./CssRuleView');

module.exports = Backbone.View.extend({

  initialize(o) {
    const config = o.config || {};
    this.config = config;
    this.em = config.em;
    this.pfx = config.stylePrefix || '';
    this.className = this.pfx + 'rules';
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo );
    this.listenTo(coll, 'reset', this.render );
  },

  /**
   * Add to collection
   * @param {Object} model
   * @private
   * */
  addTo(model) {
    this.addToCollection(model);
  },

  /**
   * Add new object to collection
   * @param {Object} model
   * @param {Object} fragmentEl
   * @return {Object}
   * @private
   * */
  addToCollection(model, fragmentEl) {
    var fragment  = fragmentEl || null;
    var viewObject  = CssRuleView;

    var view = new viewObject({
        model,
        config: this.config,
    });
    var rendered  = view.render().el;

    if(fragment)
      fragment.appendChild( rendered );
    else
      this.$el.append(rendered);

    return rendered;
  },

  render() {
    const $el = this.$el;
    const frag = document.createDocumentFragment();
    $el.empty();
    this.collection.each(model => this.addToCollection(model, frag));
    $el.append(frag);
    $el.attr('class', this.className);
    return this;
  }
});
