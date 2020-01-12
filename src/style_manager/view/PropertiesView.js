import Backbone from 'backbone';
import { appendAtIndex } from 'utils/dom';

export default Backbone.View.extend({
  initialize(o) {
    this.config = o.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.target = o.target || {};
    this.propTarget = o.propTarget || {};
    this.onChange = o.onChange;
    this.onInputRender = o.onInputRender || {};
    this.customValue = o.customValue || {};
    this.properties = [];
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.render);
  },

  addTo(model, coll, opts) {
    this.add(model, null, opts);
  },

  add(model, frag, opts = {}) {
    const appendTo = frag || this.el;
    const view = new model.typeView({
      model,
      name: model.get('name'),
      id: this.pfx + model.get('property'),
      target: this.target,
      propTarget: this.propTarget,
      onChange: this.onChange,
      onInputRender: this.onInputRender,
      config: this.config
    });

    if (model.get('type') != 'composite') {
      view.customValue = this.customValue;
    }

    view.render();
    const rendered = view.el;
    this.properties.push(view);
    view.updateVisibility();

    appendAtIndex(appendTo, rendered, opts.at);
  },

  render() {
    this.properties = [];
    const fragment = document.createDocumentFragment();
    this.collection.each(model => this.add(model, fragment));
    this.$el.append(fragment);
    this.$el.attr('class', `${this.pfx}properties`);
    return this;
  }
});
