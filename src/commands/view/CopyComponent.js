module.exports = {
  run(ed) {
    const em = ed.getModel();
    const models = [...ed.getSelectedAll()];

    if (models.length && !em.isEditing() && !ed.Canvas.isInputFocused()) {
      em.set('clipboard', models);
    }
  }
};
