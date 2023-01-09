import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';

export default {
  run(ed) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect: Component[] = [];

    ed.getSelectedAll().forEach(cmp => {
      const parent = cmp.parent();
      if (!parent) return;

      const len = parent.components().length;
      let incr = 0;
      let at = 0;
      let next: any;

      // Get the next selectable component
      do {
        incr++;
        at = cmp.index() + incr;
        next = at <= len ? parent.getChildAt(at) : null;
      } while (next && !next.get('selectable'));

      toSelect.push(next || cmp);
    });

    toSelect.length && ed.select(toSelect);
  },
} as CommandObject;
