import Styleable from 'domain_abstract/model/Styleable';

var Backbone = require('backbone');
var Selectors = require('selector_manager/model/Selectors');

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

    // If true, sets '!important' on all properties
    // You can use an array to specify properties to set important
    // Used in view
    important: 0,
	},


  initialize(c, opt = {}) {
    this.config = c || {};
    const em = opt.em;
    let selectors = this.config.selectors || [];
    this.em = em;

    if (em) {
      const sm = em.get('SelectorManager');
      const slct = [];
      selectors.forEach((selector) => {
        slct.push(sm.add(selector));
      });
      selectors = slct;
    }

    this.set('selectors', new Selectors(selectors));
  },


  /**
   * Return selectors fo the rule as a string
   * @return {string}
   */
  selectorsToString(opts = {}) {
    const result = [];
    const state = this.get('state');
    const addSelector = this.get('selectorsAdd');
    const selectors = this.get('selectors').getFullString();
    const stateStr = state ? `:${state}` : '';
    selectors && result.push(`${selectors}${stateStr}`);
    addSelector && !opts.skipAdd && result.push(addSelector);
    return result.join(', ');
  },


  /**
   * Returns CSS string of the rule
   * @param {Object} [opts={}] Options
   * @return {string}
   */
  toCSS(opts = {}) {
    let result = '';
    const media = this.get('mediaText');
    const style = this.styleToString(opts);
    const selectors = this.selectorsToString();

    if (selectors && style) {
      result = `${selectors}{${style}}`;
    }

    if (media && result) {
      result = `@media ${media}{${result}}`;
    }

    return result;
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
