export default {
  run(ed) {
    ed.Canvas.getBody().className = this.ppfx + 'dashed';
  },

  stop(ed) {
    ed.Canvas.getBody().className = '';
  }
};
