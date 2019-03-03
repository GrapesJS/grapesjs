import { isUndefined } from 'underscore';
import Backbone from 'backbone';

module.exports = Backbone.Model.extend({
  idAttribute: 'name',

  defaults: {
    name: '',

    // Width to set for the editor iframe
    width: '',

    // Height to set for the editor iframe
    height: '',

    // The width which will be used in media queries,
    // If empty the width will be used
    widthMedia: null,

    // Setup the order of media queries
    priority: null
  },

  initialize() {
    this.get('widthMedia') === null &&
      this.set('widthMedia', this.get('width'));
    !this.get('priority') &&
      this.set('priority', parseFloat(this.get('widthMedia')) || 0);
  }
});
