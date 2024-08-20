import { isArray } from 'underscore';
import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';

const command: CommandObject<{ component?: Component }> = {
  run(ed, s, opts = {}) {
    const removed: Component[] = [];
    let components = opts.component || ed.getSelectedAll();
    components = isArray(components) ? [...components] : [components];

    components.filter(Boolean).forEach((component) => {
      if (!component.get('removable')) {
        return this.em.logWarning('The element is not removable', {
          component,
        });
      }

      removed.push(component);
      const cmp = component.delegate?.remove?.(component) || component;
      cmp.remove();
    });

    ed.selectRemove(removed);

    return removed;
  },
};

export default command;
