/**
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/trait_manager/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  traitManager: {
 *    // options
 *  }
 * })
 * ```
 *
 *
 * Once the editor is instantiated you can use the API below and listen to the events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('trait:value', () => { ... });
 *
 * // Use the Trait Manager API
 * const tm = editor.Traits;
 * tm.select(...)
 * ```
 *
 * {REPLACE_EVENTS}
 *
 * [Component]: component.html
 * [Trait]: trait.html
 *
 * @module Traits
 */

import { bindAll, debounce } from 'underscore';
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
   * @returns {Object}
   */

  /**
   * Initialize module
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'TraitManager', defaults as any);
    const { state, config, events } = this;
    const ppfx = config.pStylePrefix;
    ppfx && (config.stylePrefix = `${ppfx}${config.stylePrefix}`);
    bindAll(this, '__onSelect');

    const upAll = debounce(() => this.__upSel(), 0);
    const update = debounce(() => this.__onUp(), 0);
    state.listenTo(em, 'component:toggled', upAll);
    state.listenTo(em, events.value, update);
    state.on('change:traits', this.__onSelect);

    this.debounced = [upAll, update];
  }

  /**
   * Select traits from a component.
   * @param {[Component]} component
   * @example
   * tm.select(someComponent);
   */
  select(component?: Component) {
    const traits = component?.getTraits() || [];
    this.state.set({ component, traits });
    this.__trgCustom();
  }

  /**
   * Get trait categories from the currently selected component.
   * @returns {Array<Category>}
   * @example
   * const traitCategories: Category[] = tm.getCategories();
   *
   */
  getCategories(): Category[] {
    const cmp = this.getComponent();
    const categories = cmp?.traits.categories?.models || [];
    return [...categories];
  }

  /**
   * Get traits from the currently selected component.
   * @returns {Array<[Trait]>}
   * @example
   * const currentTraits: Trait[] = tm.getTraits();
   */
  getTraits() {
    return this.getCurrent();
  }

  /**
   * Get traits by category from the currently selected component.
   * @example
   * tm.getTraitsByCategory();
   * // Returns an array of items of this type
   * // > { category?: Category; items: Trait[] }
   *
   * // NOTE: The item without category is the one containing traits without category.
   *
   * // You can also get the same output format by passing your own array of Traits
   * const myFilteredTraits: Trait[] = [...];
   * tm.getTraitsByCategory(myFilteredTraits);
   */
  getTraitsByCategory(traits?: Trait[]): TraitsByCategory[] {
    return getItemsByCategory<Trait>(traits || this.getTraits());
  }

  /**
   * Get component from the currently selected traits.
   * @example
   * tm.getComponent();
   * // Component {}
   */
  getComponent() {
    return this.state.attributes.component;
  }

  /**
   * Add new trait type.
   * More about it here: [Define new Trait type](https://grapesjs.com/docs/modules/Traits.html#define-new-trait-type).
   * @param {string} name Type name.
   * @param {Object} methods Object representing the trait.
   */
  addType<T>(name: string, methods: CustomTrait<T>) {
    const baseView = this.getType('text');
    //@ts-ignore
    this.types[name] = baseView.extend(methods);
  }

  /**
   * Get trait type
   * @param {string} name Type name
   * @returns {Object}
   * @private
   * const traitView = tm.getType('text');
   */
  getType(name: string) {
    return this.getTypes()[name];
  }

  /**
   * Get all trait types
   * @returns {Object}
   * @private
   */
  getTypes() {
    return this.types;
  }

  /**
   *
   * Get Traits viewer
   * @private
   */
  getTraitsViewer() {
    return this.view;
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
      this.getTypes(),
    );
    this.view = view;
    return view.el;
  }

  postRender() {
    this.__appendTo();
  }

  __onSelect() {
    const { em, events, state } = this;
    const { component, traits } = state.attributes;
    em.trigger(events.select, { component, traits });
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
    this.select(this.getComponent());
  }
}
