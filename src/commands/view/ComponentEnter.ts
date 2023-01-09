import Component from '../../dom_components/model/Component';
import { CommandObject } from './CommandAbstract';

export default {
  run(ed) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect: Component[] = [];

    ed.getSelectedAll().forEach(component => {
      const coll = component.components();
      const next = coll && coll.filter((c: any) => c.get('selectable'))[0];
      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  },
} as CommandObject;
