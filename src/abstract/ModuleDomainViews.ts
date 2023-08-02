import ModuleView from './ModuleView';
import ModuleCollection from './ModuleCollection';
import ModuleModel from './ModuleModel';
import { View } from '../common';

export default abstract class ModuleDomainViews<
  TCollection extends ModuleCollection,
  TItemView extends ModuleView
> extends ModuleView<TCollection> {
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
   * @param {ModuleModel} model
   * @private
   * */
  private addTo(model: ModuleModel) {
    this.add(model);
  }

  private itemViewNotFound(type: string) {
    /*const { em, ns } = this;
    const warn = `${ns ? `[${ns}]: ` : ''}'${type}' type not found`;
    em?.logWarning(warn);*/
  }
  protected abstract renderView(model: ModuleModel, itemType: string): TItemView;

  /**
   * Render new model inside the view
   * @param {ModuleModel} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  private add(model: ModuleModel, fragment?: DocumentFragment) {
    const { reuseView, viewCollection } = this;
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
    const frag = document.createDocumentFragment();
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
    View.prototype.remove.apply(this, opts);
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
