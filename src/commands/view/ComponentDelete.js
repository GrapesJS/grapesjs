import { isArray } from 'underscore';

export default {
  run(ed, s, opts = {}) {
    const toSelect = [];
    let components = opts.component || ed.getSelectedAll();
    components = isArray(components) ? [...components] : [components];

    components.filter(Boolean).forEach(component => {
      if (!component.get('removable')) {
        toSelect.push(component);
        return this.em.logWarning('The element is not removable', {
          component,
        });
      }
      component.remove();
    });

    ed.select(toSelect);

    return components;
  },
};
