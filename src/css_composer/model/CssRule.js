import Styleable from 'domain_abstract/model/Styleable';

var Backbone = require('backbone');
var Selectors = require('./Selectors');

module.exports = Backbone.Model.extend(Styleable).extend({

	defaults: {
    // Css selectors
    selectors: {},

    // Additional string css selectors
    selectorsAdd: '',

    // Css properties style
    style: {},

    // On which device width this rule should be rendered, eg. @media (max-width: 1000px)
    mediaText: '',

    // State of the rule, eg: hover | pressed | focused
    state: '',

    // Indicates if the rule is stylable
    stylable: true,
	},

  initialize(c, opt) {
      this.config   = c || {};
      this.sm = opt ? opt.sm || {} : {};
      this.slct = this.config.selectors || [];

      if(this.sm.get){
          var slct = [];
          for(var i = 0; i < this.slct.length; i++)
              slct.push(this.sm.get('SelectorManager').add(this.slct[i].name || this.slct[i]));
          this.slct = slct;
      }

      this.set('selectors', new Selectors(this.slct));
  },

  /**
   * Compare the actual model with parameters
   * @param   {Object} selectors Collection of selectors
   * @param   {String} state Css rule state
   * @param   {String} width For which device this style is oriented
   * @param {Object} ruleProps Other rule props
   * @return  {Boolean}
   * @private
   */
  compare(selectors, state, width, ruleProps) {
      var otherRule = ruleProps || {};
      var st = state || '';
      var wd = width || '';
      var selectorsAdd = otherRule.selectorsAdd || '';
      var cId = 'cid';
      //var a1 = _.pluck(selectors.models || selectors, cId);
      //var a2 = _.pluck(this.get('selectors').models, cId);
      if(!(selectors instanceof Array) && !selectors.models)
        selectors = [selectors];
      var a1 = _.map((selectors.models || selectors), model => model.get('name'));
      var a2 = _.map(this.get('selectors').models, model => model.get('name'));
      var f = false;

      if(a1.length !== a2.length)
          return f;

      for (var i = 0; i < a1.length; i++) {
          var re = 0;
          for (var j = 0; j < a2.length; j++) {
              if (a1[i] === a2[j])
                  re = 1;
          }
          if(re === 0)
            return f;
      }

      if(this.get('state') !== st)
          return f;

      if(this.get('mediaText') !== wd)
          return f;

      if(this.get('selectorsAdd') !== selectorsAdd)
          return f;

      return true;
  },

});
