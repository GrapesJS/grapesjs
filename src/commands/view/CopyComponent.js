module.exports = {
  run(ed) {
    const em = ed.getModel();
    const models = [...ed.getSelectedAll()];

    if (models.length && !ed.Canvas.isInputFocused()) {
      em.set('clipboard', models);
    }
  }
};
