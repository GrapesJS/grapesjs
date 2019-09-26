import { isArray } from 'underscore';

export default {
  run(ed, sender, opts = {}) {
    const { target } = opts;
    const dc = ed.DomComponents;
    const type = target.get('type');
    const len = dc.getWrapper().find(`[data-gjs-type="${type}"]`).length;
    const toRemove = [];

    if (!len) {
      const rules = ed.CssComposer.getAll();
      let toClear = target.get('style-signature');
      toClear = isArray(toClear) ? toClear : [toClear];

      rules.forEach(rule => {
        const selector = rule.selectorsToString();
        toClear.forEach(part => {
          part && selector.indexOf(part) >= 0 && toRemove.push(rule);
        });
      });

      rules.remove(toRemove);
    }

    return toRemove;
  }
};
