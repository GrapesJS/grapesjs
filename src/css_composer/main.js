define(function(require) {
  /**
   * @class   CssComposer
   * @param   {Object} config Configurations
   *
   * */
  var CssComposer  = function(config)
  {
    var c = config || {},
      def = require('./config/config'),
      CssRule = require('./model/CssRule'),
      CssRules = require('./model/CssRules'),
      Selectors = require('./model/Selectors'),
      CssRulesView = require('./view/CssRulesView');

    for (var name in def) {
      if (!(name in c))
        c[name] = def[name];
    }

    var rules = new CssRules([]),
    rulesView = new CssRulesView({
      collection: rules,
      config: c,
    });

    return {

        Selectors: Selectors,

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

  return CssComposer;

});