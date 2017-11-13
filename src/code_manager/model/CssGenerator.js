import { keys } from 'underscore';

module.exports = require('backbone').Model.extend({

  initialize() {
    this.compCls = [];
    this.ids = [];
  },

  /**
   * Get CSS from a component
   * @param {Model} model
   * @return {String}
   */
  buildFromModel(model, opts = {}) {
    let code = '';
    const style = model.get('style');
    const classes = model.get('classes');
    const wrappesIsBody = opts.wrappesIsBody;
    this.ids.push(model.getId());

    // Let's know what classes I've found
    classes.each(model => this.compCls.push(model.getFullName()));

    if (style && keys(style).length) {
      let selector = `#${model.getId()}`;
      selector = wrappesIsBody && model.get('wrapper') ? 'body' : selector;
      code = `${selector}{${model.styleToString()}}`;
    }

    const components = model.components();
    components.each(model => code += this.buildFromModel(model, opts));
    return code;
  },


  build(model, opts = {}) {
    const cssc = opts.cssc;
    this.compCls = [];
    this.ids = [];
    var code = this.buildFromModel(model, opts);

    if (cssc) {
      const rules = cssc.getAll();
      const mediaRules = {};

      rules.each(rule => {
        const media = rule.get('mediaText');

        // If media is setted, I'll render it later
        if (media) {
          const mRules = mediaRules[media];
          if (mRules) {
            mRules.push(rule);
          } else {
            mediaRules[media] = [rule];
          }
          return;
        }

        code += this.buildFromRule(rule);
      });

      // Get media rules
      for (var ruleW in mediaRules) {
        var meRules = mediaRules[ruleW];
        var ruleC = '';
        for(var i = 0, len = meRules.length; i < len; i++){
          ruleC += this.buildFromRule(meRules[i]);
        }

        if (ruleC) {
          code += '@media ' + ruleW + '{' + ruleC + '}';
        }
      }

    }

    return code;
  },

  /**
   * Get CSS from the rule model
   * @param {Model} rule
   * @return {string} CSS string
   */
  buildFromRule(rule) {
    let result = '';
    const selectorStr = rule.selectorsToString();
    const selectorStrNoAdd = rule.selectorsToString({skipAdd: 1});
    let found;

    // This will not render a rule if there is no its component
    rule.get('selectors').each(selector => {
      if (this.compCls.indexOf(selector.getFullName()) >= 0) {
        found = 1;
      }
    });

    if ((selectorStrNoAdd && found) || rule.get('selectorsAdd')) {
      const style = rule.styleToString();

      if (style) {
        result += `${selectorStr}{${style}}`;
      }
    }

    return result;
  },

});
