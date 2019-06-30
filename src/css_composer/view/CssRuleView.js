import Backbone from 'backbone';

export default Backbone.View.extend({
  tagName: 'style',

  initialize(o = {}) {
    this.config = o.config || {};
    const model = this.model;
    const toTrack = 'change:style change:state change:mediaText';
    this.listenTo(model, toTrack, this.render);
    this.listenTo(model, 'destroy remove', this.remove);
    this.listenTo(model.get('selectors'), 'change', this.render);
  },

  render() {
    const model = this.model;
    const important = model.get('important');
    this.el.innerHTML = this.model.toCSS({ important });
    return this;
  }
});
