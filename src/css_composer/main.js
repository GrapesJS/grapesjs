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

        /**
         * Add new class to collection only if it's not already exists
         * @param {String} name Class name
         *
         * @return  {Object} Model class
         * */
        addRule: function(Rule){
          return rules.add(Rule);
          /*
          var label = name;
          var c = this.getRule(name);
          if(!c)
            return  this.classes.add({name: name, label: label});
          return c;
          */
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

              var sel = _.pluck(rule.get('selectors'), 'cid');

              if(this.same(req, sel))
                fRule = rule;
          }, this);
          return fRule;
        },

        /**
         * Create new rule
         * @param   {Array} selectors Array of selectors
         * @param   {String} state Rule status
         * @param   {String} set Query set
         *
         * @return  {Object}
         * */
        newRule: function(selectors, state, set) {
          var rule = new CssRule({ state: state });
          rule.get('selectors').add(selectors);
          return rule;
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