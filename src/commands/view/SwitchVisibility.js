module.exports = {

  run: function(ed) {
    ed.Canvas.getBody().className = this.ppfx + 'dashed';
  },

  stop: function(ed) {
    ed.Canvas.getBody().className = "";
  }

};
