/**
 * With Style Manager you build categories (called sectors) of CSS properties which could be used to customize the style of components.
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/GrapesJS/grapesjs/blob/master/src/style_manager/config/config.ts)
 * ```js
 * const editor = grapesjs.init({
 *  styleManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance.
 *
 * ```js
 * const styleManager = editor.StyleManager;
 * ```
 *
 * {REPLACE_EVENTS}
 *
 * ## Methods
 * * [getConfig](#getconfig)
 * * [addSector](#addsector)
 * * [getSector](#getsector)
 * * [getSectors](#getsectors)
 * * [removeSector](#removesector)
 * * [addProperty](#addproperty)
 * * [getProperty](#getproperty)
 * * [getProperties](#getproperties)
 * * [removeProperty](#removeproperty)
 * * [select](#select)
 * * [getSelected](#getselected)
 * * [getSelectedAll](#getselectedall)
 * * [getSelectedParents](#getselectedparents)
 * * [addStyleTargets](#addstyletargets)
 * * [getBuiltIn](#getbuiltin)
 * * [getBuiltInAll](#getbuiltinall)
 * * [addBuiltIn](#addbuiltin)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 *
 * [Sector]: sector.html
 * [CssRule]: css_rule.html
 * [Component]: component.html
 * [Property]: property.html
 *
 * @module docsjs.StyleManager
 */

import { bindAll, debounce, isArray, isString, isUndefined } from 'underscore';
import { ItemManagerModule } from '../abstract/Module';
import { AddOptions, Debounced, Model } from '../common';
import CssRule from '../css_composer/model/CssRule';
import Component from '../dom_components/model/Component';
import { ComponentsEvents } from '../dom_components/types';
import StyleableModel, { StyleProps } from '../domain_abstract/model/StyleableModel';
import EditorModel from '../editor/model/Editor';
import { isComponent } from '../utils/mixins';
import defConfig, { StyleManagerConfig } from './config/config';
import Properties from './model/Properties';
import Property, { PropertyProps } from './model/Property';
import PropertyComposite from './model/PropertyComposite';
import PropertyFactory from './model/PropertyFactory';
import PropertyStack from './model/PropertyStack';
import Sector, { SectorProperties } from './model/Sector';
import Sectors from './model/Sectors';
import { PropertyTypes, StyleManagerEvents, StyleTarget } from './types';
import { CustomPropertyView } from './view/PropertyView';
import SectorsView from './view/SectorsView';

export type { PropertyTypes, StyleModuleParam, StyleTarget } from './types';

export type StyleManagerEvent = `${StyleManagerEvents}`;

const propDef = (value: any) => value || value === 0;

export default class StyleManager extends ItemManagerModule<
  StyleManagerConfig,
  /** @ts-ignore */
  Sectors
> {
  builtIn: PropertyFactory;
  upAll: Debounced;
  properties: typeof Properties;
  events = StyleManagerEvents;
  sectors: Sectors;
  SectView!: SectorsView;
  Sector = Sector;
  storageKey = '';
  __ctn?: HTMLElement;

  /**
   * Get configuration object
   * @name getConfig
   * @function
   * @return {Object}
   */

  /**
   * Initialize module. Automatically called with a new instance of the editor
   * @param {Object} config Configurations
   * @private
   */
  constructor(em: EditorModel) {
    super(em, 'StyleManager', new Sectors([], { em }), StyleManagerEvents, defConfig());
    bindAll(this, '__clearStateTarget');
    const { events } = this;
    const c = this.config;
    const ppfx = c.pStylePrefix;
    if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;
    this.builtIn = new PropertyFactory();
    this.properties = new Properties([], { em, module: this });
    this.sectors = this.all; // TODO check if (module: this) is required
    const model = new Model({ targets: [] });
    this.model = model;

    // Triggers for the selection refresh and properties
    const eventCmpUpdate = ComponentsEvents.update;
    const ev = `component:toggled ${eventCmpUpdate}:classes change:state change:device frame:resized selector:type`;
    this.upAll = debounce(() => this.__upSel(), 0);
    model.listenTo(em, ev, this.upAll as any);
    // Clear state target on any component selection change, without debounce (#4208)
    model.listenTo(em, 'component:toggled', this.__clearStateTarget);

    // Triggers only for properties (avoid selection refresh)
    const upProps = debounce(() => {
      this.__upProps();
      this.__trgCustom();
    }, 0);
    model.listenTo(em, 'styleable:change undo redo', upProps);

    // Triggers only custom event
    const trgCustom = debounce(() => this.__trgCustom(), 0);
    model.listenTo(em, `${events.layerSelect} ${events.target}`, trgCustom);

    // Other listeners
    model.on('change:lastTarget', () => em.trigger(events.target, this.getSelected()));
  }

  __upSel() {
    this.select(this.em.getSelectedAll() as any);
  }

  __trgCustom(opts: { container?: HTMLElement } = {}) {
    this.__ctn = this.__ctn || opts.container;
    this.em.trigger(this.events.custom, { container: this.__ctn });
  }

  __trgEv(event: string, ...data: any[]) {
    this.em.trigger(event, ...data);
  }

  __clearStateTarget() {
    const { em } = this;
    const stateTarget = this.__getStateTarget();
    stateTarget &&
      em?.skip(() => {
        em.Css.remove(stateTarget);
        this.model.set({ stateTarget: null });
      });
  }

  onLoad() {
    // Use silent as sectors' view will be created and rendered on StyleManager.render
    this.sectors.add(this.config.sectors!, { silent: true });
  }

  postRender() {
    this.__appendTo();
  }

  /**
   * Add new sector. If the sector with the same id already exists, that one will be returned.
   * @param {String} id Sector id
   * @param {Object} sector Sector definition. Check the [available properties](sector.html#properties)
   * @param {Object} [options={}] Options
   * @param {Number} [options.at] Position index (by default, will be appended at the end).
   * @returns {[Sector]} Added Sector
   * @example
   * const sector = styleManager.addSector('mySector',{
   *   name: 'My sector',
   *   open: true,
   *   properties: [{ name: 'My property'}]
   * }, { at: 0 });
   * // With `at: 0` we place the new sector at the beginning of the list
   * */
  addSector(id: string, sector: SectorProperties, options: AddOptions = {}) {
    let result = this.getSector(id);

    if (!result) {
      sector.id = id;
      result = this.sectors.add(sector, options);
    }

    return result;
  }

  /**
   * Get sector by id.
   * @param {String} id  Sector id
   * @returns {[Sector]|null}
   * @example
   * const sector = styleManager.getSector('mySector');
   * */
  getSector(id: string, opts: { warn?: boolean } = {}) {
    const res = this.sectors.where({ id })[0];
    !res && opts.warn && this._logNoSector(id);
    return res || null;
  }

  /**
   * Get all sectors.
   * @param {Object} [opts={}] Options
   * @param {Boolean} [opts.visible] Returns only visible sectors
   * @returns {Array<[Sector]>}
   * @example
   * const sectors = styleManager.getSectors();
   * */
  getSectors<T extends { array?: boolean; visible?: boolean }>(opts: T = {} as T) {
    const { sectors } = this;
    const res = sectors && sectors.models ? (opts.array ? [...sectors.models] : sectors) : [];
    return (opts.visible ? res.filter((s) => s.isVisible()) : res) as T['array'] extends true
      ? Sector[]
      : T['visible'] extends true
        ? Sector[]
        : Sectors;
  }

  /**
   * Remove sector by id.
   * @param  {String} id Sector id
   * @returns {[Sector]} Removed sector
   * @example
   * const removed = styleManager.removeSector('mySector');
   */
  removeSector(id: string) {
    return this.getSectors().remove(this.getSector(id, { warn: true }));
  }

  /**
   * Add new property to the sector.
   * @param {String} sectorId Sector id.
   * @param {Object} property Property definition. Check the [base available properties](property.html#properties) + others based on the `type` of your property.
   * @param {Object} [opts={}] Options
   * @param {Number} [opts.at] Position index (by default, will be appended at the end).
   * @returns {[Property]|null} Added property or `null` in case the sector doesn't exist.
   * @example
   * const property = styleManager.addProperty('mySector', {
   *   label: 'Minimum height',
   *   property: 'min-height',
   *   type: 'select',
   *   default: '100px',
   *   options: [
   *    { id: '100px', label: '100' },
   *    { id: '200px', label: '200' },
   *   ],
   * }, { at: 0 });
   */
  addProperty(sectorId: string, property: PropertyTypes, opts: AddOptions = {}): Property | undefined {
    const sector = this.getSector(sectorId, { warn: true });
    let prop;
    if (sector) prop = sector.addProperty(property, opts);

    return prop;
  }

  /**
   * Get the property.
   * @param {String} sectorId Sector id.
   * @param {String} id Property id.
   * @returns {[Property]|undefined}
   * @example
   * const property = styleManager.getProperty('mySector', 'min-height');
   */
  getProperty(sectorId: string, id: string): Property | undefined {
    const sector = this.getSector(sectorId, { warn: true });
    let prop;

    if (sector) {
      prop = sector.properties.filter((prop) => prop.get('property') === id || prop.get('id') === id)[0];
    }

    return prop;
  }

  /**
   * Get all properties of the sector.
   * @param {String} sectorId Sector id.
   * @returns {Collection<[Property]>|undefined} Collection of properties
   * @example
   * const properties = styleManager.getProperties('mySector');
   */
  getProperties(sectorId: string) {
    let props;
    const sector = this.getSector(sectorId, { warn: true });
    if (sector) props = sector.properties;

    return props;
  }

  /**
   * Remove the property.
   * @param {String} sectorId Sector id.
   * @param {String} id Property id.
   * @returns {[Property]|null} Removed property
   * @example
   * const property = styleManager.removeProperty('mySector', 'min-height');
   */
  removeProperty(sectorId: string, id: string) {
    const props = this.getProperties(sectorId);
    return props ? props.remove(this.getProperty(sectorId, id)!) : null;
  }

  /**
   * Select new target.
   * The target could be a Component, CSSRule, or a CSS selector string.
   * @param {[Component]|[CSSRule]|String} target
   * @returns {Array<[Component]|[CSSRule]>} Array containing selected Components or CSSRules
   * @example
   * // Select the first button in the current page
   * const wrapperCmp = editor.Pages.getSelected().getMainComponent();
   * const btnCmp = wrapperCmp.find('button')[0];
   * btnCmp && styleManager.select(btnCmp);
   *
   * // Set as a target the CSS selector
   * styleManager.select('.btn > span');
   */
  select(
    target: StyleTarget | string | (StyleTarget | string)[],
    opts: { stylable?: boolean; component?: Component } = {},
  ) {
    const { em } = this;
    const trgs = isArray(target) ? target : [target];
    const { stylable } = opts;
    const cssc = em.Css;
    let targets: StyleTarget[] = [];

    trgs.filter(Boolean).forEach((target) => {
      let model = target;

      if (isString(target)) {
        const rule = cssc.getRule(target) || cssc.setRule(target);
        !isUndefined(stylable) && rule.set({ stylable });
        // @ts-ignore
        model = rule;
      }

      targets.push(model as StyleTarget);
    });

    const component = opts.component || targets.filter((t) => isComponent(t)).reverse()[0];
    targets = targets.map((t) => this.getModelToStyle(t));
    const state = em.getState();
    const lastTarget = targets.slice().reverse()[0];
    const lastTargetParents = this.getParentRules(lastTarget, {
      state,
      // @ts-ignore
      component,
    });
    let stateTarget = this.__getStateTarget();

    // Handle the creation and update of the state rule, if enabled.
    em.skip(() => {
      // @ts-ignore
      if (state && lastTarget?.getState?.()) {
        const style = lastTarget.getStyle();
        if (!stateTarget) {
          stateTarget = cssc.getAll().add({
            selectors: 'gjs-selected',
            style,
            shallow: true,
            important: true,
          }) as unknown as CssRule;
        } else {
          stateTarget.setStyle(style);
        }
      } else if (stateTarget) {
        cssc.remove(stateTarget);
        stateTarget = undefined;
      }
    });

    this.model.set({
      targets,
      lastTarget,
      lastTargetParents,
      stateTarget,
      component,
    });
    this.__upProps(opts);

    return targets;
  }

  /**
   * Get the last selected target.
   * By default, the Style Manager shows styles of the last selected target.
   * @returns {[Component]|[CSSRule]|null}
   */
  getSelected(): StyleTarget | undefined {
    return this.model.get('lastTarget');
  }

  /**
   * Get the array of selected targets.
   * @returns {Array<[Component]|[CSSRule]>}
   */
  getSelectedAll() {
    return this.model.get('targets') as StyleTarget[];
  }

  /**
   * Get parent rules of the last selected target.
   * @returns {Array<[CSSRule]>}
   */
  getSelectedParents(): CssRule[] {
    return this.model.get('lastTargetParents') || [];
  }

  __getStateTarget(): CssRule | undefined {
    return this.model.get('stateTarget');
  }

  /**
   * Update selected targets with a custom style.
   * @param {Object} style Style object
   * @param {Object} [opts={}] Options
   * @example
   * styleManager.addStyleTargets({ color: 'red' });
   */
  addStyleTargets(style: StyleProps, opts: any) {
    this.getSelectedAll().map((t) => t.addStyle(style, opts));
    const target = this.getSelected();

    // Trigger style changes on selected components
    target && this.__emitCmpStyleUpdate(style);

    // Update state rule
    const targetState = this.__getStateTarget();
    target && targetState?.setStyle(target.getStyle(), opts);
  }

  /**
   * Return built-in property definition
   * @param {String} prop Property name.
   * @returns {Object|null} Property definition.
   * @example
   * const widthPropDefinition = styleManager.getBuiltIn('width');
   */
  getBuiltIn(prop: string) {
    return this.builtIn.get(prop);
  }

  /**
   * Get all the available built-in property definitions.
   * @returns {Object}
   */
  getBuiltInAll() {
    return this.builtIn.props;
  }

  /**
   * Add built-in property definition.
   * If the property exists already, it will extend it.
   * @param {String} prop Property name.
   * @param {Object} definition Property definition.
   * @returns {Object} Added property definition.
   * @example
   * const sector = styleManager.addBuiltIn('new-property', {
   *  type: 'select',
   *  default: 'value1',
   *  options: [{ id: 'value1', label: 'Some label' }, ...],
   * })
   */
  addBuiltIn(prop: string, definition: PropertyProps) {
    return this.builtIn.add(prop, definition);
  }

  /**
   * Get what to style inside Style Manager. If you select the component
   * without classes the entity is the Component itself and all changes will
   * go inside its 'style' property. Otherwise, if the selected component has
   * one or more classes, the function will return the corresponding CSS Rule
   * @param  {Model} model
   * @return {Model}
   * @private
   */
  getModelToStyle(model: any, options: { skipAdd?: boolean; useClasses?: boolean } = {}): StyleableModel {
    const { em } = this;
    const { skipAdd } = options;

    if (em && model?.toHTML) {
      const config = em.getConfig();
      const um = em.UndoManager;
      const cssC = em.Css;
      const sm = em.Selectors;
      const smConf = sm ? sm.getConfig() : {};
      const state = !config.devicePreviewMode ? em.get('state') : '';
      const classes = model.get('classes');
      const valid = classes.getStyleable();
      const hasClasses = valid.length;
      const useClasses = !smConf.componentFirst || options.useClasses;
      const addOpts = { noCount: 1 };
      const opts = { state, addOpts };

      // Skipping undo manager here as after adding the CSSRule (generally after
      // selecting the component) and calling undo() it will remove the rule from
      // the collection, therefore updating it in style manager will not affect it
      // #268
      um.skip(() => {
        let rule;

        if (hasClasses && useClasses) {
          const deviceW = em.getCurrentMedia();
          rule = cssC.get(valid, state, deviceW);

          if (!rule && !skipAdd) {
            rule = cssC.add(valid, state, deviceW, {}, addOpts);
          }
        } else if (config.avoidInlineStyle) {
          const id = model.getId();
          rule = cssC.getIdRule(id, opts);
          !rule && !skipAdd && (rule = cssC.setIdRule(id, {}, opts));
          if (model.is('wrapper')) {
            // @ts-ignore
            rule!.set('wrapper', 1, addOpts);
          }
        }

        rule && (model = rule);
      });
    }

    return model;
  }

  getParentRules(target: StyleTarget, { state, component }: { state?: string; component?: Component } = {}) {
    const { em } = this;
    let result: CssRule[] = [];

    if (em && target) {
      const sel = component;
      const cssC = em.Css;
      const cssGen = em.CodeManager.getGenerator('css');
      // @ts-ignore
      const cmp = target.toHTML ? target : target.getComponent();
      const optsSel = { array: true } as const;
      let cmpRules: CssRule[] = [];
      let tagNameRules: CssRule[] = [];
      let invisibleAndOtherRules: CssRule[] = [];
      let otherRules: CssRule[] = [];
      let rules: CssRule[] = [];

      const rulesBySelectors = (values: string[]) => {
        return !values.length
          ? []
          : cssC.getRules().filter((rule) => {
              const rSels = rule.getSelectors().map((s) => s.getFullName());

              // rSels is equal to 0 when rule selectors contain tagName like : p {}, .logo path {}, ul li {}
              if (rSels.length === 0) {
                return false;
              }

              return rSels.every((rSel) => values.indexOf(rSel) >= 0);
            });
      };

      const rulesByTagName = (tagName: string) => {
        return !tagName ? [] : cssC.getRules().filter((rule) => rule.selectorsToString() === tagName);
      };

      // Componente related rule
      if (cmp) {
        cmpRules = cssC.getRules(`#${cmp.getId()}`);
        tagNameRules = rulesByTagName(cmp.get('tagName'));
        otherRules = sel ? rulesBySelectors(sel.getSelectors().getFullName(optsSel)) : [];
        rules = otherRules.concat(tagNameRules).concat(cmpRules);
      } else {
        cmpRules = sel ? cssC.getRules(`#${sel.getId()}`) : [];
        tagNameRules = rulesByTagName(sel?.get('tagName') || '');
        // Get rules set on invisible selectors like private one
        const allCmpClasses = sel?.getSelectors().getFullName(optsSel) || [];
        const invisibleSel = allCmpClasses.filter(
          (item: string) =>
            target
              .getSelectors()
              .getFullName(optsSel)
              .findIndex((sel) => sel === item) === -1,
        );
        // Get rules set on active and visible selectors
        invisibleAndOtherRules = rulesBySelectors(invisibleSel.concat(target.getSelectors().getFullName(optsSel)));
        rules = tagNameRules.concat(cmpRules).concat(invisibleAndOtherRules);
      }

      const all = rules
        .filter((rule) => (!isUndefined(state) ? rule.get('state') === state : 1))
        .sort(cssGen.sortRules)
        .reverse();

      // Slice removes rules not related to the current device
      // @ts-ignore
      result = all.slice(all.indexOf(target as CssRule) + 1);
    }

    return result;
  }

  /**
   * Add new property type
   * @param {string} id Type ID
   * @param {Object} definition Definition of the type.
   * @example
   * styleManager.addType('my-custom-prop', {
   *    // Create UI
   *    create({ props, change }) {
   *      const el = document.createElement('div');
   *      el.innerHTML = '<input type="range" class="my-input" min="10" max="50"/>';
   *      const inputEl = el.querySelector('.my-input');
   *      inputEl.addEventListener('change', event => change({ event }));
   *      inputEl.addEventListener('input', event => change({ event, partial: true }));
   *      return el;
   *    },
   *    // Propagate UI changes up to the targets
   *    emit({ props, updateStyle }, { event, partial }) {
   *      const { value } = event.target;
   *      updateStyle(`${value}px`, { partial });
   *    },
   *    // Update UI (eg. when the target is changed)
   *    update({ value, el }) {
   *      el.querySelector('.my-input').value = parseInt(value, 10);
   *    },
   *    // Clean the memory from side effects if necessary (eg. global event listeners, etc.)
   *    destroy() {}
   *})
   */
  addType<T>(id: string, definition: CustomPropertyView<T>) {
    this.properties.addType(id, definition);
  }

  /**
   * Get type
   * @param {string} id Type ID
   * @return {Object} Type definition
   */
  getType(id: string) {
    return this.properties.getType(id);
  }

  /**
   * Get all types
   * @return {Array}
   */
  getTypes() {
    return this.properties.getTypes();
  }

  /**
   * Create new UI property from type (Experimental)
   * @param {string} id Type ID
   * @param  {Object} [options={}] Options
   * @param  {Object} [options.model={}] Custom model object
   * @param  {Object} [options.view={}] Custom view object
   * @return {PropertyView}
   * @private
   * @example
   * const propView = styleManager.createType('number', {
   *  model: {units: ['px', 'rem']}
   * });
   * propView.render();
   * propView.model.on('change:value', ...);
   * someContainer.appendChild(propView.el);
   */
  createType(id: string, { model = {}, view = {} } = {}) {
    const { config } = this;
    const type = this.getType(id);

    if (type) {
      return new type.view({
        model: new type.model(model),
        config,
        ...view,
      });
    }
  }

  /**
   * Render sectors and properties
   * @return  {HTMLElement}
   * @private
   * */
  render() {
    const { config, em, SectView } = this;
    const el = SectView && SectView.el;
    this.SectView = new SectorsView({
      el,
      em,
      config,
      module: this,
      collection: this.sectors,
    });
    return this.SectView.render().el;
  }

  _logNoSector(sectorId: string) {
    const { em } = this;
    em && em.logWarning(`'${sectorId}' sector not found`);
  }

  __emitCmpStyleUpdate(style: StyleProps, opts: { components?: Component | Component[] } = {}) {
    const { em } = this;

    // Ignore partial updates
    if (!style.__p) {
      const allSel = this.getSelectedAll();
      const cmp = opts.components || em.getSelectedAll();
      const cmps = Array.isArray(cmp) ? cmp : [cmp];
      const newStyles = { ...style };
      delete newStyles.__p;

      cmps.forEach(
        (cmp) =>
          // if cmp is part of selected, the event should already been triggered
          !allSel.includes(cmp as any) && cmp.__onStyleChange(newStyles),
      );
    }
  }

  __upProps(opts = {}) {
    const lastTarget = this.getSelected();
    if (!lastTarget) return;

    const { sectors } = this;
    const component = this.model.get('component');
    const lastTargetParents = this.getSelectedParents();
    const style = lastTarget.getStyle();
    const parentStyles = lastTargetParents.map((p) => ({
      target: p,
      style: p.getStyle(),
    }));

    sectors.map((sector) => {
      sector.getProperties().map((prop) => {
        this.__upProp(prop, style, parentStyles, opts);
      });
    });

    // Update sectors/properties visibility
    sectors.forEach((sector) => {
      const props = sector.getProperties();
      props.forEach((prop) => {
        const isVisible = prop.__checkVisibility({
          target: lastTarget,
          sector,
          component,
          sectors: sectors.models,
        });
        prop.set('visible', isVisible);
      });
      const sectorVisible = props.some((p) => p.isVisible());
      sector.set('visible', sectorVisible);
    });
  }

  __upProp(prop: Property, style: StyleProps, parentStyles: any[], opts: any) {
    const name = prop.getName();
    const value = style[name];
    const hasVal = propDef(value);
    const isStack = prop.getType() === 'stack';
    const isComposite = prop.getType() === 'composite';
    const opt = { ...opts, __up: true };
    const canUpdate = !isComposite && !isStack;
    const propStack = prop as PropertyStack;
    const propComp = prop as PropertyComposite;
    let newLayers = isStack ? propStack.__getLayersFromStyle(style) : [];
    let newProps = isComposite ? propComp.__getPropsFromStyle(style) : {};
    let newValue = hasVal ? value : null;
    let parentTarget: any = null;

    if ((isStack && newLayers === null) || (isComposite && newProps === null)) {
      const method = isStack ? '__getLayersFromStyle' : '__getPropsFromStyle';
      const parentItem = parentStyles.filter((p) => propStack[method](p.style) !== null)[0];

      if (parentItem) {
        newValue = parentItem.style[name];
        parentTarget = parentItem.target;
        const val = propStack[method](parentItem.style);
        if (isStack) {
          newLayers = val;
        } else {
          newProps = val;
        }
      }
    } else if (!hasVal) {
      newValue = null;
      const parentItem = parentStyles.filter((p) => propDef(p.style[name]))[0];

      if (parentItem) {
        newValue = parentItem.style[name];
        parentTarget = parentItem.target;
      }
    }

    prop.__setParentTarget(parentTarget);
    canUpdate && prop.__getFullValue() !== newValue && prop.upValue(newValue as string, opt);
    if (isStack) {
      propStack.__setLayers(newLayers || [], {
        isEmptyValue: propStack.isEmptyValueStyle(style),
      });
    }
    if (isComposite) {
      const props = propComp.getProperties();

      // Detached has to be treathed as separate properties
      if (propComp.isDetached()) {
        const newStyle = propComp.__getPropsFromStyle(style, { byName: true }) || {};
        const newParentStyles = parentStyles.map((p) => ({
          ...p,
          style: propComp.__getPropsFromStyle(p.style, { byName: true }) || {},
        }));
        props.map((pr: any) => this.__upProp(pr, newStyle, newParentStyles, opts));
      } else {
        propComp.__setProperties(newProps || {}, opt);
        propComp.getProperties().map((pr) => pr.__setParentTarget(parentTarget));
      }
    }
  }

  destroy() {
    [this.properties, this.sectors].forEach((coll) => {
      coll.reset();
      coll.stopListening();
    });
    this.SectView?.remove();
    this.model.stopListening();
    this.upAll.cancel();
  }
}
