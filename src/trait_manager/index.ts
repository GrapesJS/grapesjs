import { debounce } from 'underscore';
import { Model } from '../common';
import defaults from './config/config';
import TraitsView from './view/TraitsView';
import TraitView from './view/TraitView';
import TraitSelectView from './view/TraitSelectView';
import TraitCheckboxView from './view/TraitCheckboxView';
import TraitNumberView from './view/TraitNumberView';
import TraitColorView from './view/TraitColorView';
import TraitButtonView from './view/TraitButtonView';
import Module from '../abstract/Module';
import Component from '../dom_components/model/Component';
import EditorModel from '../editor/model/Editor';

export const evAll = 'trait';
export const evPfx = `${evAll}:`;
export const evCustom = `${evPfx}custom`;
const typesDef: { [id: string]: { new (o: any): TraitView } } = {
  text: TraitView,
  number: TraitNumberView,
  select: TraitSelectView,
  checkbox: TraitCheckboxView,
  color: TraitColorView,
  button: TraitButtonView,
};

export default class TraitsModule extends Module<typeof defaults> {
  TraitsView = TraitsView;

  //@ts-ignore
  get events() {
    return {
      all: evAll,
      custom: evCustom,
    };
  }

  view?: TraitsView;
  types: { [id: string]: { new (o: any): TraitView } };
  model: Model;
  __ctn?: any;

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'TraitManager');
    const model = new Model();
    this.model = model;
    this.types = typesDef;

    const upAll = debounce(() => this.__upSel(), 0);
    model.listenTo(em, 'component:toggled', upAll);

    const update = debounce(() => this.__onUp(), 0);
    model.listenTo(em, 'trait:update', update);

    return this;
  }

  private __upSel() {
    this.select(this.em.getSelected());
  }

  private __onUp() {
    this.select(this.getSelected());
  }

  select(component?: Component) {
    const traits = component ? component.getTraits() : [];
    this.model.set({ component, traits });
    this.__trgCustom();
  }

  getSelected() {
    return this.model.get('component') || null;
  }

  getCurrent() {
    return this.model.get('traits') || [];
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
  addType(name: string, trait: any) {
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
    let { view } = this;
    const config = this.getConfig();
    const el = view && view.el;
    view = new TraitsView(
      {
        el,
        collection: [],
        editor: this.em,
        config,
      },
      this.getTypes()
    );
    this.view = view;
    return view.el;
  }
}
