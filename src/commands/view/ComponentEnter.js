module.exports = {
  run(ed) {
    if (!ed.Canvas.hasFocus() || ed.getModel().isEditing()) return;
    const toSelect = [];

    ed.getSelectedAll().forEach(component => {
      const coll = component.components();
      const next = coll && coll.at(0);
      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
};
