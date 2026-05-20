import type Component from '../../dom_components/model/Component';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface ComponentEnterCommandRegistryRun {
  'core:component-enter': CommandPublicFnFromHandler<CommandComponentEnter['run']>;
}

export default class CommandComponentEnter extends CommandAbstract {
  run(ed: Editor) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect: Component[] = [];

    ed.getSelectedAll().forEach((component) => {
      const coll = component.components();
      const next = coll && coll.filter((c) => !!c.get('selectable'))[0];
      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
}
