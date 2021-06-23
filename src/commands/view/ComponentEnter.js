export default {
  run(ed) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect = [];

    ed.getSelectedAll().forEach(component => {
      const coll = component.components();
      const next = coll && coll.filter(c => c.get('selectable'))[0];
      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
};
