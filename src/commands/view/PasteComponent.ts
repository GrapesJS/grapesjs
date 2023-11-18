import { isArray, contains } from 'underscore';
import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';

export default {
  run(ed, s, opts = {}) {
    const em = ed.getModel();
    const clp: Component[] | null = em.get('clipboard');
    const lastSelected = ed.getSelected();

    if (clp?.length && lastSelected) {
      ed.getSelectedAll().forEach(sel => {
        const selected = sel.delegate?.copy?.(sel) || sel;
        const { collection } = selected;
        if (!collection) return;

        let added;
        const at = selected.index() + 1;
        const addOpts = { at, action: opts.action || 'paste-component' };

        if (contains(clp, selected) && selected.get('copyable')) {
          added = collection.add(selected.clone(), addOpts);
        } else {
          const copyable = clp.filter(cop => cop.get('copyable'));
          const pasteable = copyable.filter(cop => ed.Components.canMove(selected.parent()!, cop).result);
          added = collection.add(
            pasteable.map(cop => cop.clone()),
            addOpts
          );
        }

        added = isArray(added) ? added : [added];
        added.forEach(add => ed.trigger('component:paste', add));
      });

      lastSelected.emitUpdate();
    }
  },
} as CommandObject;
