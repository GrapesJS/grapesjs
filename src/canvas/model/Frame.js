import Backbone from 'backbone';

module.exports = Backbone.Model.extend({
  defaults: {
    wrapper: '',
    width: '',
    height: '',
    attributes: {}
  }
});
