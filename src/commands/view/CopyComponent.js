module.exports = {
  run(ed) {
    const em = ed.getModel();
    const models = [...ed.getSelectedAll()];

    if (models.length && !em.isEditing()) {
      em.set('clipboard', models);
    }
  }
};
