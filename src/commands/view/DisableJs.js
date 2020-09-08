export default {
  run(ed) {
    ed.Canvas.setJs(true);
  },

  stop(ed) {
    ed.Canvas.setJs(false);
  }
};
