import TraitManager from '..';
import CategoryView from '../../abstract/ModuleCategoryView';
import Component from '../../dom_components/model/Component';
import DomainViews from '../../domain_abstract/view/DomainViews';
import EditorModel from '../../editor/model/Editor';
import Trait from '../model/Trait';
import Traits from '../model/Traits';
import { TraitManagerConfigModule } from '../types';
import TraitView from './TraitView';

interface TraitsViewProps {
  el?: HTMLElement;
  collection: any[];
  editor: EditorModel;
  config: TraitManagerConfigModule;
}

const ATTR_CATEGORIES = 'data-categories';
const ATTR_NO_CATEGORIES = 'data-no-categories';
const CUSTOM_TRAIT_VALIDATION_REGEX_DEFAULT = new RegExp('^data-[a-z][a-z0-9-]*$');

export default class TraitsView extends DomainViews {
  reuseView = true;
  em: EditorModel;
  pfx: string;
  ppfx: string;
  renderedCategories = new Map<string, CategoryView>();
  config: TraitManagerConfigModule;
  traitContClass: string;
  catsClass: string;
  classNoCat: string;
  catsEl?: HTMLElement;
  traitsEl?: HTMLElement;
  rendered?: boolean;
  itemsView: TraitManager['types'];
  collection: Traits;

  events() {
    return {
      'click [data-add-trait]': 'handleAddTrait',
      'keyup [data-add-trait-input]': 'handleInputKeyup',
    };
  }

  handleAddTrait() {
    const input = this.el.querySelector('[data-add-trait-input]') as HTMLInputElement;
    const name = input.value.trim();

    if (name) {
      const component = this.validateTraitName(name);
      if (!component) {
        return;
      }

      const attributes = component.getAttributes();
      if (attributes[name]) {
        return;
      }
      component.addTrait([name]);
      component.addAttributes({ [name]: '' });

      input.value = '';
    }
  }

  handleInputKeyup(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      this.handleAddTrait();
    }
  }

  validateTraitName(name: string): Component | undefined {
    const component = this.em.getSelected();
    if (component) {
      const attributes = component.getAttributes();
      if (attributes[name]) {
        return undefined;
      }
      if (this.config.customTraitValidationRegex) {
        return this.config.customTraitValidationRegex.test(name) ? component : undefined;
      }
      return CUSTOM_TRAIT_VALIDATION_REGEX_DEFAULT.test(name) ? component : undefined;
    }
    return undefined;
  }

  constructor(props: TraitsViewProps, itemsView: TraitManager['types']) {
    super(props);
    this.itemsView = itemsView;
    const config = props.config || {};
    this.config = config;

    const em = props.editor;
    this.em = em;
    const ppfx = config.pStylePrefix || '';
    this.ppfx = ppfx;
    this.pfx = ppfx + config.stylePrefix || '';
    this.className = `${this.pfx}traits`;
    this.traitContClass = `${ppfx}traits-c`;
    this.classNoCat = `${ppfx}traits-empty-c`;
    this.catsClass = `${ppfx}trait-categories`;
    this.collection = new Traits([], { em });
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
    if (this.collection) {
      this.stopListening(this.collection);
    }
    this.collection = comp?.traits || new Traits([], { em });
    const collection = this.collection;
    this.listenTo(collection, 'add', (model) => this.add(model));
    this.listenTo(collection, 'reset', this.render);
    this.listenTo(collection, 'remove', this.render);
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
    const category = model.parent.initCategory(model);

    if (category) {
      const catId = category.getId();
      const categories = this.getCategoriesEl();
      let catView = renderedCategories.get(catId);

      if (!catView && categories) {
        catView = new CategoryView({ model: category }, config, 'trait').render();
        renderedCategories.set(catId, catView);
        categories.appendChild(catView.el);
      }

      catView?.append(rendered);
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
    const { el, ppfx, catsClass, traitContClass, classNoCat, config } = this;
    const frag = document.createDocumentFragment();
    delete this.catsEl;
    delete this.traitsEl;
    this.renderedCategories = new Map();
    const iconAdd = (config as any).iconAdd || '+';

    el.innerHTML = `
      <div class="${catsClass}" ${ATTR_CATEGORIES}></div>
      <div class="${classNoCat} ${traitContClass}" ${ATTR_NO_CATEGORIES}></div>
      <div class="${ppfx}traits-footer" style="padding: 10px; display: flex; align-items: center; gap: 5px;">
      <div class="${ppfx}field">
        <input  placeholder="Attribute name" data-add-trait-input style="flex-grow: 1;"/>
        </div>
        <button class="${ppfx}btn-prim" data-add-trait>
          ${iconAdd}
        </button>
      </div>
    `;

    this.collection.forEach((model) => this.add(model, frag));
    this.append(frag);
    const cls = `${traitContClass}s ${ppfx}one-bg ${ppfx}two-color`;
    this.$el.addClass(cls);
    this.rendered = true;
    return this;
  }
}

TraitsView.prototype.itemView = TraitView;
