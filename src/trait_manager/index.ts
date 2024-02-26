import { debounce } from 'underscore';
import { Model } from '../common';
import { Module } from '../abstract';
import defaults, { TraitManagerConfig } from './config/config';
import EditorModel from '../editor/model/Editor';
import Component from '../dom_components/model/Component';
import Trait from '../common/traits/model/Trait';
import TraitObjectView from '../common/traits/view/TraitObjectView';
import TraitView from '../common/traits/view/TraitView';
import InputFactory from '../common/traits';

export const evAll = 'trait';
export const evPfx = `${evAll}:`;
export const evCustom = `${evPfx}custom`;

export type CustomTrait<T> = T & ThisType<T & TraitView>;

export default class TraitManager extends Module<TraitManagerConfig & { pStylePrefix?: string }> {
  view?: TraitObjectView;
  types: { [id: string]: { new (o: any): TraitView } } = {};
  model: Model;
  __ctn?: any;
  TraitsView = TraitObjectView;

  events = {
    all: evAll,
    custom: evCustom,
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
    super(em, 'TraitManager', defaults);
    const model = new Model();
    this.model = model;

    const upAll = debounce(() => this.__upSel(), 0);
    model.listenTo(em, 'component:toggled', upAll);

    const update = debounce(() => this.__onUp(), 0);
    model.listenTo(em, 'trait:update', update);

    return this;
  }

  __upSel() {
    this.select(this.em.getSelected());
  }

  __onUp() {
    this.select(this.getSelected());
  }

  select(component?: Component) {
    this.model.set({ component });
    this.render();
    this.__trgCustom();
  }

  getSelected(): Component | undefined {
    return this.model.get('component');
  }

  /**
   * Get traits from the currently selected component.
   */
  getCurrent(): Trait[] {
    return this.getSelected()?.traits || [];
  }

  __trgCustom(opts: any = {}) {
    this.__ctn = this.__ctn || opts.container;
    this.em.trigger(this.events.custom, { container: this.__ctn });
  }

  postRender() {
    this.__appendTo();
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

  render() {
    let { view, em } = this;
    const el = view?.el;
    const traits = this.getCurrent(); //.map(trait => InputFactory.buildView(trait, em, trait.opts));

    console.log(traits);
    this.view = new TraitObjectView(em, { el }).render(traits);

    return this.view.el;
  }

  destroy() {
    this.model.stopListening();
    this.model.clear();
  }
}
