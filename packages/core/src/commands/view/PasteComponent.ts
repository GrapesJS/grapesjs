import { isArray, contains } from 'underscore';
import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';
import Editor from '../../editor';

export default {
  run(ed, s, opts = {}) {
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
          // Page body is selected
          // Paste at the end of the body
          const pageBody = em.Pages.getSelected()?.getMainComponent();
          const addOpts = { at: pageBody?.components().length || 0, action: opts.action || 'paste-component' };

          added = doAdd(ed, clp, pageBody as Component, addOpts);
        }

        added = isArray(added) ? added : [added];
        added.forEach((add) => ed.trigger('component:paste', add));
      });

      lastSelected.emitUpdate();
    }
  },
} as CommandObject;

function doAdd(ed: Editor, clp: Component[], parent: Component, addOpts: any): Component[] | Component {
  const copyable = clp.filter((cop) => cop.get('copyable'));
  const pasteable = copyable.filter((cop) => ed.Components.canMove(parent, cop).result);
  return parent.components().add(
    pasteable.map((cop) => cop.clone()),
    addOpts,
  );
}
