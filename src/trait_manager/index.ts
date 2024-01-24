import { debounce } from 'underscore';
import { Module } from '../abstract';
import { Model } from '../common';
import Component from '../dom_components/model/Component';
import EditorModel from '../editor/model/Editor';
import defaults from './config/config';
import {
  CustomTrait,
  TraitCustomData,
  TraitManagerConfigModule,
  TraitModuleStateProps,
  TraitViewTypes,
  TraitsByCategory,
  TraitsEvents,
} from './types';
import TraitButtonView from './view/TraitButtonView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitColorView from './view/TraitColorView';
import TraitNumberView from './view/TraitNumberView';
import TraitSelectView from './view/TraitSelectView';
import TraitView from './view/TraitView';
import TraitsView from './view/TraitsView';
import Category, { getItemsByCategory } from '../abstract/ModuleCategory';
import Trait from './model/Trait';

export default class TraitManager extends Module<TraitManagerConfigModule> {
  __ctn?: HTMLElement;
  view?: TraitsView;

  TraitsView = TraitsView;
  events = TraitsEvents;
  state = new Model<TraitModuleStateProps>({ traits: [] });
  types: TraitViewTypes = {
    text: TraitView,
    number: TraitNumberView,
    select: TraitSelectView,
    checkbox: TraitCheckboxView,
    color: TraitColorView,
    button: TraitButtonView,
  };

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Initialize module
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'TraitManager', defaults as any);
    const { state, config } = this;
    const ppfx = config.pStylePrefix;
    ppfx && (config.stylePrefix = `${ppfx}${config.stylePrefix}`);

    const upAll = debounce(() => this.__upSel(), 0);
    const update = debounce(() => this.__onUp(), 0);
    state.listenTo(em, 'component:toggled', upAll);
    state.listenTo(em, 'trait:update', update);

    this.debounced = [upAll, update];
  }

  /**
   * Select traits from component.
   * @param {[Component]} component
   * @example
   * traitManager.select(someComponent);
   */
  select(component?: Component) {
    const traits = component?.getTraits() || [];
    this.state.set({ component, traits });
    this.__trgCustom();
  }

  /**
   * Get traits from the currently selected component.
   * @return {Array<Trait>}
   */
  getTraits() {
    return this.getCurrent();
  }

  /**
   * Get traits by category from the currently selected component.
   * @example
   * traitManager.getTraitsByCategory();
   * // Returns an array of items of this type
   * // > { category?: Category; items: Trait[] }
   *
   * // NOTE: The item without category is the one containing traits without category.
   */
  getTraitsByCategory(): TraitsByCategory[] {
    return getItemsByCategory<Trait>(this.getTraits());
  }

  /**
   *
   * Get Traits viewer
   * @private
   */
  getTraitsViewer() {
    return this.view;
  }

  /**
   * Add new trait type
   * @param {string} name Type name
   * @param {Object} methods Object representing the trait
   */
  addType<T>(name: string, trait: CustomTrait<T>) {
    const baseView = this.getType('text');
    //@ts-ignore
    this.types[name] = baseView.extend(trait);
  }

  /**
   * Get trait type
   * @param {string} name Type name
   * @return {Object}
   */
  getType(name: string) {
    return this.getTypes()[name];
  }

  /**
   * Get all trait types
   * @returns {Object}
   */
  getTypes() {
    return this.types;
  }

  /**
   * Get trait categories from the currently selected component.
   * @return {Array<Category>}
   */
  getCategories(): Category[] {
    const cmp = this.state.get('component');
    const categories = cmp?.traits.categories?.models || [];
    return [...categories];
  }

  getCurrent() {
    return this.state.get('traits') || [];
  }

  render() {
    let { view } = this;
    const { em } = this;
    view = new TraitsView(
      {
        el: view?.el,
        collection: [],
        editor: em,
        config: this.getConfig(),
      },
      this.getTypes()
    );
    this.view = view;
    return view.el;
  }

  postRender() {
    this.__appendTo();
  }

  __trgCustom(opts: TraitCustomData = {}) {
    const { em, events, __ctn } = this;
    this.__ctn = __ctn || opts.container;
    em.trigger(events.custom, this.__customData());
  }

  __customData(): TraitCustomData {
    return { container: this.__ctn };
  }

  __upSel() {
    this.select(this.em.getSelected());
  }

  __onUp() {
    this.select(this.state.get('component'));
  }
}
