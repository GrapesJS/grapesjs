export default {
  run(ed, snd, opts = {}) {
    if (!ed.Canvas.hasFocus() && !opts.force) return;
    const toSelect = [];

    ed.getSelectedAll().forEach(component => {
      let next = component.parent();

      // Recurse through the parent() chain until a selectable parent is found
      while (next && !next.get('selectable')) {
        next = next.parent();
      }

      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
};
