import Backbone from 'backbone';
var Frame = require('./Frame');

module.exports = Backbone.Model.extend({
  defaults: {
    frame: '',
    wrapper: '',
    rulers: false,
    zoom: 100,
    x: 0,
    y: 0
  },

  initialize(config = {}) {
    const { styles = [], scripts = [] } = config;
    const frame = new Frame();
    styles.forEach(style => frame.addLink(style));
    scripts.forEach(script => frame.addScript(script));
    this.set('frame', frame);
    this.listenTo(this, 'change:zoom', this.onZoomChange);
  },

  onZoomChange() {
    const zoom = this.get('zoom');
    zoom < 1 && this.set('zoom', 1);
  }
});
