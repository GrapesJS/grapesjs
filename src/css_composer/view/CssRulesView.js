var Backbone = require('backbone');
var CssRuleView = require('./CssRuleView');

module.exports = Backbone.View.extend({

  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.className = this.pfx + 'rules';
    this.listenTo( this.collection, 'add', this.addTo );
    this.listenTo( this.collection, 'reset', this.render );
  },

  /**
   * Add to collection
   * @param {Object} model
   * @private
   * */
  addTo(model) {
    //console.log('Added');
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
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(function(model){
      this.addToCollection(model, fragment);
    }, this);

    this.$el.append(fragment);
    this.$el.attr('class', this.className);
    return this;
  }
});
