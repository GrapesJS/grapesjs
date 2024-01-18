import DomainViews from '../../domain_abstract/view/DomainViews';
import EditorModel from '../../editor/model/Editor';
import TraitView from './TraitView';
import CategoryView from '../../abstract/ModuleCategoryView';
import Categories from '../../abstract/ModuleCategories';
import Trait from '../model/Trait';
import { isObject, isString } from 'underscore';

export default class TraitsView extends DomainViews {
  reuseView = true;
  em: EditorModel;
  pfx: string;
  ppfx: string;
  categories: Categories;
  renderedCategories = new Map<string, CategoryView>();
  noCatClass: string;
  traitContClass: string;
  catsClass: string;
  catsEl?: HTMLElement;
  traitsEl?: HTMLElement;
  itemView?: any;
  itemType: any;
  rendered?: boolean;

  constructor(o: any = {}, itemsView: any) {
    super(o);
    this.itemsView = itemsView;
    const config = o.config || {};

    const em = o.editor;
    this.em = em;
    this.ppfx = config.pStylePrefix || '';
    this.pfx = this.ppfx + config.stylePrefix || '';
    this.className = `${this.pfx}traits`;
    this.categories = o.categories || '';
    this.noCatClass = `${this.ppfx}traits-no-cat`;
    this.traitContClass = `${this.ppfx}traits-c`;
    this.catsClass = `${this.ppfx}trait-categories`;
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
   * Add new model to the collection
   * @param {Model} model
   * @private
   */
  addTo(model: Trait) {
    this.add(model);
  }

  /**
   * Render new model inside the view
   * @param {Model} model
   * @param {Object} fragment Fragment collection
   * @private
   * */
  add(model: Trait, fragment?: DocumentFragment) {
    const { config, renderedCategories } = this;
    var itemView = this.itemView;
    const typeField = model.get(this.itemType);
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

    // Check for categories
    if (category && this.categories && !config.ignoreCategories) {
      if (isString(category)) {
        category = {
          id: category,
          label: category,
        };
      } else if (isObject(category) && !category.id) {
        category.id = category.label;
      }

      const catModel = this.categories.add(category);
      const catId = catModel.get('id')!;
      const categories = this.getCategoriesEl();
      let catView = renderedCategories.get(catId);
      //@ts-ignore
      model.set('category', catModel, { silent: true });

      if (!catView && categories) {
        catView = new CategoryView(
          {
            model: catModel,
          },
          config,
          'trait'
        ).render();
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
      this.catsEl = this.el.querySelector(`.${this.catsClass}`)!;
    }
    return this.catsEl;
  }

  getTraitsEl() {
    if (!this.traitsEl) {
      this.traitsEl = this.el.querySelector(`.${this.noCatClass} .${this.traitContClass}`)!;
    }

    return this.traitsEl;
  }

  append(el: HTMLElement | DocumentFragment) {
    let traits = this.getTraitsEl();
    traits && traits.appendChild(el);
  }

  render() {
    const ppfx = this.ppfx;
    const frag = document.createDocumentFragment();
    delete this.catsEl;
    delete this.traitsEl;
    this.renderedCategories = new Map();
    this.el.innerHTML = `
    <div class="${this.catsClass}"></div>
    <div class="${this.noCatClass}">
    <div class="${this.traitContClass}"></div>
    </div>
    `;
    if (this.collection.length) {
      this.collection.each(model => this.add(model, frag));
    }
    this.append(frag);
    const cls = `${this.traitContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    this.rendered = true;
    return this;
  }
}

// @ts-ignore
TraitsView.prototype.itemView = TraitView;
