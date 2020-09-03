export default {
  run(ed) {
    ed.Canvas.setEnableJs(true);
  },

  stop(ed) {
    ed.Canvas.setEnableJs(false);
  }
};
