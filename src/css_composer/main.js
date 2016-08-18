define(function(require) {
  /**
   * @class   CssComposer
   * @param   {Object} config Configurations
   *
   * */
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
          var smc = c.stm.getConfig() || {};
          if(smc.storeCss)
            keys.push('css');
          if(smc.storeStyles)
            keys.push('style');
          return keys;
        },

        /**
         * Initialize module. Automatically called with a new instance of the editor
         * @param {Object} config Configurations
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
          c.defaults = elStyle || c.defaults;

          c.sm = c.em; // TODO Refactor
          rules = new CssRules([], c);
          rules.add(c.defaults);

          // Load if requested
          if(c.stm && c.stm.getConfig().autoload)
            this.load();

          rulesView = new CssRulesView({
            collection: rules,
            config: c,
          });

          if(c.stm && c.stm.isAutosave())
            c.em.listenRules(this.getRules());
          return this;
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

          rules.reset(obj);
          return obj;
        },

        /**
         * Store data to the selected storage
         * @param {Boolean} noStore If true, won't store
         * @return {Object} Data to store
         * @example
         * var rules = cssComposer.store();
         */
        store: function(noStore){
          if(!c.stm)
            return;
          var obj = {};
          var keys = this.storageKey();
          if(keys.indexOf('css') >= 0)
            obj.css = c.em.getCss();
          if(keys.indexOf('style') >= 0)
            obj.styles = JSON.stringify(rules);
          if(!noStore)
            c.stm.store(obj);
          return obj;
        },

        /**
         * Create new rule and return it. Don't add it to the collection
         * @param   {Array} selectors Array of selectors
         * @param   {String} state Css rule state
         * @param   {String} width For which device this style is oriented
         *
         * @return  {Object}
         * */
        newRule: function(selectors, state, width) {
          var s = state || '';
          var w = width || '';
          var rule = new CssRule({
            state: s,
            maxWidth: w,
          });
          rule.get('selectors').add(selectors);
          return rule;
        },

        /**
         * Add new rule to the collection if not yet exists
         * @param {Object} rule
         *
         * @return  {Object}
         * */
        addRule: function(rule){
          var models = rule.get('selectors').models;
          var r = this.getRule(models, rule.get('state'), rule.get('maxWidth'));
          if(!r)
            r = rules.add(rule);
          return r;
        },

        /**
         * Get class by its name
         * @param   {Array} selectors Array of selectors
         * @param   {String} state Css rule state
         * @param   {String} width For which device this style is oriented
         *
         * @return  {Object|null}
         * */
        getRule  : function(selectors, state, width) {
          fRule = null;
          rules.each(function(rule){
              if(fRule)
                return;
              if(rule.compare(selectors, state, width))
                fRule = rule;
          }, this);
          return fRule;
        },

        /**
         * Get collection of css rules
         *
         * @return  {Object}
         * */
        getRules : function() {
          return  rules;
        },

        /**
         * Render block of CSS rules
         *
         * @return {Object}
         */
        render: function(){
          return rulesView.render().el;
        }

      };
  };

});