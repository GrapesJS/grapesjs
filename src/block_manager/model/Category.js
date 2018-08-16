import Backbone from 'backbone';

module.exports = Backbone.Model.extend({
  defaults: {
    id: '',
    label: '',
    open: true,
    attributes: {}
  }
});
