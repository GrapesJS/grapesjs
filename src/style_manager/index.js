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
 * Once the editor is instantiated you can use its API. Before using these methods you should get the module from the instance
 *
 * ```js
 * const styleManager = editor.StyleManager;
 * ```
 *
 * * [getConfig](#getconfig)
 * * [addSector](#addsector)
 * * [getSector](#getsector)
 * * [removeSector](#removesector)
 * * [getSectors](#getsectors)
 * * [addProperty](#addproperty)
 * * [getProperty](#getproperty)
 * * [removeProperty](#removeproperty)
 * * [getProperties](#getproperties)
 * * [getModelToStyle](#getmodeltostyle)
 * * [addType](#addtype)
 * * [getType](#gettype)
 * * [getTypes](#gettypes)
 * * [createType](#createtype)
 *
 * @module StyleManager
 */

import { isElement } from 'underscore';
import defaults from './config/config';
import Sectors from './model/Sectors';
import Properties from './model/Properties';
import PropertyFactory from './model/PropertyFactory';
import SectorsView from './view/SectorsView';

export default () => {
  var c = {};
  let properties;
  var sectors, SectView;

  return {
    PropertyFactory: PropertyFactory(),

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'StyleManager',

    /**
     * Get configuration object
     * @return {Object}
     */
    getConfig() {
      return c;
    },

    /**
     * Initialize module. Automatically called with a new instance of the editor
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = { ...defaults, ...config };
      const ppfx = c.pStylePrefix;
      this.em = c.em;
      if (ppfx) c.stylePrefix = ppfx + c.stylePrefix;
      properties = new Properties();
      sectors = new Sectors([], c);
      SectView = new SectorsView({
        collection: sectors,
        target: c.em,
        config: c
      });

      return this;
    },

    onLoad() {
      // Use silent as sectors' view will be created and rendered on StyleManager.render
      sectors.add(c.sectors, { silent: true });
    },

    postRender() {
      const elTo = this.getConfig().appendTo;

      if (elTo) {
        const el = isElement(elTo) ? elTo : document.querySelector(elTo);
        el.appendChild(this.render());
      }
    },

    /**
     * Add new sector to the collection. If the sector with the same id already exists,
     * that one will be returned
     * @param {string} id Sector id
     * @param  {Object} sector  Object representing sector
     * @param  {string} [sector.name='']  Sector's label
     * @param  {Boolean} [sector.open=true] Indicates if the sector should be opened
     * @param  {Array<Object>} [sector.properties=[]] Array of properties
     * @param  {Object} [options={}] Options
     * @return {Sector} Added Sector
     * @example
     * var sector = styleManager.addSector('mySector',{
     *   name: 'My sector',
     *   open: true,
     *   properties: [{ name: 'My property'}]
     * }, { at: 0 });
     * // With `at: 0` we place the new sector at the beginning of the collection
     * */
    addSector(id, sector, opts = {}) {
      let result = this.getSector(id);

      if (!result) {
        sector.id = id;
        result = sectors.add(sector, opts);
      }

      return result;
    },

    /**
     * Get sector by id
     * @param {string} id  Sector id
     * @return {Sector|null}
     * @example
     * var sector = styleManager.getSector('mySector');
     * */
    getSector(id, opts = {}) {
      const res = sectors.where({ id })[0];
      !res && opts.warn && this._logNoSector(id);
      return res;
    },

    /**
     * Remove a sector by id
     * @param  {string} id Sector id
     * @return {Sector} Removed sector
     * @example
     * const removed = styleManager.removeSector('mySector');
     */
    removeSector(id) {
      return this.getSectors().remove(this.getSector(id, { warn: 1 }));
    },

    /**
     * Get all sectors
     * @return {Sectors} Collection of sectors
     * */
    getSectors() {
      return sectors;
    },

    /**
     * Add property to the sector identified by id
     * @param {string} sectorId Sector id
     * @param {Object} property Property object
     * @param {string} [property.name=''] Name of the property
     * @param {string} [property.property=''] CSS property, eg. `min-height`
     * @param {string} [property.type=''] Type of the property: integer | radio | select | color | file | composite | stack
     * @param {Array<string>} [property.units=[]] Unit of measure available, eg. ['px','%','em']. Only for integer type
     * @param {string} [property.unit=''] Default selected unit from `units`. Only for integer type
     * @param {number} [property.min=null] Min possible value. Only for integer type
     * @param {number} [property.max=null] Max possible value. Only for integer type
     * @param {string} [property.defaults=''] Default value
     * @param {string} [property.info=''] Some description
     * @param {string} [property.icon=''] Class name. If exists no text will be displayed
     * @param {Boolean} [property.preview=false] Show layers preview. Only for stack type
     * @param {string} [property.functionName=''] Indicates if value need to be wrapped in some function, for istance `transform: rotate(90deg)`
     * @param {Array<Object>} [property.properties=[]] Nested properties for composite and stack type
     * @param {Array<Object>} [property.layers=[]] Layers for stack properties
     * @param {Array<Object>} [property.list=[]] List of possible options for radio and select types
     * @param  {Object} [options={}] Options
     * @return {Property|null} Added Property or `null` in case sector doesn't exist
     * @example
     * var property = styleManager.addProperty('mySector',{
     *   name: 'Minimum height',
     *   property: 'min-height',
     *   type: 'select',
     *   defaults: '100px',
     *   list: [{
     *     value: '100px',
     *     name: '100',
     *    },{
     *      value: '200px',
     *      name: '200',
     *    }],
     * }, { at: 0 });
     * // With `at: 0` we place the new property at the beginning of the collection
     */
    addProperty(sectorId, property, opts = {}) {
      const sector = this.getSector(sectorId, { warn: 1 });
      let prop = null;
      if (sector) prop = sector.get('properties').add(property, opts);

      return prop;
    },

    /**
     * Get property by its CSS name and sector id
     * @param  {string} sectorId Sector id
     * @param  {string} name CSS property name (or id), eg. 'min-height'
     * @return {Property|null}
     * @example
     * var property = styleManager.getProperty('mySector','min-height');
     */
    getProperty(sectorId, name) {
      const sector = this.getSector(sectorId, { warn: 1 });
      let prop;

      if (sector) {
        prop = sector
          .get('properties')
          .filter(
            prop => prop.get('property') === name || prop.get('id') === name
          )[0];
      }

      return prop || null;
    },

    /**
     * Remove a property from the sector
     * @param  {string} sectorId Sector id
     * @param  {string} name CSS property name, eg. 'min-height'
     * @return {Property} Removed property
     * @example
     * const property = styleManager.removeProperty('mySector', 'min-height');
     */
    removeProperty(sectorId, name) {
      const props = this.getProperties(sectorId);
      return props && props.remove(this.getProperty(sectorId, name));
    },

    /**
     * Get properties of the sector
     * @param  {string} sectorId Sector id
     * @return {Properties} Collection of properties
     * @example
     * var properties = styleManager.getProperties('mySector');
     */
    getProperties(sectorId) {
      let props = null;
      const sector = this.getSector(sectorId, { warn: 1 });
      if (sector) props = sector.get('properties');

      return props;
    },

    /**
     * Get what to style inside Style Manager. If you select the component
     * without classes the entity is the Component itself and all changes will
     * go inside its 'style' property. Otherwise, if the selected component has
     * one or more classes, the function will return the corresponding CSS Rule
     * @param  {Model} model
     * @return {Model}
     */
    getModelToStyle(model, options = {}) {
      const em = c.em;
      const { skipAdd } = options;
      const classes = model.get('classes');
      const id = model.getId();

      if (em) {
        const config = em.getConfig();
        const um = em.get('UndoManager');
        const cssC = em.get('CssComposer');
        const sm = em.get('SelectorManager');
        const smConf = sm ? sm.getConfig() : {};
        const state = !config.devicePreviewMode ? em.get('state') : '';
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
      const { em } = c;
      let result = [];

      if (em) {
        const cssC = em.get('CssComposer');
        const cssGen = em.get('CodeManager').getGenerator('css');
        const all = cssC
          .getRules(target.getSelectors().getFullString())
          .filter(rule => (state ? rule.get('state') === state : 1))
          .sort(cssGen.sortRules)
          .reverse();
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
      const type = this.getType(id);

      if (type) {
        return new type.view({
          model: new type.model(model),
          config: c,
          ...view
        });
      }
    },

    /**
     * Select different target for the Style Manager.
     * It could be a Component, CSSRule, or a string of any CSS selector
     * @param {Component|CSSRule|String} target
     * @return {Styleable} A Component or CSSRule
     */
    setTarget(target, opts) {
      return SectView.setTarget(target, opts);
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
      return SectView.render().el;
    },

    _logNoSector(sectorId) {
      const { em } = this;
      em && em.logWarning(`'${sectorId}' sector not found`);
    },

    destroy() {
      [properties, sectors].forEach(coll => {
        coll.reset();
        coll.stopListening();
      });
      SectView.remove();
      [c, properties, sectors, SectView].forEach(i => (i = {}));
      this.em = {};
    }
  };
};
