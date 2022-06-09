import { includes } from 'underscore';
import Backbone from 'backbone';

export default class DomainViews extends Backbone.View {
  // Defines the View per type
  itemsView = '';

  itemType = 'type';

  reuseView = false;

  constructor(opts = {}, config, autoAdd = false) {
    super(opts);
    this.config = config || opts.config || {};
    autoAdd && this.listenTo(this.collection, 'add', this.addTo);
    this.items = [];
  }

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  addTo(model) {
    this.add(model);
  }

  itemViewNotFound(type) {
    const { config, ns } = this;
    const { em } = config;
    const warn = `${ns ? `[${ns}]: ` : ''}'${type}' type not found`;
    em && em.logWarning(warn);
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model, fragment) {
    const { config, reuseView, items, itemsView = {} } = this;
    const inputTypes = [
      'button',
      'checkbox',
      'color',
      'date',
      'datetime-local',
      'email',
      'file',
      'hidden',
      'image',
      'month',
      'number',
      'password',
      'radio',
      'range',
      'reset',
      'search',
      'submit',
      'tel',
      'text',
      'time',
      'url',
      'week',
    ];
    var frag = fragment || null;
    var itemView = this.itemView;
    var typeField = model.get(this.itemType);
    let view;

    if (itemsView[typeField]) {
      itemView = itemsView[typeField];
    } else if (typeField && !itemsView[typeField] && !includes(inputTypes, typeField)) {
      this.itemViewNotFound(typeField);
    }

    if (model.view && reuseView) {
      view = model.view;
    } else {
      view = new itemView({ model, config }, config);
    }

    items && items.push(view);
    const rendered = view.render().el;

    if (frag) frag.appendChild(rendered);
    else this.$el.append(rendered);
  }

  render() {
    var frag = document.createDocumentFragment();
    this.clearItems();
    this.$el.empty();

    if (this.collection.length)
      this.collection.each(function (model) {
        this.add(model, frag);
      }, this);

    this.$el.append(frag);
    this.onRender();
    return this;
  }

  onRender() {}

  onRemoveBefore() {}
  onRemove() {}

  remove(opts = {}) {
    const { items } = this;
    this.onRemoveBefore(items, opts);
    this.clearItems();
    Backbone.View.prototype.remove.apply(this, arguments);
    this.onRemove(items, opts);
  }

  clearItems() {
    const items = this.items || [];
    // TODO Traits do not update the target anymore
    // items.forEach(item => item.remove());
    // this.items = [];
  }
}

// Default view
DomainViews.prototype.itemView = '';
