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
      const mediaRules = {};
      const dump = [];

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

        code += this.buildFromRule(rule, dump);
      });

      // Get media rules
      for (let media in mediaRules) {
        let rulesStr = '';
        const mRules = mediaRules[media];
        mRules.forEach(rule => (rulesStr += this.buildFromRule(rule, dump)));

        if (rulesStr) {
          code += `@media ${media}{${rulesStr}}`;
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
  buildFromRule(rule, dump) {
    let result = '';
    const selectorStr = rule.selectorsToString();
    const selectorStrNoAdd = rule.selectorsToString({ skipAdd: 1 });
    let found;

    // This will not render a rule if there is no its component
    rule.get('selectors').each(selector => {
      const name = selector.getFullName();
      if (this.compCls.indexOf(name) >= 0 || this.ids.indexOf(name) >= 0) {
        found = 1;
      }
    });

    if ((selectorStrNoAdd && found) || rule.get('selectorsAdd')) {
      const style = rule.styleToString();

      if (style) {
        result += `${selectorStr}{${style}}`;
      }
    } else {
      dump.push(rule);
    }

    return result;
  }
});
