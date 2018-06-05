module.exports = {
  run(ed) {
    const toSelect = [];

    ed.getSelectedAll().forEach(component => {
      const next = component.parent();
      next && toSelect.push(next);
    });

    toSelect.length && ed.select(toSelect);
  }
};
