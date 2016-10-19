/**
 * * [add](#add)
 * * [get](#get)
 * * [getAll](#getall)
 * * [load](#load)
 * * [store](#store)
 *
 * This module contains and manage CSS rules for the template inside the canvas
 * Before using the methods you should get first the module from the editor instance, in this way:
 *
 * ```js
 * var cssComposer = editor.CssComposer;
 * ```
 *
 * @module CssComposer
 * @param {Object} config Configurations
 * @param {string|Array<Object>} [config.rules=[]] CSS string or an array of rule objects
 * @example
 * ...
 * CssComposer: {
 *    rules: '.myClass{ color: red}',
 * }
 */
define(function(require) {
  return function() {
    var c = {},
    defaults = require('./config/config'),
    CssRule = require('./model/CssRule'),
    CssRules = require('./model/CssRules'),
    Selectors = require('./model/Selectors'),
    CssRulesView = require('./view/CssRulesView');

    var rules, rulesView;

    return {

        Selectors: Selectors,

        /**
         * Name of the module
         * @type {String}
         * @private
         */
        name: 'CssComposer',

        /**
         * Mandatory for the storage manager
         * @type {String}
         * @private
         */
        storageKey: function(){
          var keys = [];
          var smc = (c.stm && c.stm.getConfig()) || {};
          if(smc.storeCss)
            keys.push('css');
          if(smc.storeStyles)
            keys.push('styles');
          return keys;
        },

        /**
         * Initializes module. Automatically called with a new instance of the editor
         * @param {Object} config Configurations
         * @private
         */
        init: function(config) {
          c = config || {};
          for (var name in defaults) {
            if (!(name in c))
              c[name] = defaults[name];
          }

          var ppfx = c.pStylePrefix;
          if(ppfx)
            c.stylePrefix = ppfx + c.stylePrefix;

          var elStyle = (c.em && c.em.config.style) || '';
          c.rules = elStyle || c.rules;

          c.sm = c.em; // TODO Refactor
          rules = new CssRules([], c);
          rules.add(c.rules);

          rulesView = new CssRulesView({
            collection: rules,
            config: c,
          });
          return this;
        },

        /**
         * On load callback
         * @private
         */
        onLoad: function(){
          if(c.stm && c.stm.getConfig().autoload)
              this.load();

          if(c.stm && c.stm.isAutosave())
            c.em.listenRules(this.getAll());
        },

        /**
         * Load data from the passed object, if the object is empty will try to fetch them
         * autonomously from the storage manager.
         * The fetched data will be added to the collection
         * @param {Object} data Object of data to load
         * @return {Object} Loaded rules
         */
        load: function(data){
          var d = data || '';
          if(!d && c.stm)
            d = c.em.getCacheLoad();
          var obj = '';
          if(d.style){
            try{
              obj =  JSON.parse(d.style);
            }catch(err){}
          }else if(d.css)
            obj = c.em.get('Parser').parseCss(d.css);

          if(obj)
            rules.reset(obj);
          return obj;
        },

        /**
         * Store data to the selected storage
         * @param {Boolean} noStore If true, won't store
         * @return {Object} Data to store
         */
        store: function(noStore){
          if(!c.stm)
            return;
          var obj = {};
          var keys = this.storageKey();
          if(keys.indexOf('css') >= 0)
            obj.css = c.em.getCss();
          if(keys.indexOf('styles') >= 0)
            obj.styles = JSON.stringify(rules);
          if(!noStore)
            c.stm.store(obj);
          return obj;
        },

        /**
         * Add new rule to the collection, if not yet exists with the same selectors
         * @param {Array<Selector>} selectors Array of selectors
         * @param {String} state Css rule state
         * @param {String} width For which device this style is oriented
         * @return {Model}
         * @example
         * var sm = editor.SelectorManager;
         * var sel1 = sm.add('myClass1');
         * var sel2 = sm.add('myClass2');
         * var rule = cssComposer.add([sel1, sel2], 'hover');
         * rule.set('style', {
         *   width: '100px',
         *   color: '#fff',
         * });
         * */
        add: function(selectors, state, width) {
          var s = state || '';
          var w = width || '';
          var rule = this.get(selectors, s, w);
          if(rule)
            return rule;
          else{
            rule = new CssRule({
              state: s,
              maxWidth: w,
            });
            rule.get('selectors').add(selectors);
            rules.add(rule);
            return rule;
          }
        },

        /**
         * Get the rule
         * @param {Array<Selector>} selectors Array of selectors
         * @param {String} state Css rule state
         * @param {String} width For which device this style is oriented
         * @return  {Model|null}
         * @example
         * var sm = editor.SelectorManager;
         * var sel1 = sm.add('myClass1');
         * var sel2 = sm.add('myClass2');
         * var rule = cssComposer.get([sel1, sel2], 'hover');
         * // Update the style
         * rule.set('style', {
         *   width: '300px',
         *   color: '#000',
         * });
         * */
        get: function(selectors, state, width) {
          var rule = null;
          rules.each(function(m){
            if(rule)
              return;
            if(m.compare(selectors, state, width))
              rule = m;
          });
          return rule;
        },

        /**
         * Get the collection of rules
         * @return {Collection}
         * */
        getAll: function() {
          return rules;
        },

        /**
         * Add a raw collection of rule objects
         * This method overrides styles, in case, of already defined rule
         * @param {Array<Object>} data Array of rule objects
         * @return {Array<Model>}
         * @private
         */
        addCollection: function(data){
          var result = [];
          var d = data instanceof Array ? data : [data];
          for(var i = 0, l = d.length; i < l; i++){
            var rule = d[i] || {};
            if(!rule.selectors)
              continue;
            var sm = c.em && c.em.get('SelectorManager');
            if(!sm)
              console.warn('Selector Manager not found');
            var sl = rule.selectors;
            var sels = sl instanceof Array ? sl : [sl];
            var newSels = [];
            for(var j = 0, le = sels.length; j < le; j++){
              var selec = sm.add(sels[j]);
              newSels.push(selec);
            }
            var model = this.add(newSels, rule.state, rule.maxWidth);
            model.set('style', rule.style || {});
            result.push(model);
          }
          return result;
        },

        /**
         * Render the block of CSS rules
         * @return {HTMLElement}
         * @private
         */
        render: function() {
          return rulesView.render().el;
        }

      };
  };

});
