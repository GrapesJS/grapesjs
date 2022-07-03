export default {
  run(ed) {
    const em = ed.getModel();
    const models = [...ed.getSelectedAll()];
    models.length && em.set('clipboard', models);
  },
};
