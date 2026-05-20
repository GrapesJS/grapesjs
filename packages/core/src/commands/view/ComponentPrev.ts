import type Component from '../../dom_components/model/Component';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ComponentPrevCommandRegistryRun {
  'core:component-prev': CommandPublicFnFromHandler<CommandComponentPrev['run']>;
}

export default class CommandComponentPrev extends CommandAbstract {
  run(ed: Editor) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect: Component[] = [];

    ed.getSelectedAll().forEach((cmp) => {
      const parent = cmp.parent();
      if (!parent) return;

      let incr = 0;
      let at = 0;
      let next: Component | null = null;

      // Get the first selectable component
      do {
        incr++;
        at = cmp.index() - incr;
        next = at >= 0 ? parent.getChildAt(at) : null;
      } while (next && !next.get('selectable'));

      toSelect.push(next || cmp);
    });

    toSelect.length && ed.select(toSelect);
  }
}
