import { isArray } from 'underscore';
import type Component from '../../dom_components/model/Component';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ComponentDeleteRunOptions {
  component?: Component | Component[];
}

export interface ComponentDeleteCommandRegistryRun {
  'core:component-delete': CommandPublicFnFromHandler<CommandComponentDelete['run']>;
}

export default class CommandComponentDelete extends CommandAbstract<ComponentDeleteRunOptions> {
  run(ed: Editor, s: any, opts: ComponentDeleteRunOptions = {}) {
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
  }
}
