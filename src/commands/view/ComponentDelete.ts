import { isArray } from 'underscore';
import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';

const command: CommandObject<{ component?: Component }> = {
  run(ed, s, opts = {}) {
    const toSelect: Component[] = [];
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

export default command;
