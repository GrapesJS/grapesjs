const Backbone = require('backbone');

export default Backbone.Model.extend({
  defaults: {
    command: '',
    attributes: {}
  }
});
