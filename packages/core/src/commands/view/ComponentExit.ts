import type Component from '../../dom_components/model/Component';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ComponentExitCommandRegistryRun {
  'core:component-exit': CommandPublicFnFromHandler<CommandComponentExit['run']>;
  'select-parent': CommandPublicFnFromHandler<CommandComponentExit['run']>;
}

export default class CommandComponentExit extends CommandAbstract {
  run(ed: Editor, _: any, opts: any = {}) {
    if (!ed.Canvas.hasFocus() && !opts.force) return;
    const toSelect: Component[] = [];

    ed.getSelectedAll().forEach((component) => {
      let next = component.parent();

      // Recurse through the parent() chain until a selectable parent is found
      while (next && !next.get('selectable')) {
        next = next.parent();
      }

      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
}
