import Backbone from 'backbone';
import { isUndefined } from 'underscore';

export default Backbone.View.extend({
  initialize(o) {
    this.opts = o || {};
    this.config = o.config || {};
    this.em = this.config.em;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset', this.resetChildren);
    this.listenTo(coll, 'remove', this.removeChildren);
  },

  removeChildren(removed, coll, opts = {}) {
    removed.views.forEach(view => {
      if (!view) return;
      const { childrenView, scriptContainer } = view;
      childrenView && childrenView.stopListening();
      scriptContainer && scriptContainer.remove();
      view.remove.apply(view);
    });

    const inner = removed.components();
    inner.forEach(it => this.removeChildren(it, coll, opts));
  },

  /**
   * Add to collection
   * @param {Model} model
   * @param {Collection} coll
   * @param {Object} opts
   * @private
   * */
  addTo(model, coll = {}, opts = {}) {
    const em = this.config.em;
    const i = this.collection.indexOf(model);
    this.addToCollection(model, null, i);

    if (em && !opts.temporary) {
      const triggerAdd = model => {
        em.trigger('component:add', model);
        model.components().forEach(comp => triggerAdd(comp));
      };
      triggerAdd(model);
    }
  },

  /**
   * Add new object to collection
   * @param  {Object}  Model
   * @param  {Object}   Fragment collection
   * @param  {Integer}  Index of append
   *
   * @return   {Object}   Object rendered
   * @private
   * */
  addToCollection(model, fragmentEl, index) {
    if (!this.compView) this.compView = require('./ComponentView').default;
    const { config, opts, em } = this;
    const fragment = fragmentEl || null;
    const { frameView = {} } = config;
    const sameFrameView = frameView.model && model.getView(frameView.model);
    const dt =
      opts.componentTypes || (em && em.get('DomComponents').getTypes());
    const type = model.get('type') || 'default';
    let viewObject = this.compView;

    for (let it = 0; it < dt.length; it++) {
      if (dt[it].id == type) {
        viewObject = dt[it].view;
        break;
      }
    }
    const view =
      sameFrameView ||
      new viewObject({
        model,
        config,
        componentTypes: dt
      });
    let rendered;

    try {
      // Avoid breaking on DOM rendering (eg. invalid attribute name)
      rendered = view.render().el;
    } catch (error) {
      rendered = document.createTextNode('');
      em.logError(error);
    }

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      const parent = this.parentEl;
      const children = parent.childNodes;

      if (!isUndefined(index)) {
        const lastIndex = children.length == index;

        // If the added model is the last of collection
        // need to change the logic of append
        if (lastIndex) {
          index--;
        }

        // In case the added is new in the collection index will be -1
        if (lastIndex || !children.length) {
          parent.appendChild(rendered);
        } else {
          parent.insertBefore(rendered, children[index]);
        }
      } else {
        parent.appendChild(rendered);
      }
    }

    return rendered;
  },

  resetChildren(models, { previousModels = [] } = {}) {
    this.parentEl.innerHTML = '';
    previousModels.forEach(md => this.removeChildren(md, this.collection));
    models.each(model => this.addToCollection(model));
  },

  render(parent) {
    const el = this.el;
    const frag = document.createDocumentFragment();
    this.parentEl = parent || this.el;
    this.collection.each(model => this.addToCollection(model, frag));
    el.innerHTML = '';
    el.appendChild(frag);
    return this;
  }
});
