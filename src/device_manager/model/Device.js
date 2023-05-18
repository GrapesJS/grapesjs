import Backbone from 'backbone';

export default Backbone.Model.extend({
  idAttribute: 'name',

  defaults: {
    name: '',

    // Width to set for the editor iframe
    width: null,

    // Height to set for the editor iframe
    height: '',
    heightMedia: null,

    // The width which will be used in media queries,
    // If empty the width will be used
    widthMedia: null,
    orientationGrapes: null,

    // Setup the order of devices in the dropdown menu according to their priority
    priorityObjNum: null,
    priority: null
  },

  initialize() {
    this.get('widthMedia') === null &&
      this.set('widthMedia', this.get('width'));
    this.get('heightMedia') === null &&
      this.set('heightMedia', this.get('height'));
    this.get('orientationGrapes') === null &&
      this.set('orientationGrapes', this.get('orientation'));

    this.get('width') === null && this.set('width', this.get('widthMedia'));

    !this.get('priority') &&
      this.set('priority', parseInt(this.get('widthMedia')) || 0);
    const toCheck = ['width', 'height', 'widthMedia'];
    toCheck.forEach(prop => this.checkUnit(prop));
  },

  checkUnit(prop) {
    const pr = this.get(prop) || '';
    const noUnit = (parseInt(pr) || 0).toString() === pr.toString();
    noUnit && this.set(prop, `${pr}px`);
  }
});
