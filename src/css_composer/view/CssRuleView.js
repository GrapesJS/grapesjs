var Backbone = require('backbone');

module.exports = Backbone.View.extend({

  tagName: 'style',

  initialize(o) {
    this.config = o.config || {};
    this.listenTo(this.model, 'change:style', this.render);
    this.listenTo(this.model, 'change:state', this.render);
    this.listenTo(this.model, 'destroy remove', this.remove);
    this.listenTo(this.model, 'change:mediaText', this.render);
    this.listenTo(this.model.get('selectors'), 'change', this.selChanged);
  },

  /**
   * Triggered when some selector is changed
   * @private
   */
  selChanged() {
    this.selStr = this.renderSelectors();
    this.render();
  },

  /**
   * Returns string of selectors
   * @return {String}
   * @private
   */
  renderSelectors() {
    var sel = [];
    var model = this.model;
    var add = model.get('selectorsAdd');
    model.get('selectors').each(m => {
      sel.push('.' + m.get('name'));
    });
    var sels = sel.join('');
    return sels + (sels && add ? ', ' : '') + add;
  },

  /**
   * Returns string of properties
   * @return {String}
   * @private
   */
  renderProperties() {
    var sel = [],
      props = this.model.get('style');
    for (var prop in props){
      sel.push(prop + ':' + props[prop] + ';');
    }
    return sel.join('');
  },

  render() {
    var block = '',
      selStr = '',
      o = '';
    if(!this.selStr)
      this.selStr = this.renderSelectors();
    var prpStr = this.renderProperties();
    var stateStr = this.model.get('state');
    var mediaText = this.model.get('mediaText');
    if(this.selStr){
      stateStr = stateStr ? ':' + stateStr : '';
      block = prpStr !== '' ? '{' + prpStr + '}' : '';
    }
    o = this.selStr && block ? this.selStr + stateStr + block : '';

    if(mediaText && o)
      o = '@media ' + mediaText + '{' + o + '}';

    this.$el.html(o);
    return this;
  },

});
