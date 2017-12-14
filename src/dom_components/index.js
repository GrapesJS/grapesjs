/**
 *
 * * [getWrapper](#getwrapper)
 * * [getComponents](#getcomponents)
 * * [addComponent](#addcomponent)
 * * [clear](#clear)
 * * [load](#load)
 * * [store](#store)
 * * [render](#render)
 *
 * With this module is possible to manage components inside the canvas.
 * Before using methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var domComponents = editor.DomComponents;
 * ```
 *
 * @module DomComponents
 * @param {Object} config Configurations
 * @param {string|Array<Object>} [config.components=[]] HTML string or an array of possible components
 * @example
 * ...
 * domComponents: {
 *    components: '<div>Hello world!</div>',
 * }
 * // Or
 * domComponents: {
 *    components: [
 *      { tagName: 'span', style: {color: 'red'}, content: 'Hello'},
 *      { style: {width: '100px', content: 'world!'}}
 *    ],
 * }
 * ...
 */
module.exports = () => {
  var c = {};
  let em;
  const defaults = require('./config/config');
  const Component = require('./model/Component');
  const ComponentView = require('./view/ComponentView');
  const Components = require('./model/Components');
  const ComponentsView = require('./view/ComponentsView');

  var component, componentView;
  var componentTypes = [
    {
      id: 'cell',
      model: require('./model/ComponentTableCell'),
      view: require('./view/ComponentTableCellView'),
    },
    {
      id: 'row',
      model: require('./model/ComponentTableRow'),
      view: require('./view/ComponentTableRowView'),
    },
    {
      id: 'table',
      model: require('./model/ComponentTable'),
      view: require('./view/ComponentTableView'),
    },
    {
      id: 'thead',
      model: require('./model/ComponentTableHead'),
      view: require('./view/ComponentTableHeadView'),
    },
    {
      id: 'tbody',
      model: require('./model/ComponentTableBody'),
      view: require('./view/ComponentTableBodyView'),
    },
    {
      id: 'tfoot',
      model: require('./model/ComponentTableFoot'),
      view: require('./view/ComponentTableFootView'),
    },
    {
      id: 'map',
      model: require('./model/ComponentMap'),
      view: require('./view/ComponentMapView'),
    },
    {
      id: 'link',
      model: require('./model/ComponentLink'),
      view: require('./view/ComponentLinkView'),
    },
    {
      id: 'video',
      model: require('./model/ComponentVideo'),
      view: require('./view/ComponentVideoView'),
    },
    {
      id: 'image',
      model: require('./model/ComponentImage'),
      view: require('./view/ComponentImageView'),
    },
    {
      id: 'script',
      model: require('./model/ComponentScript'),
      view: require('./view/ComponentScriptView'),
    },
    {
      id: 'svg',
      model: require('./model/ComponentSvg'),
      view: require('./view/ComponentSvgView'),
    },
    {
      id: 'textnode',
      model: require('./model/ComponentTextNode'),
      view: require('./view/ComponentTextNodeView'),
    },
    {
      id: 'text',
      model: require('./model/ComponentText'),
      view: require('./view/ComponentTextView'),
    },
    {
      id: 'default',
      model: Component,
      view: ComponentView,
    },
  ];

  return {

    Components,

    ComponentsView,

    componentTypes,

    /**
     * Name of the module
     * @type {String}
     * @private
     */
    name: 'DomComponents',

    /**
     * Returns config
     * @return {Object} Config object
     * @private
     */
    getConfig() {
        return c;
    },

    /**
     * Mandatory for the storage manager
     * @type {String}
     * @private
     */
    storageKey() {
      var keys = [];
      var smc = (c.stm && c.stm.getConfig()) || {};
      if(smc.storeHtml)
        keys.push('html');
      if(smc.storeComponents)
        keys.push('components');
      return keys;
    },

    /**
     * Initialize module. Called on a new instance of the editor with configurations passed
     * inside 'domComponents' field
     * @param {Object} config Configurations
     * @private
     */
    init(config) {
      c = config || {};
      em = c.em;

      if (em) {
        c.components = em.config.components || c.components;
      }

      for (var name in defaults) {
        if (!(name in c))
          c[name] = defaults[name];
      }

      var ppfx = c.pStylePrefix;
      if(ppfx)
        c.stylePrefix = ppfx + c.stylePrefix;

      // Load dependencies
      if (em) {
        c.modal = em.get('Modal') || '';
        c.am = em.get('AssetManager') || '';
        em.get('Parser').compTypes = componentTypes;
        em.on('change:selectedComponent', this.componentChanged, this);
      }

      // Build wrapper
      let components = c.components;
      let wrapper = { ...c.wrapper };
      wrapper['custom-name'] = c.wrapperName;
      wrapper.wrapper = 1;

      // Components might be a wrapper
      if (components && components.constructor === Object && components.wrapper) {
        wrapper = { ...components };
        components = components.components || [];
        wrapper.components = [];

        // Have to put back the real object of components
        if (em) {
          em.config.components = components;
          c.components = components;
        }
      }

      component = new Component(wrapper, {
        sm: em,
        config: c,
        componentTypes,
      });
      component.set({ attributes: {id: 'wrapper'}});

      componentView = new ComponentView({
        model: component,
        config: c,
        componentTypes,
      });
      return this;
    },

    /**
     * On load callback
     * @private
     */
    onLoad() {
      this.getComponents().reset(c.components);
    },

    /**
     * Do stuff after load
     * @param  {Editor} em
     * @private
     */
    postLoad(em) {
      this.handleChanges(this.getWrapper(), null, { avoidStore: 1 });
    },


    /**
     * Handle component changes
     * @private
     */
    handleChanges(model, value, opts = {}) {
      const comps = model.components();
      const um = em.get('UndoManager');
      const handleUpdates = em.handleUpdates.bind(em);
      const handleChanges = this.handleChanges.bind(this);
      const handleRemoves = this.handleRemoves.bind(this);
      um && um.add(model);
      um && comps && um.add(comps);
      const evn = 'change:style change:content change:attributes change:src';

      [ [model, evn, handleUpdates],
        [comps, 'add', handleChanges],
        [comps, 'remove', handleRemoves],
        [model.get('classes'), 'add remove', handleUpdates],
      ].forEach(els => {
        em.stopListening(els[0], els[1], els[2]);
        em.listenTo(els[0], els[1], els[2]);
      });

      !opts.avoidStore && handleUpdates('', '', opts);
      comps.each(model => this.handleChanges(model, value, opts));
    },


    /**
     * Triggered when some component is removed
     * @private
     * */
    handleRemoves(model, value, opts = {}) {
      !opts.avoidStore && em.handleUpdates(model, value, opts);
    },


    /**
     * Load components from the passed object, if the object is empty will try to fetch them
     * autonomously from the selected storage
     * The fetched data will be added to the collection
     * @param {Object} data Object of data to load
     * @return {Object} Loaded data
     */
    load(data = '') {
      let result = '';

      if (!data && c.stm) {
        data = c.em.getCacheLoad();
      }

      if (data.components) {
        try {
          result = JSON.parse(data.components);
        } catch (err) {}
      } else if (data.html) {
        result = data.html;
      }

      const isObj = result && result.constructor === Object;

      if ((result && result.length) || isObj) {
        this.clear();
        this.getComponents().reset();

        // If the result is an object I consider it the wrapper
        if (isObj) {
          this.getWrapper().set(result)
          .initComponents().initClasses().loadTraits();
        } else {
          this.getComponents().add(result);
        }
      }

      return result;
    },

    /**
     * Store components on the selected storage
     * @param {Boolean} noStore If true, won't store
     * @return {Object} Data to store
     */
    store(noStore) {
      if(!c.stm) {
        return;
      }

      var obj = {};
      var keys = this.storageKey();

      if (keys.indexOf('html') >= 0) {
        obj.html = c.em.getHtml();
      }

      if (keys.indexOf('components') >= 0) {
        const toStore = c.storeWrapper ?
          this.getWrapper() : this.getComponents();
        obj.components = JSON.stringify(toStore);
      }

      if (!noStore) {
        c.stm.store(obj);
      }

      return obj;
    },

    /**
     * Returns privately the main wrapper
     * @return {Object}
     * @private
     */
    getComponent() {
      return component;
    },

    /**
     * Returns root component inside the canvas. Something like <body> inside HTML page
     * The wrapper doesn't differ from the original Component Model
     * @return {Component} Root Component
     * @example
     * // Change background of the wrapper and set some attribute
     * var wrapper = domComponents.getWrapper();
     * wrapper.set('style', {'background-color': 'red'});
     * wrapper.set('attributes', {'title': 'Hello!'});
     */
    getWrapper() {
      return this.getComponent();
    },

    /**
     * Returns wrapper's children collection. Once you have the collection you can
     * add other Components(Models) inside. Each component can have several nested
     * components inside and you can nest them as more as you wish.
     * @return {Components} Collection of components
     * @example
     * // Let's add some component
     * var wrapperChildren = domComponents.getComponents();
     * var comp1 = wrapperChildren.add({
     *   style: { 'background-color': 'red'}
     * });
     * var comp2 = wrapperChildren.add({
     *   tagName: 'span',
     *   attributes: { title: 'Hello!'}
     * });
     * // Now let's add an other one inside first component
     * // First we have to get the collection inside. Each
     * // component has 'components' property
     * var comp1Children = comp1.get('components');
     * // Procede as before. You could also add multiple objects
     * comp1Children.add([
     *   { style: { 'background-color': 'blue'}},
     *   { style: { height: '100px', width: '100px'}}
     * ]);
     * // Remove comp2
     * wrapperChildren.remove(comp2);
     */
    getComponents() {
      return this.getWrapper().get('components');
    },

    /**
     * Add new components to the wrapper's children. It's the same
     * as 'domComponents.getComponents().add(...)'
     * @param {Object|Component|Array<Object>} component Component/s to add
     * @param {string} [component.tagName='div'] Tag name
     * @param {string} [component.type=''] Type of the component. Available: ''(default), 'text', 'image'
     * @param {boolean} [component.removable=true] If component is removable
     * @param {boolean} [component.draggable=true] If is possible to move the component around the structure
     * @param {boolean} [component.droppable=true] If is possible to drop inside other components
     * @param {boolean} [component.badgable=true] If the badge is visible when the component is selected
     * @param {boolean} [component.stylable=true] If is possible to style component
     * @param {boolean} [component.copyable=true] If is possible to copy&paste the component
     * @param {string} [component.content=''] String inside component
     * @param {Object} [component.style={}] Style object
     * @param {Object} [component.attributes={}] Attribute object
     * @return {Component|Array<Component>} Component/s added
     * @example
     * // Example of a new component with some extra property
     * var comp1 = domComponents.addComponent({
     *   tagName: 'div',
     *   removable: true, // Can't remove it
     *   draggable: true, // Can't move it
     *   copyable: true, // Disable copy/past
     *   content: 'Content text', // Text inside component
     *   style: { color: 'red'},
     *   attributes: { title: 'here' }
     * });
     */
    addComponent(component) {
      return this.getComponents().add(component);
    },

    /**
     * Render and returns wrapper element with all components inside.
     * Once the wrapper is rendered, and it's what happens when you init the editor,
     * the all new components will be added automatically and property changes are all
     * updated immediately
     * @return {HTMLElement}
     */
    render() {
      return componentView.render().el;
    },

    /**
     * Remove all components
     * @return {this}
     */
    clear() {
      var c = this.getComponents();
      for(var i = 0, len = c.length; i < len; i++)
        c.pop();
      return this;
    },

    /**
     * Set components
     * @param {Object|string} components HTML string or components model
     * @return {this}
     * @private
     */
    setComponents(components) {
      this.clear().addComponent(components);
    },

    /**
     * Add new component type
     * @param {string} type
     * @param {Object} methods
     * @private
     */
    addType(type, methods) {
      var compType = this.getType(type);
      if(compType) {
        compType.model = methods.model;
        compType.view = methods.view;
      } else {
        methods.id = type;
        componentTypes.unshift(methods);
      }
    },

    /**
     * Get component type
     * @param {string} type
     * @private
     */
    getType(type) {
      var df = componentTypes;

      for (var it = 0; it < df.length; it++) {
        var dfId = df[it].id;
        if(dfId == type) {
          return df[it];
        }
      }
      return;
    },

    /**
     * Triggered when the selected component is changed
     * @private
     */
    componentChanged() {
      const em = c.em;
      const model = em.get('selectedComponent');
      const previousModel = em.previous('selectedComponent');

      // Deselect the previous component
      if (previousModel) {
        previousModel.set({
          status: '',
          state: '',
        });
      }

      model && model.set('status','selected');
    }

  };
};
