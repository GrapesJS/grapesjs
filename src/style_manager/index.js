/**
 * With Style Manager you build categories (called sectors) of CSS properties which could be used to customize the style of components.
 * You can customize the initial state of the module from the editor initialization, by passing the following [Configuration Object](https://github.com/artf/grapesjs/blob/master/src/style_manager/config/config.js)
 * ```js
 * const editor = grapesjs.init({
 *  styleManager: {
 *    // options
 *  }
 * })
 * ```
 *
 * Once the editor is instantiated you can use its API and listen to its events. Before using these methods, you should get the module from the instance.
 *
 * ```js
 * // Listen to events
 * editor.on('style:sector:add', (sector) => { ... });
 *
 * // Use the API
 * const styleManager = editor.StyleManager;
 * styleManager.addSector(...);
 * ```
 * ## Available Events
 * * `style:sector:add` - Sector added. The [Sector] is passed as an argument to the callback.
 * * `style:target` - Target selection changed. The target (or `null` in case the target is deselected) is passed as an argument to the callback.
 * * `styleManager:update:target` - The target (Component or CSSRule) is changed
 * * `styleManager:change` - Triggered on style property change from new selected component, the view of the property is passed as an argument to the callback
 * * `styleManager:change:{propertyName}` - As above but for a specific style property
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
 * * [getLastSelected](#getlastselected)
 * * [getSelectedParents](#getselectedparents)
 * * [addStyleTargets](#addstyletargets)
 * * [getBuiltIn](#getbuiltin)
 * * [getBuiltInAll](#getbuiltinall)
 * * [addBuiltIn](#addbuiltin)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 * * [createType](#createtype)
 *
 * [Sector]: sector.html
 * [CssRule]: css_rule.html
 * [Component]: component.html
 * [Property]: property.html
 *
 * @module StyleManager
 */

import { isElement, isUndefined, isArray, isString, debounce } from 'underscore';
import Module from 'common/module';
import { Model } from 'common';
import defaults from './config/config';
import Sector from './model/Sector';
import Sectors from './model/Sectors';
import Properties from './model/Properties';
import PropertyFactory from './model/PropertyFactory';
import SectorsView from './view/SectorsView';

export const evAll = 'style';
export const evPfx = `${evAll}:`;
export const evPropUp = `${evPfx}property:update`;
export const evLayerSelect = `${evPfx}layer:select`;
export const evTarget = `${evPfx}target`;
export const evCustom = `${evPfx}custom`;

const propDef = value => value || value === 0;

export default () => {
  let properties;
  var sectors, SectView;

  return {
    ...Module,

    Sector,

    events: {
      all: evAll,
      propertyUpdate: evPropUp,
      layerSelect: evLayerSelect,
      target: evTarget,
      custom: evCustom,
    },

    name: 'StyleManager',

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
    init(config = {}) {
      this.__initConfig(defaults, config);
      const c = this.config;
      const { em } = c;
      const ppfx = c.pStylePrefix;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;
      this.builtIn = new PropertyFactory();
      properties = new Properties();
      sectors = new Sectors([], c);
      const model = new Model({ targets: [] });
      this.model = model;

      // Triggers for the selection refresh and properties
      const ev = 'component:toggled component:update:classes change:state change:device frame:resized selector:type';
      const upAll = debounce(() => this.__upSel());
      model.listenTo(em, ev, upAll);

      // Triggers only for properties (avoid selection refresh)
      const upProps = debounce(() => {
        this.__upProps();
        this.__trgCustom();
      });
      model.listenTo(em, 'styleable:change', upProps);

      // Triggers only custom event
      const trgCustom = debounce(() => this.__trgCustom());
      model.listenTo(em, evLayerSelect, trgCustom);

      // Other listeners
      model.on('change:lastTarget', () => em.trigger(evTarget, this.getLastSelected()));

      return this;
    },

    __upSel() {
      this.select(this.em.getSelectedAll());
      this.__trgCustom();
    },

    __trgCustom() {
      this.em.trigger(this.events.custom);
    },

    __trgEv(event, ...data) {
      this.em.trigger(event, ...data);
    },

    onLoad() {
      // Use silent as sectors' view will be created and rendered on StyleManager.render
      sectors.add(this.config.sectors, { silent: true });
    },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        if (!el) return this.__logWarn('"appendTo" element not found');
        el.appendChild(this.render());
      }
    },

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
    addSector(id, sector, options = {}) {
      let result = this.getSector(id);

      if (!result) {
        sector.id = id;
        result = sectors.add(sector, options);
      }

      return result;
    },

    /**
     * Get sector by id.
     * @param {String} id  Sector id
     * @returns {[Sector]|null}
     * @example
     * const sector = styleManager.getSector('mySector');
     * */
    getSector(id, opts = {}) {
      const res = sectors.where({ id })[0];
      !res && opts.warn && this._logNoSector(id);
      return res || null;
    },

    /**
     * Get all sectors.
     * @returns {Collection<[Sector]>} Collection of sectors
     * @example
     * const sectors = styleManager.getSectors();
     * */
    getSectors(opts = {}) {
      return sectors && sectors.models ? (opts.array ? [...sectors.models] : sectors) : [];
    },

    /**
     * Remove sector by id.
     * @param  {String} id Sector id
     * @returns {[Sector]} Removed sector
     * @example
     * const removed = styleManager.removeSector('mySector');
     */
    removeSector(id) {
      return this.getSectors().remove(this.getSector(id, { warn: 1 }));
    },

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
    addProperty(sectorId, property, opts = {}) {
      const sector = this.getSector(sectorId, { warn: 1 });
      let prop = null;
      if (sector) prop = sector.get('properties').add(property, opts);

      return prop;
    },

    /**
     * Get the property.
     * @param {String} sectorId Sector id.
     * @param {String} id Property id.
     * @returns {[Property]|null}
     * @example
     * const property = styleManager.getProperty('mySector', 'min-height');
     */
    getProperty(sectorId, id) {
      const sector = this.getSector(sectorId, { warn: 1 });
      let prop;

      if (sector) {
        prop = sector.get('properties').filter(prop => prop.get('property') === id || prop.get('id') === id)[0];
      }

      return prop || null;
    },

    /**
     * Get all properties of the sector.
     * @param {String} sectorId Sector id.
     * @returns {Collection<[Property]>|null} Collection of properties
     * @example
     * const properties = styleManager.getProperties('mySector');
     */
    getProperties(sectorId) {
      let props = null;
      const sector = this.getSector(sectorId, { warn: 1 });
      if (sector) props = sector.get('properties');

      return props;
    },

    /**
     * Remove the property.
     * @param {String} sectorId Sector id.
     * @param {String} id Property id.
     * @returns {[Property]|null} Removed property
     * @example
     * const property = styleManager.removeProperty('mySector', 'min-height');
     */
    removeProperty(sectorId, id) {
      const props = this.getProperties(sectorId);
      return props ? props.remove(this.getProperty(sectorId, id)) : null;
    },

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
    select(target, opts = {}) {
      const { em } = this;
      const trgs = isArray(target) ? target : [target];
      const { stylable } = opts;
      const cssc = em.get('CssComposer');
      let targets = [];

      trgs.filter(Boolean).forEach(target => {
        let model = target;

        if (isString(target)) {
          const rule = cssc.getRule(target) || cssc.setRule(target);
          !isUndefined(stylable) && rule.set({ stylable });
          model = rule;
        }

        targets.push(model);
      });

      targets = targets.map(t => this.getModelToStyle(t));
      const lastTarget = targets.slice().reverse()[0];
      const lastTargetParents = this.getParentRules(lastTarget, em.getState());
      this.model.set({ targets, lastTarget, lastTargetParents });
      this.__upProps(opts);

      return targets;
    },

    /**
     * Get the array of selected targets.
     * @returns {Array<[Component]|[CSSRule]>}
     */
    getSelected() {
      return this.model.get('targets');
    },

    /**
     * Get the last selected target.
     * By default, the Style Manager shows styles of the last selected target.
     * @returns {[Component]|[CSSRule]|null}
     */
    getLastSelected() {
      return this.model.get('lastTarget') || null;
    },

    /**
     * Get parent rules of the last selected target.
     * @returns {Array<[CSSRule]>}
     */
    getSelectedParents() {
      return this.model.get('lastTargetParents') || [];
    },

    /**
     * Update selected targets with a custom style.
     * @param {Object} style Style object
     * @param {Object} [opts={}] Options
     * @example
     * styleManager.addStyleTargets({ color: 'red' });
     */
    addStyleTargets(style, opts) {
      this.getSelected().map(t => t.addStyle(style, opts));
    },

    /**
     * Return built-in property definition
     * @param {String} prop Property name.
     * @returns {Object|null} Property definition.
     * @example
     * const widthPropDefinition = styleManager.getBuiltIn('width');
     */
    getBuiltIn(prop) {
      return this.builtIn.get(prop);
    },

    /**
     * Get all the available built-in property definitions.
     * @returns {Object}
     */
    getBuiltInAll() {
      return this.builtIn.props;
    },

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
    addBuiltIn(prop, definition) {
      return this.builtIn.add(prop, definition);
    },

    /**
     * Get what to style inside Style Manager. If you select the component
     * without classes the entity is the Component itself and all changes will
     * go inside its 'style' property. Otherwise, if the selected component has
     * one or more classes, the function will return the corresponding CSS Rule
     * @param  {Model} model
     * @return {Model}
     * @private
     */
    getModelToStyle(model, options = {}) {
      const { em } = this;
      const { skipAdd } = options;

      if (em && model?.toHTML) {
        const config = em.getConfig();
        const um = em.get('UndoManager');
        const cssC = em.get('CssComposer');
        const sm = em.get('SelectorManager');
        const smConf = sm ? sm.getConfig() : {};
        const state = !config.devicePreviewMode ? em.get('state') : '';
        const classes = model.get('classes');
        const valid = classes.getStyleable();
        const hasClasses = valid.length;
        const useClasses = !smConf.componentFirst || options.useClasses;
        const addOpts = { noCount: 1 };
        const opts = { state, addOpts };
        let rule;

        // I stop undo manager here as after adding the CSSRule (generally after
        // selecting the component) and calling undo() it will remove the rule from
        // the collection, therefore updating it in style manager will not affect it
        // #268
        um.stop();

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
          if (model.is('wrapper')) rule.set('wrapper', 1, addOpts);
        }

        rule && (model = rule);
        um.start();
      }

      return model;
    },

    getParentRules(target, state) {
      const { em } = this;
      let result = [];

      if (em && target) {
        const cssC = em.get('CssComposer');
        const cssGen = em.get('CodeManager').getGenerator('css');
        const cmp = target.toHTML ? target : target.getComponent();
        const sel = em.getSelected();
        const optsSel = { combination: true, array: true };
        let cmpRules = [];
        let otherRules = [];
        let rules = [];

        // Componente related rule
        if (cmp) {
          cmpRules = cssC.getRules(`#${cmp.getId()}`);
          otherRules = sel ? cssC.getRules(sel.getSelectors().getFullName(optsSel)) : [];
          rules = otherRules.concat(cmpRules);
        } else {
          cmpRules = sel ? cssC.getRules(`#${sel.getId()}`) : [];
          otherRules = cssC.getRules(target.getSelectors().getFullName(optsSel));
          rules = cmpRules.concat(otherRules);
        }

        const all = rules
          .filter(rule => (!isUndefined(state) ? rule.get('state') === state : 1))
          .sort(cssGen.sortRules)
          .reverse();

        // Slice removes rules not related to the current device
        result = all.slice(all.indexOf(target) + 1);
      }

      return result;
    },

    /**
     * Add new property type
     * @param {string} id Type ID
     * @param {Object} definition Definition of the type. Each definition contains
     *                            `model` (business logic), `view` (presentation logic)
     *                            and `isType` function which recognize the type of the
     *                            passed entity
     *@example
     * styleManager.addType('my-custom-prop', {
     *    create({ props, change }) {
     *      const el = document.createElement('div');
     *      el.innerHTML = '<input type="range" class="my-input" min="10" max="50"/>';
     *      const inputEl = el.querySelector('.my-input');
     *      inputEl.addEventListener('change', event => change({ event })); // change will trigger the emit
     *      inputEl.addEventListener('input', event => change({ event, complete: false }));
     *      return el;
     *    },
     *    emit({ props, updateStyle }, { event, complete }) {
     *      const { value } = event.target;
     *      const valueRes = value + 'px';
     *      // Pass a string value for the exact CSS property or an object containing multiple properties
     *      // eg. updateStyle({ [props.property]: valueRes, color: 'red' });
     *      updateStyle(valueRes, { complete });
     *    },
     *    update({ value, el }) {
     *      el.querySelector('.my-input').value = parseInt(value, 10);
     *    },
     *    destroy() {
     *      // In order to prevent memory leaks, use this method to clean, eventually, created instances, global event listeners, etc.
     *    }
     *})
     */
    addType(id, definition) {
      properties.addType(id, definition);
    },

    /**
     * Get type
     * @param {string} id Type ID
     * @return {Object} Type definition
     */
    getType(id) {
      return properties.getType(id);
    },

    /**
     * Get all types
     * @return {Array}
     */
    getTypes() {
      return properties.getTypes();
    },

    /**
     * Create new property from type
     * @param {string} id Type ID
     * @param  {Object} [options={}] Options
     * @param  {Object} [options.model={}] Custom model object
     * @param  {Object} [options.view={}] Custom view object
     * @return {PropertyView}
     * @example
     * const propView = styleManager.createType('integer', {
     *  model: {units: ['px', 'rem']}
     * });
     * propView.render();
     * propView.model.on('change:value', ...);
     * someContainer.appendChild(propView.el);
     */
    createType(id, { model = {}, view = {} } = {}) {
      const { config } = this;
      const type = this.getType(id);

      if (type) {
        return new type.view({
          model: new type.model(model),
          config,
          ...view,
        });
      }
    },

    setTarget(target, opts) {
      return SectView?.setTarget(target, opts);
    },

    getTargets() {
      const { propTarget } = SectView || {};
      return (propTarget && propTarget.targets) || [];
    },

    getEmitter() {
      return SectView.propTarget;
    },

    /**
     * Render sectors and properties
     * @return  {HTMLElement}
     * @private
     * */
    render() {
      const { config, em } = this;
      const el = SectView && SectView.el;
      SectView = new SectorsView({
        el,
        collection: sectors,
        target: em,
        em,
        config,
        module: this,
      });
      return SectView.render().el;
    },

    _logNoSector(sectorId) {
      const { em } = this;
      em && em.logWarning(`'${sectorId}' sector not found`);
    },

    __upProps(opts) {
      const lastTarget = this.getLastSelected();
      // if (!lastTarget || !this.getConfig().custom) return;
      if (!lastTarget) return;

      const lastTargetParents = this.getSelectedParents();
      const style = lastTarget.getStyle();
      const parentStyles = lastTargetParents.map(p => ({
        target: p,
        style: p.getStyle(),
      }));

      sectors.map(sector => {
        sector.getProperties().map(prop => {
          this.__upProp(prop, style, parentStyles, opts);
        });
      });
    },

    __upProp(prop, style, parentStyles, opts) {
      const name = prop.getName();
      const value = style[name];
      const hasVal = propDef(value);
      const isStack = prop.getType() === 'stack';
      const isComposite = prop.getType() === 'composite';
      const opt = { ...opts, __up: true };
      const canUpdate = !isComposite;
      let newLayers = isStack ? prop.__getLayersFromStyle(style) : [];
      let newProps = isComposite ? prop.__getPropsFromStyle(style) : {};
      let newValue = hasVal ? value : null;
      let parentTarget = null;

      if ((isStack && newLayers === null) || (isComposite && newProps === null)) {
        const method = isStack ? '__getLayersFromStyle' : '__getPropsFromStyle';
        const parentItem = parentStyles.filter(p => prop[method](p.style) !== null)[0];

        if (parentItem) {
          newValue = parentItem.style[name];
          parentTarget = parentItem.target;
          const val = prop[method](parentItem.style);
          if (isStack) {
            newLayers = val;
          } else {
            newProps = val;
          }
        }
      } else if (!hasVal) {
        newValue = null;
        const parentItem = parentStyles.filter(p => propDef(p.style[name]))[0];

        if (parentItem) {
          newValue = parentItem.style[name];
          parentTarget = parentItem.target;
        }
      }

      prop.__setParentTarget(parentTarget);
      canUpdate && prop.__getFullValue() !== newValue && prop.upValue(newValue, opt);
      isStack && prop.__setLayers(newLayers || []);
      if (isComposite) {
        const props = prop.getProperties();

        // Detached has to be treathed as separate properties
        if (prop.isDetached()) {
          const newStyle = prop.__getPropsFromStyle(style, { byName: true }) || {};
          const newParentStyles = parentStyles.map(p => ({
            ...p,
            style: prop.__getPropsFromStyle(p.style, { byName: true }) || {},
          }));
          props.map(pr => this.__upProp(pr, newStyle, newParentStyles, opts));
        } else {
          prop.__setProperties(newProps || {}, opt);
          prop.getProperties().map(pr => pr.__setParentTarget(parentTarget));
        }
      }
    },

    destroy() {
      [properties, sectors].forEach(coll => {
        coll.reset();
        coll.stopListening();
      });
      SectView && SectView.remove();
      [properties, sectors, SectView].forEach(i => (i = {}));
      this.em = {};
      this.config = {};
    },
  };
};
