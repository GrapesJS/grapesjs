import DomainViews from '../../domain_abstract/view/DomainViews';
import EditorModel from '../../editor/model/Editor';
import TraitView from './TraitView';
import CategoryView from '../../abstract/ModuleCategoryView';
import Categories from '../../abstract/ModuleCategories';
import Trait from '../model/Trait';
import { isObject, isString } from 'underscore';
import TraitManager, { TraitManagerConfigModule } from '..';

interface TraitsViewProps {
  el?: HTMLElement;
  collection: any[];
  editor: EditorModel;
  config: TraitManagerConfigModule;
  categories: Categories;
}

const ATTR_CATEGORIES = 'data-categories';
const ATTR_NO_CATEGORIES = 'data-no-categories';

export default class TraitsView extends DomainViews {
  reuseView = true;
  em: EditorModel;
  pfx: string;
  ppfx: string;
  categories: Categories;
  renderedCategories = new Map<string, CategoryView>();
  config: TraitManagerConfigModule;
  traitContClass: string;
  catsClass: string;
  catsEl?: HTMLElement;
  traitsEl?: HTMLElement;
  rendered?: boolean;
  itemsView: TraitManager['types'];

  constructor(o: TraitsViewProps, itemsView: TraitManager['types']) {
    super(o);
    this.itemsView = itemsView;
    const config = o.config || {};
    this.config = config;

    const em = o.editor;
    this.em = em;
    const ppfx = config.pStylePrefix || '';
    this.ppfx = ppfx;
    this.pfx = ppfx + config.stylePrefix || '';
    this.className = `${this.pfx}traits`;
    this.categories = o.categories || '';
    this.traitContClass = `${ppfx}traits-c`;
    this.catsClass = `${ppfx}trait-categories`;
    this.listenTo(em, 'component:toggled', this.updatedCollection);
    this.updatedCollection();
  }

  /**
   * Update view collection
   * @private
   */
  updatedCollection() {
    const { ppfx, em } = this;
    const comp = em.getSelected();
    this.el.className = `${this.traitContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    // @ts-ignore
    this.collection = comp ? comp.get('traits') : [];
    this.render();
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model: Trait, fragment?: DocumentFragment) {
    const { config, renderedCategories } = this;
    let itemView = this.itemView;
    const typeField = model.get(this.itemType as any);
    if (this.itemsView && this.itemsView[typeField]) {
      itemView = this.itemsView[typeField];
    }
    const view = new itemView({
      config,
      model,
      attributes: model.get('attributes'),
    });
    const rendered = view.render().el;
    let category = model.get('category');

    // TODO: this part could be consolidated better with BlocksView.ts
    // Check for categories
    if (category && this.categories && !(config as any).ignoreCategories) {
      if (isString(category)) {
        category = { id: category, label: category };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.categories.add(category);
      const catId = catModel.getId();
      const categories = this.getCategoriesEl();
      let catView = renderedCategories.get(catId);
      model.set('category', catModel as any, { silent: true });

      if (!catView && categories) {
        catView = new CategoryView({ model: catModel }, config, 'trait').render();
        renderedCategories.set(catId, catView);
        categories.appendChild(catView.el);
      }

      catView && catView.append(rendered);
      return;
    }

    fragment ? fragment.appendChild(rendered) : this.append(rendered);
  }

  getCategoriesEl() {
    if (!this.catsEl) {
      this.catsEl = this.el.querySelector(`[${ATTR_CATEGORIES}]`)!;
    }
    return this.catsEl;
  }

  getTraitsEl() {
    if (!this.traitsEl) {
      this.traitsEl = this.el.querySelector(`[${ATTR_NO_CATEGORIES}]`)!;
    }

    return this.traitsEl;
  }

  append(el: HTMLElement | DocumentFragment) {
    const traits = this.getTraitsEl();
    traits?.appendChild(el);
  }

  render() {
    const { ppfx, catsClass, traitContClass } = this;
    const frag = document.createDocumentFragment();
    delete this.catsEl;
    delete this.traitsEl;
    this.renderedCategories = new Map();
    this.el.innerHTML = `
      <div class="${catsClass}" ${ATTR_CATEGORIES}></div>
      <div class="${traitContClass}" ${ATTR_NO_CATEGORIES}></div>
    `;

    this.collection.forEach(model => this.add(model, frag));
    this.append(frag);
    const cls = `${traitContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    this.rendered = true;
    return this;
  }
}

TraitsView.prototype.itemView = TraitView;
