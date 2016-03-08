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

    //this.qset = { '' : CssRules, '340px': CssRules };
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
         * @param {Array} selectors Array of selectors
         * @param {String} state Rule status
         * @param {String} set Query set
         *
         * @return  {Object|null}
         * */
        getRule  : function(selectors, state, set) {
          var req = _.pluck(selectors, 'cid');
            fRule = null;
          rules.each(function(rule){
              if(fRule)
                return;
              var sel = _.pluck(rule.get('selectors').models, 'cid');
              if(this.same(req, sel))
                fRule = rule;
          }, this);
          return fRule;
        },

        /**
         * Compare 2 arrays to check if are the same
         * @param  {Array} arr1
         * @param  {Array} arr2
         *
         * @return {Boolean}
         */
        same: function(a1, a2){
          if(a1.length !== a2.length)
            return;

          for (var i = 0; i < a1.length; i++) {
            var f = 0;

            for (var j = 0; j < a2.length; j++) {
              if (a1[i] === a2[j])
                f = 1;
            }

            if(f === 0)
              return;
          }
          return true;
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