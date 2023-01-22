import { includes } from 'underscore';
import { ObjectAny, View } from '../../common';

export default class DomainViews extends View {
  config?: any;
  items: any[];
  ns?: string;
  itemView?: any;

  // Defines the View per type
  itemsView = '';

  itemType = 'type';

  reuseView = false;

  constructor(opts: any = {}, config?: any, autoAdd = false) {
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
  addTo(model: any) {
    this.add(model);
  }

  itemViewNotFound(type: string) {
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
  add(model: any, fragment?: DocumentFragment) {
    const { config, reuseView, items } = this;
    const itemsView = (this.itemsView || {}) as ObjectAny;
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
        // @ts-ignore
        this.add(model, frag);
      }, this);

    this.$el.append(frag);
    this.onRender();
    return this;
  }

  onRender() {}
  onRemoveBefore(items?: any, opts?: any) {}
  onRemove(items?: any, opts?: any) {}

  remove(opts = {}) {
    const { items } = this;
    this.onRemoveBefore(items, opts);
    this.clearItems();
    super.remove();
    this.onRemove(items, opts);
    return this;
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
