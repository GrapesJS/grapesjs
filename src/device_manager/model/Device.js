import Backbone from 'backbone';

export default Backbone.Model.extend({
  idAttribute: 'name',

  defaults: {
    name: '',

    // Width to set for the editor iframe
    width: null,

    // Height to set for the editor iframe
    height: '',

    // The width which will be used in media queries,
    // If empty the width will be used
    widthMedia: null,

    // The condition to use for media queries, eg. 'max-width'
    mediaCondition: null,
    defaultMediaCondition: null,

    // Setup the order of media queries
    priority: null
  },

  initialize() {
    this.get('widthMedia') === null &&
      this.set('widthMedia', this.get('width'));
    this.get('width') === null && this.set('width', this.get('widthMedia'));

    if (this.get('widthMedia') && !this.get('mediaCondition')) {
      this.set('mediaCondition', this.get('defaultMediaCondition'));
    }

    !this.get('priority') &&
      this.set('priority', parseFloat(this.get('widthMedia')) || 0);

    const toCheck = ['width', 'height', 'widthMedia'];
    toCheck.forEach(prop => this.checkUnit(prop));
  },

  checkUnit(prop) {
    const pr = this.get(prop) || '';
    const noUnit = (parseFloat(pr) || 0).toString() === pr.toString();
    noUnit && this.set(prop, `${pr}px`);
  }
});
