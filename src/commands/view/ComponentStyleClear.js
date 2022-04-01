import { flatten } from 'underscore';

export default {
  run(ed, s, opts = {}) {
    const { target } = opts;
    let toRemove = [];

    if (!target.get('styles')) return toRemove;

    // Find all components in the project, of the target component type
    const type = target.get('type');
    const wrappers = ed.Pages.getAllWrappers();
    const len = flatten(wrappers.map(wrp => wrp.findType(type))).length;

    // Remove component related styles only if there are no more components
    // of that type in the project
    if (!len) {
      const rules = ed.CssComposer.getAll();
      toRemove = rules.filter(rule => rule.get('group') === `cmp:${type}`);
      rules.remove(toRemove);
    }

    return toRemove;
  },
};
