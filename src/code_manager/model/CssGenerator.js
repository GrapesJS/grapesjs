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
    const em = this.em;
    const avoidInline = em && em.getConfig('avoidInlineStyle');
    const style = model.styleToString();
    const classes = model.get('classes');
    const wrappesIsBody = opts.wrappesIsBody;
    const isWrapper = model.get('wrapper');
    this.ids.push(`#${model.getId()}`);

    // Let's know what classes I've found
    classes.each(model => this.compCls.push(model.getFullName()));

    if ((!avoidInline || isWrapper) && style) {
      let selector = `#${model.getId()}`;
      selector = wrappesIsBody && isWrapper ? 'body' : selector;
      code = `${selector}{${style}}`;
    }

    const components = model.components();
    components.each(model => (code += this.buildFromModel(model, opts)));
    return code;
  },

  build(model, opts = {}) {
    const cssc = opts.cssc;
    const em = opts.em || '';
    this.em = em;
    this.compCls = [];
    this.ids = [];
    var code = this.buildFromModel(model, opts);

    if (cssc) {
      const rules = cssc.getAll();
      const atRules = {};
      const dump = [];

      rules.each(rule => {
        const atRule = rule.getAtRule();

        if (atRule) {
          const mRules = atRules[atRule];
          if (mRules) {
            mRules.push(rule);
          } else {
            atRules[atRule] = [rule];
          }
          return;
        }

        code += this.buildFromRule(rule, dump, opts);
      });

      // Get at-rules
      for (let atRule in atRules) {
        let rulesStr = '';
        const mRules = atRules[atRule];
        mRules.forEach(
          rule => (rulesStr += this.buildFromRule(rule, dump, opts))
        );

        if (rulesStr) {
          code += `${atRule}{${rulesStr}}`;
        }
      }

      em && em.getConfig('clearStyles') && rules.remove(dump);
    }

    return code;
  },

  /**
   * Get CSS from the rule model
   * @param {Model} rule
   * @return {string} CSS string
   */
  buildFromRule(rule, dump, opts = {}) {
    let result = '';
    const selectorStrNoAdd = rule.selectorsToString({ skipAdd: 1 });
    const selectorsAdd = rule.get('selectorsAdd');
    const singleAtRule = rule.get('singleAtRule');
    let found;

    // This will not render a rule if there is no its component
    rule.get('selectors').each(selector => {
      const name = selector.getFullName();
      if (
        this.compCls.indexOf(name) >= 0 ||
        this.ids.indexOf(name) >= 0 ||
        opts.keepUnusedStyles
      ) {
        found = 1;
      }
    });

    if ((selectorStrNoAdd && found) || selectorsAdd || singleAtRule) {
      const block = rule.getDeclaration();
      block && (result += block);
    } else {
      dump.push(rule);
    }

    return result;
  }
});
