export default {
  run(ed) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect = [];

    ed.getSelectedAll().forEach(cmp => {
      const parent = cmp.parent();
      if (!parent) return;

      let incr = 0;
      let at = 0;
      let next;

      // Get the first selectable component
      do {
        incr++;
        at = cmp.index() - incr;
        next = at >= 0 ? parent.getChildAt(at) : null;
      } while (next && !next.get('selectable'));

      toSelect.push(next || cmp);
    });

    toSelect.length && ed.select(toSelect);
  },
};
