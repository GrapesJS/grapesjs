import { View } from 'backbone';
import { eventDrag } from 'dom_components/model/Component';

export default View.extend({
  initialize(o = {}) {
    this.items = [];
    this.opt = o;
    const config = o.config || {};
    this.level = o.level;
    this.config = config;
    this.preview = o.preview;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = config.stylePrefix || '';
    this.parent = o.parent;
    this.parentView = o.parentView;
    const pfx = this.pfx;
    const ppfx = this.ppfx;
    const parent = this.parent;
    const coll = this.collection;
    this.listenTo(coll, 'add', this.addTo);
    this.listenTo(coll, 'reset resetNavigator', this.render);
    this.listenTo(coll, 'remove', this.removeChildren);
    this.className = `${pfx}layers`;
    const em = config.em;

    if (config.sortable && !this.opt.sorter) {
      const utils = em.get('Utils');
      this.opt.sorter = new utils.Sorter({
        container: config.sortContainer || this.el,
        containerSel: `.${this.className}`,
        itemSel: `.${pfx}layer`,
        ignoreViewChildren: 1,
        onEndMove(created, sorter, data) {
          const srcModel = sorter.getSourceModel();
          em.setSelected(srcModel, { forceChange: 1 });
          em.trigger(`${eventDrag}:end`, data);
        },
        avoidSelectOnEnd: 1,
        nested: 1,
        ppfx,
        pfx
      });
    }

    this.sorter = this.opt.sorter || '';

    // For the sorter
    this.$el.data('collection', coll);
    parent && this.$el.data('model', parent);
  },

  removeChildren(removed) {
    const view = removed.viewLayer;
    if (!view) return;
    view.remove();
    removed.viewLayer = 0;
  },

  /**
   * Add to collection
   * @param Object Model
   *
   * @return Object
   * */
  addTo(model) {
    var i = this.collection.indexOf(model);
    this.addToCollection(model, null, i);
  },

  /**
   * Add new object to collection
   * @param  Object  Model
   * @param  Object   Fragment collection
   * @param  integer  Index of append
   *
   * @return Object Object created
   * */
  addToCollection(model, fragmentEl, index) {
    const { level, parentView, opt } = this;
    const { ItemView } = opt;
    const fragment = fragmentEl || null;
    const item = new ItemView({
      ItemView,
      level,
      model,
      parentView,
      config: this.config,
      sorter: this.sorter,
      isCountable: this.isCountable,
      opened: this.opt.opened
    });
    const rendered = item.render().el;

    if (fragment) {
      fragment.appendChild(rendered);
    } else {
      if (typeof index != 'undefined') {
        var method = 'before';
        // If the added model is the last of collection
        // need to change the logic of append
        if (this.$el.children().length == index) {
          index--;
          method = 'after';
        }
        // In case the added is new in the collection index will be -1
        if (index < 0) {
          this.$el.append(rendered);
        } else
          this.$el
            .children()
            .eq(index)
            [method](rendered);
      } else this.$el.append(rendered);
    }
    this.items.push(item);
    return rendered;
  },

  remove() {
    View.prototype.remove.apply(this, arguments);
    this.items.map(i => i.remove());
  },

  /**
   * Check if the model could be count by the navigator
   * @param  {Object}  model
   * @return {Boolean}
   * @private
   */
  isCountable(model, hide) {
    var type = model.get('type');
    var tag = model.get('tagName');
    if (
      ((type == 'textnode' || tag == 'br') && hide) ||
      !model.get('layerable')
    ) {
      return false;
    }
    return true;
  },

  render() {
    const frag = document.createDocumentFragment();
    const el = this.el;
    el.innerHTML = '';
    this.collection.each(model => this.addToCollection(model, frag));
    el.appendChild(frag);
    el.className = this.className;
    return this;
  }
});
