import { contains, isArray } from 'underscore';
import Component from '../../dom_components/model/Component';
import { ComponentsEvents } from '../../dom_components/types';
import Editor from '../../editor';
import type { CommandPublicFnFromHandler } from '../registryHelpers';
import CommandAbstract from './CommandAbstract';

export interface PasteComponentOptions {
  action?: string;
}

export interface PasteComponentCommandRegistryRun {
  'core:paste': CommandPublicFnFromHandler<CommandPasteComponent['run']>;
}

export default class CommandPasteComponent extends CommandAbstract<PasteComponentOptions> {
  run(ed: Editor, _sender: any, opts: PasteComponentOptions = {}) {
    const em = ed.getModel();
    const clp: Component[] | null = em.get('clipboard');
    const lastSelected = ed.getSelected();

    if (clp?.length && lastSelected) {
      ed.getSelectedAll().forEach((sel) => {
        const selected = sel.delegate?.copy?.(sel) || sel;
        const { collection } = selected;
        let added;
        if (collection) {
          const at = selected.index() + 1;
          const addOpts = { at, action: opts.action || 'paste-component' };

          if (contains(clp, selected) && selected.get('copyable')) {
            added = collection.add(selected.clone(), addOpts);
          } else {
            added = doAdd(ed, clp, selected.parent()!, addOpts);
          }
        } else {
          const pageBody = em.Pages.getSelected()?.getMainComponent();
          const addOpts = { at: pageBody?.components().length || 0, action: opts.action || 'paste-component' };

          added = doAdd(ed, clp, pageBody as Component, addOpts);
        }

        added = isArray(added) ? added : [added];
        added.forEach((add) => ed.trigger(ComponentsEvents.paste, add));
      });

      lastSelected.emitUpdate();
    }
  }
}

function doAdd(ed: Editor, clp: Component[], parent: Component, addOpts: any): Component[] | Component {
  const copyable = clp.filter((cop) => cop.get('copyable'));
  const pasteable = copyable.filter((cop) => ed.Components.canMove(parent, cop).result);
  return parent.components().add(
    pasteable.map((cop) => cop.clone()),
    addOpts,
  );
}
