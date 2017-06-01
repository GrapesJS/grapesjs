var Backbone = require('backbone');

module.exports = Backbone.Model.extend({

  idAttribute: 'name',

  defaults: {
    name: '',
    label: '',
    type: 'class',
    active: true,
  },

  initialize() {
    this.set('name', this.escapeName(this.get('name')));
    var label = this.get('label').trim();
    if(!label)
      this.set('label', this.get('name'));
  },

  /**
   * Escape string
   * @param {string} name
   * @return {string}
   * @private
   */
  escapeName(name) {
    return name.replace(/([^a-z0-9\w]+)/gi, '-');
  },

});
