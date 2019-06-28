export default {
  run(ed) {
    if (!ed.Canvas.hasFocus()) return;
    const toSelect = [];

    ed.getSelectedAll().forEach(component => {
      const coll = component.collection;
      const at = coll.indexOf(component);
      const next = coll.at(at + 1);
      toSelect.push(next || component);
    });

    toSelect.length && ed.select(toSelect);
  }
};
