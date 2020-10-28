import Backbone from 'backbone';
import ButtonView from './ButtonView';
import { result } from 'underscore';

export default Backbone.View.extend({
  initialize(o) {
    this.opt = o || {};
    this.config = this.opt.config || {};
    this.pfx = this.config.stylePrefix || '';
    this.parentM = this.opt.parentM || null;
    this.listenTo(this.collection, 'add', this.addTo);
    this.listenTo(this.collection, 'reset remove', this.render);
    this.className = this.pfx + 'buttons';
  },

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * */
  addTo(model) {
    this.addToCollection(model);
  },

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   *
   * @return Object Object created
   * */
  addToCollection(model, fragmentEl) {
    const fragment = fragmentEl || null;
    const viewObject = ButtonView;
    const el = model.get('el');
    const view = new viewObject({
      el,
      model,
      config: this.config,
      parentM: this.parentM
    });
    const rendered = view.render().el;

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      this.$el.append(rendered);
    }

    return rendered;
  },

  render() {
    var fragment = document.createDocumentFragment();
    this.$el.empty();

    this.collection.each(function(model) {
      this.addToCollection(model, fragment);
    }, this);

    this.$el.append(fragment);
    this.$el.attr('class', result(this, 'className'));
    return this;
  }
});
