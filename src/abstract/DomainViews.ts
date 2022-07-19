import { includes } from 'underscore';
import Backbone from 'backbone';
import View from './View';
import Collection from './Collection';
import Model from './Model';

export default abstract class DomainViews<
  TCollection extends Collection,
  TItemView extends View
> extends View<TCollection> {
  // Defines the View per type
  itemsView = '';

  protected itemType = 'type';

  reuseView = false;

  viewCollection: TItemView[] = [];
  constructor(opts: any = {}, autoAdd = false) {
    super(opts);
    autoAdd && this.listenTo(this.collection, 'add', this.addTo);
  }

  /**
   * Add new model to the collection
   * @param {Model} model
   * @private
   * */
  private addTo(model: Model) {
    this.add(model);
  }

  private itemViewNotFound(type: string) {
    /*const { em, ns } = this;
    const warn = `${ns ? `[${ns}]: ` : ''}'${type}' type not found`;
    em?.logWarning(warn);*/
  }
  protected abstract renderView(model: Model, itemType: string): TItemView;

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  private add(model: Model, fragment?: DocumentFragment) {
    const { reuseView, viewCollection, itemsView = {} } = this;
    var frag = fragment || null;
    var typeField = model.get(this.itemType);
    let view;

    //@ts-ignore
    if (model.view && reuseView) {
      //@ts-ignore
      view = model.view;
    } else {
      view = this.renderView(model, typeField);
    }

    viewCollection.push(view);
    const rendered = view.render().el;

    if (frag) frag.appendChild(rendered);
    else this.$el.append(rendered);
  }

  render() {
    var frag = document.createDocumentFragment();
    this.clearItems();
    this.$el.empty();

    if (this.collection.length) this.collection.each(model => this.add(model, frag));

    this.$el.append(frag);
    this.onRender();
    return this;
  }

  onRender() {}

  onRemoveBefore(items: TItemView[], opts: any) {}
  onRemove(items: TItemView[], opts: any) {}

  remove(opts: any = {}) {
    const { viewCollection } = this;
    this.onRemoveBefore(viewCollection, opts);
    this.clearItems();
    Backbone.View.prototype.remove.apply(this, opts);
    this.onRemove(viewCollection, opts);
    return this;
  }

  clearItems() {
    const items = this.viewCollection || [];
    // TODO Traits do not update the target anymore
    // items.forEach(item => item.remove());
    // this.items = [];
  }
}
